import assert from "node:assert/strict";
import { loadSource } from "./source-loader.cjs";

/** Transporte falso: sin red. Cada llamada consume un paso del guion (el último se repite). */
function fakeTransport(script: Array<Record<string, unknown> | Error>) {
  const calls: any[] = [];
  let i = 0;
  const transport = {
    async send(envelope: any) {
      calls.push(envelope);
      const step = script[Math.min(i, script.length - 1)];
      i += 1;
      if (step instanceof Error) throw step;
      return { ok: true, version: envelope.version, ...step } as any;
    }
  };
  return { transport, calls };
}

const insp = (id: string, extra: Record<string, unknown> = {}) => ({ id, ...extra }) as any;

export async function runChecks() {
  const checks: Array<{ id: string; status: string; detail?: string }> = [];
  async function check(id: string, action: () => unknown) {
    try { await action(); checks.push({ id, status: "pass" }); }
    catch (error) { checks.push({ id, status: "fail", detail: String(error) }); }
  }

  const { MemoryInspectionStore, idempotencyKey } = loadSource("src/lib/storage/schema.ts");
  const { SyncQueue, backoffDelay, seededRandom, MAX_DELAY_MS } = loadSource("src/lib/sync/queue.ts");

  // Reloj controlado: las pruebas avanzan el tiempo a mano, sin esperas reales.
  function clock() {
    let t = 1000;
    return { now: () => t, advance: (ms: number) => { t += ms; } };
  }

  await check("backoff-exponential", () => {
    assert.ok(backoffDelay(0) < backoffDelay(1));
    assert.ok(backoffDelay(1) < backoffDelay(2));
    assert.equal(backoffDelay(10), MAX_DELAY_MS);
    assert.equal(backoffDelay(50), MAX_DELAY_MS);
  });

  await check("no-duplicate-on-enqueue", () => {
    const q = new SyncQueue(new MemoryInspectionStore(), fakeTransport([{}]).transport);
    const first = q.enqueue(insp("a"), 1);
    const second = q.enqueue(insp("a"), 1);
    assert.equal(q.all().length, 1);
    assert.equal(first, second);
    q.enqueue(insp("a"), 2); // otra versión = otra operación
    assert.equal(q.all().length, 2);
  });

  await check("no-duplicate-on-retry", async () => {
    const c = clock();
    const fake = fakeTransport([{ ok: false, error: "red" }, { ok: false, error: "red" }, { ok: true }]);
    const q = new SyncQueue(new MemoryInspectionStore(), fake.transport, { now: c.now });
    q.enqueue(insp("a"), 1);
    for (let i = 0; i < 3; i++) { await q.drain(); c.advance(60000); }
    assert.equal(fake.calls.length, 3);
    assert.equal(q.all().length, 1);
    assert.equal(q.all()[0].state, "synced");
    assert.equal(q.pending().length, 0);
  });

  await check("retry-increments-attempts", async () => {
    const c = clock();
    const fake = fakeTransport([{ ok: false, error: "red" }]);
    const q = new SyncQueue(new MemoryInspectionStore(), fake.transport, { now: c.now });
    const entry = q.enqueue(insp("a"), 1);
    await q.drain();
    assert.equal(entry.attempts, 1);
    assert.equal(entry.state, "pending");
    assert.equal(entry.lastError, "red");
    assert.ok(entry.nextAttemptAt > c.now());
    // Antes de que toque el reintento, drain no vuelve a enviar.
    await q.drain();
    assert.equal(fake.calls.length, 1);
    assert.equal(entry.attempts, 1);
  });

  await check("gives-up-after-max", async () => {
    const c = clock();
    const fake = fakeTransport([{ ok: false, error: "caido" }]);
    const q = new SyncQueue(new MemoryInspectionStore(), fake.transport, { now: c.now, maxAttempts: 3 });
    q.enqueue(insp("a"), 1);
    for (let i = 0; i < 6; i++) { await q.drain(); c.advance(60000); }
    assert.equal(fake.calls.length, 3); // dejó de reintentar
    assert.equal(q.all()[0].state, "failed");
    assert.equal(q.pending().length, 0);
    assert.equal(q.failed().length, 1);
  });

  await check("survives-tab-close", async () => {
    const store = new MemoryInspectionStore();
    const before = fakeTransport([{}]);
    const q1 = new SyncQueue(store, before.transport);
    q1.enqueue(insp("a"), 1);
    await q1.flush(); // se "cierra la pestaña": q1 desaparece, solo queda el almacenamiento

    const after = fakeTransport([{}]);
    const q2 = new SyncQueue(store, after.transport);
    await q2.rehydrate();
    assert.equal(q2.pending().length, 1);
    const report = await q2.drain();
    assert.equal(report.sent, 1);
    assert.equal(after.calls.length, 1);
    assert.equal(before.calls.length, 0);
  });

  await check("syncing-reopens-as-pending", async () => {
    const store = new MemoryInspectionStore();
    const data = insp("a");
    const key = idempotencyKey(data, 1);
    await store.saveQueue([{ key, attempts: 0, state: "syncing", envelope: { key, data, version: 1, updatedAt: 1 } }]);

    const fake = fakeTransport([{}]);
    const q = new SyncQueue(store, fake.transport);
    const entries = await q.rehydrate();
    assert.equal(entries.length, 1);
    assert.equal(entries[0].state, "pending"); // no se pierde
    const report = await q.drain();
    assert.equal(report.sent, 1);
    assert.equal(fake.calls.length, 1);
  });

  await check("out-of-order-ignored", async () => {
    // Caso 1: la v3 se aplica antes de que se envíe la v2; la v2 ya no sale.
    const fake = fakeTransport([{}]);
    const q = new SyncQueue(new MemoryInspectionStore(), fake.transport);
    q.enqueue(insp("a"), 3);
    q.enqueue(insp("a"), 2);
    const report = await q.drain();
    assert.equal(fake.calls.length, 1);
    assert.equal(fake.calls[0].version, 3);
    assert.equal(report.skipped, 1);
    assert.equal(q.lastApplied("a"), 3);

    // Caso 2: la respuesta de la v2 llega DESPUÉS de que la v3 ya se aplicó: se descarta.
    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const slow = {
      async send(envelope: any) {
        if (envelope.version === 2) { await gate; return { ok: true, version: 2 }; }
        return { ok: true, version: envelope.version };
      }
    };
    const q2 = new SyncQueue(new MemoryInspectionStore(), slow);
    q2.enqueue(insp("b"), 2);
    const lateDrain = q2.drain(); // v2 queda en vuelo (syncing)
    q2.enqueue(insp("b"), 3);
    await q2.drain(); // v3 se aplica primero
    assert.equal(q2.lastApplied("b"), 3);
    release(); // ahora llega la respuesta vieja
    const lateReport = await lateDrain;
    assert.equal(lateReport.sent, 0);
    assert.equal(lateReport.skipped, 1);
    assert.equal(q2.lastApplied("b"), 3); // no retrocede
  });

  await check("no-loss-on-failure", async () => {
    const c = clock();
    const fake = fakeTransport([new Error("boom")]);
    const q = new SyncQueue(new MemoryInspectionStore(), fake.transport, { now: c.now });
    q.enqueue(insp("a"), 1);
    const report = await q.drain();
    assert.equal(report.failed, 1);
    assert.equal(q.all().length, 1);
    assert.equal(q.pending().length, 1); // sigue en la cola
    assert.ok(String(q.all()[0].lastError).includes("boom"));
  });

  await check("deterministic-retries", async () => {
    const c = clock();
    async function delayWithSeed(seed: number) {
      const fake = fakeTransport([{ ok: false, error: "red" }]);
      const q = new SyncQueue(new MemoryInspectionStore(), fake.transport, { now: c.now, random: seededRandom(seed) });
      const entry = q.enqueue(insp("a"), 1);
      await q.drain();
      return entry.nextAttemptAt;
    }
    assert.equal(await delayWithSeed(42), await delayWithSeed(42));
  });

  return checks;
}