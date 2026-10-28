/**
 * tests/unit/security-privacy.spec.ts
 * Pruebas unitarias de controles de privacidad y minimizacion de datos (LGPDPPSO)
 */

import assert from "node:assert/strict";
import { loadSource } from "../source-loader.cjs";

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

  const {
    truncateCoordinatesForPrivacy,
    maskSensitiveData,
    sanitizeImageEvidence
  } = loadSource("src/lib/security/privacy-controls.ts");

  // 1. Truncado de coordenadas GPS a nivel campus UTT
  await check("privacy-gps-truncates-to-campus-precision", () => {
    const rawLat = 18.461234;
    const rawLng = -97.391234;

    const truncated = truncateCoordinatesForPrivacy(rawLat, rawLng, 3);
    assert.equal(truncated.latitude, 18.461);
    assert.equal(truncated.longitude, -97.391);
    assert.equal(truncated.precisionLevel, "campus");
  });

  await check("privacy-gps-rejects-invalid-values", () => {
    assert.throws(() => {
      truncateCoordinatesForPrivacy(NaN, -97.39);
    }, /invalidas/);
  });

  // 2. Enmascaramiento de correos en notas
  await check("privacy-masks-email-addresses", () => {
    const note = "Reportado por inspector.sintetico01@utt.edu.mx en el rack central.";
    const cleaned = maskSensitiveData(note);
    assert.ok(!cleaned.includes("inspector.sintetico01@utt.edu.mx"));
    assert.ok(cleaned.includes("[CORREO_INSTITUCIONAL_PROTEGIDO]"));
  });

  // 3. Enmascaramiento de numeros telefonicos
  await check("privacy-masks-phone-numbers", () => {
    const note = "Contactar al guardia al 238-123-4567 de inmediato.";
    const cleaned = maskSensitiveData(note);
    assert.ok(!cleaned.includes("238-123-4567"));
    assert.ok(cleaned.includes("[TELEFONO_PROTEGIDO]"));
  });

  // 4. Rechazo de imagenes vectoriales SVG con riesgo XSS
  await check("privacy-rejects-svg-evidence", () => {
    const svgData = "data:image/svg+xml;base64,PHN2Zz48c2NyaXB0PmFsZXJ0KDEpPC9zY3JpcHQ+PC9zdmc+";
    const result = sanitizeImageEvidence(svgData);
    assert.equal(result.safe, false);
    assert.equal(result.sanitizedUrl, "");
  });

  // 5. Aceptacion de imagen raster estandar
  await check("privacy-accepts-raster-image", () => {
    const pngData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
    const result = sanitizeImageEvidence(pngData);
    assert.equal(result.safe, true);
    assert.ok(result.sanitizedUrl.startsWith("data:image/png"));
  });

  return checks;
}