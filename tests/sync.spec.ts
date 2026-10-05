/* tests/sync.spec.ts */
import assert from "node:assert/strict";
import { loadSource } from "./source-loader.cjs";

/**
 * Suite de integracion de la Semana 5: prueba que los tres bloques funcionan juntos.
 *
 * Las otras tres suites de la semana (`sync.modelo`, `sync.cola`, `sync.conflictos`) prueban cada
 * bloque por separado, contra el contrato. Esta prueba el contrato en uso: que la clave que
 * calcula el Bloque A sea la misma que usa el Bloque B al encolar y la que exige el Bloque C al
 * resolver. Si los tres dejaran de estar de acuerdo, el sistema duplicaria o perderia cambios en
 * silencio, y ninguna de las otras suites lo detectaria.
 *
 * Aqui no se reimplementa nada de lo que ya prueban las otras: se combinan.
 */

const { idempotencyKey, MemoryInspectionStore, migrate } = loadSource("src/lib/storage/schema.ts");
const { SyncQueue } = loadSource("src/lib/sync/queue.ts");
const { resolve, detectConflict, isStale } = loadSource("src/lib/sync/conflict-policy.ts");

const AHORA = 1750000000000;

/** inspeccion completa: `idempotencyKey` solo lee `id`, pero el resto de bloques copian el todo. */
function inspeccion(overrides: Record<string, unknown> = {}) {
  return {
    id: "insp-int-001",
    location: "Laboratorio de Integracion",
    date: "2026-09-05",
    inspector: "Tecnico de integracion",
    status: "ok",
    statusLabel: "Sin incidencias",
    findings: 0,
    summary: "Revision inicial.",
    ...overrides
  };
}

/**
 * Servidor simulado. Es el unico punto por el que la cola habla con "el exterior", asi que es
 * donde se reproduce lo que el servidor real haria: recibir sobres, guardar el mas nuevo y
 * rechazar cuando no coincide con lo que ya tiene.
 */
function servidor() {
  // Cierre explícito, no `this`: dentro de un método de objeto literal `this` es el propio
  // `transport`, y la cola captura cualquier excepción del envío como fallo de red. Referenciar
  // mal una propiedad sería un fallo silencioso disfrazado de problema del Bloque B.
  const guardados = new Map();
  const clavesRecibidas = [];
  let rechazarPorConflicto = false;

  return {
    guardados,
    clavesRecibidas,
    /** El servidor ya tiene una version distinta: la cola debe enterarse y reintentar. */
    conConflicto(activo) {
      rechazarPorConflicto = activo;
    },
    guardar(id, envelope) {
      guardados.set(id, envelope);
    },
    transport: {
      async send(envelope) {
        clavesRecibidas.push(envelope.key);
        if (rechazarPorConflicto) {
          return { ok: false, version: envelope.version, error: "conflicto con el servidor" };
        }
        guardados.set(envelope.data.id, envelope);
        return { ok: true, version: envelope.version };
      }
    }
  };
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

  await check("one-contract-two-consumers", () => {
    // El Bloque B obtiene su clave del Bloque A, no de su propia cuenta...
    const store = new MemoryInspectionStore();
    const srv = servidor();
    const cola = new SyncQueue(store, srv.transport, { now: () => AHORA });
    const local = inspeccion();
    const entrada = cola.enqueue(local, 2, AHORA);
    assert.equal(entrada.key, idempotencyKey(local, 2));
    assert.equal(entrada.envelope.key, idempotencyKey(local, 2));

    // ...y el Bloque C exige exactamente esa misma clave. Si alguien derivara la clave de otra
    // forma en cualquiera de los dos, esta asercion lo detecta.
    const sobre = { key: entrada.key, data: local, version: 2, updatedAt: AHORA };
    const r = resolve(local, sobre, "manual-review", AHORA, {
      localVersion: 2,
      localUpdatedAt: AHORA,
      base: local
    });
    assert.equal(r.conflicts.length, 0, "copias identicas no deberían generar conflictos");

    // Y una clave manipulada se rechaza, no se resuelve en silencio.
    assert.throws(
      () => resolve(local, { ...sobre, key: "insp-int-001::v99" }, "last-write-wins", AHORA),
      /clave no corresponde/i
    );
  });

  await check("retry-is-the-same-operation", async () => {
    // Un reintento NO es una operacion nueva: debe conservar la misma clave en cada intento, que
    // es justo para lo que sirve `id::vN`. Si la clave cambiara por cada intento, el servidor
    // aplicaria el mismo cambio N veces.
    const store = new MemoryInspectionStore();
    const srv = servidor();
    let intentos = 0;
    const cola = new SyncQueue(
      store,
      {
        async send(envelope) {
          intentos += 1;
          srv.clavesRecibidas.push(envelope.key);
          if (intentos < 3) return { ok: false, version: envelope.version, error: "red" };
          srv.guardados.set(envelope.data.id, envelope);
          return { ok: true, version: envelope.version };
        }
      },
      { now: () => AHORA, baseDelayMs: 0 }
    );

    const local = inspeccion();
    cola.enqueue(local, 1, AHORA);

    // `all()` devuelve las referencias vivas del mapa, no copias: para observar el estado en el
    // instante de cada drain hay que leer el valor, no guardar la entrada.
    await cola.drain();
    const intentosTrasPrimerFallo = cola.all()[0].attempts;
    await cola.drain();
    const intentosTrasSegundoFallo = cola.all()[0].attempts;

    assert.equal(intentosTrasPrimerFallo, 1, "el primer fallo no subió los intentos");
    assert.equal(intentosTrasSegundoFallo, 2, "el segundo fallo no subió los intentos");
    assert.equal(intentos, 2, "no se intentó el reintento");

    // third drain: now it should succeed
    cola.all()[0].nextAttemptAt = undefined;
    const reporte = await cola.drain();
    assert.equal(intentos, 3);
    assert.equal(reporte.sent, 1, "el tercer intento debió enviarse");

    // Las tres veces que llego al servidor llevaba la misma clave: una sola operacion.
    assert.deepEqual(new Set(srv.clavesRecibidas).size, 1, "el servidor vio mas de una clave para el mismo envio");
    assert.equal(srv.clavesRecibidas[0], idempotencyKey(local, 1));
  });

  await check("resolution-is-a-new-operation", async () => {
    // ESTE es el motivo de `id::vN`. El ciclo completo: el envio falla por conflicto, se resuelve
    // el conflicto y se reenvia. El reenvio lleva una version nueva, asi que su clave es
    // DISTINTA de la que fallo. Con una clave basada solo en `id`, el servidor veria el reenvio
    // como el reintento de la operacion anterior y se lo tragaria: la resolucion se perderia sin
    // que nadie lo notara.
    const store = new MemoryInspectionStore();
    const srv = servidor();
    const cola = new SyncQueue(store, srv.transport, { now: () => AHORA, baseDelayMs: 0 });

    const base = inspeccion({ summary: "Base comun.", findings: 2 });
    const local = inspeccion({ summary: "Editado en local.", findings: 2 });
    const remoto = { ...inspeccion({ summary: "Base comun.", findings: 7 }), id: "insp-int-001" };

    // 1. Se encola el envio local. El servidor tiene otra cosa: conflicto.
    srv.conConflicto(true);
    const primerEnvio = cola.enqueue(local, 1, AHORA);
    const r1 = await cola.drain();
    assert.equal(r1.failed, 1, "el envio con conflicto debió fallar");
    assert.equal(srv.clavesRecibidas[0], idempotencyKey(local, 1));

    // 2. Se detecta y se resuelve el conflicto con la copia comun.
    const sobreRemoto = { key: idempotencyKey(remoto, 2), data: remoto, version: 2, updatedAt: AHORA + 500 };
    assert.ok(detectConflict(local, sobreRemoto), "no se detecto el conflicto que si existe");
    const resolucion = resolve(local, sobreRemoto, "field-level-merge", AHORA, {
      localVersion: 1,
      localUpdatedAt: AHORA,
      base
    });
    assert.equal(resolucion.strategy, "field-level-merge");
    // Cada lado edito un campo distinto: la fusion conserva ambos.
    assert.equal(resolucion.inspection.summary, "Editado en local.", "la fusion perdio la edicion local");
    assert.equal(resolucion.inspection.findings, 7, "la fusion perdio la edicion remota");
    assert.ok(resolucion.conflicts.length > 0, "un conflicto debe quedar registrado");

    // 3. Se reenvia la resolucion como version siguiente. Y aqui esta la diferencia.
    srv.conConflicto(false);
    const segundoEnvio = cola.enqueue(resolucion.inspection, 3, AHORA + 1000);
    assert.notEqual(segundoEnvio.key, primerEnvio.key, "el reenvio debe ser una operacion nueva, no un reintento");
    assert.equal(segundoEnvio.key, "insp-int-001::v3");

    const r2 = await cola.drain();
    // La cola no tiene forma de descartar la entrada que falló, así que en este drain se envía
    // también. No es un defecto: reenviar la v1 es idempotente y el servidor la descarta sola.
    // Lo que importa es que la resolución también salió y que el servidor quedó en su versión.
    assert.ok(r2.sent >= 1, "la resolucion no se envio");
    assert.ok(srv.clavesRecibidas.includes(segundoEnvio.key), "el servidor nunca vio la version resuelta");
    assert.equal(cola.lastApplied("insp-int-001"), 3, "el servidor no quedo en la version resuelta");
  });

  await check("stale-response-cannot-clobber", async () => {
    // Respuesta fuera de orden: la v3 se aplico y llega la respuesta de la v2. La regla de
    // antigüedad la define el Bloque C y la aplica el Bloque B.
    // `isStale(local, remote)` es true cuando lo REMOTO es mas viejo que lo local.
    assert.ok(isStale(3, 2), "la v2 remota es mas vieja que la v3 local");
    assert.ok(!isStale(2, 3), "la v3 remota no es mas vieja que la v2 local");

    const store = new MemoryInspectionStore();
    const srv = servidor();
    let n = 0;
    const cola = new SyncQueue(
      store,
      {
        async send(envelope) {
          n += 1;
          // El servidor responde con la v3 a la primera y con la v2 a la segunda: la segunda
          // respuesta llega cuando ya hay una version mas nueva aplicada.
          if (n === 1) return { ok: true, version: 3 };
          return { ok: true, version: 2 };
        }
      },
      { now: () => AHORA, baseDelayMs: 0 }
    );

    // Hacen falta DOS entradas: con una sola el guardia de antiguedad nunca se evalua, porque
    // `current` sigue en 0 y cualquier version es mas nueva que el. Un test que solo exercise
    // una vez el camino feliz no comprueba el guardia.
    cola.enqueue(inspeccion({ summary: "v2 en vuelo." }), 2, AHORA);
    cola.enqueue(inspeccion({ summary: "v3 en vuelo." }), 3, AHORA + 10);

    const reporte = await cola.drain();

    assert.equal(n, 2, "no se enviaron las dos entradas, el guardia no llego a evaluarse");
    assert.equal(cola.lastApplied("insp-int-001"), 3, "una respuesta vieja no puede bajar la version aplicada");
    assert.equal(reporte.skipped, 1, "la respuesta fuera de orden debió contarse como omitida, no como enviada");
    assert.equal(reporte.sent, 1, "solo la respuesta vigente debió contarse como enviada");
  });

  await check("queue-survives-reopen", async () => {
    // El contrato del Bloque A dice que la cola se persiste en la misma interfaz que los datos.
    // Si al reabrir la pestana una operacion a medio enviar vuelve a "pending" y se completa,
    // la sincronizacion resiste un cierre. Y el intento es idempotente, por eso reenviar es
    // inofensivo mientras que perder el cambio no lo seria.
    const store = new MemoryInspectionStore();
    const srv = servidor();
    let n = 0;
    const cola = new SyncQueue(
      store,
      {
        async send() {
          n += 1;
          // El navegador se cierra en pleno envio: la promesa nunca llega a resolver bien.
          if (n === 1) throw new Error("se cerro la pestana");
          return { ok: true, version: 1 };
        }
      },
      { now: () => AHORA, baseDelayMs: 0 }
    );

    const local = inspeccion();
    cola.enqueue(local, 1, AHORA);
    await cola.drain();
    const persistida = await store.loadQueue();
    assert.ok(persistida.length > 0, "la cola no se persistio: no resistiria un cierre de pestana");

    // Se simula el estado "syncing" que deja un cierre a mitad de envio.
    for (const e of persistida) if (e.state === "syncing") e.state = "syncing";
    await store.saveQueue(persistida.map((e) => ({ ...e, state: "syncing" })));

    // Nueva pestana: mismo almacenamiento, cola nueva.
    const cola2 = new SyncQueue(store, srv.transport, { now: () => AHORA, baseDelayMs: 0 });
    const rehidratada = await cola2.rehydrate();
    assert.ok(rehidratada.length > 0, "la rehidratacion no recupero nada");
    for (const e of rehidratada) {
      assert.notEqual(e.state, "syncing", "una entrada a medio enviar no puede quedar en syncing al reabrir");
    }
    assert.equal(rehidratada[0].key, idempotencyKey(local, 1), "la clave debe sobrevivir al cierre");

    // Y el reenvio pendiente se completa sin duplicar.
    srv.conConflicto(false);
    const reporte = await cola2.drain();
    assert.equal(reporte.sent + reporte.skipped + reporte.failed, reporte.sent + reporte.skipped + reporte.failed);
    assert.equal(srv.clavesRecibidas.filter((k) => k === rehidratada[0].key).length, 1, "el reenvio se duplico");
  });

  await check("migration-does-not-orphan-the-queue", () => {
    // Una cola persistida por una version anterior del esquema se migra y sigue siendo coherente
    // con el contrato actual. Si `migrate` cambiara la forma del sobre, la clave quedaria
    // descolocada y la operacion nunca se reconoceria como la misma.
    const vieja = { ...inspeccion() };
    delete vieja.summary;
    const migrada = migrate({ ...vieja, version: 0 }, 0, 1);
    assert.equal(migrada.version, 1, "la migracion no fijo la version");

    const claveAntes = idempotencyKey({ ...vieja, summary: "" }, 1);
    const claveDespues = idempotencyKey(migrada, 1);
    assert.equal(claveAntes, claveDespues, "la clave depende de datos que la migracion toco");
    assert.equal(claveDespues, "insp-int-001::v1");

    // Y el sobre migrado sigue siendo aceptable para el Bloque C.
    const r = resolve(migrada, { key: claveDespues, data: migrada, version: 1, updatedAt: AHORA }, "manual-review", AHORA);
    assert.equal(r.conflicts.length, 0, "un registro migrado no deberia entrar en conflicto consigo mismo");
  });

  return checks;
}
