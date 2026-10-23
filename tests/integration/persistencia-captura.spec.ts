import assert from "node:assert/strict";
import { loadSource } from "../source-loader.cjs";

export async function runChecks() {
  const { LocalInspectionStore } = loadSource("src/lib/storage/local-store.ts");
  const { SyncQueue } = loadSource("src/lib/sync/queue.ts");
  const inspection = { id: "inspection-persistencia", location: "Laboratorio de Redes", date: "2026-10-20",
    inspector: "Técnica A", findings: 0, status: "ok", statusLabel: "Sin incidencias", summary: "Registro sintético." };
  const checks: Array<{ id: string; status: string; detail?: string }> = [];
  const memoryStorage = () => {
    const values = new Map<string, string>();
    return { getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); } };
  };
  async function check(id: string, action: () => unknown) {
    try { await action(); checks.push({ id, status: "pass" }); }
    catch (error) { checks.push({ id, status: "fail", detail: String(error) }); }
  }
  await check("offline-persiste-al-recrear-almacen-y-cola", async () => {
    const storage = memoryStorage();
    let sends = 0;
    const transport = { async send() { sends += 1; throw new Error("offline"); } };
    const first = new SyncQueue(new LocalInspectionStore(storage), transport, { now: () => 1000 });
    first.enqueue(inspection, 1);
    await first.flush();
    assert.equal(sends, 0);
    const reopened = new LocalInspectionStore(storage);
    assert.deepEqual(await reopened.getAll(), [inspection]);
    const next = new SyncQueue(reopened, transport, { now: () => 1000 });
    await next.rehydrate();
    assert.equal(next.pending().length, 1);
    assert.equal(next.pending()[0].key, "inspection-persistencia::v1");
    const copy = await reopened.get(inspection.id);
    copy.summary = "Cambio de la copia";
    assert.equal((await reopened.get(inspection.id)).summary, inspection.summary);
  });
  await check("respuesta-perdida-reintenta-sin-duplicar", async () => {
    const storage = memoryStorage();
    const applied = new Map<string, unknown>();
    const sent: string[] = [];
    let now = 1000;
    const transport = { async send(envelope: any) {
      sent.push(envelope.key);
      if (!applied.has(envelope.key)) applied.set(envelope.key, envelope.data);
      if (sent.length === 1) throw new Error("Respuesta perdida después de guardar.");
      return { ok: true, version: envelope.version };
    } };
    const first = new SyncQueue(new LocalInspectionStore(storage), transport, { now: () => now, random: () => 0 });
    first.enqueue(inspection, 1);
    await first.drain();
    assert.equal(applied.size, 1);
    assert.equal(first.pending().length, 1);
    now = 5000;
    const next = new SyncQueue(new LocalInspectionStore(storage), transport, { now: () => now });
    await next.rehydrate();
    await next.drain();
    assert.equal(next.all()[0].state, "synced");
    assert.deepEqual(sent, ["inspection-persistencia::v1", "inspection-persistencia::v1"]);
    assert.equal(applied.size, 1);
    await next.drain();
    assert.equal(sent.length, 2);
  });
  await check("almacen-corrupto-no-se-presenta-como-vacio", async () => {
    const store = new LocalInspectionStore({ getItem: () => "no-json", setItem: () => {} });
    await assert.rejects(store.getAll());
  });
  await check("cuota-agotada-no-confirma-guardado", async () => {
    const store = new LocalInspectionStore({ getItem: () => null, setItem: () => { throw new Error("Cuota agotada"); } });
    const queue = new SyncQueue(store, { send: async () => ({ ok: true, version: 1 }) });
    queue.enqueue(inspection, 1, 1000);
    await queue.flush();
    assert.ok(queue.lastPersistError.includes("Cuota agotada"));
    assert.deepEqual(await store.getAll(), []);
  });
  await check("api-idempotente-rechaza-contenido-diferente", async () => {
    const api = loadSource("src/app/api/inspecciones/route.ts");
    const envelope = { key: "inspection-persistencia::v1", data: inspection, version: 1, updatedAt: 1000 };
    const post = (body: unknown) => api.POST(new Request("http://localhost/api/inspecciones", {
      method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" }
    }));
    assert.equal((await (await post(envelope)).json()).duplicate, false);
    assert.equal((await (await post(envelope)).json()).duplicate, true);
    assert.equal((await post({ ...envelope, data: { ...inspection, summary: "Otra operación con la misma clave" } })).status, 409);
    const response = await api.GET(new Request("http://localhost/api/inspecciones?id=inspection-persistencia"));
    const result = await response.json();
    assert.equal(result.count, 1);
    assert.deepEqual(result.records, [inspection]);
  });
  await check("api-rechaza-captura-invalida-y-clave-ajena", async () => {
    const api = loadSource("src/app/api/inspecciones/route.ts");
    for (const body of [null, { key: "otra", data: inspection, version: 1, updatedAt: 1000 },
      { key: "inspection-persistencia::v1", data: { ...inspection, summary: "" }, version: 1, updatedAt: 1000 }]) {
      const response = await api.POST(new Request("http://localhost/api/inspecciones", { method: "POST", body: JSON.stringify(body) }));
      assert.equal(response.status, 400);
    }
    const response = await api.GET(new Request("http://localhost/api/inspecciones?id=inspection-persistencia"));
    assert.equal((await response.json()).count, 0);
  });
  return checks;
}
