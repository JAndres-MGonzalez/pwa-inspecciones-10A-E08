import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { evaluateSw, fire, navRequest, ENTRY_CACHE, CACHE_PREFIX, PRECACHE } from "./sw-harness.cjs";

type Check = { id: string; status: string; detail?: string };
const HOME = "https://localhost/";
const root = resolve(__dirname, "..");

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

  await check("offline-consistency-snapshot", async () => {
    const { self, fetchCtl } = evaluateSw({ [HOME]: { body: "HTML-ONLINE-UNICO" } });
    const first = await fire(self, "fetch", { request: navRequest(HOME) });
    const onlineBody = await first.text();
    assert.ok(onlineBody.length > 0);
    fetchCtl.routes = {};
    const second = await fire(self, "fetch", { request: navRequest(HOME) });
    const offlineBody = await second.text();
    assert.equal(offlineBody, onlineBody, "offline debe devolver el mismo snapshot que la carga en línea");
  });

  await check("offline-update-removes-previous-version", async () => {
    const { self, cacheStorage } = evaluateSw({ [HOME]: { body: "HTML-V2" } });
    const old = await cacheStorage.open(CACHE_PREFIX + "static-v0");
    await old.put(HOME, new Response("HTML-V1", { status: 200 }));
    await fire(self, "activate", {});
    assert.ok(
      !(await cacheStorage.keys()).includes(CACHE_PREFIX + "static-v0"),
      "la versión previa debe purgarse antes de activarse"
    );
    const response = await fire(self, "fetch", { request: navRequest(HOME) });
    assert.equal(await response.text(), "HTML-V2", "nunca debe servirse la versión anterior");
  });

  await check("offline-fallback-precached-and-present", async () => {
    const { self, cacheStorage } = evaluateSw(PRECACHE);
    await fire(self, "install", {});
    const stat = await cacheStorage.open(ENTRY_CACHE);
    assert.ok(await stat.match("/offline.html"), "offline.html debe estar en el precache");
    assert.ok(existsSync(resolve(root, "public/offline.html")), "debe existir public/offline.html");
    const response = await fire(self, "fetch", { request: navRequest("https://localhost/ruta-sin-cache") });
    assert.match(await response.text(), /Sin conexión/);
  });

  await check("offline-dataset-remains-synthetic", async () => {
    const source = readFileSync(resolve(root, "src/lib/data/inspections.ts"), "utf8");
    for (const entry of ["inspection-001", "inspection-002", "inspection-003"]) {
      assert.ok(source.includes(entry), `el dataset debe contener ${entry}`);
    }
    for (const lab of ["Redes", "Electrónica", "Software"]) {
      assert.ok(source.includes(lab), `el dataset debe mencionar ${lab}`);
    }
  });

  await check("offline-first-visit-includes-html-css-and-js", async () => {
    const { self, fetchCtl } = evaluateSw(PRECACHE);
    await fire(self, "install");
    await fire(self, "activate");
    fetchCtl.routes = {};
    const home = await fire(self, "fetch", { request: navRequest(HOME) });
    assert.equal(await home.text(), PRECACHE["/"].body);
    for (const file of ["/_next/static/app.css", "/_next/static/app.js"]) {
      const response = await fire(self, "fetch", { request: new Request(new URL(file, HOME)) });
      assert.equal(await response.text(), PRECACHE[file].body);
    }
  });

  await check("offline-repeated-reads-do-not-consume-cached-body", async () => {
    const { self, fetchCtl } = evaluateSw({ [HOME]: { body: "HTML" } });
    await fire(self, "fetch", { request: navRequest(HOME) });
    fetchCtl.routes = {};
    for (let i = 0; i < 3; i += 1) {
      const response = await fire(self, "fetch", { request: navRequest(HOME) });
      assert.equal(await response.text(), "HTML");
    }
  });

  await check("offline-empty-cache-returns-503-and-ignores-foreign-data", async () => {
    const { self, cacheStorage } = evaluateSw();
    const foreign = await cacheStorage.open("otra-cache");
    await foreign.put(HOME, new Response("AJENO"));
    for (const request of [navRequest(HOME), new Request(HOME + "imagen.png"), new Request(HOME + "_next/static/app.js")]) {
      const response = await fire(self, "fetch", { request });
      assert.equal(response.status, 503);
      assert.match(await response.text(), /Sin conexión/);
    }
  });

  return checks;
}
