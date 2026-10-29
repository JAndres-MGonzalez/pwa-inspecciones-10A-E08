import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createSecurityHeaders, CSP_HEADER, SECURITY_HEADERS } from "../src/lib/security/headers-csp";
import { startProductionServer } from "./e2e/production-server.cjs";

export async function runChecks() {
  const checks: Array<{ id: string; status: string; detail?: string }> = [];
  const check = async (id: string, action: () => unknown) => {
    try { await action(); checks.push({ id, status: "pass" }); }
    catch (error) { checks.push({ id, status: "fail", detail: String(error) }); }
  };
  const configured = (development: boolean) => JSON.parse(execFileSync(process.execPath, [
    "--input-type=module", "-e",
    "const { default: config } = await import('./next.config.mjs'); console.log(JSON.stringify((await config.headers()).find(item => item.source === '/:path*').headers));"
  ], { encoding: "utf8", env: { ...process.env, NODE_ENV: development ? "development" : "production" } }));

  await check("csp-produccion-restringe-origenes-y-enmarcado", () => {
    const directives = new Map(CSP_HEADER.split("; ").map(line => {
      const [name, ...values] = line.split(" ");
      return [name, values];
    }));
    for (const name of ["default-src", "connect-src", "worker-src", "base-uri", "form-action"]) {
      assert.deepEqual(directives.get(name), ["'self'"], name);
    }
    for (const name of ["object-src", "frame-ancestors"]) assert.deepEqual(directives.get(name), ["'none'"]);
    assert.deepEqual(directives.get("script-src"), ["'self'", "'unsafe-inline'"]);
    assert.ok(!CSP_HEADER.includes("unsafe-eval"));
    assert.equal(SECURITY_HEADERS.find(header => header.key === "X-Frame-Options")?.value, "DENY");
    assert.equal(SECURITY_HEADERS.find(header => header.key === "Permissions-Policy")?.value,
      "camera=(self), microphone=(), geolocation=(self)");
  });
  await check("config-produccion-coincide-con-contrato", () => {
    assert.deepEqual(configured(false), createSecurityHeaders(false));
  });
  await check("config-desarrollo-separa-eval-y-websocket", () => {
    const headers = configured(true);
    assert.deepEqual(headers, createSecurityHeaders(true));
    const policy = headers.find((header: { key: string }) => header.key === "Content-Security-Policy").value;
    assert.ok(policy.includes("'unsafe-eval'"));
    assert.ok(policy.includes("connect-src 'self' ws: wss:"));
    assert.ok(!CSP_HEADER.includes("ws:"));
  });

  const server = await startProductionServer();
  const request = (path: string) => fetch(new URL(path, server.url), { signal: AbortSignal.timeout(5000) });
  try {
    await check("headers-http-en-paginas-api-y-worker", async () => {
      for (const path of ["/", "/captura", "/api/inspecciones?id=fixture-inexistente", "/sw.js", "/offline.html"]) {
        const response = await request(path);
        assert.equal(response.status, 200, path);
        for (const header of SECURITY_HEADERS) {
          assert.equal(response.headers.get(header.key), header.value, `${path}: ${header.key}`);
        }
        await response.arrayBuffer();
      }
    });
    await check("worker-conserva-revalidacion", async () => {
      const response = await request("/sw.js");
      assert.match(response.headers.get("cache-control") ?? "", /max-age=0/);
      assert.match(response.headers.get("cache-control") ?? "", /no-cache/);
      await response.arrayBuffer();
    });
    await check("api-no-guarda-respuesta-en-cache", async () => {
      const response = await request("/api/inspecciones?id=fixture-inexistente");
      assert.equal(response.headers.get("cache-control"), "no-store");
      assert.deepEqual(await response.json(), { records: [], count: 0 });
    });
    await check("robots-servido-incluye-rutas-operativas", async () => {
      const response = await request("/robots.txt");
      assert.equal(response.status, 200);
      assert.match(response.headers.get("content-type") ?? "", /text\/plain/);
      const text = await response.text();
      for (const line of ["User-agent: *", "Disallow: /inspecciones", "Disallow: /captura", "Disallow: /api/", "Allow: /manifest.webmanifest"]) {
        assert.ok(text.split(/\r?\n/).includes(line), line);
      }
    });
  } finally { await server.stop(); }
  return checks;
}
