import assert from "node:assert/strict";
import { loadSource } from "../source-loader.cjs";

export async function runChecks() {
  const { validateInspection } = loadSource("src/lib/inspection-validation.ts");
  const valid = { id: "inspection-demo", location: "Laboratorio de Redes", date: "2026-10-20",
    inspector: "Técnica A", findings: 0, status: "ok", statusLabel: "Sin incidencias", summary: "Registro sintético." };
  const checks: Array<{ id: string; status: string; detail?: string }> = [];
  for (const [id, action] of [
    ["acepta-captura-valida", () => assert.deepEqual(validateInspection(valid, "2026-10-22"), [])],
    ["rechaza-resumen-vacio", () => assert.ok(validateInspection({ ...valid, summary: "  " }, "2026-10-22").some((x: string) => x.includes("resumen")))],
    ["rechaza-hallazgos-invalidos", () => {
      for (const findings of [-1, 0.5, 1000, NaN]) assert.ok(validateInspection({ ...valid, findings }, "2026-10-22").length);
    }],
    ["rechaza-fecha-inexistente-o-futura", () => {
      for (const date of ["2026-02-30", "2026-10-23", "fecha"]) assert.ok(validateInspection({ ...valid, date }, "2026-10-22").length);
    }],
    ["rechaza-estado-incoherente", () => assert.ok(validateInspection({ ...valid, findings: 2 }, "2026-10-22").length)],
    ["rechaza-datos-incompletos", () => {
      assert.ok(validateInspection(null, "2026-10-22").length);
      assert.ok(validateInspection({}, "2026-10-22").length);
    }]
  ] as Array<[string, () => unknown]>) {
    try { action(); checks.push({ id, status: "pass" }); }
    catch (error) { checks.push({ id, status: "fail", detail: String(error) }); }
  }
  return checks;
}
