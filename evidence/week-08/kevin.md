# Evidencia week-08 — Kevin Armando Montalvo Marcial

- **Grupo y equipo:** 10A-E08. **Matrícula:** 3523110092.
- **Rama:** `semana-8-kevin-testing-ci` (desde `master`).
- **Bloque:** Arranque compartido + Bloque A (pirámide unitaria), según `referencias/GUIA-SEMANA8-ARRANQUE.md` y `referencias/GUIA-SEMANA8-KEVIN.md` (compartidas fuera del repositorio).
- **Fecha de ejecución:** 20 de octubre de 2026.

## 1. Qué hice (contribución concreta)

1. **Arranque de la semana** (Fase A0):
   - Actualicé `ASSIGNMENT_ID` de `"w06-device-push"` a `"w08-testing-ci"` en `src/lib/storage/schema.ts`. Todo el harness (reporte `reports/w08-testing-ci/tests.json`, `verify.mjs`, `check.sh`) lee ese valor: es la única fuente de verdad.
   - Creé `tests/discover.cjs`, la **única** función de descubrimiento de suites. Antes la lógica estaba duplicada en tres lectores (`starter.spec.mjs`, `verify.mjs` y el bloque `tests:` de `check.sh`), cada uno con su propio `readdirSync`; con las tres capas de la pirámide nueva, esa duplicación habría permitido que una suite existiera en disco pero no en el reporte sin que nadie lo notara. Ahora los tres consumen el mismo helper.
   - Extendí el descubrimiento a las capas `tests/unit/`, `tests/integration/` y `tests/e2e/` con ids prefijados (`unit/<nombre>`, etc.), conservando intactos los ids históricos (`manifest02`).
   - Agregué una **guardia anti falso-verde** en el runner: una corrida que descubre cero suites falla en vez de aprobar con `[].every()`.
   - Creé los README de las tres carpetas de la pirámide y las registré en la lista de archivos de `check.sh`.
2. **Bloque A — pirámide unitaria** (Fase A1), 37 checks en dos suites:
   - `tests/unit/schema-idempotencia.spec.ts` (15 checks): determinismo y formato de `idempotencyKey`, migración (no-op, descendente, versión desconocida, v0→v1), y `MemoryInspectionStore` con foco en que **ni `put` ni `get` conservan referencias** (una copia mutada no contamina el almacén).
   - `tests/unit/sync-bordes.spec.ts` (22 checks): bordes del backoff (crecimiento, techo, intentos negativos, base inyectable), semillas del jitter, `isStale` en empates, `detectConflict` (incluido `updatedAt === 0` como «sin edición»), y `resolve` con todas sus guardas y la degradación a `manual-review`.
3. **Demostración de regresión** (Fase A2): los cuatro archivos de `evidence/week-08/kevin-regresion-*.txt`.

## 2. Decisión técnica que puedo explicar

**El descubrimiento de suites se centraliza en `tests/discover.cjs` en vez de mantener las tres listas.** La semana 5 ya sufrió la versión semántica de este problema: un marcador de `check.sh` estaba dentro del cuerpo del `for` y el `files: PASS` salía verde sin haber comprobado los archivos nuevos. Con la pirámide, el riesgo se triplicaba: si cada lector escanea por su cuenta, basta que uno ignore `tests/e2e/` para que el E2E exista pero nunca se ejecute ni se reporte. Un solo módulo con una sola firma (`discoverSuites(root)`) elimina esa clase de fallo, y el runner ahora **falla si descubre cero suites**, porque `[].every() === true` es el falso-verde clásico.

## 3. Pruebas que ejecuté y resultado real

Ejecutado el 20 de octubre de 2026 en Windows PowerShell con `npm.cmd` (la política bloquea `npm.ps1`):

| Comando | Resultado |
|---|---|
| `npm.cmd test` (línea base, antes de escribir unit) | `starter.spec.mjs: PASS` — 12 suites, 118 checks |
| `npm.cmd test` (con Bloque A) | `starter.spec.mjs: PASS` — **14 suites, 155 checks** |
| `npm.cmd run verify` | `Verificación técnica: pass` (estructura + test + barrido + build) |
| `bash public-tests/check.sh` (Git Bash) | `PUBLIC_OK`, código de salida 0 (los 8 apartados en PASS) |

### Demostración de regresión (fallo reproducible)

Rompi `idempotencyKey` a propósito quitando la versión de la clave (`return inspection.id`):

- **`npm.cmd test` → FAIL.** Atraparon la rotura **9 checks en 4 suites**:
  - `unit/schema-idempotencia/key-version-sensitive` y `key-format-includes-id-and-version` (misma capa, mensaje directo),
  - `sync.modelo/idempotency-deterministic` e `idempotency-version-sensitive`,
  - `sync.cola/no-duplicate-on-enqueue` y `out-of-order-ignored`,
  - `sync/resolution-is-a-new-operation`, `stale-response-cannot-clobber` y `migration-does-not-orphan-the-queue`.
- Restauré la función y volvió el verde completo (14 suites / 155 checks).

Salidas capturadas (fuente real, sin edición manual):
- `evidence/week-08/kevin-regresion-01-linea-base.txt` — verde con conteos.
- `evidence/week-08/kevin-regresion-02-rotura-detectada.txt` — salida completa del FAIL con los 9 checks.
- `evidence/week-08/kevin-regresion-03-restaurado.txt` — verde tras restaurar.

### Prueba negativa de la puerta (check.sh)

Moví `tests/unit/` temporalmente a `tests/unit-oculta` y ejecuté `check.sh`:

- Sin la carpeta: `files: FAIL` (falta `tests/unit/README.md`) y `tests: FAIL` («Faltan suites en el reporte»), **código de salida 1**.
- Restaurada: `PUBLIC_OK`, código 0.

Captura real (generada con `cmd /c bash public-tests/check.sh 2>&1`, sin transcripción manual) en `evidence/week-08/kevin-regresion-04-prueba-negativa-puerta.txt`.

## 4. Qué comprueba y qué no

**Comprueba:** las suites unitarias ejercitan lógica pura con valores en los bordes del contrato (clave `id::vN`, techo del backoff, migración, copias del almacén). El runner descubre automáticamente cualquier `*.spec.ts` en las cuatro ubicaciones y su reporte debe contener exactamente los mismos `suiteId` que el disco, o `verify` y `check.sh` fallan.

**No comprueba:** nada de navegador, IndexedDB, red real ni registro efectivo del Service Worker (eso es de los bloques B y C). El helper `discover.cjs` se prueba indirectamente: si fallara, la guardia de cero suites y la comparación del reporte lo delatan, pero no hay una unitaria del propio helper.

## 5. Limitación o fallo diagnosticado

Además del fallo inyectado en la demostración, encontré y corregí un fallo propio durante el arranque: mi primera versión de `discoverSuites` escaneaba `root` en vez de `root/tests`. El resultado fue un **verde con 0 suites** (`starter.spec.mjs: PASS` con el reporte vacío), es decir, exactamente el falso-verde que la guardia anti falso-verde (agregada en el mismo cambio) quedó diseñada para impedir. Lo detecté al inspeccionar el reporte en vez de fiarme del PASS; tras corregirlo, la línea base recuperó las 12 suites históricas.

Límite declarado: esta verificación se ejecutó en Windows/PowerShell con Node local; la CI (workflow académico de Juan Andrés) correrá en Ubuntu con Node 20.19.6 y deberá confirmarse por separado.

## 6. Bloque A extra — pruebas unitarias añadidas por decisión propia (20 de octubre)

Sobre la línea base del Bloque A se añadieron **13 checks** (de 155 a **168**):

- `tests/unit/sync-bordes.spec.ts` (+5): los tres casos de `last-write-wins` (remoto más nuevo gana, remoto más viejo no pisa, empate gana local) — la tercera estrategia de `conflict-policy.ts` estaba casi sin ejercitar — y `queue-jitter-range-with-injected-clock`, que mide el jitter **dentro** de `SyncQueue` con reloj y fuente aleatoria inyectados (`random()=0` → delay exacto = base; `random()=1` → +10 % sin pasar `MAX_DELAY_MS`).
- `tests/unit/schema-idempotencia.spec.ts` (+1): `migrate-v0-keeps-existing-summary` — un `summary` ya escrito en v0 no se pisa con `""` (el operador `??` de la migración).
- `tests/unit/dataset-sintetico.spec.ts` (**archivo nuevo**, 8 checks): automatiza el RNF-04 que antes solo se revisaba a mano — ids únicos, campos requeridos, `status` válidos, fechas ISO no futuras, coherencia `findings`↔`status`, alias genéricos de inspector («Técnica A») y **cero datos personales** (correo, matrícula de 10 dígitos, teléfono, CURP) en los campos de texto. Los patrones se aplican solo a `location`/`inspector`/`statusLabel`/`summary`, nunca a `date`/`id`/`findings`, para no casar fechas.

### Pruebas negativas de los checks nuevos (cada rotura, capturada y restaurada)

| Rotura temporal (commit NO destinado a merge) | Checks fallidos | Captura |
|---|---|---|
| `remoteIsNewer = false` en `conflict-policy.ts` | 3: el nuevo `resolve-last-write-wins-takes-newer-remote` + 2 históricos de `sync.conflictos` (misma estrategia) | `kevin-negativo-1-lww-rotura.txt` |
| `jitter = 0` en `queue.ts` | **1**: `queue-jitter-range-with-injected-clock` (los históricos solo prueban determinismo, que sigue cumpliéndose) | `kevin-negativo-2-jitter-rotura.txt` |
| `summary: ""` fijo en `migrate` | **1**: `migrate-v0-keeps-existing-summary` | `kevin-negativo-3-migrate-rotura.txt` |
| Correo `juan.perez@ejemplo.edu.mx` dentro del `summary` de inspection-002 | **1**: `sin-datos-personales` con detalle «contiene correo electrónico» | `kevin-negativo-4-pii-rotura.txt` |

Nota de honestidad de la primera tentativa: mi primer intento de rotura del dataset puso el correo en un **comentario** del código, y la suite no lo detectaría (escanea valores de campos, no fuente). Lo corregí poniéndolo dentro del campo `summary`, que es el caso real que importa.

Verificación final tras restaurar las cuatro roturas: `git diff src/` muestra **solo** el cambio legítimo de `ASSIGNMENT_ID`; `npm.cmd test` → 15 suites / 168 checks PASS; `npm.cmd run verify` → pass; `check.sh` → `PUBLIC_OK` código 0. Captura: `kevin-negativo-00-final-restaurado.txt`.

## 7. Uso de IA y validación humana

Usé un asistente de IA de terminal (opencode) para redactar las suites, el helper `discover.cjs` y esta evidencia, y para diagnosticar el falso-verde de 0 suites. En el bloque extra (sección 6), el asistente redactó las pruebas y ejecutó las roturas; yo verifiqué que cada rotura cayera solo donde se esperaba y que las restauraciones dejaran `git diff src/` con solo el cambio de `ASSIGNMENT_ID`. **Validación humana:** ejecuté y verifiqué personalmente cada comando en PowerShell (`npm.cmd test`, `npm.cmd run verify`) y en Git Bash (`check.sh`), revisé la salida completa de la rotura inyectada (9 checks, ninguno ajeno a la clave), confirmé con `git diff src/lib/storage/schema.ts` que tras la demostración el único cambio fue el `ASSIGNMENT_ID`, y verifiqué que la prueba negativa de la puerta falla con código 1 y restaura a `PUBLIC_OK`. Ninguna captura fue transcrita a mano.
