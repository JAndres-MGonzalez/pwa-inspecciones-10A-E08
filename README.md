# Inspecciones de laboratorio · Semanas 1 a 8

Proyecto del equipo **10A-E08** para consultar inspecciones y mantenimiento de laboratorios con datos sintéticos.

Repositorio: [pwa-inspecciones-10A-E08](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08).

## Semana 8 · `w08-testing-ci` · avance

El PR #21 integra el arranque y las unitarias de Kevin. Se agregan ocho comprobaciones HTTP
contra el servidor de producción, CI con etapas separadas y reportes de resultados/cobertura.
La [estrategia de pruebas](docs/test-strategy.md) relaciona riesgos, capas y límites.

**La semana no está cerrada.** Falta la integración nueva de Ismael. La aplicación aún no
tiene el flujo de creación, guardado durable y sincronización desde la interfaz que solicita
`ACTIVIDAD.txt`. Los checks HTTP no sustituyen el E2E de ese flujo ni su variante sin capacidad.

Comandos de esta semana en PowerShell, con Node.js 20.19.6 o posterior compatible:

```powershell
npm.cmd ci --ignore-scripts --no-audit --no-fund
node scripts/lint.mjs
node node_modules/typescript/bin/tsc --noEmit
npm.cmd run build
node scripts/test-with-coverage.mjs
npm.cmd run verify
& 'C:\Program Files\Git\bin\bash.exe' public-tests/check.sh
node scripts/evaluation-result.mjs
```

`npm run verify` equivale a `make verify`: estructura, pruebas, barrido de información sensible,
build y consistencia del reporte. Se hace build antes del primer test. Las suites se descubren
en `tests/*.spec.ts` y `tests/{unit,integration,e2e}/*.spec.ts` sin listas manuales. `npm test`
también ejecuta HTTP: inicia un servidor de producción en puerto libre y lo detiene al terminar.
Con un `next start` ya abierto se puede usar `E2E_BASE_URL=http://127.0.0.1:3000`.

El lint revisa sintaxis JS/TS con Node y TypeScript existentes; la comprobación de tipos es
otra etapa. No se incorporan ESLint ni dependencias nuevas. La CI usa Ubuntu y Node 20.19.6.

El workflow `.github/workflows/academic-evaluation.yml` conserva resultados y cobertura incluso
cuando falla una etapa. El ZIP de instrucciones no contiene otro workflow original de semana 8;
se documenta este equivalente. Artefacto: `academic-evidence-w08-testing-ci`.

Los resultados quedan en `reports/w08-testing-ci/tests.json`, `reports/verification.json`,
`coverage/` y `evaluation-result.json`. La cobertura V8 identifica el JS del runner y auxiliares;
no tiene un mapa fiable al TypeScript ejecutado dinámicamente. No se declara un porcentaje de
cobertura de `src/`. El resumen de cierre devuelve código 1 e `incomplete` si falta alguna capa
o los escenarios de interfaz, aunque las comprobaciones existentes estén verdes.

La evidencia de Juan Andrés está [separada por semana](evidence/w08/juan-andres.md). Kevin
conserva la suya en [evidence/week-08/kevin.md](evidence/week-08/kevin.md). No se modifica su
ruta histórica ni se escribe la evidencia personal de Ismael. `master` está protegida:
cambios mediante PR incluso para administradores, sin push forzado ni borrado.

La entrega se prepara en [ENTREGA.md](ENTREGA.md). Cada integrante entrega por separado en
Classroom el mismo SHA integrado y su sección personal. La consigna de semana 8 no requiere tag.

## Estado de Semana 6 · `w06-device-push`

La semana 6 incorpora evidencia opcional por cámara o archivo, ubicación opcional y
notificaciones locales de cambio. Los permisos se solicitan desde un clic. **Avisar cambio**
muestra el mensaje en pantalla si no hay permiso; **Permitir notificaciones** abre la solicitud
opcional. **Adjuntar ubicación** conserva el flujo sin coordenadas cuando la API falla.

El contrato está en `src/lib/device/types.ts` y el índice en
[docs/capabilities.md](docs/capabilities.md). La evidencia y los avisos usan datos sintéticos.
El adjunto permanece en memoria y no se envía a un servidor.

La suite `tests/capabilities.spec.ts` comprueba los tres módulos bajo el mismo contrato.
La verificación exige todos los entregables. El workflow de semana 6 es la copia original
del kit, con SHA256 `CDA79B0A9547EC24DA3EE5D6FDE05E1744EAE3159BDB007A3A866080BCE0F6A9`.
La política permite cámara y ubicación solo a este origen; el micrófono permanece bloqueado.

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
npm.cmd run build
npm.cmd run start
```

Abrir [localhost:3000](http://localhost:3000). Detener con Ctrl+C antes de compilar. Para ejecutar la versión de producción:

```powershell
npm.cmd run build
npm.cmd run start
```

Los scripts disponibles son `dev`, `build`, `start`, `test`, `check-secrets` y `verify`. En otros sistemas se puede escribir `npm` en lugar de `npm.cmd`.

Para probar los botones de dispositivo utiliza **producción**, con `npm.cmd run build` y
`npm.cmd run start`. La política de seguridad heredada bloquea la evaluación de scripts de
`next dev`, de modo que en ese modo puede verse el HTML sin que los botones funcionen.
La comprobación en producción se realizó sin cambiar esa política.

## Verificación

```powershell
npm.cmd run verify
bash public-tests/check.sh
```

`npm.cmd run verify` es el equivalente exacto de `make verify`: el Makefile llama a `npm run verify`. El script comprueba archivos, descubre y ejecuta todas las suites presentes, revisa palabras sensibles y compila. Genera `reports/verification.json`. El chequeo público necesita Git Bash y Node en Windows.

| Comprobación | Alcance actual |
|---|---|
| Instalación con `npm.cmd ci --ignore-scripts --no-audit --no-fund` | Conserva las dependencias y el lockfile |
| `npm.cmd test` | 118 casos en 12 suites: 83 heredados, 8 de cámara, 8 de ubicación, 13 de notificaciones e interfaz y 6 de integración. Reporte en `reports/w06-device-push/tests.json` |
| `npm.cmd run check-secrets` | Barrido de palabras con excepciones literales documentadas en `public-tests/README.md` |
| `npm.cmd run verify` | Estructura, suites, barrido y build; reporte `w06-device-push` |
| Chequeo público | `files`, `cursors`, `tests`, `package`, `sync` y `capabilities`: archivos presentes, barrido, suites completas, dependencias conservadas, contrato de idempotencia y capacidades disponibles |

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


## Entrega Semana 6

El workflow week-06-w06-device-push.yml es la copia literal del kit. Comprueba instalación
limpia y build (AC-01), presencia de los cinco artefactos (AC-02) y pruebas ejecutables
(AC-03). El criterio de ingeniería se documenta en capacidades, README y evidencia individual;
el workflow no calcula una calificación completa.

La evidencia de Juan Andrés está en evidence/individual.md. La prueba en navegador usa
una imagen sintética, cámara y ubicación bloqueadas por la política de prueba y avisos sin
permiso concedido. El contexto exacto está en evidence/week-06/andres-browser.json.
No demuestra captura real, GPS real ni visualización de un aviso del sistema operativo.

Para entregar se usa el enlace o SHA integrado que coincida con Actions y con el reporte
reports/verification.json. Ese reporte se genera con npm.cmd run verify y no se versiona.
La revisión personal de cada integrante se registra por separado.
