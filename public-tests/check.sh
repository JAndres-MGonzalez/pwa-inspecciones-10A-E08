#!/usr/bin/env bash
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1
STATUS=0
FILES_OK=1
for file in public/manifest.webmanifest public/sw.js public/offline.html \
  src/app/layout.tsx src/app/page.tsx src/components/app-shell.tsx \
  src/components/register-sw.tsx src/lib/pwa/register-service-worker.ts \
  docs/cache-strategy.md tests/manifest.spec.ts tests/sw-harness.cjs \
  tests/service-worker.spec.ts tests/offline.spec.ts scripts/check-secrets.mjs \
  scripts/verify.mjs README.md; do
  if [ ! -s "$file" ]; then
    echo "Falta archivo: $file" >&2
    FILES_OK=0
  fi
done
if [ "$FILES_OK" -eq 1 ]; then echo "files: PASS"; else echo "files: FAIL"; STATUS=1; fi

if node scripts/check-secrets.mjs; then echo "cursors: PASS"; else echo "cursors: FAIL"; STATUS=1; fi

if node --input-type=module <<'NODE'
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
const report = JSON.parse(readFileSync("reports/week-03/tests.json", "utf8"));
assert.equal(report.assignmentId, "w03-service-worker-offline");
assert.equal(report.status, "pass");
assert.equal(report.commitSha, execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim());
for (const id of ["manifest02", "service-worker", "offline"]) {
  const suite = report.suites.find((item) => item.suiteId === id);
  assert.ok(suite?.checks?.length > 0, `Suite ausente o vacía: ${id}`);
  assert.ok(suite.checks.every((check) => check.status === "pass"), `Suite fallida: ${id}`);
}
NODE
then echo "tests: PASS"; else echo "tests: FAIL (ejecuta npm test y revisa el reporte)"; STATUS=1; fi

if node --input-type=module <<'NODE'
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
for (const file of ["package.json", "package-lock.json"]) {
  assert.ok(!/vitest/i.test(readFileSync(file, "utf8")), "No se deben añadir dependencias de vitest");
}
NODE
then echo "package: PASS"; else echo "package: FAIL"; STATUS=1; fi
exit "$STATUS"

