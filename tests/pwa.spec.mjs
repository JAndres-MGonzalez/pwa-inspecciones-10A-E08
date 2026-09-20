import { loadSource } from "./source-loader.cjs";

const suites = ["tests/service-worker.spec.ts", "tests/offline.spec.ts"];
const checks = [];
for (const suite of suites) {
  try {
    checks.push(...(await loadSource(suite).runChecks()));
  } catch (error) {
    checks.push({ id: suite, status: "fail", detail: String(error) });
  }
}
const passed = checks.length > 0 && checks.every((check) => check.status === "pass");
for (const check of checks) {
  console.log(`${check.id}: ${check.status}${check.detail ? ` - ${check.detail}` : ""}`);
}
console.log(`pwa.spec.mjs: ${passed ? "PASS" : "FAIL"}`);
process.exitCode = passed ? 0 : 1;
