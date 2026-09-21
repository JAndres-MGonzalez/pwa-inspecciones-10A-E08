/* scripts/verify.mjs */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const required = [
  "package.json", "package-lock.json", "README.md",
  "src/app/layout.tsx", "src/app/page.tsx", "src/app/globals.css",
  "src/app/loading.tsx", "src/app/error.tsx",
  "src/components/app-shell.tsx", "src/components/register-sw.tsx",
  "src/lib/data/inspections.ts", "src/lib/pwa/register-service-worker.ts",
  "public/manifest.webmanifest",
  "public/icons/icon-192.png", "public/icons/icon-512.png",
  "public/icons/icon-maskable-512.png", "public/apple-touch-icon.png",
  "public/sw.js", "public/offline.html",
  "docs/requirements.md", "docs/decision-record.md", "docs/cache-strategy.md",
  "tests/starter.spec.mjs", "tests/manifest.spec.ts", "tests/source-loader.cjs",
  "tests/sw-harness.cjs", "tests/service-worker.spec.ts", "tests/offline.spec.ts",
  "scripts/check-secrets.mjs", "public-tests/check.sh", "public-tests/README.md",
  "evidence/individual.md", "evidence/session-log.md"
];
const missing = required.filter((file) => !existsSync(resolve(root, file)));
const structureOnly = process.argv.includes("--structure");
if (structureOnly) {
  console.log(missing.length ? `Faltan archivos: ${missing.join(", ")}` : "Estructura presente. No valida contenido, pruebas, build ni barrido de info sensible.");
  process.exit(missing.length ? 1 : 0);
}
const checks = [{ id: "structure", status: missing.length ? "fail" : "pass", missing }];
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
for (const [id, args] of [
  ["test", ["test"]],
  ["check-secrets", ["run", "check-secrets"]],
  ["build", ["run", "build"]]
]) {
  console.log(`\nVerificando ${id}...`);
  const run = spawnSync(npm, args, { cwd: root, encoding: "utf8", shell: process.platform === "win32", maxBuffer: 20 * 1024 * 1024 });
  if (run.stdout) process.stdout.write(run.stdout);
  if (run.stderr) process.stderr.write(run.stderr);
  checks.push({ id, status: run.status === 0 && !run.error ? "pass" : "fail", exitCode: run.status, error: run.error?.message ?? null });
}
const git = (args) => {
  const r = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  return r.status === 0 ? r.stdout.trim() : null;
};
const testReportPath = existsSync(resolve(root, "reports/week-03/tests.json"))
  ? resolve(root, "reports/week-03/tests.json")
  : null;
const testReport = testReportPath ? JSON.parse(readFileSync(testReportPath, "utf8")) : null;
const suitesOfInterest = ["manifest02", "service-worker", "offline"];
const suitesOk = checks.find((check) => check.id === "test")?.status === "pass" &&
  testReport?.assignmentId === "w03-service-worker-offline" && testReport?.status === "pass" &&
  testReport?.commitSha === git(["rev-parse", "HEAD"]) && Array.isArray(testReport?.suites) &&
  suitesOfInterest.every((id) => {
    const suite = testReport.suites.find((s) => s.suiteId === id);
    return suite && Array.isArray(suite.checks) && suite.checks.length > 0 && suite.checks.every((c) => c.status === "pass");
  });
checks.push({ id: "service-worker-and-offline", status: suitesOk ? "pass" : "fail" });
const gitStatus = git(["status", "--porcelain"]);
const documents = ["docs/requirements.md", "docs/decision-record.md", "docs/cache-strategy.md", "evidence/individual.md", "README.md"].map((file) => ({ file, content: existsSync(resolve(root, file)) ? readFileSync(resolve(root, file), "utf8") : null }));
const result = {
  schemaVersion: 2,
  assignmentId: "w03-service-worker-offline",
  checkedAt: new Date().toISOString(),
  commitSha: git(["rev-parse", "HEAD"]),
  workingTreeClean: gitStatus === null ? null : gitStatus === "",
  runtime: { node: process.version },
  status: checks.every((c) => c.status === "pass") ? "pass" : "fail",
  checks,
  academicReview: { status: "pending", message: "Sin calificación automática. Revisar requisitos, decisión y evidencia por integrante con la rúbrica; existencia no implica calidad.", documents },
  testReport,
  limits: ["La instalación se verifica mediante npm ci por separado.", "La suite de service worker corre sobre un navegador simulado en memoria.", "La comprobación pública de palabras y el barrido de info sensible se registran por separado; pueden marcar documentación y nombres de dependencias."]
};
mkdirSync(resolve(root, "reports"), { recursive: true });
writeFileSync(resolve(root, "reports/verification.json"), JSON.stringify(result, null, 2) + "\n");
console.log(`\nVerificación técnica: ${result.status}. Revisión académica: pendiente. Reporte: reports/verification.json`);
process.exit(result.status === "pass" ? 0 : 1);
