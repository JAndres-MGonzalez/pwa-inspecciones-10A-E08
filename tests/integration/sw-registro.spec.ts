/* tests/integration/sw-registro.spec.ts
 *
 * Bloque B de la semana 8 (pirámide de integración).
 *
 * Verifica el CONTRATO entre la app (registerServiceWorker), el archivo real public/sw.js
 * y el harness en memoria. No repite lo que ya cubre tests/service-worker.spec.ts:
 *   - register-registers-sw-js-with-scope     (registro feliz: una llamada con /sw.js y scope "/")
 *   - register-unsupported-returns-undefined  (sin soporte devuelve undefined)
 *   - sw-skip-waiting-message-and-invalid-messages (mensaje SKIP_WAITING)
 * Aquí van los escenarios que ninguna de esas suites toca.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { loadSource } from "../source-loader.cjs";
import { evaluateSw, fire, PRECACHE, ENTRY_CACHE, RUNTIME_CACHE, CACHE_PREFIX } from "../sw-harness.cjs";

type Check = { id: string; status: string; detail?: string };

/** Instala un navigator/window falsos solo durante `action` y los restaura siempre. */
async function withNavigator(navigatorValue: unknown, action: () => Promise<void>) {
  const g = globalThis as Record<string, unknown>;
  const savedWindow = g.window;
  const savedNavigator = g.navigator;
  Object.defineProperty(globalThis, "window", { value: {}, configurable: true, writable: true });
  Object.defineProperty(globalThis, "navigator", { value: navigatorValue, configurable: true, writable: true });
  try {
    await action();
  } finally {
    Object.defineProperty(globalThis, "window", { value: savedWindow, configurable: true, writable: true });
    Object.defineProperty(globalThis, "navigator", { value: savedNavigator, configurable: true, writable: true });
  }
}

function loadRegister() {
  // Carga fresca: loadSource sin caché compartida evita arrastrar estado entre checks.
  return loadSource("src/lib/pwa/register-service-worker.ts") as {
    registerServiceWorker: () => Promise<unknown>;
  };
}

export async function runChecks(): Promise<Check[]> {
  const checks: Check[] = [];
  async function check(id: string, action: () => Promise<unknown>) {
    try {
      await action();
      checks.push({ id, status: "pass" });
    } catch (error) {
      checks.push({ id, status: "fail", detail: error instanceof Error ? error.message : String(error) });
    }
  }

  await check("register-url-points-to-existing-worker-file", async () => {
    // Lo que la app registra debe existir en public/ y quedar dentro del alcance declarado.
    let captured: unknown[] = [];
    const fakeNavigator = {
      serviceWorker: { async register(...args: unknown[]) { captured = args; return { scope: "/" }; } }
    };
    await withNavigator(fakeNavigator, async () => { await loadRegister().registerServiceWorker(); });

    const [url, options] = captured as [string, { scope: string }];
    assert.equal(typeof url, "string");
    assert.ok(url.startsWith(options.scope), "el script del worker debe estar dentro de su scope");
    const file = path.resolve(__dirname, "../../public", url.replace(/^\//, ""));
    assert.ok(fs.existsSync(file), `la app registra ${url} pero public/${url.replace(/^\//, "")} no existe`);

    // Y ese mismo archivo es el que el harness evalúa: instala sin lanzar.
    const { self, cacheStorage } = evaluateSw(PRECACHE);
    await fire(self, "install", {});
    const shell = await cacheStorage.open(ENTRY_CACHE);
    assert.ok((await shell.keys()).length > 0, "el worker real debe precachear su shell");
  });

  await check("register-rejection-degrades-without-throw", async () => {
    // Si el navegador rechaza el registro, la app no debe romperse: undefined + error registrado.
    const savedError = console.error;
    const logged: unknown[][] = [];
    console.error = (...args: unknown[]) => { logged.push(args); };
    try {
      const fakeNavigator = {
        serviceWorker: { async register() { throw new Error("SecurityError sintético"); } }
      };
      await withNavigator(fakeNavigator, async () => {
        const result = await loadRegister().registerServiceWorker();
        assert.equal(result, undefined);
      });
    } finally {
      console.error = savedError;
    }
    assert.equal(logged.length, 1, "el fallo debe dejar constancia en console.error");
  });

  await check("register-twice-delegates-dedup-to-browser", async () => {
    // El módulo no guarda estado propio: cada invocación delega en register con los MISMOS
    // argumentos. La deduplicación es del navegador (misma URL + scope = mismo registro).
    const calls: unknown[][] = [];
    const registration = { scope: "/" };
    const fakeNavigator = {
      serviceWorker: { async register(...args: unknown[]) { calls.push(args); return registration; } }
    };
    await withNavigator(fakeNavigator, async () => {
      const { registerServiceWorker } = loadRegister();
      const first = await registerServiceWorker();
      const second = await registerServiceWorker();
      assert.equal(first, registration);
      assert.equal(second, registration, "ambas invocaciones devuelven el mismo registro");
    });
    assert.equal(calls.length, 2);
    assert.deepEqual(calls[0], calls[1], "los argumentos no deben variar entre invocaciones");
  });

  await check("sw-update-flow-install-then-activate-purges-old-version", async () => {
    // Flujo completo de actualización con el worker real: una caché de versión anterior
    // convive, el worker nuevo instala (skipWaiting) y al activar la purga y toma control.
    const { self, cacheStorage } = evaluateSw(PRECACHE);
    await cacheStorage.open(CACHE_PREFIX + "static-v0");
    await cacheStorage.open("otra-cache");

    await fire(self, "install", {});
    assert.equal(self.state.skipWaitingCalls, 1);
    assert.equal(self.state.claimCalls, 0, "aún no toma control antes de activar");

    await fire(self, "activate", {});
    const keys = await cacheStorage.keys();
    assert.equal(self.state.claimCalls, 1);
    assert.ok(keys.includes(ENTRY_CACHE), "la caché vigente instalada se conserva");
    assert.ok(!keys.includes(CACHE_PREFIX + "static-v0"), "la versión anterior se purga");
    assert.ok(keys.includes("otra-cache"), "una caché ajena no se toca");
  });

  return checks;
}
