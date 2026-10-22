/* tests/starter.spec.mjs */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { loadSource } from "./source-loader.cjs";

const root = resolve(import.meta.dirname, "..");
const { ASSIGNMENT_ID } = loadSource("src/lib/storage/schema.ts");

/**
 * Descubre cualquier tests/*.spec.ts y las capas tests/{unit,integration,e2e}/*.spec.ts.
 *
 * Nadie edita esta lista: cada quien deja su archivo en su carpeta y aparece solo. La
 * logica vive una sola vez en tests/discover.cjs, compartida con scripts/verify.mjs y
 * public-tests/check.sh, para que los tres lectores no puedan desincronizarse.
 */
const require = createRequire(import.meta.url);
const { discoverSuites } = require("./discover.cjs");
const suites = discoverSuites(root).map((entry) => [entry.suiteId, entry.file]);

/**
 * Guardia anti falso-verde: una corrida que no descubre NINGUNA suite no puede aprobarse.
 * Un descubrimiento roto (por ejemplo, un helper que escanea la raiz en vez de tests/)
 * pasaria inadvertido si compararamos con `every` sobre una lista vacia.
 */
if (suites.length === 0) {
  console.error("starter.spec.mjs: FAIL — discoverSuites no encontró ninguna suite en tests/");
  process.exit(1);
}

const results = [];
for (const [suiteId, file] of suites) {
  const start = Date.now();
  let checks;
  try {
    checks = await loadSource(file).runChecks();
    if (!Array.isArray(checks) || checks.length === 0) throw new Error("Suite sin comprobaciones");
  } catch (error) {
    checks = [{ id: "suite", status: "fail", detail: String(error) }];
  }
  const status = checks.every((check) => check.status === "pass") ? "pass" : "fail";
  results.push({ suiteId, duration_ms: Date.now() - start, status, checks });
  for (const check of checks) console.log(`${suiteId}/${check.id}: ${check.status}${check.detail ? ` — ${check.detail}` : ""}`);
  console.log(`${suiteId}: ${status.toUpperCase()}`);
}
const passed = results.every((suite) => suite.status === "pass");
const report = {
  schemaVersion: 2,
  assignmentId: ASSIGNMENT_ID,
  checkedAt: new Date().toISOString(),
  commitSha: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(),
  workingTreeClean: execFileSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" }).trim() === "",
  status: passed ? "pass" : "fail",
  suites: results
};
mkdirSync(resolve(root, "reports", ASSIGNMENT_ID), { recursive: true });
writeFileSync(resolve(root, "reports", ASSIGNMENT_ID, "tests.json"), JSON.stringify(report, null, 2) + "\n");
console.log(`starter.spec.mjs: ${passed ? "PASS" : "FAIL"}`);
process.exitCode = passed ? 0 : 1;
