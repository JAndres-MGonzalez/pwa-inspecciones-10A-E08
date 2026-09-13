import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { loadSource } from "./source-loader.cjs";

const root = resolve(import.meta.dirname, "..");
let checks;
try {
  checks = await loadSource("tests/manifest.spec.ts").runChecks();
} catch (error) {
  checks = [{ id: "suite", status: "fail", detail: String(error) }];
}
const passed = checks.every((check) => check.status === "pass");
const report = {
  schemaVersion: 1,
  assignmentId: "w02-shell-manifest",
  checkedAt: new Date().toISOString(),
  commitSha: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(),
  status: passed ? "pass" : "fail",
  checks
};
mkdirSync(resolve(root, "reports/week-02"), { recursive: true });
writeFileSync(resolve(root, "reports/week-02/tests.json"), JSON.stringify(report, null, 2) + "\n");
for (const check of checks) console.log(`${check.id}: ${check.status}${check.detail ? ` — ${check.detail}` : ""}`);
console.log(`starter.spec.mjs: ${passed ? "PASS" : "FAIL"}`);
process.exitCode = passed ? 0 : 1;
