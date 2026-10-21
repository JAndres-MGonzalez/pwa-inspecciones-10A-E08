/* tests/unit/sync-bordes.spec.ts
 *
 * Bloque A de la semana 8 (pirámide unitaria).
 *
 * Funciones puras de la cola de sincronización y de la política de conflictos, llevadas
 * a sus bordes exactos: techo del backoff, semillas, versiones en empate y degradación a
 * manual-review. Si estos límites se mueven, la semana 5 entera (cola + conflictos) deja
 * de comportarse como su documentación promete.
 */
import assert from "node:assert/strict";
import { loadSource } from "../source-loader.cjs";

const insp = (id: string, extra: Record<string, unknown> = {}) => ({ id, ...extra }) as any;

export async function runChecks() {
  const checks: Array<{ id: string; status: string; detail?: string }> = [];
  async function check(id: string, action: () => unknown) {
    try { await action(); checks.push({ id, status: "pass" }); }
    catch (error) { checks.push({ id, status: "fail", detail: String(error) }); }
  }

  const { backoffDelay, seededRandom, MAX_DELAY_MS, BASE_DELAY_MS } =
    loadSource("src/lib/sync/queue.ts");
  const { isStale, detectConflict, resolve, DEFAULT_STRATEGY } =
    loadSource("src/lib/sync/conflict-policy.ts");
  const { idempotencyKey } = loadSource("src/lib/storage/schema.ts");

  // --- backoffDelay: función pura del reintento ---

  await check("backoff-grows-exponentially", () => {
    assert.ok(backoffDelay(0) < backoffDelay(1), "el primer reintento no puede ser menor que el cero");
    assert.ok(backoffDelay(1) < backoffDelay(2), "debe crecer entre intentos consecutivos");
    assert.equal(backoffDelay(0), BASE_DELAY_MS, "el intento 0 usa la base exacta");
    assert.equal(backoffDelay(1), BASE_DELAY_MS * 2, "el intento 1 duplica la base");
  });

  await check("backoff-caps-at-max", () => {
    // Techo sin desbordes: un reintento lejano espera 30 s, no años (ni Infinity).
    assert.equal(backoffDelay(10), MAX_DELAY_MS);
    assert.equal(backoffDelay(50), MAX_DELAY_MS);
    assert.ok(Number.isFinite(backoffDelay(1000)), "nunca debe producir Infinity");
  });

  await check("backoff-negative-attempts-clamp-to-base", () => {
    // Intentos negativos (bug de caller) tratan como 0: Math.max(0, attempts).
    assert.equal(backoffDelay(-3), BASE_DELAY_MS);
  });

  await check("backoff-custom-base", () => {
    // Fuente inyectable: la base la decide el caller (y por eso las pruebas son posibles).
    assert.equal(backoffDelay(1, 500), 1000);
    assert.equal(backoffDelay(2, 500), 2000);
    assert.ok(backoffDelay(9, 500) <= MAX_DELAY_MS, "la base personalizada también respeta el techo");
  });

  // --- seededRandom: determinismo del jitter ---

  await check("seeded-random-reproducible", () => {
    const first = seededRandom(42);
    const second = seededRandom(42);
    const seqA = [first(), first(), first()];
    const seqB = [second(), second(), second()];
    assert.deepEqual(seqA, seqB, "misma semilla debe dar la misma secuencia");
  });

  await check("seeded-random-different-seeds-differ", () => {
    const a = seededRandom(1);
    const b = seededRandom(2);
    assert.notEqual(a(), b(), "semillas distintas deben divergir (o el jitter no aporta nada)");
  });

  await check("seeded-random-values-in-unit-interval", () => {
    // El jitter se usa como multiplicador fraccional: un valor fuera de [0,1) rompería
    // el cálculo del retardo.
    const rng = seededRandom(7);
    for (let i = 0; i < 50; i += 1) {
      const value = rng();
      assert.ok(value >= 0 && value < 1, `valor fuera de [0,1): ${value}`);
    }
  });

  // --- isStale: comparación de versiones ---

  await check("is-stale-boundaries", () => {
    assert.equal(isStale(3, 2), true, "remota más vieja = local vigente");
    assert.equal(isStale(3, 3), false, "misma versión no está obsoleta");
    assert.equal(isStale(3, 4), false, "remota más nueva tampoco");
  });

  // --- detectConflict ---

  await check("detect-conflict-field-diff", () => {
    const local = insp("a", { summary: "local" });
    const remote = { key: "a::v2", data: insp("a", { summary: "remoto" }), version: 2, updatedAt: 10 };
    assert.equal(detectConflict(local, remote), true, "mismo id, campo distinto = conflicto");
    const identical = { key: "a::v2", data: insp("a", { summary: "local" }), version: 2, updatedAt: 10 };
    assert.equal(detectConflict(local, identical), false, "mismo contenido no es conflicto");
  });

  await check("detect-conflict-zero-updated-at-is-no-edition", () => {
    // updatedAt === 0 marca un sobre sin edición real: no hay conflicto que resolver.
    const local = insp("a", { summary: "local" });
    const remote = { key: "a::v2", data: insp("a", { summary: "remoto" }), version: 2, updatedAt: 0 };
    assert.equal(detectConflict(local, remote), false);
  });

  await check("detect-conflict-different-id-is-never-a-conflict", () => {
    // Comparar inspecciones distintas sería un error de categoría, no un conflicto.
    const local = insp("a", { summary: "x" });
    const remote = { key: "b::v2", data: insp("b", { summary: "y" }), version: 2, updatedAt: 10 };
    assert.equal(detectConflict(local, remote), false);
  });

  // --- resolve: guardas y estrategias ---

  await check("resolve-rejects-mismatched-key", () => {
    // La clave ata el sobre a su inspección y versión; una clave ajena es rechazada.
    const local = insp("a");
    const remote = { key: "otra::v2", data: insp("a"), version: 2, updatedAt: 10 };
    assert.throws(() => resolve(local, remote), /clave/);
  });

  await check("resolve-rejects-different-ids", () => {
    const remote = { key: idempotencyKey(insp("b"), 2), data: insp("b"), version: 2, updatedAt: 10 };
    assert.throws(() => resolve(insp("a"), remote), /misma inspección/);
  });

  await check("resolve-unknown-strategy-throws", () => {
    const remote = { key: idempotencyKey(insp("a"), 1), data: insp("a"), version: 1, updatedAt: 10 };
    assert.throws(
      () => resolve(insp("a"), remote, "gana-el-mas-rapido" as any),
      /desconocida/
    );
  });

  await check("resolve-invalid-numbers-throws", () => {
    const local = insp("a");
    const bad = { key: idempotencyKey(local, 2), data: local, version: -1, updatedAt: 10 };
    assert.throws(() => resolve(local, bad), /números válidos/);
    const nan = { key: idempotencyKey(local, 2), data: local, version: 2, updatedAt: NaN };
    assert.throws(() => resolve(local, nan), /números válidos/);
  });

  await check("resolve-no-conflict-returns-local-copy", () => {
    // Sin diferencias no hay nada que resolver; se devuelve local entera.
    const local = insp("a", { summary: "único" });
    const remote = { key: idempotencyKey(local, 1), data: { ...local }, version: 1, updatedAt: 5 };
    const resolution = resolve(local, remote);
    assert.deepEqual(resolution.inspection, local);
    assert.deepEqual(resolution.conflicts, []);
    assert.equal(resolution.strategy, DEFAULT_STRATEGY);
  });

  await check("resolve-no-context-forces-manual-review", () => {
    // Sin metadatos no se puede deducir qué editó cada lado: degrada a revisión humana
    // en vez de fingir que resolvió.
    const local = insp("a", { summary: "local" });
    const remote = { key: idempotencyKey(local, 2), data: insp("a", { summary: "remoto" }), version: 2, updatedAt: 10 };
    const resolution = resolve(local, remote);
    assert.equal(resolution.strategy, "manual-review");
    assert.equal(resolution.conflicts.length, 1);
    assert.equal(resolution.conflicts[0].field, "summary");
  });

  await check("resolve-field-merge-keeps-both-sides", () => {
    // Cada lado cambió un campo distinto sobre la misma base: los dos cambios viven en
    // el resultado (la razón de existir de field-level-merge).
    const base = insp("a", { summary: "base", location: "base-loc" });
    const local = insp("a", { summary: "cambio-local", location: "base-loc" });
    const remote = { key: idempotencyKey(local, 2), data: insp("a", { summary: "base", location: "cambio-remoto" }), version: 2, updatedAt: 20 };
    const resolution = resolve(local, remote, "field-level-merge", 30, {
      localVersion: 1, localUpdatedAt: 10, base
    });
    assert.equal(resolution.inspection.summary, "cambio-local", "se conserva el cambio local");
    assert.equal(resolution.inspection.location, "cambio-remoto", "se aplica el remoto");
    assert.equal(resolution.strategy, "field-level-merge");
    assert.equal(resolution.conflicts.length, 2, "ambos campos quedan registrados");
  });

  await check("resolve-field-merge-tie-keeps-local", () => {
    // Empate de fechas: gana la copia local (regla documentada de la semana 5).
    const base = insp("a", { summary: "base" });
    const local = insp("a", { summary: "local" });
    const remote = { key: idempotencyKey(local, 2), data: insp("a", { summary: "remoto" }), version: 2, updatedAt: 10 };
    const resolution = resolve(local, remote, "field-level-merge", 10, {
      localVersion: 1, localUpdatedAt: 10, base
    });
    assert.equal(resolution.inspection.summary, "local");
  });

  await check("resolve-stale-remote-ignored", () => {
    // Una respuesta remota con versión menor que la local se descarta: no pisa lo nuevo.
    const local = insp("a", { summary: "vigente" });
    const remote = { key: idempotencyKey(local, 2), data: insp("a", { summary: "viejo" }), version: 2, updatedAt: 99 };
    const resolution = resolve(local, remote, "field-level-merge", 100, {
      localVersion: 3, localUpdatedAt: 100, base: insp("a", { summary: "base" })
    });
    assert.equal(resolution.inspection.summary, "vigente", "lo viejo no pisa lo nuevo");
    assert.deepEqual(resolution.conflicts, [], "un sobre viejo ni siquiera registra conflicto");
  });

  await check("resolve-missing-base-degrades-to-manual-review", () => {
    // field-level-merge sin base común no puede saber quién cambió qué: revisión manual.
    const local = insp("a", { summary: "local" });
    const remote = { key: idempotencyKey(local, 2), data: insp("a", { summary: "remoto" }), version: 2, updatedAt: 20 };
    const resolution = resolve(local, remote, "field-level-merge", 30, {
      localVersion: 1, localUpdatedAt: 10
    });
    assert.equal(resolution.strategy, "manual-review");
  });

  await check("resolve-conflicts-carry-shared-key", () => {
    // El ConflictRecord usa la MISMA clave id::vN que la cola; si divergieran, la cola y
    // la política dejarían de poder cruzar sus datos.
    const local = insp("a", { summary: "local" });
    const version = 2;
    const remote = { key: idempotencyKey(local, version), data: insp("a", { summary: "remoto" }), version, updatedAt: 10 };
    const resolution = resolve(local, remote);
    assert.equal(resolution.conflicts[0].key, idempotencyKey(local, version));
  });

  // --- last-write-wins: la tercera estrategia, la menos ejercitada hasta ahora ---

  await check("resolve-last-write-wins-takes-newer-remote", () => {
    // Remoto más nuevo: gana la copia remota COMPLETA (así lo define la estrategia).
    const base = insp("a", { summary: "base" });
    const local = insp("a", { summary: "local" });
    const remote = { key: idempotencyKey(local, 2), data: insp("a", { summary: "remoto" }), version: 2, updatedAt: 20 };
    const resolution = resolve(local, remote, "last-write-wins", 30, {
      localVersion: 1, localUpdatedAt: 10, base
    });
    assert.equal(resolution.inspection.summary, "remoto");
    assert.equal(resolution.strategy, "last-write-wins");
    // Los conflictos siguen registrándose aunque la estrategia ya decidió.
    assert.equal(resolution.conflicts.length, 1);
  });

  await check("resolve-last-write-wins-keeps-local-if-remote-older", () => {
    // Un remoto más viejo NO pisa lo local, aunque la estrategia sea last-write-wins.
    const base = insp("a", { summary: "base" });
    const local = insp("a", { summary: "vigente" });
    const remote = { key: idempotencyKey(local, 2), data: insp("a", { summary: "viejo" }), version: 2, updatedAt: 5 };
    const resolution = resolve(local, remote, "last-write-wins", 30, {
      localVersion: 1, localUpdatedAt: 10, base
    });
    assert.equal(resolution.inspection.summary, "vigente");
  });

  await check("resolve-last-write-wins-tie-keeps-local", () => {
    // Empate de fechas: gana lo local (misma regla que field-level-merge).
    const base = insp("a", { summary: "base" });
    const local = insp("a", { summary: "local" });
    const remote = { key: idempotencyKey(local, 2), data: insp("a", { summary: "remoto" }), version: 2, updatedAt: 10 };
    const resolution = resolve(local, remote, "last-write-wins", 10, {
      localVersion: 1, localUpdatedAt: 10, base
    });
    assert.equal(resolution.inspection.summary, "local");
  });

  // --- Jitter aplicado DENTRO de la cola (no solo backoffDelay puro) ---

  await check("queue-jitter-range-with-injected-clock", async () => {
    // Escenario limpio: reloj y fuente aleatoria inyectados; se mide el delay exacto.
    const { SyncQueue, backoffDelay, MAX_DELAY_MS } = loadSource("src/lib/sync/queue.ts");
    const { MemoryInspectionStore } = loadSource("src/lib/storage/schema.ts");
    const transport = { async send() { return { ok: false, error: "red", version: 1 }; } } as any;
    async function delayWithRandom(random: () => number) {
      let t = 1000;
      const q = new SyncQueue(new MemoryInspectionStore(), transport, { now: () => t, random });
      const entry = q.enqueue(insp("a"), 1);
      await q.drain();
      return { delay: (entry.nextAttemptAt as number) - t, base: backoffDelay(0) };
    }
    const noJitter = await delayWithRandom(() => 0);
    const maxJitter = await delayWithRandom(() => 1);
    assert.equal(noJitter.delay, noJitter.base, "random()=0 no agrega jitter");
    // random()=1 → +10 % de la base (1000 → 1100), sin pasar el techo.
    assert.equal(maxJitter.delay, Math.min(noJitter.base + Math.floor(1 * noJitter.base * 0.1), MAX_DELAY_MS));
    assert.ok(maxJitter.delay <= MAX_DELAY_MS, "el jitter nunca supera MAX_DELAY_MS");
    assert.ok(maxJitter.delay > noJitter.delay, "el jitter debe poder agregar tiempo");
  });

  return checks;
}
