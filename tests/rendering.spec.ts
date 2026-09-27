/* tests/rendering.spec.ts */
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadSource } from "./source-loader.cjs";

type Check = { id: string; status: string; detail?: string };

const overrides = {
  "src/lib/data/inspection-controls.ts": { SimulateError: false, SimulatedLatencyMs: 0 }
};

const DATA = [
  { id: "inspection-001", location: "Laboratorio de Redes", date: "2026-08-28", inspector: "Técnica A", status: "ok", statusLabel: "Sin incidencias", findings: 0, summary: "Revisión visual de cableado y ventilación." },
  { id: "inspection-002", location: "Laboratorio de Electrónica", date: "2026-08-27", inspector: "Técnico B", status: "attention", statusLabel: "Requiere atención", findings: 2, summary: "Dos observaciones sintéticas para seguimiento." }
];

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

  await check("rendering-csr-initial-loading", async () => {
    const { default: InspeccionesPage } = loadSource("src/app/inspecciones/page.tsx", overrides);
    const html = renderToStaticMarkup(createElement(InspeccionesPage));
    assert.match(html, /Cargando listado/, "el primer render del CSR debe ser el estado de carga");
    assert.match(html, /role="status"/);
  });

  await check("rendering-csr-no-hydration-mismatch", async () => {
    const { default: InspeccionesPage } = loadSource("src/app/inspecciones/page.tsx", overrides);
    const first = renderToStaticMarkup(createElement(InspeccionesPage));
    const second = renderToStaticMarkup(createElement(InspeccionesPage));
    assert.equal(second, first, "el HTML del servidor y del cliente debe coincidir en el primer render");
  });

  await check("rendering-csr-grid", async () => {
    const { InspeccionesGrid } = loadSource("src/app/inspecciones/page.tsx", overrides);
    const html = renderToStaticMarkup(createElement(InspeccionesGrid, { items: DATA }));
    for (const name of ["Laboratorio de Redes", "Laboratorio de Electrónica"]) {
      assert.ok(html.includes(name), `la lista debe incluir ${name}`);
    }
    assert.match(html, /href="\/inspecciones\/inspection-001"/);
    assert.match(html, /Ver detalle/);
    assert.equal((html.match(/<article\b/g) || []).length, 2, "dos tarjetas para dos registros");
  });

  await check("rendering-csr-empty", async () => {
    const { InspeccionesEmpty } = loadSource("src/app/inspecciones/page.tsx", overrides);
    const html = renderToStaticMarkup(createElement(InspeccionesEmpty));
    assert.match(html, /Sin inspecciones/);
  });

  await check("rendering-csr-error", async () => {
    const { InspeccionesError } = loadSource("src/app/inspecciones/page.tsx", overrides);
    const html = renderToStaticMarkup(
      createElement(InspeccionesError, { message: "Falla de prueba", onRetry() {} })
    );
    assert.match(html, /role="alert"/);
    assert.match(html, /Falla de prueba/);
    assert.match(html, /Inténtalo de nuevo/);
  });

  await check("rendering-ssr-content", async () => {
    const { default: InspectionDetailPage } = loadSource("src/app/inspecciones/[id]/page.tsx", overrides);
    const html = renderToStaticMarkup(
      await InspectionDetailPage({ params: { id: "inspection-001" } })
    );
    assert.match(html, /Laboratorio de Redes/);
    assert.match(html, /Revisión visual de cableado/);
    assert.match(html, /Volver al listado/);
  });

  await check("rendering-ssr-missing-id", async () => {
    const { default: InspectionDetailPage } = loadSource("src/app/inspecciones/[id]/page.tsx", overrides);
    await assert.rejects(
      InspectionDetailPage({ params: { id: "inspection-999" } }),
      "el detalle inexistente debe entrar en notFound"
    );
  });

  await check("rendering-shell-navigation", async () => {
    const { default: AppShell } = loadSource("src/components/app-shell.tsx");
    const html = renderToStaticMarkup(createElement(AppShell, { children: null }));
    assert.match(html, /href="\/inspecciones"/, "el shell debe enlazar al listado CSR");
  });

  await check("rendering-loading-state-component", () => {
    const { default: LoadingState } = loadSource("src/components/loading-state.tsx");
    const html = renderToStaticMarkup(createElement(LoadingState, { label: "Cargando detalle…" }));
    assert.match(html, /Cargando detalle/);
    assert.match(html, /role="status"/);
    assert.match(html, /aria-busy="true"/);
  });

  return checks;
}