import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ORIGIN, RUNTIME_CACHE, createHarness, makeRequest } from "./sw-harness";
import type { SwRequest } from "./sw-harness";

const root = resolve(__dirname, "..");

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

  async function ready() {
    const sw = createHarness();
    await sw.lifecycle("install");
    await sw.lifecycle("activate");
    return sw;
  }

  await check("offline-page-exists", () => {
    const file = resolve(root, "public/offline.html");
    assert.ok(existsSync(file), "Falta public/offline.html");
    assert.match(readFileSync(file, "utf8"), /sin conexi/i);
  });

  await check("offline-visited-page-from-cache", async () => {
    const sw = await ready();
    const page = makeRequest("/inspecciones", { mode: "navigate" });
    const online = await sw.fetchEvent(page);
    assert.equal(online.handled, true);
    assert.equal(online.response.body, `network:${ORIGIN}/inspecciones:1`);
    sw.network.online = false;
    const offline = await sw.fetchEvent(page);
    assert.equal(offline.response.body, `network:${ORIGIN}/inspecciones:1`, "Debe servir la pagina guardada");
  });

  await check("offline-unknown-route-shows-fallback", async () => {
    const sw = await ready();
    sw.network.online = false;
    const result = await sw.fetchEvent(makeRequest("/ruta-inventada", { mode: "navigate" }));
    assert.equal(result.response.body, "precache:/offline.html");
  });

  await check("offline-without-fallback-returns-503", async () => {
    const sw = createHarness();
    sw.network.online = false;
    const result = await sw.fetchEvent(makeRequest("/ruta-inventada", { mode: "navigate" }));
    assert.equal(result.response.status, 503);
    assert.match(await result.response.text(), /Sin conexi/);
  });

  await check("offline-static-assets-stale-while-revalidate", async () => {
    const sw = await ready();
    const url = `${ORIGIN}/_next/static/app.js`;
    const asset = makeRequest("/_next/static/app.js", { mode: "no-cors" });
    const first = await sw.fetchEvent(asset);
    assert.equal(first.response.body, `network:${url}:1`);
    const second = await sw.fetchEvent(asset);
    assert.equal(second.response.body, `network:${url}:1`, "Debe responder desde la cache");
    await new Promise((done) => setTimeout(done, 0));
    const runtime = sw.caches.stores.get(RUNTIME_CACHE);
    assert.equal(runtime?.get(url)?.body, `network:${url}:2`, "Debe revalidar en segundo plano");
    sw.network.online = false;
    const offline = await sw.fetchEvent(asset);
    assert.equal(offline.response.body, `network:${url}:2`);
  });

  await check("offline-other-assets-cache-first", async () => {
    const sw = await ready();
    const url = `${ORIGIN}/icons/icon-192.png`;
    const icon = makeRequest("/icons/icon-192.png", { mode: "no-cors" });
    const first = await sw.fetchEvent(icon);
    assert.equal(first.response.body, `network:${url}:1`);
    sw.network.online = false;
    const cached = await sw.fetchEvent(icon);
    assert.equal(cached.response.body, `network:${url}:1`, "Debe servir desde la cache");
    assert.equal(sw.counters.networkCalls, 1, "Cache-first no debe pedir a la red si ya esta guardado");
    const missing = await sw.fetchEvent(makeRequest("/icons/otro.png", { mode: "no-cors" }));
    assert.equal(missing.response.status, 503);
  });

  await check("offline-requests-not-intercepted", async () => {
    const sw = await ready();
    const cases: Array<[string, SwRequest]> = [
      ["post", makeRequest("/api/inspecciones", { method: "POST" })],
      ["api-get", makeRequest("/api/inspecciones")],
      ["authorization", makeRequest("/inspecciones", { headers: { Authorization: "Bearer prueba" } })],
      ["cross-origin", makeRequest("https://example.com/lib.js")],
    ];
    for (const [name, request] of cases) {
      const result = await sw.fetchEvent(request);
      assert.equal(result.handled, false, `No se debe interceptar: ${name}`);
    }
    assert.equal(sw.counters.networkCalls, 0);
  });

  return checks;
}
