#!/usr/bin/env bash
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1
STATUS=0
FILES_OK=1
for file in public/manifest.webmanifest public/sw.js public/offline.html \
  src/app/layout.tsx src/app/page.tsx "src/app/inspecciones/page.tsx" \
  "src/app/inspecciones/[id]/page.tsx" src/components/app-shell.tsx \
  src/components/register-sw.tsx src/components/loading-state.tsx \
  src/lib/pwa/register-service-worker.ts src/lib/storage/schema.ts \
  docs/cache-strategy.md docs/rendering-decision.md \
  docs/sync-policy.md docs/sync/01-modelo.md docs/sync/02-conflictos.md docs/sync/03-cola.md \
  tests/manifest.spec.ts tests/source-loader.cjs tests/sw-harness.cjs \
  tests/service-worker.spec.ts tests/offline.spec.ts tests/rendering.spec.ts \
  scripts/check-secrets.mjs scripts/verify.mjs README.md \
  src/lib/sync/queue.ts src/lib/sync/conflict-policy.ts tests/sync.spec.ts; do
  # Nota: los archivos van en la lista de arriba, no en este cuerpo. Puestos aqui bash los
  # intentaria EJECUTAR, y el `files: PASS` seguiria verde sin haberlos comprobado nunca.
  if [ ! -s "$file" ]; then
    echo "Falta archivo: $file" >&2
    FILES_OK=0
  fi
done
if [ "$FILES_OK" -eq 1 ]; then echo "files: PASS"; else echo "files: FAIL"; STATUS=1; fi

if node scripts/check-secrets.mjs; then echo "cursors: PASS"; else echo "cursors: FAIL"; STATUS=1; fi

if node --input-type=module <<'NODE'
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
// La identidad de la actividad y la ruta del reporte salen del contrato, no de aqui.
const { ASSIGNMENT_ID } = createRequire(import.meta.url)("./tests/source-loader.cjs").loadSource("src/lib/storage/schema.ts");
const report = JSON.parse(readFileSync(`reports/${ASSIGNMENT_ID}/tests.json`, "utf8"));
assert.equal(report.assignmentId, ASSIGNMENT_ID);
assert.equal(report.status, "pass");
assert.equal(report.commitSha, execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim());
// Suites esperadas derivadas de los archivos presentes, no de una lista escrita a mano.
const legacy = { "manifest.spec.ts": "manifest02" };
const expected = readdirSync("tests").filter((f) => f.endsWith(".spec.ts"))
  .map((f) => legacy[f] ?? f.replace(/\.spec\.ts$/, ""));
assert.equal(report.suites.length, expected.length, "Faltan suites en el reporte");
for (const id of expected) {
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

if node --input-type=module <<'NODE'
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
const { loadSource } = createRequire(import.meta.url)("./tests/source-loader.cjs");

// 1. El contrato debe exponer los simbolos que comparten los tres bloques.
const schema = readFileSync("src/lib/storage/schema.ts", "utf8");
for (const symbol of ["ASSIGNMENT_ID", "SCHEMA_VERSION", "SyncEnvelope", "QueueEntry",
                      "ConflictRecord", "InspectionStore", "idempotencyKey", "migrate"]) {
  assert.ok(schema.includes(symbol), `Falta el simbolo del contrato: ${symbol}`);
}

// 2. Comportamiento de la clave de idempotencia, ejecutado de verdad.
//    Mismos datos y misma version = misma clave. Version distinta = operacion distinta.
//    Si la clave ignorara la version, un reintento y un cambio nuevo colisionarian.
const { idempotencyKey, migrate, ASSIGNMENT_ID, SCHEMA_VERSION } = loadSource("src/lib/storage/schema.ts");
const base = { id: "inspection-001", location: "L", date: "2026-08-28", inspector: "T",
               status: "ok", statusLabel: "ok", findings: 0, summary: "s" };
assert.equal(idempotencyKey(base, 1), idempotencyKey({ ...base }, 1), "la clave debe ser determinista");
assert.notEqual(idempotencyKey(base, 1), idempotencyKey(base, 2), "una version nueva debe ser otra operacion");
assert.equal(migrate({ a: 1 }, SCHEMA_VERSION, SCHEMA_VERSION).a, 1, "migrar a la misma version no debe cambiar nada");
assert.throws(() => migrate({ a: 1 }, SCHEMA_VERSION, 0), /descendente/, "la migracion descendente debe fallar");

// 3. Los artefactos de la semana 5: que no sean archivos vacios.
//    La EXISTENCIA ya no se comprueba aqui, sino en la lista de archivos de arriba (linea 16),
//    que desde el dia de integrar exige los cinco. Este paso solo evita que un archivo exista
//    pero este vacio, porque `test -s` de arriba ya cubre el caso contrario.
const optional = ["src/lib/sync/queue.ts", "src/lib/sync/conflict-policy.ts", "tests/sync.spec.ts"];
for (const f of optional) {
  if (existsSync(f)) {
    assert.ok(readFileSync(f, "utf8").trim().length > 40, `Archivo trivial (solo existencia no basta): ${f}`);
  }
}

// 4. Si hay suites de sincronizacion, deben estar y tener comprobaciones.
const report = JSON.parse(readFileSync(`reports/${ASSIGNMENT_ID}/tests.json`, "utf8"));
const sync = report.suites.filter((s) => s.suiteId.startsWith("sync"));
console.log(`sync: contrato ${ASSIGNMENT_ID} v${SCHEMA_VERSION}; suites sync: ${sync.length ? sync.map((s) => s.suiteId).join(", ") : "ninguna aun"}`);
NODE
then echo "sync: PASS"; else echo "sync: FAIL"; STATUS=1; fi

if [ "$STATUS" -eq 0 ]; then echo "PUBLIC_OK"; fi
exit "$STATUS"