/* scripts/verify.mjs */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { loadSource } from "../tests/source-loader.cjs";

const root = resolve(import.meta.dirname, "..");

/**
 * Identificador de la actividad leido del contrato, no escrito a mano.
 *
 * Sustituye a los hardcodeos que hubo que editar a mano en la transicion w03 -> w04
 * (assignmentId, rutas de reporte y listas de suites en dos archivos distintos).
 */
const { ASSIGNMENT_ID } = loadSource("src/lib/storage/schema.ts");

const required = [
  "package.json", "package-lock.json", "README.md",
  "src/app/layout.tsx", "src/app/page.tsx", "src/app/globals.css",
  "src/app/loading.tsx", "src/app/error.tsx",
  "src/app/inspecciones/page.tsx", "src/app/inspecciones/[id]/page.tsx",
  "src/components/app-shell.tsx", "src/components/register-sw.tsx", "src/components/loading-state.tsx",
  "src/lib/data/inspections.ts", "src/lib/pwa/register-service-worker.ts",
  "src/lib/storage/schema.ts",
  "public/manifest.webmanifest",
  "public/icons/icon-192.png", "public/icons/icon-512.png",
  "public/icons/icon-maskable-512.png", "public/apple-touch-icon.png",
  "public/sw.js", "public/offline.html",
  "docs/requirements.md", "docs/decision-record.md", "docs/cache-strategy.md", "docs/rendering-decision.md",
  "docs/sync-policy.md", "docs/sync/01-modelo.md", "docs/sync/02-conflictos.md", "docs/sync/03-cola.md",
  "tests/starter.spec.mjs", "tests/manifest.spec.ts", "tests/source-loader.cjs",
  "tests/sw-harness.cjs", "tests/service-worker.spec.ts", "tests/offline.spec.ts", "tests/rendering.spec.ts",
  "scripts/check-secrets.mjs", "public-tests/check.sh", "public-tests/README.md",
  "evidence/individual.md", "evidence/session-log.md"
  // Semana 5: cuando terminen los bloques B y C, descomentar. hasta entonces el arranque
  // debe dejar master en verde para que los tres trabajen sobre una base que pasa.
  // "src/lib/sync/queue.ts", "src/lib/sync/conflict-policy.ts", "tests/sync.spec.ts"
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
/** Ruta del reporte derivada del contrato, no escrita a mano. */
const testReportPath = resolve(root, "reports", ASSIGNMENT_ID, "tests.json");
const testReport = existsSync(testReportPath) ? JSON.parse(readFileSync(testReportPath, "utf8")) : null;
/**
 * Suites esperadas, derivadas de los archivos presentes en tests/ en vez de una lista
 * escrita a mano. Asi agregar una suite no obliga a tocar este archivo, que era el punto
 * de conflicto entre integrantes en semanas anteriores.
 */
const LEGACY_SUITE_IDS = { "manifest.spec.ts": "manifest02" };
const suitesOnDisk = readdirSync(resolve(root, "tests"))
  .filter((f) => f.endsWith(".spec.ts"))
  .map((f) => LEGACY_SUITE_IDS[f] ?? f.replace(/\.spec\.ts$/, ""));
const suitesOk = checks.find((check) => check.id === "test")?.status === "pass" &&
  testReport?.assignmentId === ASSIGNMENT_ID && testReport?.status === "pass" &&
  testReport?.commitSha === git(["rev-parse", "HEAD"]) && Array.isArray(testReport?.suites) &&
  testReport.suites.length === suitesOnDisk.length &&
  testReport.suites.every((s) => Array.isArray(s.checks) && s.checks.length > 0 && s.checks.every((c) => c.status === "pass")) &&
  suitesOnDisk.every((id) => testReport.suites.some((s) => s.suiteId === id));
checks.push({ id: `${ASSIGNMENT_ID}-and-suites`, status: suitesOk ? "pass" : "fail" });
const gitStatus = git(["status", "--porcelain"]);
const documents = ["docs/requirements.md", "docs/decision-record.md", "docs/cache-strategy.md", "docs/rendering-decision.md", "docs/sync-policy.md", "evidence/individual.md", "README.md"].map((file) => ({ file, content: existsSync(resolve(root, file)) ? readFileSync(resolve(root, file), "utf8") : null }));
const result = {
  schemaVersion: 2,
  assignmentId: ASSIGNMENT_ID,
  checkedAt: new Date().toISOString(),
  commitSha: git(["rev-parse", "HEAD"]),
  workingTreeClean: gitStatus === null ? null : gitStatus === "",
  runtime: { node: process.version },
  status: checks.every((c) => c.status === "pass") ? "pass" : "fail",
  checks,
  academicReview: { status: "pending", message: "Sin calificación automática. Revisar requisitos, decisión y evidencia por integrante con la rúbrica; existencia no implica calidad.", documents },
  testReport,
  limits: ["La instalación se verifica mediante npm ci por separado.", "La suite de service worker corre sobre un navegador simulado en memoria; la suite de renderizado usa ReactDOMServer.", "La comprobación pública de palabras y el barrido de info sensible se registran por separado; pueden marcar documentación y nombres de dependencias."]
};
mkdirSync(resolve(root, "reports"), { recursive: true });
writeFileSync(resolve(root, "reports/verification.json"), JSON.stringify(result, null, 2) + "\n");
console.log(`\nVerificación técnica: ${result.status}. Revisión académica: pendiente. Reporte: reports/verification.json`);
process.exit(result.status === "pass" ? 0 : 1);