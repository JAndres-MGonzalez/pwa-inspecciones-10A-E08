const { spawn } = require("node:child_process");
const { existsSync, mkdtempSync, mkdirSync, writeFileSync, realpathSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join, sep, basename } = require("node:path");
const WebSocket = require("next/dist/compiled/ws");

// CDP usa el WebSocket ya incluido en la versión fijada de Next; no descarga navegador.
async function startBrowser(name) {
  const executable = [process.env.CHROME_PATH,
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"]
    .find(path => path && existsSync(path));
  if (!executable) throw new Error("Falta Chrome/Edge. Define CHROME_PATH con el ejecutable para las pruebas E2E.");
  const profile = mkdtempSync(join(tmpdir(), "pwa-w08-"));
  const child = spawn(executable, ["--headless=new", "--remote-debugging-port=0",
    "--remote-debugging-address=127.0.0.1", `--user-data-dir=${profile}`,
    "--no-first-run", "--no-default-browser-check", "--disable-gpu", "--edge-skip-compat-layer-relaunch",
    ...(process.platform === "linux" ? ["--no-sandbox"] : []), "about:blank"],
  { stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
  let socket;
  let sessionId;
  let nextId = 0;
  const pending = new Map();
  const listeners = new Map();
  const close = async () => {
    let closingNormally = false;
    if (socket?.readyState === WebSocket.OPEN) {
      try {
        const coverage = await call("Profiler.takePreciseCoverage");
        mkdirSync("reports/w08-testing-ci/browser", { recursive: true });
        writeFileSync(`reports/w08-testing-ci/browser/${name}-coverage.json`, JSON.stringify(coverage));
      } catch {}
      closingNormally = true;
      await call("Browser.close", {}, false).catch(() => {});
    }
    socket?.terminate();
    if (child.exitCode === null && child.signalCode === null) {
      await new Promise(done => {
        const timer = setTimeout(() => child.kill("SIGKILL"), 3000);
        child.once("exit", () => { clearTimeout(timer); done(); });
        // Browser.close ya inició el cierre de Chrome y sus procesos hijos.
        if (!closingNormally) child.kill();
      });
    }
    // Se elimina únicamente el perfil temporal que creó esta ejecución.
    const actual = realpathSync(profile);
    if (!actual.startsWith(realpathSync(tmpdir()) + sep) || !basename(actual).startsWith("pwa-w08-")) {
      throw new Error("El perfil temporal no está en la carpeta esperada.");
    }
    try { rmSync(actual, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); }
    catch (error) {
      // Un archivo temporal aún abierto no debe ocultar el resultado de la prueba.
      console.warn(`El navegador se cerró; limpieza temporal pendiente (${error.code}).`);
    }
  };
  function call(method, params = {}, page = true) {
    return new Promise((resolve, reject) => {
      const id = ++nextId;
      const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP agotó el tiempo: ${method}`)); }, 15000);
      pending.set(id, { resolve, reject, timer });
      socket.send(JSON.stringify({ id, method, params, ...(page && sessionId ? { sessionId } : {}) }));
    });
  }
  try {
    const endpoint = await new Promise((resolve, reject) => {
      let output = "";
      const timer = setTimeout(() => reject(new Error(`No inició el navegador: ${output.slice(-1000)}`)), 15000);
      child.once("error", error => { clearTimeout(timer); reject(error); });
      child.once("exit", code => {
        if (code !== 0) { clearTimeout(timer); reject(new Error(`El navegador terminó (${code}). ${output.slice(-1500)}`)); }
      });
      child.stdout.on("data", chunk => { output += chunk; });
      child.stderr.on("data", chunk => {
        output += chunk;
        const match = output.match(/DevTools listening on (ws:\/\/127\.0\.0\.1:\d+\/\S+)/);
        if (match) { clearTimeout(timer); resolve(match[1]); }
      });
    });
    socket = new WebSocket(endpoint);
    socket.on("message", raw => {
      const message = JSON.parse(raw.toString());
      if (message.id) {
        const request = pending.get(message.id);
        if (!request) return;
        clearTimeout(request.timer); pending.delete(message.id);
        if (message.error) request.reject(new Error(message.error.message));
        else request.resolve(message.result);
      } else if (listeners.has(message.method)) {
        for (const listener of listeners.get(message.method)) listener(message.params);
      }
    });
    socket.on("close", () => {
      for (const request of pending.values()) { clearTimeout(request.timer); request.reject(new Error("Conexión CDP cerrada.")); }
      pending.clear();
    });
    await new Promise((resolve, reject) => { socket.once("open", resolve); socket.once("error", reject); });
    const target = await call("Target.createTarget", { url: "about:blank" }, false);
    const attached = await call("Target.attachToTarget", { targetId: target.targetId, flatten: true }, false);
    sessionId = attached.sessionId;
    const version = await call("Browser.getVersion", {}, false);
    mkdirSync("reports/w08-testing-ci/browser", { recursive: true });
    writeFileSync(`reports/w08-testing-ci/browser/${name}-environment.json`, JSON.stringify({
      browser: version.product, protocol: version.protocolVersion, node: process.version, platform: process.platform
    }, null, 2) + "\n");
    await call("Page.enable"); await call("Runtime.enable"); await call("Network.enable");
    await call("Profiler.enable"); await call("Profiler.startPreciseCoverage", { callCount: true, detailed: true });
    const evaluate = async expression => {
      const result = await call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true, userGesture: true });
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
      return result.result.value;
    };
    const wait = async expression => {
      const deadline = Date.now() + 15000;
      while (Date.now() < deadline) {
        try { if (await evaluate(expression)) return; } catch {}
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      throw new Error(`No se cumplió la condición de interfaz: ${expression}`);
    };
    const click = async selector => {
      const point = await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el || el.disabled) throw Error('Control no disponible'); el.scrollIntoView({block:'center'}); const r = el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
      await call("Input.dispatchMouseEvent", { type: "mousePressed", ...point, button: "left", clickCount: 1 });
      await call("Input.dispatchMouseEvent", { type: "mouseReleased", ...point, button: "left", clickCount: 1 });
    };
    return { call, evaluate, wait, click, close,
      on(method, listener) { if (!listeners.has(method)) listeners.set(method, []); listeners.get(method).push(listener); } };
  } catch (error) { await close(); throw error; }
}

module.exports = { startBrowser };
