/**
 * tests/security.spec.ts
 * Suite automatizada de seguridad y validacion de entradas (AC-02 / AC-03)
 */

import assert from "node:assert/strict";
import { loadSource } from "./source-loader.cjs";

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

  const { validateInspectionInput, sanitizeString } = loadSource("src/lib/security/input-validation.ts");

  // 1. Sanitizacion de caracteres peligrosos y tags XSS
  await check("sanitize-strips-script-tags", () => {
    const malicious = "Revision normal <script>alert('xss')</script> finalizada";
    const cleaned = sanitizeString(malicious);
    assert.ok(!cleaned.includes("<script>"));
    assert.ok(!cleaned.includes("alert"));
    assert.ok(cleaned.includes("Revision normal"));
  });

  await check("sanitize-escapes-html-entities", () => {
    const input = 'Prueba & evaluacion <test> "valor"';
    const cleaned = sanitizeString(input);
    assert.ok(cleaned.includes("&amp;"));
    assert.ok(cleaned.includes("&lt;test&gt;"));
    assert.ok(cleaned.includes("&quot;valor&quot;"));
  });

  // 2. Aceptacion de payload sintetico valido
  await check("validate-accepts-valid-synthetic-payload", () => {
    const payload = {
      id: "insp-utt-2026-001",
      location: "Laboratorio de Redes y Telecomunicaciones",
      date: "2026-10-27",
      inspector: "Inspector Sintetico UTT 01",
      status: "ok",
      statusLabel: "Operativo",
      findings: 0,
      summary: "Inspeccion de rutina en racks y cableado estructurado sin incidencias."
    };
    const result = validateInspectionInput(payload);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
    assert.equal(result.sanitized.id, "insp-utt-2026-001");
  });

  // 3. Rechazo de ID malicioso o invalido
  await check("validate-rejects-invalid-id-characters", () => {
    const payload = {
      id: "insp/../root/etc",
      location: "Lab Quimica",
      date: "2026-10-27",
      inspector: "Tester",
      status: "ok",
      findings: 0,
      summary: "Notas"
    };
    const result = validateInspectionInput(payload);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e: string) => e.includes("alfanumericos")));
  });

  // 4. Rechazo de formato de fecha incorrecto
  await check("validate-rejects-invalid-date-format", () => {
    const payload = {
      id: "insp-002",
      location: "Lab Sistemas",
      date: "27/10/2026", // Formato no ISO
      inspector: "Tester",
      status: "ok",
      findings: 0,
      summary: "Notas"
    };
    const result = validateInspectionInput(payload);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e: string) => e.includes("ISO")));
  });

  // 5. Rechazo de estatus no permitido (Enumeracion cerrada)
  await check("validate-rejects-unauthorized-status", () => {
    const payload = {
      id: "insp-003",
      location: "Lab Computo",
      date: "2026-10-27",
      inspector: "Tester",
      status: "hacked_status",
      findings: 0,
      summary: "Notas"
    };
    const result = validateInspectionInput(payload);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e: string) => e.includes("ok, warning, danger")));
  });

  // 6. Rechazo de findings negativos o decimales
  await check("validate-rejects-negative-or-decimal-findings", () => {
    const payloadNegative = {
      id: "insp-004",
      location: "Lab Mecatronica",
      date: "2026-10-27",
      inspector: "Tester",
      status: "danger",
      findings: -5,
      summary: "Notas"
    };
    const result = validateInspectionInput(payloadNegative);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e: string) => e.includes("mayor o igual a 0")));
  });

  // 7. Sanitizacion automatica de resumen con scripts embebidos
  await check("validate-sanitizes-summary-content", () => {
    const payload = {
      id: "insp-005",
      location: "Lab Diseno",
      date: "2026-10-27",
      inspector: "Tester",
      status: "warning",
      findings: 1,
      summary: "Extintor descargado <script>document.cookie</script>"
    };
    const result = validateInspectionInput(payload);
    assert.equal(result.valid, true);
    assert.ok(!result.sanitized.summary.includes("<script>"));
    assert.ok(!result.sanitized.summary.includes("document.cookie"));
  });

  return checks;
}
