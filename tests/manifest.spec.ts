import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, sep } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadSource } from "./source-loader.cjs";

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
  const read = (file: string) => readFileSync(resolve(root, file), "utf8");
  const manifest = JSON.parse(read("public/manifest.webmanifest"));
  const overrides = { "src/lib/data/inspection-controls.ts": { SimulateError: false, SimulatedLatencyMs: 0 } };
  const { default: Page } = loadSource("src/app/page.tsx", overrides);
  const { default: Layout, metadata, viewport } = loadSource("src/app/layout.tsx");
  const html = renderToStaticMarkup(createElement(Layout, { children: await Page() }));

  await check("starter-contract", () => {
    assert.equal(JSON.parse(read("package.json")).scripts.build, "next build");
    assert.match(html, /Inspecciones de laboratorio/);
    assert.match(html, /sintéticos/i);
  });
  await check("manifest-fields", () => {
    for (const field of ["name", "short_name", "description", "background_color", "theme_color"]) {
      assert.equal(typeof manifest[field], "string", field);
      assert.ok(manifest[field].trim().length > 0, field);
    }
    assert.equal(manifest.start_url, "/");
    assert.equal(manifest.scope, "/");
    assert.equal(manifest.display, "standalone");
    assert.equal(manifest.theme_color, viewport.themeColor);
    assert.equal(metadata.manifest, "/manifest.webmanifest");
  });
  await check("manifest-png-icons", () => {
    assert.ok(Array.isArray(manifest.icons));
    for (const size of ["192x192", "512x512"]) assert.ok(manifest.icons.some((icon) => icon.sizes === size));
    assert.ok(manifest.icons.some((icon) => icon.purpose?.split(" ").includes("maskable") && icon.sizes === "512x512"));
    for (const icon of [...manifest.icons, ...metadata.icons.apple.map((icon) => ({ ...icon, src: icon.url }))]) {
      assert.equal(icon.type, "image/png");
      assert.ok(icon.src.startsWith("/") && !icon.src.startsWith("//"));
      const file = resolve(root, "public", icon.src.slice(1));
      assert.ok(file.startsWith(resolve(root, "public") + sep));
      const png = readFileSync(file);
      assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
      assert.equal(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`, icon.sizes);
    }
  });
  await check("shell-single-main-and-footer", () => {
    assert.equal((html.match(/<main\b/g) || []).length, 1, "La página debe tener un solo main");
    assert.equal((html.match(/<footer\b/g) || []).length, 1, "La página debe tener un solo pie");
    assert.match(html, /<nav[^>]*aria-label="Navegación principal"/);
    assert.match(html, /<html lang="es-MX"/);
  });
  await check("shell-navigation-targets", () => {
    for (const match of html.matchAll(/href="#([^"]+)"/g)) {
      assert.ok(html.includes(`id="${match[1]}"`), `Falta el destino #${match[1]}`);
    }
  });
  await check("inspection-list", () => {
    assert.equal((html.match(/<article\b/g) || []).length, 3);
    for (const name of ["Redes", "Electrónica", "Software"]) assert.ok(html.includes(name));
    assert.match(html, /3 registros/);
  });
  await check("empty-state", async () => {
    const { default: EmptyPage } = loadSource("src/app/page.tsx", {
      ...overrides, "src/lib/data/inspections.ts": { inspections: [] }
    });
    const empty = renderToStaticMarkup(await EmptyPage());
    assert.match(empty, /Sin registros/);
    assert.match(empty, /0 registros/);
    assert.doesNotMatch(empty, /<article\b/);
  });
  await check("loading-state", () => {
    const { default: Loading } = loadSource("src/app/loading.tsx");
    const loading = renderToStaticMarkup(createElement(Loading));
    assert.match(loading, /Cargando inspecciones/);
    assert.match(loading, /role="status"/);
    assert.match(loading, /aria-busy="true"/);
  });
  await check("error-and-recovery", async () => {
    const options = { SimulateError: true, SimulatedLatencyMs: 0 };
    const { loadInspections } = loadSource("src/lib/data/inspection-loader.ts", {
      "src/lib/data/inspection-controls.ts": options
    });
    await assert.rejects(loadInspections, /No se pudieron cargar las inspecciones/);
    const { default: ErrorState } = loadSource("src/app/error.tsx");
    const errorHtml = renderToStaticMarkup(createElement(ErrorState, { error: new Error("Falla de prueba"), reset() {} }));
    assert.match(errorHtml, /role="alert"/);
    assert.match(errorHtml, /<button[^>]*type="button"/);
    assert.match(errorHtml, /Inténtalo de nuevo/);
    options.SimulateError = false;
    assert.equal((await loadInspections()).length, 3);
  });
  return checks;
}
