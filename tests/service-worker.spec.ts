import assert from "node:assert/strict";
import { loadSource } from "./source-loader.cjs";
import { ORIGIN, PRECACHE_URLS, STATIC_CACHE, createHarness } from "./sw-harness";

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

  await check("sw-install-precaches-shell", async () => {
    const sw = createHarness();
    await sw.lifecycle("install");
    const shell = sw.caches.stores.get(STATIC_CACHE);
    assert.ok(shell, "Falta la cache estatica del app shell");
    for (const url of PRECACHE_URLS) {
      assert.ok(shell.has(`${ORIGIN}${url}`), `Falta ${url} en el precache`);
    }
  });

  await check("sw-activate-removes-old-caches", async () => {
    const sw = createHarness();
    for (const name of ["inspecciones-static-v0", "inspecciones-runtime-v0", "otra-cache"]) {
      await sw.caches.open(name);
    }
    await sw.lifecycle("install");
    await sw.lifecycle("activate");
    const names = (await sw.caches.keys()).sort();
    assert.deepEqual(names, [STATIC_CACHE, "otra-cache"], "Borra solo versiones viejas propias");
    assert.equal(sw.counters.claim, 1, "Debe tomar control con clients.claim()");
  });

  await check("sw-skip-waiting-message", async () => {
    const sw = createHarness();
    await sw.lifecycle("install");
    await sw.lifecycle("activate");
    const base = sw.counters.skipWaiting;
    await sw.message({ type: "OTRO_MENSAJE" });
    await sw.message(undefined);
    assert.equal(sw.counters.skipWaiting, base, "Otros mensajes no deben activar la actualizacion");
    await sw.message({ type: "SKIP_WAITING" });
    assert.equal(sw.counters.skipWaiting, base + 1, "SKIP_WAITING debe activar la nueva version");
  });

  await check("sw-purge-caches-message", async () => {
    const sw = createHarness();
    await sw.lifecycle("install");
    await sw.caches.open("inspecciones-runtime-v1");
    await sw.caches.open("otra-cache");
    const received: unknown[] = [];
    await sw.message({ type: "PURGE_CACHES" }, [{ postMessage: (data: unknown) => received.push(data) }]);
    assert.deepEqual(await sw.caches.keys(), ["otra-cache"]);
    assert.deepEqual(received, [{ type: "PURGE_CACHES_DONE" }]);
  });

  await check("register-module-exports", () => {
    const mod = loadSource("src/lib/pwa/register-service-worker.ts");
    const register = mod.default ?? mod.registerServiceWorker;
    assert.equal(typeof register, "function", "El modulo de registro debe exportar una funcion");
  });

  return checks;
}
