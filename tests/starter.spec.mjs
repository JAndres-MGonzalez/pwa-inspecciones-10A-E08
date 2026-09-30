/* tests/starter.spec.mjs */
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { loadSource } from "./source-loader.cjs";

const root = resolve(import.meta.dirname, "..");
const { ASSIGNMENT_ID } = loadSource("src/lib/storage/schema.ts");

/**
 * Ids historicos que NO coinciden con el nombre del archivo. Se conservan porque
 * `public-tests/check.sh` y la evidencia de w04 los referencian por nombre; renombrarlos
 * seria una regresion silenciosa. Las suites nuevas se derivan del nombre del archivo.
 */
const LEGACY_SUITE_IDS = { "manifest.spec.ts": "manifest02" };

/**
 * Descubre cualquier tests/*.spec.ts.
 *
 * Nadie edita esta lista: cada quien deja su archivo en tests/ y aparece solo. Ese es el
 * punto de la semana 5, donde tres personas entregan en paralelo y un archivo de suites
 * compartido las habria hecho chocar en cada merge.
 */
const suites = readdirSync(resolve(root, "tests"))
  .filter((file) => file.endsWith(".spec.ts"))
  .sort()
  .map((file) => [LEGACY_SUITE_IDS[file] ?? file.replace(/\.spec\.ts$/, ""), `tests/${file}`]);

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
