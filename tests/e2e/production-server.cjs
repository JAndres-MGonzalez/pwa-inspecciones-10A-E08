const { spawn } = require("node:child_process");
const { existsSync } = require("node:fs");
const { createServer } = require("node:http");
const { resolve } = require("node:path");

const root = resolve(__dirname, "../..");

async function startProductionServer() {
  if (process.env.E2E_BASE_URL) {
    if (!/^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?\/?$/.test(process.env.E2E_BASE_URL)) {
      throw new Error("E2E_BASE_URL debe apuntar a HTTP local.");
    }
    const url = new URL(process.env.E2E_BASE_URL);
    return { url: url.origin, stop: async () => {} };
  }
  if (!existsSync(resolve(root, ".next/BUILD_ID"))) {
    throw new Error("Falta el build de producción. Ejecuta npm run build antes de npm test.");
  }
  const child = spawn(process.execPath, [__filename], {
    cwd: root, stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, NODE_ENV: "production" }
  });
  const stop = async () => {
    if (child.exitCode !== null || child.signalCode !== null) return;
    await new Promise((done) => {
      child.once("exit", done);
      child.kill();
    });
  };
  try {
    const url = await new Promise((done, reject) => {
      let output = "";
      const timer = setTimeout(() => {
        reject(new Error(`El servidor no inició en 30 s. ${output.slice(-1500)}`));
      }, 30000);
      child.once("error", (error) => { clearTimeout(timer); reject(error); });
      child.once("exit", (code) => {
        clearTimeout(timer);
        reject(new Error(`El servidor terminó antes de iniciar (${code}). ${output.slice(-1500)}`));
      });
      child.stderr.on("data", (chunk) => { output += chunk; });
      child.stdout.on("data", (chunk) => {
        output += chunk;
        const ready = output.match(/E2E_READY (http:\/\/127\.0\.0\.1:\d+)/);
        if (ready) { clearTimeout(timer); done(ready[1]); }
      });
    });
    return { url, stop };
  } catch (error) {
    await stop();
    throw error;
  }
}

if (require.main === module) {
  (async () => {
    const app = require("next")({ dev: false, dir: root, hostname: "127.0.0.1", port: 0 });
    await app.prepare();
    const server = createServer(app.getRequestHandler());
    server.once("error", (error) => { console.error(error); process.exitCode = 1; });
    server.listen(0, "127.0.0.1", () => {
      console.log(`E2E_READY http://127.0.0.1:${server.address().port}`);
    });
    process.on("SIGTERM", async () => {
      server.closeAllConnections();
      server.close();
      await app.close();
      process.exit(0);
    });
  })().catch((error) => { console.error(error); process.exitCode = 1; });
}

module.exports = { startProductionServer };
