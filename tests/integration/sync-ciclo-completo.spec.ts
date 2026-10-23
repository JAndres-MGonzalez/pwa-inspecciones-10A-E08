/* tests/integration/sync-ciclo-completo.spec.ts
 *
 * Bloque B de la semana 8 (pirámide de integración).
 *
 * Combina los tres módulos de la semana 5 con componentes REALES (schema, cola, política
 * de conflictos) y un transporte/servidor falso en memoria. No reprueba lo que ya cubren
 * las unitarias: comprueba que los módulos siguen de acuerdo en el contrato compartido,
 * la clave `id::vN`.
 *
 * Determinismo: reloj inyectado, sin setTimeout, sin red, sin azar, datos sintéticos.
 */
import assert from "node:assert/strict";
import { loadSource } from "../source-loader.cjs";

const base = (extra: Record<string, unknown> = {}) => ({
  id: "inspection-001",
  location: "Laboratorio de Redes",
  date: "2026-10-20",
  inspector: "UTT-SINTETICO",
  status: "ok",
  statusLabel: "Conforme",
  findings: 0,
  summary: "Sintético",
  ...extra
}) as any;

/** Servidor falso: guion de respuestas y registro de lo que "aplicó" por clave. */
function fakeServer(script: Array<Record<string, unknown> | Error> = [{}]) {
  const calls: any[] = [];
  const applied = new Map<string, number>(); // clave -> veces aplicada
  let i = 0;
  const transport = {
    async send(envelope: any) {
      calls.push(envelope);
      const step = script[Math.min(i, script.length - 1)];
      i += 1;
      if (step instanceof Error) throw step;
      const result = { ok: true, version: envelope.version, ...step } as any;
      if (result.ok) applied.set(envelope.key, (applied.get(envelope.key) ?? 0) + 1);
      return result;
    }
  };
  return { transport, calls, applied };
}

/** Reloj controlado: el backoff se avanza a mano. */
function clock() {
  let t = 1000;
  return { now: () => t, advance: (ms: number) => { t += ms; } };
}

export async function runChecks() {
  const checks: Array<{ id: string; status: string; detail?: string }> = [];
  async function check(id: string, action: () => unknown) {
    try { await action(); checks.push({ id, status: "pass" }); }
    catch (error) { checks.push({ id, status: "fail", detail: String(error) }); }
  }

  const { MemoryInspectionStore, idempotencyKey } = loadSource("src/lib/storage/schema.ts");
  const { SyncQueue } = loadSource("src/lib/sync/queue.ts");
  const { resolve } = loadSource("src/lib/sync/conflict-policy.ts");

  await check("full-cycle-happy-path", async () => {
    const c = clock();
    const store = new MemoryInspectionStore();
    const server = fakeServer([{}]);
    const q = new SyncQueue(store, server.transport, { now: c.now });

    q.enqueue(base({ id: "inspection-001" }), 1);
    q.enqueue(base({ id: "inspection-002" }), 1);
    assert.equal(q.pending().length, 2);

    const report = await q.drain();
    await q.flush();

    assert.equal(report.sent, 2);
    assert.equal(report.pending, 0);
    assert.deepEqual(
      server.calls.map((e: any) => e.key).sort(),
      ["inspection-001::v1", "inspection-002::v1"]
    );
    assert.equal(q.pending().length, 0);
    assert.ok(q.all().every((e: any) => e.state === "synced"));
    // La cola persistida en el almacén real coincide con la de memoria.
    const persisted = await store.loadQueue();
    assert.equal(persisted.length, 2);
    assert.ok(persisted.every((e: any) => e.state === "synced"));
    assert.ok(await store.get("inspection-001"), "el dato local se guardó al encolar");
  });

  await check("conflict-mid-cycle-resolves", async () => {
    const c = clock();
    const store = new MemoryInspectionStore();
    const server = fakeServer([{}]);
    const q = new SyncQueue(store, server.transport, { now: c.now });

    const v1 = base();
    q.enqueue(v1, 1, 1000);
    await q.drain();

    // Edición local (v2) y, en paralelo, edición remota de OTRO campo (v2 en el servidor).
    const local = base({ summary: "Cambio local" });
    const localEntry = q.enqueue(local, 2, 2000);
    const remote = {
      key: idempotencyKey(local, 2),
      data: base({ status: "attention", statusLabel: "Con incidencias" }),
      version: 2,
      updatedAt: 3000
    };

    const resolution = resolve(local, remote, "field-level-merge", 4000, {
      localVersion: 2,
      localUpdatedAt: 2000,
      base: v1
    });

    // Se conservan los dos cambios: el local (summary) y el remoto (status).
    assert.equal(resolution.strategy, "field-level-merge");
    assert.equal(resolution.inspection.summary, "Cambio local");
    assert.equal(resolution.inspection.status, "attention");
    assert.equal(resolution.inspection.statusLabel, "Con incidencias");
    // Un contrato, dos consumidores: los registros usan la MISMA clave que la cola.
    assert.ok(resolution.conflicts.length > 0);
    assert.ok(resolution.conflicts.every((r: any) => r.key === localEntry.key));
  });

  await check("retry-then-conflict", async () => {
    const c = clock();
    const store = new MemoryInspectionStore();
    const server = fakeServer([
      { ok: false, error: "red" },
      { ok: false, error: "red" },
      { ok: true }
    ]);
    const q = new SyncQueue(store, server.transport, { now: c.now });

    const insp = base();
    const entry = q.enqueue(insp, 1, 1000);
    for (let i = 0; i < 3; i += 1) { await q.drain(); c.advance(60000); }

    assert.equal(server.calls.length, 3);
    assert.equal(entry.attempts, 2, "solo cuentan los intentos fallidos");
    assert.equal(entry.state, "synced");
    // Servidor falso: la operación se aplicó UNA sola vez aunque hubo 3 envíos.
    assert.equal(server.applied.get(entry.key), 1);

    // Reencolar la misma clave no duplica ni vuelve a enviar.
    assert.equal(q.enqueue(insp, 1, 9999), entry);
    await q.drain();
    assert.equal(server.calls.length, 3);
    assert.equal(q.all().length, 1);

    // Un conflicto posterior sobre la misma operación usa la clave de la cola.
    const remote = {
      key: entry.key,
      data: base({ summary: "Edición remota" }),
      version: 1,
      updatedAt: 5000
    };
    const resolution = resolve(insp, remote, "last-write-wins", 6000, {
      localVersion: 1,
      localUpdatedAt: 1000
    });
    assert.ok(resolution.conflicts.length > 0);
    assert.ok(resolution.conflicts.every((r: any) => r.key === entry.key));
  });

  await check("stale-response-cannot-clobber-after-resolve", async () => {
    const c = clock();
    const store = new MemoryInspectionStore();

    // El servidor retiene la respuesta de la v2 hasta que el test la libere.
    const calls: any[] = [];
    let release: (value: any) => void = () => undefined;
    const held = new Promise<any>((resolvePromise) => { release = resolvePromise; });
    const transport = {
      async send(envelope: any) {
        calls.push(envelope);
        if (envelope.version === 2) return held; // respuesta tardía
        return { ok: true, version: envelope.version };
      }
    };
    const q = new SyncQueue(store, transport, { now: c.now });

    const local = base({ summary: "Local v2" });
    q.enqueue(local, 2, 2000);
    const firstDrain = q.drain(); // queda esperando la respuesta de v2
    for (let i = 0; i < 50 && calls.length === 0; i += 1) await Promise.resolve();
    assert.equal(calls.length, 1, "la v2 ya salió y espera respuesta");

    // Mientras tanto se resuelve un conflicto y se encola el resultado como v3.
    const remote = {
      key: idempotencyKey(local, 3),
      data: base({ summary: "Remoto v3", findings: 2 }),
      version: 3,
      updatedAt: 3000
    };
    const resolution = resolve(local, remote, "last-write-wins", 3500, {
      localVersion: 2,
      localUpdatedAt: 2000
    });
    q.enqueue(resolution.inspection, 3, 3500);
    await q.drain();
    assert.equal(q.lastApplied("inspection-001"), 3);

    // Llega la respuesta tardía de la v2: no puede hacer retroceder lastApplied.
    release({ ok: true, version: 2 });
    const report = await firstDrain;
    assert.equal(q.lastApplied("inspection-001"), 3);
    assert.equal(report.skipped, 1);
    assert.equal(report.sent, 0);
  });

  await check("queue-and-policy-agree-on-version", async () => {
    const q = new SyncQueue(new MemoryInspectionStore(), fakeServer([{}]).transport, { now: clock().now });
    const insp = base();
    for (const version of [1, 2, 7]) {
      const entry = q.enqueue(insp, version, 1000 * version);
      // La cola calcula la clave con el schema...
      assert.equal(entry.key, idempotencyKey(insp, version));
      // ...y la política acepta exactamente esa clave para esa versión.
      const remote = { key: entry.key, data: { ...insp }, version, updatedAt: 1000 * version };
      const resolution = resolve(insp, remote, "field-level-merge", 0, {
        localVersion: version,
        localUpdatedAt: 1000 * version,
        base: insp
      });
      assert.deepEqual(resolution.conflicts, []);
      // Si la versión remota no coincide con la de la clave, la política lo rechaza.
      assert.throws(
        () => resolve(insp, { ...remote, version: version + 1 }, "field-level-merge", 0),
        /clave/i
      );
    }
  });

  return checks;
}
