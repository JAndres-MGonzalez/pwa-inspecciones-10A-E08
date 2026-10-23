import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { startBrowser } from "./browser.cjs";
import { startProductionServer } from "./production-server.cjs";

export async function runChecks() {
  const checks: Array<{ id: string; status: string; detail?: string }> = [];
  const server = await startProductionServer();
  async function check(id: string, action: () => unknown) {
    try { await action(); checks.push({ id, status: "pass" }); }
    catch (error) { checks.push({ id, status: "fail", detail: String(error) }); }
  }
  async function page(name: string, withoutLocation = false) {
    const browser = await startBrowser(name);
    try {
      await browser.call("Page.addScriptToEvaluateOnNewDocument", { source: `
        window.__w08Now = 1000;
        Date.now = () => window.__w08Now;
        Object.defineProperty(Crypto.prototype, 'randomUUID', { value: () => '${name}' });
        ${withoutLocation ? "Object.defineProperty(navigator, 'geolocation', {value: undefined, configurable: true});" : ""}
      ` });
      await browser.call("Page.navigate", { url: server.url + "/captura" });
      await browser.wait("document.querySelector('fieldset')?.disabled === false");
      await browser.evaluate(`navigator.serviceWorker.ready.then(() => navigator.serviceWorker.controller
        ? true : new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(true), {once:true})))`);
      // La primera visita puede ser anterior al control del SW: recargar online guarda la ruta y sus assets.
      await browser.call("Page.reload", { ignoreCache: true });
      await browser.wait("document.querySelector('fieldset')?.disabled === false");
      return browser;
    } catch (error) { await browser.close(); throw error; }
  }
  async function flow(name: string, withoutLocation: boolean) {
    const browser = await page(name, withoutLocation);
    const id = `inspection-${name}`;
    const count = async () => {
      const response = await fetch(`${server.url}/api/inspecciones?id=${id}`, { signal: AbortSignal.timeout(5000) });
      assert.equal(response.status, 200);
      return response.json();
    };
    try {
      assert.equal((await count()).count, 0, "Estado remoto inicial aislado");
      if (withoutLocation) {
        const selector = await browser.evaluate(`(() => { const buttons = [...document.querySelectorAll('button')]; const b = buttons.find(x => x.textContent === 'Adjuntar ubicación'); b.setAttribute('data-location-test',''); return '[data-location-test]'; })()`);
        await browser.click(selector);
        await browser.wait("document.body.textContent.includes('sin ubicación') || document.body.textContent.includes('sin coordenadas') || document.body.textContent.includes('geolocalización')");
        assert.equal(await browser.evaluate("navigator.geolocation === undefined"), true);
      }
      await browser.call("Network.emulateNetworkConditions", { offline: true, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
      await browser.wait("document.querySelector('[data-connection]')?.dataset.connection === 'offline'");
      await browser.click("textarea[name=summary]");
      await browser.call("Input.insertText", { text: "Inspección sintética guardada sin conexión." });
      await browser.click("button[type=submit]");
      await browser.wait("document.querySelector('[data-inspection-id]')?.dataset.syncState === 'pending'");
      assert.equal((await count()).count, 0, "Guardar offline no envía al servidor");
      await browser.call("Page.reload", { ignoreCache: true });
      await browser.wait("document.querySelector('[data-inspection-id]')?.dataset.syncState === 'pending' && document.querySelector('fieldset')?.disabled === false");
      assert.equal(await browser.evaluate("document.querySelectorAll('[data-inspection-id]').length"), 1);
      assert.equal(await browser.evaluate("document.querySelector('[data-inspection-id]').dataset.inspectionId"), id);
      await browser.call("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
      await browser.wait("document.querySelector('[data-connection]')?.dataset.connection === 'online'");
      let lostResponse = false;
      browser.on("Fetch.requestPaused", async (event: any) => {
        try {
          if (!lostResponse && event.request.method === "POST") {
            lostResponse = true;
            await browser.call("Fetch.failRequest", { requestId: event.requestId, errorReason: "ConnectionClosed" });
          } else await browser.call("Fetch.continueRequest", { requestId: event.requestId });
        } catch {}
      });
      await browser.call("Fetch.enable", { patterns: [{ urlPattern: "*/api/inspecciones", requestStage: "Response" }] });
      const syncSelector = await browser.evaluate(`(() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent === 'Sincronizar'); b.setAttribute('data-sync-test',''); return '[data-sync-test]'; })()`);
      await browser.click(syncSelector);
      await browser.wait("document.querySelector('[data-capture-message]')?.textContent.includes('No se completó la sincronización')");
      assert.equal(lostResponse, true);
      assert.equal((await count()).count, 1, "El servidor guardó antes de perderse la respuesta");
      await browser.evaluate("window.__w08Now = 10000");
      await browser.click(syncSelector);
      await browser.wait("document.querySelector('[data-inspection-id]')?.dataset.syncState === 'synced'");
      assert.equal((await count()).count, 1, "El reintento conserva una sola inspección remota");
      await browser.click(syncSelector);
      await browser.wait("document.querySelector('[data-sync-test]').disabled === false");
      assert.equal((await count()).count, 1);
      assert.equal(await browser.evaluate("document.querySelectorAll('[data-inspection-id]').length"), 1);
      mkdirSync("reports/w08-testing-ci/browser", { recursive: true });
      const screenshot = await browser.call("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
      writeFileSync(`reports/w08-testing-ci/browser/${name}.png`, Buffer.from(screenshot.data, "base64"));
    } finally { await browser.close(); }
  }
  try {
    await check("captura-invalida-no-persiste", async () => {
      const browser = await page("w08-invalida");
      try {
        await browser.click("button[type=submit]");
        await browser.wait("document.querySelector('[data-capture-message]')?.textContent.includes('resumen')");
        assert.equal(await browser.evaluate("document.querySelectorAll('[data-inspection-id]').length"), 0);
      } finally { await browser.close(); }
    });
    await check("crear-offline-recargar-sincronizar-sin-duplicar", () => flow("w08-flujo", false));
    await check("captura-con-capacidad-no-disponible", () => flow("w08-sin-ubicacion", true));
  } finally { await server.stop(); }
  return checks;
}
