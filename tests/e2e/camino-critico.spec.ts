import assert from "node:assert/strict";
import { startProductionServer } from "./production-server.cjs";

// Comprueba respuestas del servidor real. No ejecuta interacciones del navegador.
export async function runChecks() {
  const checks: Array<{ id: string; status: string; detail?: string }> = [];
  const server = await startProductionServer();
  const request = (path: string) => fetch(new URL(path, server.url), {
    signal: AbortSignal.timeout(5000), redirect: "error"
  });
  const html = async (path: string) => {
    const response = await request(path);
    assert.equal(response.status, 200, `GET ${path}`);
    assert.match(response.headers.get("content-type") ?? "", /text\/html/);
    return response.text();
  };
  async function check(id: string, action: () => unknown) {
    try { await action(); checks.push({ id, status: "pass" }); }
    catch (error) { checks.push({ id, status: "fail", detail: String(error) }); }
  }
  try {
    await check("home-200-con-titulo", async () => {
      const body = await html("/");
      assert.match(body, /<h1[^>]*>Inspecciones de laboratorio<\/h1>/);
      assert.match(body, /Los datos mostrados son sintéticos/);
    });
    await check("home-enlaza-a-inspecciones", async () => {
      assert.match(await html("/"), /<a\b[^>]*href="\/inspecciones"/);
    });
    await check("listado-estado-carga-inicial", async () => {
      assert.match(await html("/inspecciones"), /Cargando listado/);
    });
    await check("detalle-ssr-muestra-laboratorio", async () => {
      assert.match(await html("/inspecciones/inspection-001"), /<h1[^>]*>Laboratorio de Redes<\/h1>/);
    });
    await check("detalle-inexistente-contenido-404", async () => {
      const response = await request("/inspecciones/no-existe-999");
      // Next puede enviar 200 si el límite de loading inició streaming antes del 404.
      assert.ok([200, 404].includes(response.status));
      const body = await response.text();
      assert.ok(body.includes("Inspección no encontrada"));
      assert.ok(body.includes("NEXT_NOT_FOUND"), "La respuesta debe indicar notFound, no un detalle válido.");
    });
    await check("manifest-accesible", async () => {
      const response = await request("/manifest.webmanifest");
      assert.equal(response.status, 200);
      const manifest = await response.json();
      for (const field of ["name", "start_url", "scope"]) {
        assert.equal(typeof manifest[field], "string", `Falta ${field}`);
        assert.ok(manifest[field].length > 0, `${field} vacío`);
      }
      assert.equal(manifest.start_url, "/");
      assert.equal(manifest.scope, "/");
    });
    await check("sw-accesible", async () => {
      const response = await request("/sw.js");
      assert.equal(response.status, 200);
      assert.match(response.headers.get("content-type") ?? "", /javascript/);
      assert.match(await response.text(), /inspecciones-/);
    });
    await check("offline-html-accesible", async () => {
      assert.match(await html("/offline.html"), /<h1[^>]*>Estás sin conexión<\/h1>/);
    });
  } finally {
    await server.stop();
  }
  return checks;
}
