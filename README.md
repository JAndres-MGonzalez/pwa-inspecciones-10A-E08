# Inspecciones de laboratorio · Semanas 1 a 5

Proyecto del equipo **10A-E08** para consultar inspecciones y mantenimiento de laboratorios con datos sintéticos.

Repositorio: [pwa-inspecciones-10A-E08](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08).

## Estado de Semana 5 · `w05-sync-data`

La semana 5 agrega la capa de datos y sincronización. El contrato compartido está congelado en
[`src/lib/storage/schema.ts`](src/lib/storage/schema.ts) y la política documentada en
[`docs/sync-policy.md`](docs/sync-policy.md), con una sección por integrante:

| Sección | Autor | Contenido |
|---|---|---|
| [Modelo y persistencia local](docs/sync/01-modelo.md) | Kevin Montalvo | qué se guarda, versión de esquema, migración, clave de idempotencia |
| [Política de conflictos](docs/sync/02-conflictos.md) | Juan Andrés Medina | qué es un conflicto, qué estrategia gana, cómo se registra |
| [Cola idempotente y reintentos](docs/sync/03-cola.md) | José Ismael Montalvo | encolado, deduplicación, backoff, cierre de pestaña |

El identificador de la actividad y la ruta del reporte se leen del contrato. Anteriormente cada
transición de semana obligaba a editar a mano la misma ruta y el mismo identificador en dos
archivos; en la transición de la semana 3 a la 4 fueron ocho valores. Las suites se descubren
solas en `tests/*.spec.ts`, de modo que agregar una prueba no requiere tocar el runner.

**Límites declarados.** No hay servidor: la cola y la política se prueban contra un transporte
simulado en memoria. La persistencia local usa `MemoryInspectionStore`; la interfaz
`InspectionStore` declara el contrato pero la conexión real con IndexedDB no está implementada.

## Estado de Semana 3 (base heredada)

La aplicación muestra tres inspecciones de ejemplo, navegación, manifest, iconos y estados de carga, error y lista vacía. El layout registra `public/sw.js` con alcance `/`.

El Service Worker prepara el inicio, la página de respaldo, manifest, iconos y los CSS/JavaScript enlazados por el HTML inicial. Las páginas intentan la red primero y utilizan una copia guardada o el respaldo sin conexión si la red falla. La limpieza conserva las cachés ajenas.

Se completaron las pruebas y herramientas del turno de Ismael. La [estrategia de caché](docs/cache-strategy.md) describe el comportamiento implementado y sus límites; la [bitácora](evidence/session-log.md#turno-2--semana-3--ismael-completar-integración) registra el diagnóstico y la verificación.

## Instalar y ejecutar

Requisitos: Git, Node.js 20.19.6 o posterior compatible y npm. Desde la carpeta del proyecto, en PowerShell:

```powershell
npm.cmd ci --ignore-scripts --no-audit --no-fund
npm.cmd run dev
```

Abrir [localhost:3000](http://localhost:3000). Detener con Ctrl+C antes de compilar. Para ejecutar la versión de producción:

```powershell
npm.cmd run build
npm.cmd run start
```

Los scripts disponibles son `dev`, `build`, `start`, `test`, `check-secrets` y `verify`. En otros sistemas se puede escribir `npm` en lugar de `npm.cmd`.

## Verificación

```powershell
npm.cmd run verify
bash public-tests/check.sh
```

`npm.cmd run verify` es el equivalente exacto de `make verify`: el Makefile llama a `npm run verify`. El script comprueba archivos, ejecuta las tres suites, revisa palabras sensibles y compila. Genera `reports/verification.json`. El chequeo público necesita Git Bash y Node en Windows.

| Comprobación | Alcance actual |
|---|---|
| Instalación con `npm.cmd ci --ignore-scripts --no-audit --no-fund` | Conserva las dependencias y el lockfile |
| `npm.cmd test` | 45 casos: 9 de manifest y estructura, 20 de Service Worker, 7 de offline y 9 de renderizado; más las suites de sincronización que se agreguen. Reporte en `reports/w05-sync-data/tests.json` |
| `npm.cmd run check-secrets` | Barrido de palabras con excepciones literales documentadas en `public-tests/README.md` |
| `npm.cmd run verify` | Estructura, suites, barrido y build; reporte `w05-sync-data` |
| Chequeo público | `files`, `cursors`, `tests`, `package` y `sync`: archivos presentes, barrido, suites completas, ausencia de vitest y contrato de idempotencia |

Ejecuta `npm.cmd test` **antes** del chequeo público: el reporte vive en `reports/`, que está
ignorado por Git, y el chequeo falla si no corresponde al SHA actual.

La [revisión de integración](evidence/session-log.md#revisión-final-de-juan-andrés--semana-3) registra los 35 casos y cuatro chequeos aprobados, la compilación y sus límites. Un reporte anterior debe regenerarse después de modificar el código.

## Entorno del Turno 3

| Herramienta | Comprobación local | Workflow de Semana 3 |
|---|---|---|
| Sistema | Windows | Ubuntu de GitHub Actions |
| Node.js | 26.4.0 | 20.19.6 |
| npm | 11.17.0 | Versión incluida con Node.js en Actions |
| Git | 2.55.0.windows.3 | Versión del entorno de Actions |

## Decisiones y límites

La [nota de decisiones](docs/decision-record.md#semana-3--actualización-automática-y-caché) describe el funcionamiento implementado: guardar los recursos de la aplicación, intentar la red primero para las páginas y disponer de un respaldo sin conexión. La primera preparación requiere conexión y que termine la instalación del Service Worker.

La corrección del turno de Ismael limita la limpieza al prefijo `inspecciones-`, repone las peticiones y mensajes, y añade pruebas que reproducen los fallos detectados durante la revisión anterior.

Se usan únicamente inspecciones ficticias. No hay captura de inspecciones nuevas desde la interfaz
ni un servidor real contra el que sincronizar: la capa de datos y la cola de la Semana 5 se
prueban en memoria. Un build aprobado no comprueba el funcionamiento offline ni sustituye la
revisión académica.

## Entrega Semana 3

El workflow `week-03-w03-service-worker-offline.yml` ejecuta instalación, build y pruebas al subir a `master`. Usa el contenido indicado en la guía. Los pasos opcionales de feedback no generan un reporte porque el proyecto no tiene `test:feedback`; por sí solos no acreditan la actividad.

La evidencia de cada integrante está en [evidence/individual.md](evidence/individual.md) y la bitácora en [evidence/session-log.md](evidence/session-log.md). Cada persona registra su propia contribución y sus pruebas.

Antes de entregar debe registrarse la revisión personal y quedar Actions en verde sobre el SHA que se entregue. Para Classroom se entrega el enlace o SHA final del repositorio, dentro del plazo asignado. La guía del equipo también pide conservar la URL y la captura del run de Semana 3. Los reportes generados y la guía de trabajo se conservan fuera de Git.

## Entrega Semana 5

El workflow `week-05-w05-sync-data.yml` corre en cada `push` y en cada `pull_request`. Hace el
`checkout` con `ref:` al SHA del PR: sin eso, en un evento `pull_request` el runner se queda con
el SHA del commit de fusión sintético y las comprobaciones de `commitSha` describirían un commit
que nadie commiteó. Sus correcciones respecto del kit y el criterio de endurecimiento de la puerta
por etapas están documentados en [`public-tests/README.md`](public-tests/README.md).
