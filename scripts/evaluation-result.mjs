import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { loadSource } from "../tests/source-loader.cjs";

const { ASSIGNMENT_ID } = loadSource("src/lib/storage/schema.ts");
const sha = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const read = (path) => {
  try { return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : null; }
  catch { return null; }
};
const testPath = `reports/${ASSIGNMENT_ID}/tests.json`;
const tests = read(testPath);
const verification = read("reports/verification.json");
const layers = Object.fromEntries(["unit", "integration", "e2e"].map((layer) => [layer,
  (tests?.suites ?? []).filter((suite) => suite.suiteId.startsWith(layer + "/")).length
]));
const blockers = [];
for (const path of ["docs/test-strategy.md", ".github/workflows/academic-evaluation.yml", "README.md", "evidence/individual.md"]) {
  if (!existsSync(path) || !readFileSync(path, "utf8").trim()) blockers.push(`Falta un entregable: ${path}.`);
}
if (ASSIGNMENT_ID === "w09-security-privacy") {
  for (const path of ["docs/threat-model.md", "docs/privacy-data-inventory.md", "public/robots.txt",
    "src/lib/security/input-validation.ts", "src/lib/security/privacy-controls.ts", "src/lib/security/headers-csp.ts",
    "src/lib/security/index.ts", "tests/security.spec.ts", "tests/unit/security-privacy.spec.ts",
    "tests/security-headers.spec.ts", ".github/workflows/week-09-w09-security-privacy.yml"]) {
    if (!existsSync(path) || !readFileSync(path, "utf8").trim()) blockers.push(`Falta un entregable de semana 9: ${path}.`);
  }
  for (const suiteId of ["security", "unit/security-privacy", "security-headers"]) {
    const suite = tests?.suites?.find(item => item.suiteId === suiteId);
    if (!suite?.checks?.length || suite.status !== "pass") blockers.push(`Falta una suite de seguridad aprobada: ${suiteId}.`);
  }
}
for (const [label, report] of [["pruebas", tests], ["verificación", verification]]) {
  if (!report || report.status !== "pass" || report.commitSha !== sha || report.workingTreeClean !== true) {
    blockers.push(`Falta un reporte aprobado, limpio y del SHA actual: ${label}.`);
  }
}
for (const layer of Object.keys(layers)) {
  if (layers[layer] === 0) blockers.push(`Falta una suite ejecutable en tests/${layer}/.`);
}
// Los checks HTTP no sustituyen estos dos comportamientos de la consigna.
const e2eChecks = (tests?.suites ?? []).filter((suite) => suite.suiteId.startsWith("e2e/"))
  .flatMap((suite) => suite.checks ?? []);
for (const id of ["crear-offline-recargar-sincronizar-sin-duplicar", "captura-con-capacidad-no-disponible"]) {
  if (!e2eChecks.some((check) => check.id === id && check.status === "pass")) {
    blockers.push(`Flujo de interfaz sin evidencia automatizada: ${id}.`);
  }
}
const result = {
  assignmentId: ASSIGNMENT_ID, commitSha: sha,
  status: blockers.length ? "incomplete" : "pass", layers,
  checks: (tests?.suites ?? []).reduce((count, suite) => count + suite.checks.length, 0),
  blockers, sources: [testPath, "reports/verification.json"],
  limitation: "Resumen técnico del equipo; no calcula la calificación ni demuestra revisión humana."
};
writeFileSync("evaluation-result.json", JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result, null, 2));
process.exitCode = blockers.length ? 1 : 0;
