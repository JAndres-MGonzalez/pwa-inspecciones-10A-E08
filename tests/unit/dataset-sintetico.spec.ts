/* tests/unit/dataset-sintetico.spec.ts
 *
 * Bloque A de la semana 8 (pirámide unitaria).
 *
 * Automatiza el RNF-04 de docs/requirements.md: el dataset es 100 % sintético y no
 * contiene identificación real de personas. Antes esta revisión era manual; aquí un
 * cambio futuro que introduzca un correo, una matrícula o un teléfono en los datos de
 * ejemplo hace fallar la suite.
 *
 * OJO con los falsos positivos: las fechas ("2026-08-28") contienen dígitos y los ids
 * ("inspection-001") también. Por eso los patrones solo se aplican a CAMPOS DE TEXTO
 * (location, inspector, statusLabel, summary) y nunca a date, id ni findings.
 */
import assert from "node:assert/strict";
import { loadSource } from "../source-loader.cjs";

const TEXT_FIELDS = ["location", "inspector", "statusLabel", "summary"] as const;

export async function runChecks() {
  const checks: Array<{ id: string; status: string; detail?: string }> = [];
  async function check(id: string, action: () => unknown) {
    try { await action(); checks.push({ id, status: "pass" }); }
    catch (error) { checks.push({ id, status: "fail", detail: String(error) }); }
  }

  const { inspections, type: _type } = loadSource("src/lib/data/inspections.ts") as any;
  const rows: any[] = inspections;

  // Patrones de identificación personal. Se buscan como palabras completas en campos de
  // texto; los separadores evitan casar fechas o identificadores internos.
  const PATTERNS: Array<{ id: string; re: RegExp; what: string }> = [
    { id: "correo", re: /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/, what: "correo electrónico" },
    // Matrícula mexicana: 10 dígitos seguidos, con límites de palabra (no fecha, que
    // lleva guiones: 2026-08-28 no puede casar).
    { id: "matricula", re: /\b\d{10}\b/, what: "matrícula de 10 dígitos" },
    // Teléfono: 10 dígitos precedidos de +52 o de un paréntesis de lada.
    { id: "telefono", re: /(?:\+52[\s-]?)?\(?\d{2,3}\)?[\s-]?\d{3}[\s-]?\d{4}\b/, what: "teléfono" },
    // CURP: 18 caracteres alfanuméricos con forma específica (6 fecha + 4 homoclave...).
    { id: "curp", re: /\b[A-Z]{4}\d{6}[HM][A-Z]{5}\d{2}\b/, what: "CURP" }
  ];

  await check("dataset-no-vacio", () => {
    assert.ok(Array.isArray(rows) && rows.length >= 3,
      `el dataset debe tener al menos las 3 inspecciones de ejemplo, tiene ${rows.length}`);
  });

  await check("ids-unicos", () => {
    const ids = rows.map((r) => r.id);
    const duplicated = ids.filter((id, i) => ids.indexOf(id) !== i);
    assert.deepEqual(duplicated, [], `ids duplicados: ${duplicated.join(", ")}`);
  });

  await check("campos-requeridos-presentes", () => {
    // Los consumidores (app, rendering.spec, sync) asumen estos campos siempre presentes.
    for (const row of rows) {
      for (const field of ["id", "location", "date", "inspector", "status", "statusLabel", "findings", "summary"]) {
        assert.ok(field in row, `falta el campo ${field} en ${row.id ?? "(sin id)"}`);
        assert.notEqual(row[field], undefined, `${field} es undefined en ${row.id}`);
      }
    }
  });

  await check("status-validos", () => {
    // status debe ser uno de los dos valores del tipo; statusLabel no puede venir vacío.
    for (const row of rows) {
      assert.ok(["ok", "attention"].includes(row.status), `status inválido: ${row.status}`);
      assert.ok(typeof row.statusLabel === "string" && row.statusLabel.length > 0,
        `statusLabel vacío en ${row.id}`);
    }
  });

  await check("fechas-validas-y-no-futuras", () => {
    // Formato ISO y no en el futuro (datos sintéticos de un histórico de mantenimiento).
    const today = "2026-10-22"; // Fecha de referencia del fixture, independiente del reloj del equipo.
    for (const row of rows) {
      assert.match(row.date, /^\d{4}-\d{2}-\d{2}$/, `fecha no ISO: ${row.date}`);
      assert.ok(row.date <= today, `fecha futura en ${row.id}: ${row.date}`);
    }
  });

  await check("findings-consistente-con-status", () => {
    // Coherencia mínima del set: "ok" no debería arrastrar observaciones; "attention" sí.
    for (const row of rows) {
      assert.ok(Number.isInteger(row.findings) && row.findings >= 0,
        `findings inválido en ${row.id}: ${row.findings}`);
      if (row.status === "ok") assert.equal(row.findings, 0, `${row.id} dice ok con findings=${row.findings}`);
      if (row.status === "attention") assert.ok(row.findings > 0, `${row.id} dice attention sin findings`);
    }
  });

  await check("sin-datos-personales", () => {
    // RNF-04: cero matrículas, correos, teléfonos o CURP en los campos de texto.
    for (const row of rows) {
      for (const field of TEXT_FIELDS) {
        const value = String(row[field] ?? "");
        for (const pattern of PATTERNS) {
          const match = value.match(pattern.re);
          assert.equal(match, null,
            `${row.id}.${field} contiene ${pattern.what}: «${match?.[0]}»`);
        }
      }
    }
  });

  await check("inspectores-son-aliases-genericos", () => {
    // Ni siquiera nombres propios inventados: alias de una sola palabra genérica
    // ("Técnica A"), como exige el dataset sintético del escenario.
    for (const row of rows) {
      assert.match(row.inspector, /^(Técnico|Técnica) [A-Z]$/,
        `el inspector debe ser un alias genérico, no un nombre: «${row.inspector}»`);
    }
  });

  return checks;
}
