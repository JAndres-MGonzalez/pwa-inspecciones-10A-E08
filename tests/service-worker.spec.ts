import assert from "node:assert/strict";
import { loadSource } from "./source-loader.cjs";
import { evaluateSw, fire, navRequest, ENTRY_CACHE, RUNTIME_CACHE, CACHE_PREFIX, PRECACHE } from "./sw-harness.cjs";

type Check = { id: string; status: string; detail?: string };
const HOME = "https://localhost/";

export async function runChecks(): Promise<Check[]> {
  const checks: Check[] = [];
  async function check(id: string, action: () => Promise<unknown>) {
    try {
      await action();
      checks.push({ id, status: "pass" });
    } catch (error) {
      checks.push({
        id,
        status: "fail",
        detail: error instanceof Error ? error.message : String(error)
      });
    }
  }

  await check("sw-install-precache-and-skip-waiting", async () => {
    const { self, cacheStorage } = evaluateSw(PRECACHE);
    await fire(self, "install", {});
    assert.equal(self.state.skipWaitingCalls, 1, "install debe pedir skipWaiting");
    const cache = await cacheStorage.open(ENTRY_CACHE);
    const keys = (await cache.keys()).map((request: Request) => new URL(request.url).pathname);
    for (const url of Object.keys(PRECACHE)) {
      assert.ok(keys.includes(url), `el precache debe incluir ${url}`);
    }
  });

  await check("sw-activate-purges-stale-and-claims", async () => {
    const { self, cacheStorage } = evaluateSw({});
    await cacheStorage.open(CACHE_PREFIX + "static-v0");
    await cacheStorage.open(RUNTIME_CACHE);
    await cacheStorage.open("otra-cache");
    await fire(self, "activate", {});
    const keys = await cacheStorage.keys();
    assert.equal(self.state.claimCalls, 1, "activate debe llamar clients.claim");
    assert.ok(!keys.includes(CACHE_PREFIX + "static-v0"), "la caché antigua debe eliminarse");
    assert.ok(keys.includes(RUNTIME_CACHE), "la caché runtime vigente se conserva");
    assert.ok(keys.includes("otra-cache"), "una caché ajena no debe tocarse");
  });

  await check("sw-navigation-network-first-caches", async () => {
    const { self, cacheStorage } = evaluateSw({ [HOME]: { body: "PAGINA EN LINEA" } });
    const response = await fire(self, "fetch", { request: navRequest(HOME) });
    assert.equal(await response.text(), "PAGINA EN LINEA");
    const runtime = await cacheStorage.open(RUNTIME_CACHE);
    assert.ok(await runtime.match(HOME), "la navegación debe quedar guardada en runtime");
  });

  await check("sw-navigation-offline-uses-cache", async () => {
    const { self, cacheStorage } = evaluateSw({});
    const runtime = await cacheStorage.open(RUNTIME_CACHE);
    await runtime.put(HOME, new Response("VERSION CACHEADA", { status: 200 }));
    const response = await fire(self, "fetch", { request: navRequest(HOME) });
    assert.equal(await response.text(), "VERSION CACHEADA");
  });

  await check("sw-navigation-offline-fallback-html", async () => {
    const { self, cacheStorage } = evaluateSw({});
    const stat = await cacheStorage.open(ENTRY_CACHE);
    await stat.put("/offline.html", new Response("<html>Sin conexión</html>", { status: 200 }));
    const response = await fire(self, "fetch", { request: navRequest(HOME) });
    assert.match(await response.text(), /Sin conexión/);
  });

  await check("sw-static-cached-served-when-network-fails", async () => {
    const url = "https://localhost/_next/static/css/estilos.css";
    const { self, cacheStorage } = evaluateSw({});
    const runtime = await cacheStorage.open(RUNTIME_CACHE);
    await runtime.put(url, new Response("CSS CACHEADO", { status: 200 }));
    const response = await fire(self, "fetch", { request: new Request(url, { method: "GET" }) });
    assert.equal(await response.text(), "CSS CACHEADO");
  });

  await check("sw-static-first-load-cached", async () => {
    const url = "https://localhost/_next/static/js/app.js";
    const { self, cacheStorage } = evaluateSw({ [url]: { body: "JS ONLINE" } });
    const response = await fire(self, "fetch", { request: new Request(url, { method: "GET" }) });
    assert.equal(await response.text(), "JS ONLINE");
    const runtime = await cacheStorage.open(RUNTIME_CACHE);
    assert.ok(await runtime.match(url), "el estático de primera carga debe guardarse");
  });

  await check("sw-api-network-only-not-cached", async () => {
    const url = "https://localhost/api/inspecciones";
    const { self, cacheStorage, fetchCtl } = evaluateSw({ [url]: { body: "API" } });
    const response = await fire(self, "fetch", { request: new Request(url, { method: "GET" }) });
    assert.equal(response, undefined, "el SW no debe interceptar peticiones a /api/*");
    assert.equal(fetchCtl.calls.length, 0, "el SW no debe tocar la red por /api/*");
    for (const name of await cacheStorage.keys()) {
      const cache = await cacheStorage.open(name);
      assert.equal((await cache.keys()).length, 0, "la API no debe persistirse en caché");
    }
  });

  await check("sw-authorization-network-only-not-cached", async () => {
    const { self, cacheStorage, fetchCtl } = evaluateSw({ [HOME]: { body: "AUTORIZADO" } });
    const request = navRequest(HOME, { headers: { authorization: "Bearer ejemplo" } });
    const response = await fire(self, "fetch", { request });
    assert.equal(response, undefined, "el SW no debe interceptar peticiones con autorización");
    assert.equal(fetchCtl.calls.length, 0, "el SW no debe tocar la red en ese caso");
    const runtime = await cacheStorage.open(RUNTIME_CACHE);
    assert.equal((await runtime.keys()).length, 0, "una petición con autorización no debe guardarse");
  });

  await check("sw-purge-caches-message", async () => {
    const { self, cacheStorage } = evaluateSw({});
    await cacheStorage.open(CACHE_PREFIX + "static-v0");
    await cacheStorage.open(RUNTIME_CACHE);
    await cacheStorage.open("otra-cache");
    const port = {
      messages: [] as Array<Record<string, unknown>>,
      postMessage(msg: Record<string, unknown>) {
        this.messages.push(msg);
      }
    };
    await fire(self, "message", { data: { type: "PURGE_CACHES" }, source: null, ports: [port] });
    assert.deepEqual(await cacheStorage.keys(), ["otra-cache"], "solo se eliminan las cachés de la app");
    assert.equal(port.messages.length, 1, "debe confirmarse por el puerto");
    assert.equal(port.messages[0].type, "PURGE_CACHES_DONE");
  });

  await check("register-registers-sw-js-with-scope", async () => {
    const savedWindow = (globalThis as Record<string, unknown>).window;
    const savedNavigator = (globalThis as Record<string, unknown>).navigator;
    let calls = 0;
    let lastArgs: unknown[] = [];
    Object.defineProperty(globalThis, "window", { value: {}, configurable: true, writable: true });
    Object.defineProperty(globalThis, "navigator", {
      value: {
        serviceWorker: {
          async register(...args: unknown[]) {
            calls += 1;
            lastArgs = args;
            return { scope: "/" };
          }
        }
      },
      configurable: true,
      writable: true
    });
    try {
      const mod = loadSource("src/lib/pwa/register-service-worker.ts") as {
        registerServiceWorker: (opts?: unknown) => Promise<unknown>;
      };
      const registration = await mod.registerServiceWorker();
      assert.ok(registration, "debe devolver el registro");
      assert.equal(calls, 1, "register debe llamarse una vez");
      assert.deepEqual(lastArgs, ["/sw.js", { scope: "/" }], "ruta y alcance esperados");
    } finally {
      Object.defineProperty(globalThis, "window", { value: savedWindow, configurable: true, writable: true });
      Object.defineProperty(globalThis, "navigator", { value: savedNavigator, configurable: true, writable: true });
    }
  });

  await check("register-unsupported-returns-undefined", async () => {
    const savedWindow = (globalThis as Record<string, unknown>).window;
    const savedNavigator = (globalThis as Record<string, unknown>).navigator;
    Object.defineProperty(globalThis, "window", { value: {}, configurable: true, writable: true });
    Object.defineProperty(globalThis, "navigator", { value: {}, configurable: true, writable: true });
    try {
      const mod = loadSource("src/lib/pwa/register-service-worker.ts") as {
        registerServiceWorker: () => Promise<unknown>;
      };
      const result = await mod.registerServiceWorker();
      assert.equal(result, undefined, "sin soporte debe devolver undefined según la API actual");
    } finally {
      Object.defineProperty(globalThis, "window", { value: savedWindow, configurable: true, writable: true });
      Object.defineProperty(globalThis, "navigator", { value: savedNavigator, configurable: true, writable: true });
    }
  });

  await check("sw-static-revalidates-cached-response", async () => {
    const url = "https://localhost/_next/static/app.js";
    const { self, cacheStorage, fetchCtl } = evaluateSw({ [url]: { body: "NUEVO" } });
    const runtime = await cacheStorage.open(RUNTIME_CACHE);
    await runtime.put(url, new Response("ANTERIOR"));
    const response = await fire(self, "fetch", { request: new Request(url) });
    assert.equal(await response.text(), "ANTERIOR");
    assert.equal(await (await runtime.match(url)).text(), "NUEVO");
    assert.deepEqual(fetchCtl.calls, [url]);
  });

  await check("sw-bypasses-other-origins-methods-and-rsc", async () => {
    const { self, fetchCtl, cacheStorage } = evaluateSw();
    for (const request of [
      new Request("https://externo.example/recurso"),
      new Request(HOME, { method: "POST", body: "ejemplo" }),
      new Request(HOME, { method: "HEAD" }),
      new Request(HOME, { headers: { RSC: "1" } }),
      new Request(HOME + "?_rsc=demo"),
      new Request(HOME + "api"),
      new Request(HOME + "sw.js")
    ]) assert.equal(await fire(self, "fetch", { request }), undefined);
    assert.equal(fetchCtl.calls.length, 0);
    assert.deepEqual(await cacheStorage.keys(), []);
  });

  await check("sw-cache-first-reuses-public-resource", async () => {
    const url = HOME + "icons/icon-192.png";
    const { self, fetchCtl } = evaluateSw({ [url]: { body: "IMAGEN" } });
    for (let i = 0; i < 2; i += 1) {
      const response = await fire(self, "fetch", { request: new Request(url) });
      assert.equal(await response.text(), "IMAGEN");
    }
    assert.equal(fetchCtl.calls.length, 1);
  });

  await check("sw-does-not-store-http-errors", async () => {
    const { self, cacheStorage } = evaluateSw({ [HOME]: { body: "FALLO", status: 500 } });
    const response = await fire(self, "fetch", { request: navRequest(HOME) });
    assert.equal(response.status, 500);
    assert.equal(await (await cacheStorage.open(RUNTIME_CACHE)).match(HOME), undefined);
  });

  await check("sw-skip-waiting-message-and-invalid-messages", async () => {
    const { self } = evaluateSw();
    await fire(self, "message", { data: null });
    await fire(self, "message", { data: { type: "DESCONOCIDO" } });
    assert.equal(self.state.skipWaitingCalls, 0);
    await fire(self, "message", { data: { type: "SKIP_WAITING" } });
    assert.equal(self.state.skipWaitingCalls, 1);
    await fire(self, "message", { data: { type: "PURGE_CACHES" } });
  });

  await check("sw-install-fails-if-required-asset-is-unavailable", async () => {
    const { self } = evaluateSw({ ...PRECACHE, "/offline.html": null });
    await assert.rejects(() => fire(self, "install"));
    assert.equal(self.state.skipWaitingCalls, 0);
  });

  await check("sw-network-response-survives-cache-write-failure", async () => {
    const { self, cacheStorage } = evaluateSw({ [HOME]: { body: "HTML DISPONIBLE" } });
    const runtime = await cacheStorage.open(RUNTIME_CACHE);
    runtime.put = async () => { throw new Error("Sin espacio"); };
    const response = await fire(self, "fetch", { request: navRequest(HOME) });
    assert.equal(await response.text(), "HTML DISPONIBLE");
  });

  await check("sw-runtime-cache-bounded-evicts-oldest", async () => {
    const urls = Array.from({ length: 26 }, (_, i) => `https://localhost/pagina-${i}`);
    const routes = Object.fromEntries(urls.map((url) => [url, { body: "OK" }]));
    const { self, cacheStorage } = evaluateSw(routes);
    for (const url of urls) {
      await fire(self, "fetch", { request: new Request(url, { method: "GET" }) });
    }
    const runtime = await cacheStorage.open(RUNTIME_CACHE);
    const paths = (await runtime.keys()).map((request: Request) => new URL(request.url).pathname);
    assert.equal(paths.length, 24, "la caché runtime debe quedar acotada al máximo permitido");
    assert.ok(!paths.includes("/pagina-0"), "se elimina la entrada más antigua");
    assert.ok(!paths.includes("/pagina-1"), "se elimina también la segunda más antigua");
    assert.ok(paths.includes("/pagina-25"), "las entradas más recientes se conservan");
  });

  return checks;
}
