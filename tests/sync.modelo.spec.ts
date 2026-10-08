/* tests/sync.modelo.spec.ts */
import assert from "node:assert/strict";
import { loadSource } from "./source-loader.cjs";

/**
 * Bloque A de la Semana 5: modelo de datos, version de esquema y clave de idempotencia.
 *
 * Estos checks solo ejercitan `src/lib/storage/schema.ts`. No dependen de `queue.ts` ni de
 * `conflict-policy.ts`, asi que esta suite se puede escribir y revisar sin los bloques de los
 * companeros. Es deliberado: el contrato es la frontera compartida, y si el contrato falla,
 * fallan los tres.
 */

/**
 * Inspeccion minima valida. `idempotencyKey` solo lee `id`, pero la tienda copia el registro
 * entero, asi que el fixture lleva los ocho campos del tipo real: un fixture con forma distinta
 * de la real pasaria las pruebas y no probaria nada.
 */
function inspeccion(overrides: Record<string, unknown> = {}) {
  return {
    id: "insp-modelo-001",
    location: "Laboratorio de Protocolos",
    date: "2026-09-01",
    inspector: "Tecnico de pruebas",
    status: "ok",
    statusLabel: "Sin incidencias",
    findings: 0,
    summary: "Revision inicial de la instalacion.",
    ...overrides
  };
}

/** Envoltorio de una inspeccion, como lo transporta la cola. */
function envelope(inspect: ReturnType<typeof inspeccion>, version: number, key: string) {
  return { key, data: inspect, version, updatedAt: 1750000000000 };
}

export async function runChecks() {
  const checks: Array<{ id: string; status: string; detail?: string }> = [];
  async function check(id: string, action: () => unknown) {
    try {
      await action();
      checks.push({ id, status: "pass" });
    } catch (error) {
      checks.push({ id, status: "fail", detail: String(error) });
    }
  }

  const { ASSIGNMENT_ID, SCHEMA_VERSION, idempotencyKey, migrate, MemoryInspectionStore } =
    loadSource("src/lib/storage/schema.ts");

  await check("contract-exports", () => {
    // La forma, no el valor de la semana: el literal exacto convertia el identificador en
    // dos lugares con el mismo valor, justo cuando el punto del contrato era una sola fuente.
    // Con la forma, este check sigue exigiendo una actividad declarada y con estructura sin
    // volver a fallar por calendario.
    assert.match(ASSIGNMENT_ID, /^w\d{2}-[a-z0-9-]+$/, "el contrato debe declarar la actividad vigente");
    assert.equal(SCHEMA_VERSION, 1);
    assert.equal(typeof idempotencyKey, "function");
    assert.equal(typeof migrate, "function");
    assert.equal(typeof MemoryInspectionStore, "function");
  });

  await check("idempotency-deterministic", () => {
    // Dos llamadas seguidas sobre la misma inspeccion y version deben coincidir: es lo que
    // permite que un reintento de red se detecte como la misma operacion.
    const una = inspeccion();
    const otra = inspeccion();
    const clave = idempotencyKey(una, 3);
    assert.equal(clave, idempotencyKey(una, 3), "dos llamadas seguidas no coinciden");
    assert.equal(clave, idempotencyKey(otra, 3), "inspecciones iguales con igual version divergen");
    assert.equal(clave, "insp-modelo-001::v3");
  });

  await check("idempotency-version-sensitive", () => {
    // Este es el motivo de `id::vN` y no solo `id`. Con la clave sola, reenviar una version
    // nueva de una inspeccion ya sincronizada se veria como un reintento de la anterior, y el
    // cambio se perderia en silencio.
    const v3 = idempotencyKey(inspeccion(), 3);
    const v4 = idempotencyKey(inspeccion(), 4);
    assert.notEqual(v3, v4, "misma inspeccion con version distinta produjo la misma clave");
    assert.equal(v3, "insp-modelo-001::v3");
    assert.equal(v4, "insp-modelo-001::v4");
    // Dos inspecciones distintas en la misma version tampoco deben chocar.
    assert.notEqual(v3, idempotencyKey(inspeccion({ id: "insp-modelo-002" }), 3));
  });

  await check("migrate-noop", () => {
    // from === to devuelve el registro intacto. Se compara contra una copia previa para detectar
    // mutacion, no solo igualdad de valor.
    const original = inspeccion();
    const antes = JSON.stringify(original);
    const resultado = migrate(original, 1, 1);
    assert.deepEqual(resultado, original);
    assert.equal(JSON.stringify(original), antes, "migrate modifico el registro original");
  });

  await check("migrate-upgrade", () => {
    // v0 -> v1: `summary` paso de opcional a obligatorio y se fijo la version.
    const resultado = migrate({ ...inspeccion(), summary: undefined }, 0, 1);
    assert.equal(resultado.summary, "", "summary ausente no se relleno");
    assert.equal(resultado.version, 1);
    assert.equal(resultado.id, "insp-modelo-001", "migrate perdio campos del registro");
  });

  await check("migrate-downgrade-rejected", () => {
    // Lanzar hacia atras lanza error en vez de adivinar: perder un registro en silencio es peor
    // que negarse a arrancar. Una version por encima de la conocida tambien es error, no un
    // no-op silencioso.
    assert.throws(() => migrate({ ...inspeccion() }, 1, 0), /descendente/i);
    assert.throws(() => migrate({ ...inspeccion() }, 0, 99), /desconocida/i);
  });

  await check("store-roundtrip", async () => {
    const store = new MemoryInspectionStore();
    const original = inspeccion();

    await store.put(original);
    const leido = await store.get(original.id);
    assert.ok(leido, "put no persistio el registro");
    assert.deepEqual(leido, original);

    // La tienda devuelve copias, no referencias vivas: mutar lo leido no puede alterar el
    // almacen. Es lo que impide que una escritura posterior pise datos ajenos.
    leido.summary = "alterado fuera de la tienda";
    const releido = await store.get(original.id);
    assert.equal(releido.summary, original.summary, "la tienda expone referencias internas");

    await store.remove(original.id);
    assert.equal(await store.get(original.id), null, "remove no borro el registro");
    assert.equal(await store.get("no-existe"), null, "get de una clave ausente debe ser null");
  });

  await check("queue-persists", async () => {
    const store = new MemoryInspectionStore();
    const primera = inspeccion();
    const segunda = inspeccion({ id: "insp-modelo-002" });
    const key1 = idempotencyKey(primera, 3);
    const key2 = idempotencyKey(segunda, 1);

    // Las claves de la cola se derivan del contrato, no se escriben a mano: el fixture
    // demonstrates la relacion que el Bloque B tiene que respetar.
    const entries = [
      {
        key: key1,
        attempts: 2,
        state: "failed",
        envelope: envelope(primera, 3, key1),
        lastError: "timeout",
        nextAttemptAt: 1750000600000
      },
      {
        key: key2,
        attempts: 0,
        state: "pending",
        envelope: envelope(segunda, 1, key2)
      }
    ];

    await store.saveQueue(entries);
    const cargada = await store.loadQueue();

    assert.equal(cargada.length, entries.length);
    assert.deepEqual(
      cargada.map((e) => e.key),
      [key1, key2]
    );
    // `attempts` y `state` son los dos campos que sostienen el reintento: si no sobreviven al
    // ciclo de guardado, la cola reinicia su cuenta y puede duplicar o rendirse antes de tiempo.
    assert.deepEqual(
      cargada.map((e) => e.attempts),
      [2, 0],
      "saveQueue/loadQueue perdio attempts"
    );
    assert.deepEqual(
      cargada.map((e) => e.state),
      ["failed", "pending"],
      "saveQueue/loadQueue perdio state"
    );
    assert.equal(cargada[0].lastError, "timeout", "saveQueue/loadQueue perdio lastError");
    assert.equal(cargada[0].nextAttemptAt, 1750000600000, "saveQueue/loadQueue perdio nextAttemptAt");
    assert.equal(cargada[0].envelope.version, 3, "saveQueue/loadQueue perdio el sobre");

    // Igual que las inspecciones, la cola se devuelve copiada.
    cargada[0].attempts = 99;
    assert.equal((await store.loadQueue())[0].attempts, 2, "loadQueue expone la referencia interna");
  });

  return checks;
}
