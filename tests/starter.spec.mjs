import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { loadSource } from "./source-loader.cjs";

const root = resolve(import.meta.dirname, "..");
const suites = [];
for (const [suiteId, file] of [
  ["manifest02", "manifest.spec.ts"],
  ["service-worker", "service-worker.spec.ts"],
  ["offline", "offline.spec.ts"]
]) {
  const start = Date.now();
  let checks;
  try {
    checks = await loadSource(`tests/${file}`).runChecks();
    if (!Array.isArray(checks) || checks.length === 0) throw new Error("Suite sin comprobaciones");
  } catch (error) {
    checks = [{ id: "suite", status: "fail", detail: String(error) }];
  }
  const status = checks.every((check) => check.status === "pass") ? "pass" : "fail";
  suites.push({ suiteId, duration_ms: Date.now() - start, status, checks });
  for (const check of checks) console.log(`${suiteId}/${check.id}: ${check.status}${check.detail ? ` — ${check.detail}` : ""}`);
  console.log(`${suiteId}: ${status.toUpperCase()}`);
}
const passed = suites.every((suite) => suite.status === "pass");
const report = {
  schemaVersion: 2,
  assignmentId: "w03-service-worker-offline",
  checkedAt: new Date().toISOString(),
  commitSha: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(),
  workingTreeClean: execFileSync("git", ["status", "--porcelain"], { cwd: root, encoding: "utf8" }).trim() === "",
  status: passed ? "pass" : "fail",
  suites
};
mkdirSync(resolve(root, "reports/week-03"), { recursive: true });
writeFileSync(resolve(root, "reports/week-03/tests.json"), JSON.stringify(report, null, 2) + "\n");
console.log(`starter.spec.mjs: ${passed ? "PASS" : "FAIL"}`);
process.exitCode = passed ? 0 : 1;
