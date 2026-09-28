#!/usr/bin/env bash
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1
STATUS=0
FILES_OK=1
for file in public/manifest.webmanifest public/sw.js public/offline.html \
  src/app/layout.tsx src/app/page.tsx "src/app/inspecciones/page.tsx" \
  "src/app/inspecciones/[id]/page.tsx" src/components/app-shell.tsx \
  src/components/register-sw.tsx src/components/loading-state.tsx \
  src/lib/pwa/register-service-worker.ts \
  docs/cache-strategy.md docs/rendering-decision.md \
  tests/manifest.spec.ts tests/source-loader.cjs tests/sw-harness.cjs \
  tests/service-worker.spec.ts tests/offline.spec.ts tests/rendering.spec.ts \
  scripts/check-secrets.mjs scripts/verify.mjs README.md; do
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
const report = JSON.parse(readFileSync("reports/week-04/tests.json", "utf8"));
assert.equal(report.assignmentId, "w04-csr-ssr");
assert.equal(report.status, "pass");
assert.equal(report.commitSha, execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim());
for (const id of ["manifest02", "service-worker", "offline", "rendering"]) {
  const suite = report.suites.find((item) => item.suiteId === id);
  assert.ok(suite?.checks?.length > 0, `Suite ausente o vacía: ${id}`);
  assert.ok(suite.checks.every((check) => check.status === "pass"), `Suite fallida: ${id}`);
}
NODE
then echo "tests: PASS"; else echo "tests: FAIL (ejecuta npm test y revisa el reporte)"; STATUS=1; fi

if node --input-type=module <<'NODE'
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
assert.ok(!pkg.devDependencies || !("vitest" in pkg.devDependencies), "no vitest en devDependencies");
assert.ok(!pkg.dependencies || !("vitest" in pkg.dependencies), "no vitest en dependencies");
const lock = readFileSync("package-lock.json", "utf8");
assert.ok(!lock.includes('"vitest"'), "no vitest en el lockfile");
NODE
then echo "package: PASS"; else echo "package: FAIL (no agregues vitest)"; STATUS=1; fi

if [ "$STATUS" -eq 0 ]; then echo "PUBLIC_OK"; fi
exit "$STATUS"