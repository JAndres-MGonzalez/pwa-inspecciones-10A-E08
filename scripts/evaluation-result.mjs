import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const sha = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const read = (path) => {
  try { return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : null; }
  catch { return null; }
};
const tests = read("reports/w08-testing-ci/tests.json");
const verification = read("reports/verification.json");
const layers = Object.fromEntries(["unit", "integration", "e2e"].map((layer) => [layer,
  (tests?.suites ?? []).filter((suite) => suite.suiteId.startsWith(layer + "/")).length
]));
const blockers = [];
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
  assignmentId: "w08-testing-ci", commitSha: sha,
  status: blockers.length ? "incomplete" : "pass", layers,
  checks: (tests?.suites ?? []).reduce((count, suite) => count + suite.checks.length, 0),
  blockers, sources: ["reports/w08-testing-ci/tests.json", "reports/verification.json"],
  limitation: "Resumen técnico del equipo; no calcula la calificación ni demuestra revisión humana."
};
writeFileSync("evaluation-result.json", JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result, null, 2));
process.exitCode = blockers.length ? 1 : 0;
