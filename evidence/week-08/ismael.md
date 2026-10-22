# Evidencia week-08 — José Ismael Montalvo López

- **Grupo y equipo:** 10A-E08.
- **Rama:** `semana-8-ismael-testing-ci` (desde `master`, después del PR #21 con el arranque y el Bloque A de Kevin).
- **Bloque:** B (pruebas de integración), según `GUIA-SEMANA8-ARRANQUE.md` y `GUIA-SEMANA8-ISMAEL.md`.
- **Commit de las suites:** [82447deb7a455ebcb0a1d1635f2bf177068e9a52](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/commit/82447deb7a455ebcb0a1d1635f2bf177068e9a52). Este es el SHA sobre el que corrí `verify` y `check.sh`; el commit de esta evidencia es posterior y no puede contener su propio SHA.
- **Fecha de ejecución:** 22 de octubre de 2026.

## 1. Qué hice (contribución concreta)

Agregué dos suites en `tests/integration/`, que el descubrimiento automático de Kevin (`tests/discover.cjs`) detecta sola como `integration/<nombre>`. No toqué ningún archivo ajeno ni el runner.

1. **`tests/integration/sync-ciclo-completo.spec.ts` (5 checks).** Usa componentes reales (`MemoryInspectionStore`, `SyncQueue`, `resolve`) y un servidor falso en memoria con reloj inyectado:
   - `full-cycle-happy-path`: encolar 2 inspecciones, `drain()`, los sobres salen con clave `id::vN`, quedan `synced` y `pending()` queda vacío.
   - `conflict-mid-cycle-resolves`: edición local y remota de campos distintos; `field-level-merge` conserva ambos cambios y los `ConflictRecord` usan la misma clave que la entrada de la cola.
   - `retry-then-conflict`: el servidor falla dos veces y luego responde; `attempts` es 2, la operación se aplica una sola vez en el servidor falso y reencolar la misma clave no duplica ni reenvía; un conflicto posterior reusa la clave de la cola.
   - `stale-response-cannot-clobber-after-resolve`: se resuelve un conflicto y se encola como v3 mientras la respuesta de la v2 sigue retenida; al liberarla, `lastApplied` se queda en 3.
   - `queue-and-policy-agree-on-version`: la clave de la cola es la que `resolve` acepta, y una versión remota distinta la rechaza.
2. **`tests/integration/sw-registro.spec.ts` (4 checks).** Contrato entre la app, el `public/sw.js` real y el harness:
   - `register-url-points-to-existing-worker-file`: lo que registra la app existe en `public/`, queda dentro de su scope y el harness lo instala.
   - `register-rejection-degrades-without-throw`: si el navegador rechaza el registro, devuelve `undefined` y deja constancia en `console.error`.
   - `register-twice-delegates-dedup-to-browser`: dos invocaciones llaman a `register` con los mismos argumentos y devuelven el mismo registro.
   - `sw-update-flow-install-then-activate-purges-old-version`: instalar y luego activar con el worker real purga la caché anterior, conserva la vigente y no toca cachés ajenas.

**Escenarios que no repetí** porque ya están en `tests/service-worker.spec.ts`: `register-registers-sw-js-with-scope` (registro con `/sw.js` y scope `/`), `register-unsupported-returns-undefined` (sin soporte) y `sw-skip-waiting-message-and-invalid-messages` (mensaje `SKIP_WAITING`).

## 2. Decisión técnica que puedo explicar

**Integración en vez de duplicar unitarias, y la clave `id::vN` como punto de unión.** Las unitarias de Kevin ya prueban cada módulo por separado. Mi capa combina cola, política de conflictos y schema porque comparten un contrato: la clave `id::vN` que calcula `idempotencyKey`. La cola la usa para deduplicar y la política para validar que el sobre remoto corresponde a esa inspección y versión. Si un módulo cambiara el formato sin el otro, cada uno seguiría pasando sus pruebas unitarias; solo una prueba que los junte lo detecta, y eso hace esta suite.

## 3. Pruebas que ejecuté y resultado real

Ejecutado el 22 de octubre de 2026 en Windows PowerShell con `npm.cmd`; `check.sh` con Git Bash.

| Comando | Resultado |
|---|---|
| Cada suite en aislado (`loadSource(...).runChecks()`) | 5 checks `pass` en `sync-ciclo-completo` y 4 en `sw-registro` |
| `npm.cmd test` | `starter.spec.mjs: PASS`, **17 suites y 177 checks** (168 anteriores, según la evidencia de Kevin, más mis 9) |
| `npm.cmd run verify` | `Verificación técnica: pass` (tests, barrido de datos sensibles y build) |
| `bash public-tests/check.sh` | `PUBLIC_OK` |

### Prueba negativa

Rompí un solo contrato: `idempotencyKey` devolvía `${inspection.id}` sin la versión. `npm.cmd test` terminó en FAIL con **12 checks fallidos en 5 suites**:

| Suite | Checks que fallaron |
|---|---|
| `integration/sync-ciclo-completo` (la mía) | `full-cycle-happy-path`, `stale-response-cannot-clobber-after-resolve`, `queue-and-policy-agree-on-version` |
| `unit/schema-idempotencia` (la de Kevin) | `key-version-sensitive`, `key-format-includes-id-and-version` |
| `sync.cola` | `no-duplicate-on-enqueue`, `out-of-order-ignored` |
| `sync.modelo` | `idempotency-deterministic`, `idempotency-version-sensitive` |
| `sync` | `resolution-is-a-new-operation`, `stale-response-cannot-clobber`, `migration-does-not-orphan-the-queue` |

Restauré con `git checkout -- src/lib/storage/schema.ts`; `git status --short` quedó sin cambios en `src/` y `npm.cmd test` volvió a verde, sin ningún `fail`.

Salidas capturadas (sin edición manual):
- `evidence/week-08/ismael-01-linea-base.txt`: las dos suites en aislado.
- `evidence/week-08/ismael-02-npm-test.txt`: `npm test` completo.
- `evidence/week-08/ismael-03-verify.txt`: `verify` completo.
- `evidence/week-08/ismael-04-negativa-rota.txt`: la salida con el contrato roto.
- `evidence/week-08/ismael-05-restaurado.txt`: verde tras restaurar.

## 4. Qué comprueba y qué no

**Comprueba:** que cola, política de conflictos y schema siguen de acuerdo en la clave `id::vN`; que el ciclo completo con reintentos y respuestas tardías conserva el orden de versiones; y que el registro del Service Worker apunta a un archivo real y se degrada sin romper la app.

**No comprueba:** un servidor real, IndexedDB ni un navegador real. El servidor, el transporte y el almacén son dobles en memoria, y el harness del SW simula el entorno en memoria (el HTTP real corresponde a la capa E2E de Juan Andrés). Tampoco prueba cada módulo por separado: eso es del Bloque A.

## 5. Limitación o fallo diagnosticado

- **Dos checks no cayeron con la rotura**, y es esperado: `conflict-mid-cycle-resolves` y `retry-then-conflict` comprueban que la cola y la política **coincidan** en la clave, y con la clave rota ambas siguen coincidiendo. Detectan desacuerdo entre módulos, no que el formato de la clave sea el correcto; esa parte la cubren las unitarias de Kevin (`key-format-includes-id-and-version`).
- **La guía pedía comprobar que una segunda invocación del registro «no duplica»**, pero `registerServiceWorker` no guarda estado: vuelve a llamar a `register` con los mismos argumentos y la deduplicación la hace el navegador. Mi check documenta ese comportamiento real en lugar de afirmar una garantía que el módulo no da.
- Las capturas de `Tee-Object` conservan caracteres con codificación alterada (por ejemplo `Ô£ô`) por la consola de PowerShell; el contenido de los resultados no cambia.
- Esta verificación se hizo en Windows con Node local; la CI de Juan Andrés corre en Ubuntu y debe confirmarse por separado.
- Por consistencia con las evidencias de Kevin, usé la carpeta `evidence/week-08/` en lugar de `evidence/w08/` que menciona la guía.

## 6. Uso de IA y validación humana

Usé Claude (Anthropic), en chat, para guiarme paso a paso con los comandos de Git y PowerShell y para redactar las dos suites y esta evidencia. Claude leyó el código del repositorio (`queue.ts`, `conflict-policy.ts`, `schema.ts`, `register-service-worker.ts`, `sw-harness.cjs` y las specs existentes) y ejecutó las suites y la rotura en su propio entorno antes de dármelas; esas ejecuciones no son mías y no se citan como resultado.

**Validación humana:** copié los archivos a mi rama, ejecuté yo mismo en PowerShell las dos suites en aislado, `npm.cmd test` y `npm.cmd run verify`, y `check.sh` con Git Bash; hice la prueba negativa, revisé la lista de checks fallidos y confirmé con `git status --short` que `src/` quedó limpio al restaurar.
