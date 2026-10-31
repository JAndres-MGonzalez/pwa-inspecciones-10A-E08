# Inspecciones de laboratorio · Semanas 1 a 9

Proyecto del equipo **10A-E08** para consultar inspecciones y mantenimiento de laboratorios con datos sintéticos.

Repositorio: [pwa-inspecciones-10A-E08](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08).

## Semana 9 · `w09-security-privacy`

El [modelo de amenazas](docs/threat-model.md) describe los activos, las seis categorías
STRIDE, los controles comprobados y los riesgos que siguen abiertos. Las inspecciones
son sintéticas; no se afirma un despliegue institucional ni cumplimiento legal certificado.

La política de producción limita recursos y conexiones al mismo origen, permite vistas
previas de imágenes locales y bloquea objetos y marcos externos. Cámara y ubicación
son opcionales y del mismo origen; el micrófono está bloqueado. Desarrollo incorpora
las excepciones de evaluación y WebSocket para Next.js. Las pruebas comparan el contrato
de `headers-csp.ts`, la configuración y las cabeceras recibidas por HTTP.

Los scripts y estilos inline siguen permitidos para hidratación; CSP no elimina todo
riesgo de XSS. `robots.txt` pide no rastrear rutas operativas y no sustituye autenticación.
El despliegue con HTTPS, autenticación y almacenamiento protegido queda fuera de esta demo.

El [inventario de privacidad](docs/privacy-data-inventory.md) del Bloque B describe
localStorage y los registros conservados después del envío. La corrección quedó integrada
mediante el [PR #28](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/pull/28).
Las utilidades nuevas de validación y privacidad tienen pruebas propias,
pero aún no están conectadas al formulario. La API mantiene la validación ya existente.
El filtro de imágenes no elimina EXIF. Estos límites están registrados en el modelo.

Instalación y comprobación, con Chrome/Edge instalado y Git Bash en Windows:

```powershell
npm.cmd ci --ignore-scripts --no-audit --no-fund
node scripts/lint.mjs
node node_modules/typescript/bin/tsc --noEmit
npm.cmd run verify
node scripts/test-with-coverage.mjs
& 'C:\Program Files\Git\bin\bash.exe' public-tests/check.sh
node scripts/evaluation-result.mjs
```

Para iniciar la app: `npm.cmd run dev` y abrir `http://localhost:3000`.
`npm run verify` es el equivalente exacto de `make verify`; construye antes de ejecutar
las suites. Para `npm test` por separado se necesita primero `npm run build`.
No se agregan dependencias ni se modifica el lockfile.

Los dos workflows de la semana usan Node 20.19.6. El de semana 9 conserva las condiciones
AC-01 a AC-03 del kit y añade comprobación de evidencia y reporte; `academic-evaluation` conserva
lint, tipos, cobertura, build, navegador y verificación de las suites acumuladas.
Artefactos: `academic-evidence-w09-security-privacy` y `academic-evidence-w09-integration`.
Los reportes de pruebas y cobertura usan `reports/w09-security-privacy/`; el verificador
genera `reports/verification.json` y el resumen `evaluation-result.json`, ligados al SHA.
La cobertura continúa siendo de JS ejecutado, sin porcentaje fiable de líneas TS originales.

El chequeo público acumulado del proyecto se conserva. El script público original del
kit está separado en `referencias/`: en la ejecución local imprimió `PUBLIC_OK` y terminó
en 0 aunque encontró coincidencias con nombres de herramientas. Su negación de la búsqueda
no detiene el script. Esa salida no equivale a una auditoría aprobada. Se conserva el
barrido del proyecto, que sí devuelve un código de fallo cuando detecta contenido fuera
de sus excepciones literales. La evidencia del incremento está en
[evidence/week-09/juan-andres.md](evidence/week-09/juan-andres.md) y en mi sección de
[evidence/individual.md](evidence/individual.md).

La auditoría de dependencias ejecutada el 29 de octubre informó dos avisos altos y uno
crítico en la base instalada. La propuesta automática incluye un cambio mayor de Next.js;
queda pendiente una migración comprobada. El build y las pruebas aprobadas no resuelven
esos avisos. [Resultado registrado](evidence/week-09/andres-auditoria.txt).

La entrega de semana 9 se prepara con el SHA final integrado, su ejecución de Actions y
los adjuntos `verification.json` y `evidence/individual.md`. La etiqueta del equipo es
`week-09-final`; se publica sobre esa misma versión después de comprobar la integración.
El [formato de entrega](ENTREGA.md) y la evidencia separada de cada integrante permiten
identificar contribución, decisión, prueba, limitación y uso de IA.

## Semana 8 · `w08-testing-ci`

Los PR #21 y #23 integran unitarias de Kevin e integración de Ismael. El PR #22 agrega
captura con persistencia local, E2E desde la interfaz, comprobaciones HTTP y CI con reportes.
La [estrategia de pruebas](docs/test-strategy.md) relaciona riesgos, capas y límites.

Desde **Nueva inspección** en el inicio, abrir `/captura`, llenar datos sintéticos y pulsar
**Guardar inspección**. Datos y cola se guardan en localStorage, incluso sin red. Al recargar
se recuperan y **Sincronizar** envía la misma operación a la API de demostración sin duplicar.
La geolocalización es opcional. La API conserva datos en memoria y se reinicia con el servidor;
el registro local permanece en el navegador. Los adjuntos opcionales siguen siendo temporales.

Requisitos: Git, Node.js 20.19.6 o posterior compatible, npm y Chrome/Edge instalado. En
PowerShell, usar `npm.cmd`; para el chequeo público, Git Bash:

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

`npm run verify` equivale a `make verify`: estructura, build, pruebas, barrido de información
sensible y consistencia del reporte. Compila antes de probar, también en un clon limpio. Las suites se descubren
en `tests/*.spec.ts` y `tests/{unit,integration,e2e}/*.spec.ts` sin listas manuales. `npm test`
también ejecuta HTTP y navegador: inicia servidores en puertos libres y los detiene al terminar.
Con un `next start` ya abierto se puede usar `E2E_BASE_URL=http://127.0.0.1:3000`.
`CHROME_PATH` permite seleccionar Chrome/Edge. El E2E usa un perfil temporal y falla si no hay
navegador; no descarga uno ni utiliza el perfil personal. CI usa Chrome de Ubuntu.

El lint revisa sintaxis JS/TS con Node y TypeScript existentes; la comprobación de tipos es
otra etapa. No se incorporan ESLint ni dependencias nuevas. La CI usa Ubuntu y Node 20.19.6.

El workflow `.github/workflows/academic-evaluation.yml` conserva resultados y cobertura incluso
cuando falla una etapa. El ZIP de instrucciones no contiene otro workflow original de semana 8;
se documenta este equivalente. Artefacto: `academic-evidence-w08-testing-ci`.

Los resultados quedan en `reports/w08-testing-ci/tests.json`, `reports/verification.json`,
`coverage/` y `evaluation-result.json`. La cobertura V8 identifica el JS del runner y auxiliares;
no tiene un mapa fiable al TypeScript ejecutado dinámicamente. No se declara un porcentaje de
cobertura de `src/`. También se conserva cobertura precisa del JS del navegador, capturas y
versiones en `reports/w08-testing-ci/browser/`. El resumen devuelve código 1 si falta alguna capa
o los escenarios de interfaz, aunque las comprobaciones existentes estén verdes.

La evidencia de Juan Andrés está [separada por semana](evidence/w08/juan-andres.md). Kevin
conserva la suya en [evidence/week-08/kevin.md](evidence/week-08/kevin.md). No se modifica su
ruta histórica. Ismael conserva [su evidencia propia](evidence/week-08/ismael.md). `master` está protegida:
cambios mediante PR incluso para administradores, sin push forzado ni borrado.

La entrega se prepara en [ENTREGA.md](ENTREGA.md). Cada integrante entrega por separado en
Classroom el mismo SHA integrado y su sección personal. La consigna de semana 8 no requiere tag.

| Entregable | Uso |
|---|---|
| `tests/unit/` | Validación, claves, migración y bordes de sincronización |
| `tests/integration/` | Cola, conflictos, almacenamiento persistente y contrato del SW |
| `tests/e2e/` | Rutas HTTP e interfaz: offline, recarga, reconexión, reintento y capacidad ausente |
| `docs/test-strategy.md` | Riesgos, decisiones, comandos, defectos y límites |
| `.github/workflows/academic-evaluation.yml` | CI y artefacto de resultados/cobertura |
| `evidence/individual.md` | Una sección por persona, enlazada a su evidencia semanal |

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
npm.cmd run build
npm.cmd run verify
& 'C:\Program Files\Git\bin\bash.exe' public-tests/check.sh
node scripts/evaluation-result.mjs
```

`npm.cmd run verify` es el equivalente exacto de `make verify`: el Makefile llama a `npm run verify`. El script comprueba archivos, descubre y ejecuta todas las suites presentes, revisa palabras sensibles y compila. Genera `reports/verification.json`. El chequeo público necesita Git Bash y Node en Windows.

| Comprobación | Alcance actual |
|---|---|
| Instalación con `npm.cmd ci --ignore-scripts --no-audit --no-fund` | Conserva las dependencias y el lockfile |
| `npm.cmd test` | 200 casos en 21 suites: históricas, 4 unitarias, 3 de integración y 2 E2E. Reporte en `reports/w08-testing-ci/tests.json` |
| `npm.cmd run check-secrets` | Barrido de palabras con excepciones literales documentadas en `public-tests/README.md` |
| `npm.cmd run verify` | Estructura, suites, barrido y build; reporte `w08-testing-ci` |
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

Se usan únicamente inspecciones ficticias. La captura de semana 8 conserva datos y cola en
localStorage y sincroniza con una API de demostración en memoria. El E2E comprueba recarga
offline y reintento sin duplicados en navegador local. No demuestra despliegue, almacenamiento
remoto permanente, permisos físicos ni instalación en teléfono. No sustituye la revisión académica.

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
