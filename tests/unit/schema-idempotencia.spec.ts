/* tests/unit/schema-idempotencia.spec.ts
 *
 * Bloque A de la semana 8 (pirámide unitaria).
 *
 * Aísla y lleva a los bordes la lógica pura del contrato de almacenamiento:
 * idempotencyKey, migrate y MemoryInspectionStore. La suite de integración (sync.spec.ts)
 * ya usa estas funciones dentro de un ciclo; aquí se prueban por sí solas para que un
 * fallo se diagnostique en la capa correcta y no en la de arriba.
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

export async function runChecks() {
  const checks: Array<{ id: string; status: string; detail?: string }> = [];
  async function check(id: string, action: () => unknown) {
    try { await action(); checks.push({ id, status: "pass" }); }
    catch (error) { checks.push({ id, status: "fail", detail: String(error) }); }
  }

  const { idempotencyKey, migrate, MemoryInspectionStore, SCHEMA_VERSION } =
    loadSource("src/lib/storage/schema.ts");

  // --- idempotencyKey ---

  await check("key-deterministic", () => {
    // Mismos datos, dos objetos distintos: la clave debe ser idéntica. Si dependiera de
    // la identidad del objeto, cada reintento generaría una clave nueva y duplicaría.
    const first = idempotencyKey(base(), 1);
    const second = idempotencyKey({ ...base() }, 1);
    assert.equal(first, second);
  });

  await check("key-version-sensitive", () => {
    // Una versión distinta es OTRA operación: un reintento viejo no puede colisionar
    // con un cambio nuevo y perderlo en silencio.
    assert.notEqual(idempotencyKey(base(), 1), idempotencyKey(base(), 2));
  });

  await check("key-format-includes-id-and-version", () => {
    // Si el formato cambia en un solo consumidor (cola vs política de conflictos), los
    // dos dejan de entenderse; el contrato visible es "<id>::v<versión>".
    const key = idempotencyKey(base({ id: "abc" }), 7);
    assert.equal(key, "abc::v7");
    assert.match(key, /^abc::v\d+$/);
  });

  await check("key-different-ids-different-keys", () => {
    assert.notEqual(
      idempotencyKey(base({ id: "a" }), 1),
      idempotencyKey(base({ id: "b" }), 1)
    );
  });

  // --- migrate ---

  await check("migrate-same-version-noop", () => {
    // from === to devuelve el registro sin tocarlo.
    const record = { a: 1 };
    const result = migrate(record, SCHEMA_VERSION, SCHEMA_VERSION);
    assert.equal(result.a, 1);
    assert.deepEqual(result, record);
  });

  await check("migrate-same-version-returns-record-untouched", () => {
    // from === to devuelve el registro sin modificar; el contrato documenta que no se
    // toca nada (a diferencia de v0 -> v1, que sí agrega campos).
    const record = { a: 1 };
    const result = migrate(record, 2, 2);
    assert.deepEqual(result, record);
  });

  await check("migrate-downgrade-throws", () => {
    // Migrar hacia atrás debe rechazarse en voz alta: adivinar perdería datos.
    assert.throws(() => migrate({ a: 1 }, SCHEMA_VERSION, 0), /descendente/);
  });

  await check("migrate-unknown-version-throws", () => {
    // Una versión por encima de la soportada también es un error, no un salto a ciegas.
    assert.throws(() => migrate({ a: 1 }, 1, SCHEMA_VERSION + 1), /desconocida/);
  });

  await check("migrate-v0-fills-summary", () => {
    // v0 -> v1: "summary" pasa a obligatorio; un registro v0 sin summary migra a "".
    const result = migrate({ id: "x" } as any, 0, 1) as any;
    assert.equal(result.summary, "");
    assert.equal(result.version, 1);
  });

  await check("migrate-does-not-lose-fields", () => {
    // La migración agrega; nunca borra lo que el registro ya traía.
    const result = migrate({ id: "x", custom: "conservado" } as any, 0, 1) as any;
    assert.equal(result.custom, "conservado");
  });

  await check("migrate-v0-keeps-existing-summary", () => {
    // v0 → llena summary con "" solo si FALTA; un summary ya escrito no se pisa (??).
    const result = migrate({ id: "x", summary: "escrito en v0" } as any, 0, 1) as any;
    assert.equal(result.summary, "escrito en v0", "un summary existente no debe perderse");
    assert.equal(result.version, 1);
  });

  // --- MemoryInspectionStore ---

  await check("store-roundtrip-copy", () => {
    // get devuelve una copia: mutar el resultado no puede contaminar el almacén.
    const store = new MemoryInspectionStore();
    const original = base({ findings: 1 });
    return store.put(original).then(async () => {
      const found = await store.get("inspection-001");
      assert.ok(found);
      (found as any).findings = 99;
      const again = await store.get("inspection-001");
      assert.equal((again as any).findings, 1, "el almacén quedó contaminado por la copia devuelta");
    });
  });

  await check("store-put-does-not-keep-caller-reference", () => {
    // Mismo riesgo en el otro lado: si put guardara la referencia, mutar el objeto
    // original cambiaría lo persistido sin que nadie lo sepa.
    const store = new MemoryInspectionStore();
    const caller = base({ findings: 2 });
    return store.put(caller).then(async () => {
      (caller as any).findings = 77;
      const found = await store.get("inspection-001");
      assert.equal((found as any).findings, 2);
    });
  });

  await check("store-missing-id-returns-null", () => {
    // Un id inexistente resuelve en null, nunca lanza: el llamador decide qué mostrar.
    const store = new MemoryInspectionStore();
    return store.get("no-existe").then((found) => {
      assert.equal(found, null);
    });
  });

  await check("store-remove-deletes-only-that-id", async () => {
    const store = new MemoryInspectionStore();
    await store.put(base({ id: "a" }));
    await store.put(base({ id: "b" }));
    await store.remove("a");
    assert.equal(await store.get("a"), null);
    assert.ok(await store.get("b"));
  });

  await check("store-queue-saved-and-loaded", async () => {
    // La cola sobrevive a la rehidratación: lo que se guarda es lo que se carga.
    const store = new MemoryInspectionStore();
    const entry = {
      key: "inspection-001::v1",
      attempts: 2,
      state: "pending" as const,
      envelope: { key: "inspection-001::v1", data: base(), version: 1, updatedAt: 1000 }
    };
    await store.saveQueue([entry]);
    const loaded = await store.loadQueue();
    assert.equal(loaded.length, 1);
    assert.equal(loaded[0].attempts, 2);
    assert.equal(loaded[0].state, "pending");
    assert.equal(loaded[0].envelope.version, 1);
  });

  return checks;
}
