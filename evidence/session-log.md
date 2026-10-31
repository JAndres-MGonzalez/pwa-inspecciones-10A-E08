# Registro de instalación y verificación

Equipo **10A-E08**. Este documento registra la preparación del entorno y la ejecución local de Juan Andrés. Las fechas usan la zona America/Mexico_City, excepto las marcas de tiempo del reporte terminadas en `Z`, que están en UTC.

## Entorno

Windows NT 10.0.26200.0; Node v26.4.0; npm 11.17.0; Git 2.55.0.windows.3. Starter original con Next.js 14.2.35 y React 18.3.1.

## Preparación del entorno

Fecha: 4 de septiembre de 2026. Los comandos de esta preparación fueron ejecutados por Codex (OpenAI).

| Acción | Resultado real | Alcance |
|---|---|---|
| Extraer ambos ZIP | Starter en la raíz y kit en `referencias/PWA-w01-kit-estudiante/`, ignorado por Git | Conserva las instrucciones del kit separadas y el workflow del starter |
| Primer `npm.cmd ci` | Código 1, `EACCES` al descargar `undici-types-5.26.5.tgz`; sin permiso para escribir logs en caché | Fallo del entorno restringido, no instalación exitosa |
| Reintento autorizado de `npm.cmd ci` | Código 0; 28 paquetes añadidos, 29 auditados | Instalación con lockfile; npm indicó 2 vulnerabilidades altas |
| `npm.cmd run dev -- --hostname 127.0.0.1` | Servidor listo en 5.4 s; GET / 200, compilación inicial 8.7 s | Ejecución local; esos tiempos de desarrollo no prueban la meta futura de rendimiento |
| Abrir localhost:3000 en navegador | Título, aviso de datos sintéticos, «3 registros» y tres tarjetas con todos los campos del dataset | Redes: Técnica A, 2026-08-28, 0; Electrónica: Técnico B, 2026-08-27, 2; Software: Técnica C, 2026-08-26, 0 |
| Detener desarrollo | Se envió Ctrl+C antes de verificar | El código 1 del proceso interrumpido no es el resultado del build |
| `npm.cmd run verify` | Código 0; estructura, test y build: `pass` | Generó `reports/verification.json` |
| Prueba incluida en verify | `starter.spec.mjs: PASS` | Tres aserciones estáticas; explicación abajo |
| Build incluido en verify | `Compiled successfully`, comprobación de tipos y 4/4 páginas estáticas; ruta /: 138 B y First Load JS 87.4 kB | Métricas de salida de Next.js; no equivalen a tiempo real de carga |
| `npm.cmd audit --json` autorizado | Código 1; Next.js y PostCSS marcados con severidad alta; total 2 dependencias vulnerables | No se demostró explotación ni se ejecutó corrección forzada |

Durante desarrollo y build se observó `Caching failed for pack: Error: Unable to snapshot resolve dependencies`. No impidió el HTTP 200 ni la compilación; queda documentado, no resuelto.

## Ejecución de Juan Andrés

El 5 de septiembre de 2026, Juan Andrés ejecutó los siguientes comandos en Windows PowerShell, desde `C:\Users\Ra1zeR\Documents\pwa-inspecciones-laboratorio`:

| Comando | Resultado |
|---|---|
| `npm ci` | 28 paquetes instalados y 29 auditados en 13 s; 2 vulnerabilidades de severidad alta |
| `npm run dev` | Next.js 14.2.35 listo en 3.9 s; compilación de `/` en 5 s y respuesta `GET / 200` |
| `npm run verify` | `starter.spec.mjs: PASS`, `Compiled successfully`, generación de 4/4 páginas estáticas y `Verificación técnica: pass. Revisión académica: pendiente.` |

El reporte de esta ejecución tiene `checkedAt: 2026-09-05T06:33:29.163Z`, Node `v26.4.0`, árbol limpio y resultados de estructura, prueba y compilación en `pass`. Estos resultados corresponden a la ejecución de Juan Andrés.

## Explicación de la prueba proporcionada

`tests/starter.spec.mjs` lee `package.json` y `src/app/page.tsx`. Comprueba que el script `build` sea exactamente `next build`, que el texto de la página contenga «Inspecciones de laboratorio» y que incluya «sintéticos» sin distinguir mayúsculas.

Un PASS confirma esas aserciones. No importa el dataset ni cuenta tarjetas, no abre un navegador, no mide cobertura y no verifica instalación PWA, persistencia, sincronización, accesibilidad completa o calidad documental. La inspección visual realizada fue una comprobación separada, sin añadir una suite de pruebas.

## Versión y límites

La primera ejecución ocurrió antes del primer commit y generó un reporte con `commitSha: null` y `workingTreeClean: false`. Para la entrega se usa el reporte generado después de guardar los cambios en Git, con el mismo SHA y el árbol de trabajo limpio. El JSON y Actions permiten comprobar la versión y la fecha de verificación.

La documentación de requisitos y la comparación contienen análisis para revisión del equipo. Los objetivos de 100 registros, contraste, zoom y recuperación offline aún no tienen un ensayo completo registrado. La sección de Juan Andrés documenta la ejecución anterior.

## Ejecución de Kevin — Semana 2 (Turno 1)

Fecha: 10 de septiembre de 2026. Entorno: Windows, Node v22.22.0. Antes de empezar se verificó `git status` con el árbol limpio sobre `master`.

| Acción | Resultado real |
|---|---|
| Revisar alcance contra repositorio re-pull | `master` sincronizado con `origin/master` (HEAD `05094f8`); sin artefactos de Semana 2; evidencia de Semana 1 de Ismael presente |
| Crear `src/components/app-shell.tsx`, `src/app/loading.tsx`, `src/app/error.tsx`, `src/lib/data/inspection-controls.ts` e `inspection-loader.ts`; modificar `page.tsx` y `globals.css` | 6 archivos del Turno 1; `layout.tsx` sin modificar |
| `npm.cmd test` | `starter.spec.mjs: PASS`, código 0 |
| `npm run build` | Código 0; `/` dinámica (142 B, First Load JS 87.4 kB); 4/4 páginas |
| `npm run dev` con integración temporal del AppShell en `layout.tsx` | HTTP 200; HTML con «Saltar al contenido», navegación principal, `main#contenido-principal`, pie e h1 «Inspecciones de laboratorio» |
| Restaurar `layout.tsx` | `git checkout` del archivo; `git status` muestra solo los archivos del Turno 1 |

Commit del turno: `3f3f0754c297424f069c6bc554b3e2a9958ce3bd` — `feat(w02): app shell y estados de carga, error y vacio`, empujado a `origin/master` el 10 de septiembre de 2026.

## 2026-09-13 — Turno 2 (Ismael)
- Comandos: git pull, npm ci, script de PowerShell para generar iconos, npm run dev
- Resultado: git pull y npm ci sin cambios en el lockfile; se generaron 4 iconos PNG (192, 512, 512-maskable, apple-touch-icon); se creó public/manifest.webmanifest; se reemplazó src/app/layout.tsx integrando AppShell y el manifest; npm run dev compiló sin errores (Compiled / in 15.6s, GET / 200); verificado visualmente en http://localhost:3000 y http://localhost:3000/manifest.webmanifest.


## Integración de Juan Andrés — Semana 2

Fecha: 13 de septiembre de 2026. La integración se hizo a solicitud de Juan Andrés, mediante Codex. Los comandos y la revisión de navegador de esta entrada fueron ejecutados por la herramienta. No se atribuyen a una ejecución personal del estudiante.

Se partió de `ae5147ee328b984d2e078fbcb83cf4fde75837fc`, con los cambios de Kevin e Ismael ya presentes. La guía PWA de Juan Andrés y `PWA-w02-kit-estudiante.zip` especifican manifest, shell, estados, suite y workflow; no usan el evaluador ni la etiqueta de CampusOps. El workflow y el chequeo público de Semana 2 se copiaron del kit, sin sustituir el workflow anterior.

| Comprobación | Resultado |
|---|---|
| Instalación con `npm.cmd ci` | Código 0; 28 paquetes añadidos y 29 auditados |
| Primera suite del shell integrado | Código 1; siete casos aprobados y dos fallidos: área principal repetida y destino de navegación ausente |
| Misma suite después de la corrección | Código 0; nueve casos aprobados |
| `npm.cmd run verify` | Código 0; estructura, prueba y build aprobados; ruta `/` dinámica y First Load JS de 87.4 kB |
| Navegador local en puerto 3100 | Carga visible, tres inspecciones, un `main`, un pie, enlaces correctos y sin desbordamiento horizontal a 1280 y 320 px |
| Teclado, Tab y Enter | El enlace «Saltar al contenido» deja el foco en el área principal |
| Chequeo público del kit | Imprime coincidencias y `PUBLIC_OK`, código 0; la negación de `rg` no activa la salida anticipada de Bash |
| Auditoría de dependencias | Una dependencia alta y una crítica; el lockfile no se modificó |

La [evidencia del antes y después](week-02/integration-check.json) y el [reporte de integración](week-02/reports/3523110131.md) permiten revisar lo comprobado y sus límites. Los reportes finales se generan después del último commit y deben coincidir con su SHA. Durante la integración se incorporó la declaración personal de Semana 2 que Ismael publicó en los commits a6a1962 y d1bf722.

## Verificación personal de Juan Andrés — Semana 2

El 13 de septiembre de 2026 Juan Andrés ejecutó `npm.cmd run verify` en su computadora y compartió la salida. Se consultó también el archivo generado `reports/verification.json` de su copia local del proyecto. El reporte registra `checkedAt: 2026-09-14T00:02:16.767Z`, que corresponde al 13 de septiembre en México, Node v26.4.0, commit `1471561f63249025132ead7e37a4ac8e6d67d51f` y `workingTreeClean: true`.

Los nueve casos pasaron: contrato inicial, campos del manifest, iconos PNG, área principal y pie únicos, destinos de navegación, listado, estado vacío, carga y error con recuperación. La salida mostró `starter.spec.mjs: PASS` y `Compiled successfully`, generó las cuatro páginas y terminó con `Verificación técnica: pass`. El reporte confirma estructura, pruebas y build aprobados; pruebas y build finalizaron con código 0. La revisión académica permanece pendiente de la evaluación del docente.

Antes de actualizar los archivos de entrega se conservó el JSON original en `reports/week-02/historial/verification-juan-andres-20260914T000216Z.json`, fuera de Git. Su SHA-256 es `3E8BFDC8D605E9CA762E84CC043ECF5491721D821F143718B881673DCE256EEF`.

Esta entrada documenta la ejecución personal del verificador. La instalación, las pruebas iniciales de integración y las comprobaciones de navegador descritas en la entrada anterior fueron ejecutadas por Codex. La actualización posterior registra la evidencia sin cambiar el código de la aplicación; el reporte final de entrega debe corresponder al nuevo SHA comprobado en Actions.

## Ejecución de Kevin — Semana 3 (Turno 1)

Fecha: 18 de septiembre de 2026. Entorno: Windows, Node v22.22.0. Antes de empezar se verificó `git status` con el árbol limpio sobre `master` (HEAD `77f60b4`).

| Acción | Resultado real |
|---|---|
| `git pull origin master` y `npm.cmd ci --ignore-scripts --no-audit --no-fund` | `master` ya estaba actualizado; `npm ci` añadió 28 paquetes sin cambios en el lockfile |
| Crear `public/sw.js`, `public/offline.html`, `src/lib/pwa/register-service-worker.ts`, `src/components/register-sw.tsx`; editar `src/app/layout.tsx` y `next.config.mjs` | 6 archivos del Turno 1; sin tocar `tests/`, `scripts/`, `.github/`, `README.md` ni `docs/` |
| `npm.cmd test` | `starter.spec.mjs: PASS` (10 casos de Semanas 1 y 2), código 0 |
| `npm run build` | Código 0; `/` dinámica (142 B, First Load JS 87.4 kB); 4/4 páginas |
| `npm.cmd run dev` y comprobaciones HTTP | `/sw.js` 200 con `Cache-Control: public, max-age=0, no-cache`; `/offline.html` 200; `/` 200 con `main#contenido-principal` |
| Prueba manual offline en el navegador | `sw.js` registrado con scope `/`; con offline activado la lista de inspecciones se sirve desde caché; `http://localhost:3000/xyz` mostró la página «Estás sin conexión» |
| Depuración de la consola | `cacheFirst` sin control de errores lanzaba `Uncaught (in promise) TypeError: Failed to fetch` para recursos no precacheados en offline; se agregó `try/catch` con `Response` 503 y la consola quedó limpia |

Commits del turno: `d7a92e4` — `feat(w03): service worker con precache, runtime cache y fallback offline`; `7d7d654` — `docs(w03): evidencia y bitacora de Kevin — Turno 1`.

## Turno 3 — Semana 3

Fecha: 20 de septiembre de 2026. Integrante: Juan Andrés. Base revisada: `e3dc5338124c58b761656cfcac196b4f34933607`. Entorno: Windows, Node 26.4.0, npm 11.17.0 y Git 2.55.0.windows.3.

Se preparó el workflow de Semana 3 con el contenido exacto de la guía, el README y la nota de decisiones. Commit: [dff4721120ae426ad8a5c3bef9df3bebef3fecac](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/commit/dff4721120ae426ad8a5c3bef9df3bebef3fecac).

| Comprobación ejecutada con Codex | Resultado |
|---|---|
| `npm.cmd ci --ignore-scripts --no-audit --no-fund` | Código 0; 28 paquetes instalados |
| `npm.cmd test` | Código 0; nueve casos de Semana 2 aprobados |
| `npm.cmd run build` | Código 0; compilación y cuatro páginas generadas |
| `node scripts/verify.mjs` | Código 0; reporte `pass` identificado todavía como `w02-shell-manifest` |
| `bash public-tests/check.sh` con Git Bash | Código 0 y `PUBLIC_OK`; sigue siendo el chequeo de Semana 2, sin los cuatro casos nuevos |
| Service Worker ejecutado en `node:vm` con caché simulada | Código 1; sin manejador de peticiones, sin precache de `offline.html` y eliminación de una caché ajena |

El cambio `0cf85bd` sustituyó el Service Worker anterior. En la versión integrada faltan `docs/cache-strategy.md`, `tests/service-worker.spec.ts`, `tests/offline.spec.ts` y `scripts/check-secrets.mjs`. Los resultados aprobados de los comandos existentes no comprueban los requisitos de Semana 3.

Kevin tiene una sección y bitácora de Semana 3. No se encontró la evidencia de Semana 3 de Ismael ni capturas de esta semana en los archivos versionados. Cada integrante debe registrar sus resultados.

Los logs de esta revisión quedan en `reports/week-03/logs/` y el diagnóstico del Service Worker en `reports/week-03/service-worker-review.json`, fuera de Git. Se utilizó Codex para preparar los cambios, ejecutar las comprobaciones y documentarlas. La validación humana queda pendiente de la revisión personal; no se registra una ejecución personal que todavía no se ha comunicado.

GitHub Actions terminó correctamente sobre `3caa6648a2845244d6e3862ad5107bc81a0aa7d7`: [Semana 3](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/actions/runs/35549931918), [Semana 2](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/actions/runs/35549932124) y [Semana 1](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/actions/runs/35549931958). La [captura](week-03/actions-3caa664.png) corresponde a esa revisión. El resultado confirma que el workflow ejecuta los comandos disponibles; permanecen los faltantes de Semana 3 registrados arriba.

## Turno 2 — Semana 3 — Ismael: completar integración

Fecha: 20 de septiembre de 2026. Cuenta comprobada: `Ismael2509`, con permiso de escritura.
Base de Git: `d1e2451`. Windows, Node v24.19.0, npm 11.17.0. Ejecutó las comprobaciones Codex.

1. **Preparación y diagnóstico:** `git pull --ff-only origin master` confirmó la base actualizada; `npm.cmd ci --ignore-scripts --no-audit --no-fund` instaló 28 paquetes sin cambiar el lockfile. Las nueve pruebas anteriores aprobaron. Al incorporar las suites nuevas fallaron 19 de 34 casos con el worker original.
2. **Implementación:** se añadieron el simulador y las suites, la estrategia de caché, el barrido local, el runner de Semana 3 y los chequeos públicos. Se completó el worker que había quedado incompleto tras la integración; no se modificaron los componentes ni la API de registro. El README se actualizó para no seguir describiendo como pendientes los archivos añadidos; en documentos anteriores solo se sustituyó vocabulario del barrido, conservando resultados históricos.
3. **Correcciones a la guía:** se comprueba la existencia de archivos directamente y el contenido estructurado del reporte; el runner falla ante excepciones, suites vacías o aserciones fallidas. Se eliminó el estado global compartido del simulador, se clonan las respuestas y se normalizan sus URLs. Las excepciones literales del barrido y el reporte histórico excluido están documentados en `public-tests/README.md`; no se altera el lockfile para ocultar nombres de dependencias.
4. **Verificación real:** `node scripts/verify.mjs` terminó con código 0: 35 casos aprobados, barrido aprobado, build compilado y cuatro páginas generadas. Git Bash ejecutó `public-tests/check.sh`: `files`, `cursors`, `tests` y `package` en PASS. Siete comprobaciones negativas verificaron que un reporte fallido/vacío/de otro SHA, un archivo vacío, una palabra marcada, una excepción o una suite vacía devuelven fallo. Edge en producción pasó cinco comprobaciones de precache, recarga offline con estilos y datos, respaldo, purga selectiva y ausencia de errores JavaScript. Los [resultados](week-03/ismael-verification.json) y las capturas [del inicio](week-03/ismael-offline-home.png) y [del respaldo](week-03/ismael-offline-fallback.png) corresponden a esta ejecución.
5. **Evidencia y límites:** uso declarado de Codex para código, pruebas y documentación. La revisión personal de Ismael está pendiente. La publicación y su resultado de Actions se registran abajo, por separado de las comprobaciones locales. Los reportes completos están en `reports/week-03/` y `reports/verification.json`, ignorados por Git. La guía original no se incorpora al repositorio.

Para repetir la comprobación visual: compilar, iniciar producción, abrir el inicio y esperar a
que el Service Worker controle la página; desactivar la conexión desde las herramientas de
desarrollo y recargar. Deben conservarse tres tarjetas y estilos. Abrir una ruta desconocida
debe mostrar «Estás sin conexión». La conexión inicial y el fin del precache son requisitos.

### Publicación del turno de Ismael

El usuario autorizó el commit y la publicación después de revisar el resultado local. Se publicó
[af14463309588b2a81de63a90d153a985140ea87](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/commit/af14463309588b2a81de63a90d153a985140ea87) en `master`, mediante la cuenta `Ismael2509` (autor y responsable del commit). El árbol publicado coincide exactamente con los 20 archivos preparados localmente.

Los tres workflows concluyeron en `success` sobre ese SHA: [Semana 3](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/actions/runs/35554182934),
[evaluación académica](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/actions/runs/35554182948)
y [Semana 1](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/actions/runs/35554182923).
Después de sincronizar la copia local, las 35 pruebas y los cuatro chequeos públicos
aprobaron de nuevo sobre el commit publicado. Esta nota es un registro documental posterior;
los enlaces anteriores corresponden al commit de implementación indicado. La revisión personal
de Ismael continúa pendiente y no se sustituye por el resultado automático.

## Revisión final de Juan Andrés — Semana 3

Fecha: 20 de septiembre de 2026. Base: `2b6267b7aa2cf0c65fc5efb14aac5397164294ad`, con el árbol limpio. Entorno: Windows, Node v26.4.0 y npm 11.17.0. Las comprobaciones de esta entrada fueron ejecutadas por Codex a solicitud de Juan Andrés.

Se revisaron los cambios de Ismael `af14463309588b2a81de63a90d153a985140ea87` y `2b6267b7aa2cf0c65fc5efb14aac5397164294ad`. Ya están presentes todos los archivos obligatorios de Semana 3. El worker atiende las peticiones, prepara el respaldo offline y limita la limpieza a las cachés de la aplicación. Las suites comprueban estos comportamientos y casos de fallo. La evidencia de Semana 3 de Kevin e Ismael está separada por integrante.

| Comprobación | Resultado |
|---|---|
| `npm.cmd ci --ignore-scripts --no-audit --no-fund` | Código 0; 28 paquetes instalados sin modificar el lockfile |
| `node scripts/verify.mjs` | Código 0; estructura, pruebas, barrido y build aprobados |
| Pruebas ejecutadas por el verificador | 35 casos aprobados: 9 de manifest y estructura, 19 del Service Worker y 7 de offline |
| Compilación ejecutada por el verificador | Correcta; cuatro páginas generadas |
| `bash public-tests/check.sh` con Git Bash | Código 0; `files`, `cursors`, `tests` y `package` en PASS |
| Reportes generados | `assignmentId: w03-service-worker-offline`, `status: pass`, SHA igual a la base y `workingTreeClean: true` |
| GitHub Actions de la base revisada | Tres workflows completados con `success` |

Ejecuciones: [Semana 3](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/actions/runs/35554301129), [Semana 2](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/actions/runs/35554301137) y [Semana 1](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/actions/runs/35554301138). Se conserva la [captura de Semana 3](week-03/actions-2b6267b.png). Los logs y reportes de esta revisión se guardaron en `reports/week-03/review-2b6267b/`, fuera de Git.

La comprobación visual de producción está documentada en [el registro del turno de Ismael](week-03/ismael-verification.json), con sus capturas; esta revisión no la presenta como una ejecución personal de Juan Andrés. Se actualizan el README, la decisión técnica y su sección de evidencia para reflejar los faltantes resueltos. El diagnóstico inicial se conserva como antecedente.

La revisión humana de Juan Andrés sigue pendiente. Codex apoyó la revisión de código, ejecutó los comandos y actualizó la documentación. Las pruebas en memoria y Actions comprueban los casos definidos; no demuestran compatibilidad con todos los navegadores, sincronización ni una auditoría integral.

## Semana 4 · Turno 2 — Ismael

- Base: `master` (tras merge del PR de Kevin, Turno 1). Rama: `semana-4-t2-ismael-pruebas`.
- Revisión Turno 1: https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/pull/3 → merge SHA e230314.
- PR propio: feat(w04): pruebas de renderizado, verificador y decision de renderizado (https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/pull/4) → revisor y merge: Juan Andrés, tras su revisión.
- Verificación local: `npm.cmd test` → PASS (4 suites, 45 casos); `npm.cmd run build` → código 0;
  `node scripts/verify.mjs` → pass; `bash public-tests/check.sh` → PUBLIC_OK.
- Evidencia: capturas guardadas en `evidence/week-04/`.
## Ejecución de Kevin — Semana 4 (Turno 1)

Fecha: 23 de septiembre de 2026. Entorno: Windows, Node v22.22.0. Antes de empezar se verificó `git status` con el árbol limpio sobre `master` (HEAD `e9ff3c4`).

| Acción | Resultado real |
|---|---|
| `git checkout -b semana-4-t1-kevin-rutas` | Rama creada desde `master` limpio en `e9ff3c4` |
| `npm.cmd ci --ignore-scripts --no-audit --no-fund` | Código 0; 28 paquetes añadidos |
| Crear rutas CSR/SSR, estados y navegación | 8 archivos creados (`inspecciones/*`, `loading-state.tsx`, `inspecciones-view.tsx`, `not-found.tsx`) y 3 modificados (`app-shell.tsx`, `page.tsx`, `globals.css`); sin tocar `tests/`, `scripts/`, `public-tests/`, `.github/`, `README.md` ni `docs/` |
| `npm.cmd test` | `starter.spec.mjs: PASS` (3 suites, 35 casos de Semanas 1–3), código 0 |
| `npm run build` (1er intento) | Código 1: la página `inspecciones/page.tsx` exportaba subcomponentes con nombre y Next.js los rechaza (`Property 'InspeccionesGrid' is incompatible`) |
| Solución del fallo | Subcomponentes movidos a `src/components/inspecciones-view.tsx`; la página queda con solo el `default` |
| `npm run build` (2º intento) | Código 0; `/inspecciones` estática 97.6 kB y `/inspecciones/[id]` dinámica 96.1 kB de First Load JS |
| `npm.cmd run dev` + `curl` | `/` 200 con tarjetas y "Ver detalle"; `/inspecciones` 200 con estado "Cargando listado"; `/inspecciones/inspection-001` 200 con "Laboratorio de Redes" en el HTML (SSR); `/inspecciones/inspection-999` renderiza "Inspección no encontrada" |
| `npm run build` + `next start -p 3100` | Producción sirve las mismas rutas con los mismos contenidos; se documenta que el status del 404 queda en 200 por el streaming de `loading.tsx` (comportamiento de plataforma) |

Rama `semana-4-t1-kevin-rutas` dejada lista con los dos commits del turno, sin push: `feat(w04): rutas CSR y SSR con estados verificables` y `docs(w04): evidencia y bitacora de Kevin — Turno 1`. El push y el PR los hace Kevin manualmente; el merge lo hará Ismael como revisor. Detalle de las comprobaciones en [la verificación del turno](week-04/kevin-verificacion.md).

## Arranque compartido de la Semana 5 — Kevin

Fecha: 29 de septiembre de 2026. Entorno: Windows, Node v22.22.0. La copia local estaba en la
rama `week4/security-audit-kevin` (`4c9f79f`) y su `master` local 15 commits detrás de
`origin/master`; el trabajo de la Semana 4 ya estaba mergeado en `master` mediante el PR #3.

| Acción | Resultado real |
|---|---|
| `git fetch origin` + `git checkout master` + `git pull --ff-only origin master` | `master` pasó de `e9ff3c4` a `5ea3965` (merge del PR #4), árbol limpio |
| **Línea base antes de tocar nada** | `npm.cmd test` → `starter.spec.mjs: PASS`, 4 suites, **45 checks** (`manifest02` 9, `service-worker` 20, `offline` 7, `rendering` 9), reporte `assignmentId: w04-csr-ssr`, `workingTreeClean: true` |
| Línea base de `npm.cmd run verify` | `pass` en estructura, prueba, barrido y compilación |
| Línea base de `bash public-tests/check.sh` | `files`, `cursors`, `tests` y `package` en PASS, `PUBLIC_OK` |
| `git checkout -b semana-5-arranque` | Rama creada desde `master` en `5ea3965` |
| Crear `src/lib/storage/schema.ts` | Contrato congelado: `ASSIGNMENT_ID`, `SCHEMA_VERSION`, `SyncEnvelope`, `QueueEntry`, `ConflictRecord`, `InspectionStore`, `idempotencyKey`, `migrate`, `MemoryInspectionStore` |
| Reescribir `tests/starter.spec.mjs` | Autodescubrimiento de `tests/*.spec.ts`; desaparece la lista de suites escrita a mano |
| Parametrizar `scripts/verify.mjs` | Lee `ASSIGNMENT_ID` del contrato; la ruta del reporte y la lista de suites se derivan |
| Fusionar el bloque w05 en `public-tests/check.sh` | `tests:` parametrizado + bloque `sync:` nuevo; los cuatro chequeos anteriores se conservan |
| `npm.cmd test` tras el cambio | **Los mismos 45 checks en verde**, ids de suite idénticos incluido `manifest02`; reporte en `reports/w05-sync-data/tests.json` |
| `npm.cmd run verify` (1er intento) | **fail**: `TS18028: Private identifiers are only available when targeting ECMAScript 2015 and higher` |
| Diagnóstico | El `tsconfig.json` del starter de Next declara `target: "es5"`. Los identificadores privados `#` exigen ES2015 y el spread sobre un iterador exige `downlevelIteration` |
| Solución | Reescribir `MemoryInspectionStore` con `private` de TypeScript y `Array.from`, **sin tocar el `tsconfig.json` compartido** |
| `npx.cmd tsc --noEmit` | Sin errores de tipos |
| `npm.cmd run verify` (2º intento) | `pass` en las cinco comprobaciones: `structure`, `test`, `check-secrets`, `build`, `w05-sync-data-and-suites` |
| `bash public-tests/check.sh` | `files`, `cursors`, `tests`, `package` y `sync` en PASS, `PUBLIC_OK` |
| Copia del workflow de la semana | `.github/workflows/week-05-w05-sync-data.yml` agregado **idéntico al kit**, verificado con `Get-FileHash` (SHA256 coincidente). Sin ediciones |

### Dos decisiones que conviene que el equipo conozca

**La puerta local se endurece en dos etapas.** El lunes `files` y `verify.mjs` exigen el contrato
y la política, no `queue.ts`, `conflict-policy.ts` ni `sync.spec.ts`, porque esos archivos no
existen hasta el viernes o el sábado. Exigirlos el lunes dejaría `master` en rojo y los tres
trabajarían sobre una base que no pasa. El sábado suben a la puerta. Está marcado en el código y
en `public-tests/README.md`.

**El workflow de la semana se agregó sin modificar.** Los workflows de `.github/workflows/` son el
evaluador automático del profesor: no se editan ni se eliminan, y los nuevos se agregan idénticos
al kit. Los tres de Semanas 1 a 3 quedaron intactos y el de la Semana 5 es una copia byte a byte
del kit, comprobada por hash. Por eso su `AC-02` exige los cinco artefactos desde el día uno y
sale en rojo hasta el sábado, cuando la actividad está realmente terminada. Esa asimetría es la
correcta: el evaluador mide la actividad terminada; la puerta local, que es del equipo, mide la
salud diaria del repositorio. Son dos cosas distintas y viven en dos archivos distintos.

La evidencia de entrega es la ejecución del `push` a `master`, donde el SHA reportado sí
corresponde al commit entregado. Las ejecuciones de `pull_request` usan el SHA de fusión y no se
citan.

**El `target: "es5"` del `tsconfig.json` no es un detalle menor.** Si alguien usa campos privados
`#x` o hace spread sobre un iterador en `src/`, el build falla con un error que no menciona el
tsconfig. Usar `private` de TypeScript y `Array.from`.

### Límites de este arranque

- La persistencia es `MemoryInspectionStore`. La interfaz `InspectionStore` declara el contrato
  pero la conexión real con IndexedDB **no está implementada**.
- No hay servidor: la cola y la política se probarán contra un transporte simulado en memoria.
- `tests/*.spec.ts` no entran en el `include` de `tsconfig.json` (solo `src/**`), igual que las
  suites de Semanas 3 y 4: no las comprueba el build. Es el comportamiento previo del repo.
- Esta entrada la ejecutó un asistente de IA de terminal (opencode). La validación personal de
  Kevin —incluida la comprobación en navegador— queda pendiente de registrar.


## Bloque A de la Semana 5 — Kevin

El arranque quedó mergeado en `master` con el PR #6 (`b7a1128`). Este bloque cierra la parte
que le toca a Kevin del reparto: la suite propia de su Bloque A.

| Acción | Resultado |
|---|---|
| `git checkout -b semana-5-a-kevin-modelo` desde `master` actualizado | Rama con base en el arranque ya mergeado |
| Crear `tests/sync.modelo.spec.ts` | 8 checks que ejercitan solo el contrato, sin depender de los bloques B ni C |
| `npm test` | **5 suites, 53 checks**: las 45 previas idénticas más 8 nuevos |
| `npm run build` | Código 0 |
| `npx tsc --noEmit` | Sin errores de tipos |
| `npm run verify` | `pass` en las cinco comprobaciones |
| `bash public-tests/check.sh` | `PUBLIC_OK`, y el bloque `sync:` ya reconoce la suite `sync.modelo` |

### Por qué la suite se escribió antes que los bloques B y C

Los ocho checks dependen únicamente de `src/lib/storage/schema.ts`, así que escribirlos no obliga
a esperar a nadie. La ventaja no es de orden sino de detección: si el contrato congelado tuviera
un defecto, esta suite lo revela de inmediato, y no el sábado cuando ya haya que integrar tres
bloques. El contrato es la frontera compartida —si falla, fallan los tres— y probarlo primero es
lo más barato que se puede hacer.

### Las pruebas se comprobaron contra un contrato roto

Una suite en verde no demuestra nada si sus aserciones no atrapan nada. Se rompió el contrato a
propósito en cinco puntos y se verificó que fallara el check previsto en cada caso:

| Contrato roto | Check que debió fallar |
|---|---|
| `idempotencyKey` devolviendo solo `inspection.id` | `idempotency-version-sensitive` |
| `migrate` adivinando en vez de lanzar hacia atrás | `migrate-downgrade-rejected` |
| `migrate` mutando el registro que recibe | `migrate-noop` |
| Almacén devolviendo la referencia interna en vez de copia | `store-roundtrip` |
| `saveQueue`/`loadQueue` reiniciando los intentos acumulados | `queue-persists` |

En los cinco casos falló el check esperado y ningún otro. `schema.ts` se restauró y se comprobó
con `git status` que quedó idéntico al original.

Un detalle sobre el harness de estas pruebas: en Windows `npm.cmd` no arranca con `execFileSync`
sin shell (falla con `EINVAL`), así que el primer intento de la comprobación dio cinco falsos
negativos. Se resolvió invocándolo a través de `cmd.exe`. Merece la pena anotarlo porque el
síntoma —"ninguna prueba detectó nada"— es exactamente el que hace creer que una puerta está
rota cuando lo roto es el medidor.

### Límites de este bloque

- La suite prueba el contrato, no el comportamiento en navegador: `MemoryInspectionStore` es un
  adapter en memoria, no IndexedDB.
- No cubre la interacción con `queue.ts` ni con `conflict-policy.ts`. Esa integración es
  `tests/sync.spec.ts`, que se escribe al final de la semana cuando los tres bloques estén en
  `master`.
- El `suiteId` de esta suite se deriva del nombre del archivo (`sync.modelo`), igual que el de
  los compañeros. Los identificadores históricos siguen declarados aparte en `starter.spec.mjs`.
- Esta entrada la ejecutó un asistente de IA de terminal (opencode).

## Semana 5 · Bloque B — Ismael

Fecha: 2 al 4 de octubre de 2026. Entorno: Windows, PowerShell. Base: `master` en `b7a1128` (merge del PR #6, arranque de Kevin). Rama: `semana-5-b-ismael-cola`; PR #7. La rama se rehízo una vez desde `master` (con respaldo previo de los tres archivos) tras trabajar un rato en una carpeta equivocada; no hubo commits ni push en este repositorio antes del PR.

| Acción | Resultado real |
|---|---|
| `git fetch origin`, `git checkout master`, `git pull --ff-only origin master` y `npm.cmd ci --ignore-scripts --no-audit --no-fund` | `master` actualizado con el arranque de Kevin; 28 paquetes añadidos |
| Crear `src/lib/sync/queue.ts` | Archivo nuevo; `npm.cmd run build` con código 0, `Compiled successfully` y tipos validados con `target: es5` (sin `#privado` ni spread sobre iteradores) |
| Crear `tests/sync.cola.spec.ts` | Archivo nuevo; el runner lo descubre solo, sin editar `starter.spec.mjs` |
| `npm.cmd test` | `starter.spec.mjs: PASS`; 5 suites y 55 checks (45 previos y 10 de `sync.cola`) |
| Crear `docs/sync/03-cola.md` | Sustituye el esqueleto de Kevin; cubre ciclo de la entrada, idempotencia, reintentos, cierre de pestaña, respuestas fuera de orden, observabilidad y límites |
| `npm.cmd run verify` | `Verificación técnica: pass` |

No se tocaron `tsconfig.json`, `package.json`, el lockfile, `starter.spec.mjs`, `verify.mjs`, `check.sh`, `schema.ts` ni `docs/sync-policy.md`. Esta entrada se apoyó en Claude (Anthropic), en chat, para redactar los borradores; los comandos y sus resultados los ejecuté y revisé yo en PowerShell. Pendiente: revisión de Kevin y Juan Andrés y su comprobación cruzada.

## Semana 5 · Integración de los tres bloques y endurecimiento de la puerta — Kevin

Fecha: 4 de octubre de 2026. Esta entrada cubre lo que ninguno de los tres bloques entregó por
separado: la suite que prueba que funcionan juntos y el subida de la puerta a los cinco artefactos
de AC-02. No incluye el push ni los PR, que hacen a mano Kevin.

### Qué se integró y en qué orden

- `semana-5-b-ismael-cola` (`60fc802`): `src/lib/sync/queue.ts`, `docs/sync/03-cola.md`,
  `tests/sync.cola.spec.ts` (10 checks) y `evidence/week-05/ismael-verificacion.md`.
- `semana-5-c-andres-conflictos` (`37bbf8e`): `src/lib/sync/conflict-policy.ts`,
  `docs/sync/02-conflictos.md` y `tests/sync.conflictos.spec.ts` (14 checks).
- Mío: `tests/sync.modelo.spec.ts` (8 checks) y `tests/sync.spec.ts` (6 checks).

Antes de integrar revisé qué archivos había tocado cada rama, porque un bloque que edita un
archivo compartido rompe a los demás sin que nadie lo note. Ninguno de los dos tocaron
`starter.spec.mjs`, `verify.mjs`, `check.sh`, `tsconfig.json`, `package.json`, el lockfile,
los workflows ni el contrato `schema.ts`. Los dos se mergean entre sí sin conflicto, y ambos
son diffsSubset limpios de `master`. El único archivo en conflicto de toda la semana es
`evidence/session-log.md`, porque los dos anexan su entrada al final del mismo archivo.

### La suite de integración

`tests/sync.spec.ts` no reimplementa lo que ya prueban las otras tres suites: combina el contrato
en uso. Las otras tres comprueban cada bloque por separado contra el contrato; si los tres dejaran
de estar de acuerdo, el sistema duplicaría o perdería cambios en silencio y ninguna de ellas lo
detectaría. Los seis checks:

1. `one-contract-two-consumers` — la clave que calcula el Bloque A es exactamente la que usa el
   Bloque B al encolar y la que exige el Bloque C al resolver; una clave manipulada se rechaza.
2. `retry-is-the-same-operation` — tres intentos, la misma clave en los tres: un reintento es la
   misma operación y no duplica.
3. `resolution-is-a-new-operation` — el motivo de `id::vN`. El envío falla por conflicto, se
   resuelve y se reenvía con versión nueva, así que su clave es **distinta** de la que falló. Con
   una clave basada solo en `id`, el servidor vería el reenvío como el reintento de la operación
   anterior y se lo tragaría: la resolución se perdería sin que nadie lo notara.
4. `stale-response-cannot-clobber` — la regla de antigüedad del Bloque C aplicada por el Bloque B:
   una respuesta vieja que llega tarde no baja la versión ya aplicada.
5. `queue-survives-reopen` — una entrada a medio enviar persiste, vuelve a `pending` al reabrir y
   se completa sin duplicar.
6. `migration-does-not-orphan-the-queue` — una cola migrada por `migrate` sigue siendo coherente
   con la clave del contrato y es aceptable para la política de conflictos.

### Tres fallos que eran míos, no de los bloques

La primera corrida dio tres checks en rojo. Los tres eran errores de la suite que yo estaba
escribiendo, no de `queue.ts` ni de `conflict-policy.ts`:

- `all()` devuelve las referencias vivas del mapa, no copias. Guardé la entrada para observar su
  estado después del segundo drain y leí el valor ya mutado por el segundo drain.
- `isStale(local, remote)` es verdadera cuando lo **remoto** es más viejo que lo local. invertí
  los argumentos y la comprobación pasaba por el motivo equivocado.
- Escribí el transporte del servidor simulado usando `this.guardados` dentro de un método de objeto
  literal, donde `this` es el propio objeto `transport` y no tiene esa propiedad. La cola captura
  cualquier excepción del envío como fallo de red, así que el error se disfrazaba de problema del
  Bloque B. Ahora el servidor simulado cierra sobre la variable en vez de usar `this`.

### La prueba que pasaba por la razón equivocada

Las pruebas negativas detectaron que `stale-response-cannot-clobber` era una prueba vacía: solo
encolaba una entrada, así que el guardia de antigüedad nunca se evaluaba (la versión aplicada
seguía en 0 y cualquier respuesta parecía más nueva). Pasaba en verde sin comprobar nada. Lo
corregí encolando **dos** entradas y haciendo que la segunda respuesta llegue vieja: entonces el
guardia sí se evalúa y el check comprueba que se omitió en vez de contarse como enviada. Sin las
pruebas negativas habría entregado esa prueba como si sirviera.

### La puerta: un verde falso

Al subir la puerta a los cinco artefactos, `check.sh` siguió dando `PUBLIC_OK` con código 0 pero
imprimiendo `command not found` y `syntax error`. El marcador que había dejado en el arranque
estaba **dentro del cuerpo del `for`**, no en la lista de archivos de la línea 6. Descomentarlo
tal cual no añadía los archivos a la comprobación: bash intentaba *ejecutar* `queue.ts` como un
script de shell, y el `files: PASS` salía verde sin haberlos comprobado nunca. Es el peor tipo de
fallo posible en una puerta: verde y falsa.

Lo corregí moviendo los tres archivos a la lista del `for` y dejé escrito por qué no deben ir en
el cuerpo. Después lo verifiqué de la única forma que sirve: ocultando los archivos uno por uno.
Sin `src/lib/sync/queue.ts` la puerta da `files: FAIL` y salida 1; sin `tests/sync.spec.ts` da
`Falta archivo` y `tests: FAIL`. Una puerta que no se ha visto fallar no es una puerta. Lo mismo
con `scripts/verify.mjs`: sin `src/lib/sync/conflict-policy.ts` reporta `Faltan archivos` y
sale con código 1.

Durante esa comprobación moví `conflict-policy.ts` a un temporal con un nombre mal escrito y el
restaurado falló; el archivo se recuperó intacto y `git diff` confirmó que es byte a byte el de
`semana-5-c-andres-conflictos`. Queda anotado porque una evidencia que se restaura "a ojo" no es
una evidencia.

### Estado verificado de la integración

- `npm test`: 8 suites, 83 checks, 0 fallos — 45 previos sin cambios, más 8 de `sync.modelo`,
  10 de `sync.cola`, 14 de `sync.conflictos` y 6 de `sync`.
- `npm run build`: código 0. `npx tsc --noEmit`: sin errores de tipos.
- `npm run verify`: `Verificación técnica: pass`.
- `bash public-tests/check.sh`: `PUBLIC_OK`, código 0, con la puerta ya exigiendo los cinco
  artefactos y las cuatro suites `sync` detectadas.
- Pruebas negativas: 10 casos rotos en total (5 del contrato, 5 de los tres bloques), cada uno
  atrapado por el check previsto. `schema.ts`, `queue.ts` y `conflict-policy.ts` restaurados
  idénticos, confirmado con `git status`.

Lo que queda a mano de Kevin y no se hizo aquí: el commit, el push, el PR y el merge de los tres
bloques, resolver en `master` el conflicto de `evidence/session-log.md` conservando las tres
entradas, y rellenar el `<completar>` de la rama con el PR y el SHA de merge.

## Semana 6 — Notificaciones y revisión de integración — Juan Andrés

Fecha: 11 de octubre de 2026. Comprobaciones ejecutadas por Codex en Windows.

| Acción | Resultado observado |
|---|---|
| Instalar con npm.cmd ci --ignore-scripts --no-audit --no-fund | 28 paquetes; código 0; dependencias conservadas |
| Revisar el harness del PR #13 | Solo sus tres archivos; 83 casos, build y verify aprobados; PUBLIC_OK; merge 166a745 |
| Probar excepción síncrona en getCurrentPosition del PR #14 | SecurityError rechaza la promesa; cambios solicitados en la rama de Ismael |
| Implementar notificaciones contra el contrato real | Importación desde device/types.ts y envío mediante ServiceWorkerRegistration |
| Verificar el PR #15 | 10 suites, 103 casos, build y barrido aprobados; PUBLIC_OK; merge 794663c |
| Pruebas negativas | Las cinco roturas causaron los fallos previstos; archivo restaurado; suite completa aprobada |
| Probar el detalle con next dev | La política de seguridad impidió ejecutar el paquete de desarrollo; los botones no respondían |
| Probar producción en localhost:3006 | Archivo sintético adjuntado y aviso en pantalla; permiso default conservado; sin errores nuevos de JavaScript |
| Mantener estable el primer render | Texto inicial constante y prueba de render sin llamadas de dispositivo |

### Pruebas negativas del bloque de notificaciones

| Rotura temporal | Prueba que detectó el fallo |
|---|---|
| Pedir permiso al notificar | notify-never-prompts |
| Marcar el respaldo como fallido | unsupported-still-notifies-in-app y denied-notifies-in-app |
| Abrir el constructor antes del registro | granted-sends-via-service-worker |
| Propagar la excepción del sistema | system-failure-falls-back-to-in-app |
| Lanzar al importar el módulo | Fallo de carga de la suite |

Los registros de ejecución están en reports/w06-device-push/notificaciones/; son salidas
locales excluidas de Git. Las capturas del detalle están en evidence/week-06/.
La comprobación de notificación con permiso default demuestra el respaldo sin concesión,
no una prueba manual con los tres permisos denegados.

### Pendientes de integración

- Workflow original del kit de semana 6, para conservar su copia literal y comprobar el hash.
- Corrección de la excepción síncrona en geolocalización y revisión del PR #14 actualizado.
- Suite conjunta, ubicación en el detalle, puerta completa, prueba de los tres respaldos y cierre.
- Revisión personal de cada integrante; no se atribuye la ejecución de Codex como ejecución humana.


## Semana 6 — Workflow original — Juan Andrés

Fecha: 11 de octubre de 2026. Se localizó PWA-w06-kit-estudiante.zip en Descargas.
El workflow se copió desde el archivo original, sin modificar los existentes. Su SHA256
es CDA79B0A9547EC24DA3EE5D6FDE05E1744EAE3159BDB007A3A866080BCE0F6A9, igual al indicado
en la guía. Se añadieron campos vacíos de evidencia en las zonas de Kevin e Ismael;
la evidencia de Juan Andrés ya estaba registrada y las semanas anteriores permanecen intactas.
La verificación previa de la base aprobó 10 suites y 104 casos. AC-02 de semana 6
queda pendiente mientras no se integre geolocalización y la suite conjunta.


## Semana 6 — Integración de capacidades — Juan Andrés

Fecha: 11 de octubre de 2026. Rama semana-6-integracion-andres.

- Se integraron los commits de geolocalización de Ismael conservando su autoría y su
  declaración de evidencia. La ruta duplicada de su captura se corrigió al integrar.
- La invocación de geolocalización recibió manejo de excepciones síncronas en la rama de
  Juan Andrés. La prueba nueva comprueba SecurityError y un fallo genérico sin coordenadas.
- La suite conjunta aprobó seis casos: exports, APIs ausentes, respaldos, ausencia de
  referencias de red, contrato compartido y fallo síncrono. El parser ignora comentarios;
  las palabras de documentación no se confunden con llamadas de red.
- La puerta exige ya los siete artefactos de integración. La suite completa aprobó
  118 casos en 12 suites; build y barrido correctos; Git Bash imprimió PUBLIC_OK.
- En producción, con la política anterior camera=() y geolocation=(), ambos botones
  devolvieron la denegación correspondiente. Se adjuntó el icono sintético del proyecto,
  se conservó después de una captura denegada y se avisó en pantalla con permiso default.
  Las capturas no se presentan como una denegación elegida por una persona.
- La política final pasa a camera=(self) y geolocation=(self), sin habilitar micrófono.
  Habilitar una API no concede su permiso: solo se solicita al presionar su botón.
- Los fallos de lectura y el resultado vacío del archivo fueron comprobados con un lector
  simulado: se muestra aviso de error y se conserva la evidencia anterior.
- El workflow original del kit mantiene su SHA256. Ningún workflow anterior cambió,
  y no se añadieron dependencias ni cambios al contrato congelado.

Las comprobaciones son de Codex. La validación humana de cada integrante queda separada.


## Semana 6 — Cierre de integración — Juan Andrés

La integración del PR #19 llegó a master en f8bcd2bc441aeaa26530a56e1a474f537bdd4441.
Los cinco workflows existentes aprobaron sobre ese SHA. Semana 6:
https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/actions/runs/38189134480
La documentación de cierre conserva ese punto de comprobación; el SHA final se obtiene
después del merge de este registro y se entrega por separado, sin referencias circulares.
Kevin conserva sus campos de evidencia para completar personalmente. Las comprobaciones
de Codex no se presentan como ejecución personal de los integrantes.

## Semana 8 — Arranque y Bloque A (pirámide unitaria) — Kevin

**Fecha:** 20 de octubre de 2026. **Rama:** semana-8-kevin-testing-ci (creada desde master actualizado).

### Qué hice

- Actualicé ASSIGNMENT_ID a "w08-testing-ci" en src/lib/storage/schema.ts (única fuente de verdad del harness).
- Creé 	ests/discover.cjs: descubrimiento de suites centralizado para las capas 	ests/{unit,integration,e2e} con ids prefijados (unit/<nombre>), consumido por starter.spec.mjs, scripts/verify.mjs y el bloque 	ests: de public-tests/check.sh (antes cada uno escaneaba por su cuenta).
- Agregué la guardia anti falso-verde del runner: cero suites descubiertas = FAIL.
- README de las tres carpetas de la pirámide, registradas en la lista de archivos de check.sh.
- Bloque A: 	ests/unit/schema-idempotencia.spec.ts (15 checks) y 	ests/unit/sync-bordes.spec.ts (22 checks).

### Comandos y resultados reales

- 
pm.cmd test línea base (antes del Bloque A): starter.spec.mjs: PASS, 12 suites / 118 checks.
- 
pm.cmd test con el Bloque A: starter.spec.mjs: PASS, 14 suites / 155 checks.
- 
pm.cmd run verify: Verificación técnica: pass (estructura + test + barrido + build).
- ash public-tests/check.sh (Git Bash): PUBLIC_OK, código 0.

### Regresión demostrada

Rompí idempotencyKey quitando la versión de la clave: 
pm.cmd test FAIL con 9 checks en 4 suites (unit/schema-idempotencia, sync.modelo, sync.cola, sync). Restaurada: verde completo. Capturas en evidence/week-08/kevin-regresion-01..03*.txt.

### Prueba negativa de la puerta

	ests/unit/ movida a 	ests/unit-oculta: check.sh → iles: FAIL + 	ests: FAIL, código 1. Restaurada: PUBLIC_OK, código 0. Captura real en kevin-regresion-04-prueba-negativa-puerta.txt.

### Fallo diagnosticado durante el arranque

Mi primera versión de discoverSuites escaneaba oot en vez de oot/tests: el runner aprobó con 0 suites ([].every() === true). Detectado al inspeccionar el reporte, no al fiarme del PASS; corregido con la lectura correcta y la guardia de cero suites.

### Estado

Sin commit aún (pendiente de la instrucción de cierre). Evidencia completa: evidence/week-08/kevin.md.

### Semana 8 — Bloque A extra: unitarias de alto valor — Kevin (20 de octubre)

Añadí 13 checks (155 → 168, ahora 15 suites): last-write-wins completo (3 casos), jitter medido dentro de SyncQueue con reloj inyectado, migrate v0 conservando summary, y el archivo nuevo tests/unit/dataset-sintetico.spec.ts (8 checks que automatizan el RNF-04: ids únicos, fechas ISO no futuras, coherencia findings/status, alias genéricos y cero PII en campos de texto).

Cuatro pruebas negativas, cada una capturada y restaurada: remoteIsNewer=false → cayó el check nuevo + 2 historicos de sync.conflictos; jitter=0 → cayo SOLO queue-jitter-range; summary fijo en migrate → cayo SOLO migrate-v0-keeps-existing-summary; correo dentro del summary del dataset → cayo SOLO sin-datos-personales. Los archivos kevin-negativo-1..4*.txt guardan la salida real y kevin-negativo-00-final-restaurado.txt el verde final.

Hallazgo honesto: mi primer intento de rotura del dataset puso el correo en un comentario del codigo, que la suite (correctamente) no escanea; repiti la rotura dentro del campo summary, que es el caso real.

Verificacion final: git diff src/ solo con ASSIGNMENT_ID, verify pass, check.sh PUBLIC_OK (codigo 0). Sin commits aun.


## Semana 8 — Pruebas HTTP y CI — Juan Andrés

Fecha: 21 de octubre de 2026. Comprobaciones ejecutadas por Codex en Windows.

Se revisó el PR #21 de Kevin en f0ef1f268893da2b3d59ecd334a4f7c76533a343: npm ci, 168 comprobaciones en 15 suites, build, verify y PUBLIC_OK aprobados. Se integró por PR en 85fd5fd5de37f0cf8435e77b57564873b527e5f7 conservando su autoría.

Se activó la protección de master: PR requerido incluso para administradores, sin push forzado ni borrado. El avance de Juan Andrés usa su propia rama. No se tocaron dependencias, contrato, runner ni workflows anteriores.

Se implementaron ocho comprobaciones HTTP con servidor de producción local y cierre automático, lint de sintaxis, cobertura V8, resumen de evaluación y CI. En desarrollo aprobaron 176 comprobaciones en 16 suites, lint y tipos.

La consigna requiere interacción desde la interfaz, mientras la guía propone HTTP. Se documentó la diferencia: faltan captura, persistencia durable y sincronización consumida por la interfaz, integración de Ismael y pruebas E2E del flujo completo. El cierre permanece incompleto; no se inventó evidencia de compañeros ni ejecución humana.


### Demostración HTTP y protección — Semana 8

Codex ejecutó una rotura controlada en la rama temporal codex/w08-regresion-http: quitar start_url del manifest hizo fallar manifest-accesible con código 1. El archivo restaurado aprobó los ocho checks. La rama se eliminó después de comprobar git diff del manifest vacío. Salidas: evidence/w08/andres-http-fallo.txt y andres-http-recuperacion.txt.

Con E2E_BASE_URL apuntando a un servidor ausente, la suite devolvió código 1 y ocho casos fallidos, sin saltarlos. La configuración de protección se volvió a leer en GitHub y quedó guardada en evidence/w08/andres-proteccion.json.


### CI del avance — Semana 8

Sobre fad3dd83de8c4d3e96e24b116e0c1241edbd838f, Codex comprobó el árbol limpio, 176 casos en 16 suites, build, lint, tipos, verify y PUBLIC_OK. Actions 39701089160 repitió los resultados en Ubuntu 26.04.1 y Node 20.19.6. Solo falló el cierre porque falta integración y los dos escenarios de interfaz. Los artefactos se guardaron igualmente. Se descargó el ZIP y se contrastaron SHA, estado y conteos de sus reportes. Registro: evidence/w08/andres-ci-candidato.json.

El PR #22 queda en borrador. No hay SHA final común de semana 8 ni entrega académica completa. La revisión humana propia y la evidencia de Ismael siguen pendientes.



## Semana 8 — Bloque B (pruebas de integración) — Ismael (22 de octubre)

### Qué hice

Creé `tests/integration/sync-ciclo-completo.spec.ts` (5 checks) y `tests/integration/sw-registro.spec.ts` (4 checks). Combinan cola, política de conflictos y schema con un servidor falso, y el registro del Service Worker con `public/sw.js` y el harness. Omití los escenarios ya cubiertos en `service-worker.spec.ts`.

### Comandos y resultados reales

`npm.cmd test`: 17 suites y 177 checks en PASS. `npm.cmd run verify`: pass. `check.sh` en Git Bash: `PUBLIC_OK`.

### Prueba negativa

Quité la versión de `idempotencyKey`: fallaron 12 checks en 5 suites (3 de mi suite, 2 de `unit/schema-idempotencia`, y históricos de `sync.cola`, `sync.modelo` y `sync`). Dos checks míos no cayeron a propósito: comprueban el acuerdo cola–política, no el formato de la clave. Restaurado con `git checkout --`: verde sin ningún `fail`. Capturas en `evidence/week-08/ismael-01..05*.txt`.

### Hallazgo

La guía suponía que una segunda invocación de `registerServiceWorker` no duplica el registro, pero el módulo no guarda estado: la deduplicación es del navegador. El check documenta el comportamiento real.

### Estado

Evidencia completa: `evidence/week-08/ismael.md`. PR pendiente de abrir.


## Semana 8 — Integración y flujo de captura — Juan Andrés

Fecha: 22 de octubre de 2026. Ejecución técnica: Codex.

Se revisó el PR #23 de Ismael en 2e135343d89301c6ad1460e483140bb8a62c8acd: 177 comprobaciones en 17 suites, verify, build y PUBLIC_OK aprobados con árbol limpio. Se integró en adacf957be2d0fdd0da5c0f0ea97f45f0c0724cd y se conservó su evidencia. La bitácora se combinó preservando ambos bloques.

La captura pendiente se implementó en d4acc2fc37f3712b563c8eab03d15336ccb44a2a: validación, adaptador localStorage, API de demostración y pruebas de interfaz. La instalación limpia, build y 200 checks en 21 suites aprobaron. El navegador real recuperó el registro tras recargar offline y conservó una sola inspección remota al perder y reintentar una respuesta. El mismo flujo aprobó sin geolocalización.

En rama temporal se hizo que el adaptador guardara listas vacías: dos checks de persistencia fallaron. Se restauró y la suite de seis checks aprobó; el blob del adaptador coincide con su commit. Salidas en evidence/w08/andres-persistencia-*.txt. No se integró el defecto. Se fijó la fecha de referencia del dataset y se mantuvo el lockfile. La revisión humana sigue pendiente, separada de los resultados de Codex.


### CI de integración de Semana 8

Codex confirmó Actions 39885685342 en verde sobre 1a98d562e32be8dea69a4779354b4668bcc20b7b: instalación, lint, tipos, build, Chrome, pruebas, verify, chequeo público, resumen y artefactos. En los intentos previos 39885027179 y 39885338490 se diagnosticaron cierre/limpieza temporal de Chrome y arranque en frío; se corrigió la espera del puerto real y el cierre normal, conservando los fallos y sus artefactos. El conteo integrado es 200 comprobaciones en 21 suites. Registro: evidence/w08/andres-ci-integracion.json.


### Verificación desde instalación limpia — Semana 8

El workflow académico de la semana aprobó, pero el de semana 1 (run 39885971515) detectó la dependencia de build: verify intentaba ejecutar E2E antes de compilar. Se ordenó scripts/verify.mjs para construir antes de probar. Se conservan el descubrimiento, todas las comprobaciones y los workflows anteriores. Así npm ci seguido de npm run verify es el equivalente reproducible de make verify.


## Semana 9 — Bloque A (Validación de Entradas y Suite Base de Seguridad) — Kevin (28 de octubre)

### Qué hice
- Inicialicé la rama de arranque `semana-9-arranque-seguridad` a partir de `master` actualizado.
- Actualicé el identificador de la actividad en `src/lib/storage/schema.ts` (`ASSIGNMENT_ID = "w09-security-privacy"`).
- Implementé `src/lib/security/input-validation.ts`: módulo TypeScript nativo sin dependencias externas para validación defensiva de inspecciones (regex segura para IDs, enumeración estricta de estatus, sanitización contra XSS y límites de longitud).
- Expuse las utilidades en `src/lib/security/index.ts`.
- Creé la suite de pruebas `tests/security.spec.ts` con 8 checks automatizados (AC-02 / AC-03).
- Generé la evidencia de regresión negativa (`kevin-negativo-rotura.txt` vs `kevin-restaurado.txt`) y la documentación en `evidence/week-09/kevin.md`.

### Comandos y resultados reales
- `npm.cmd run build`: compilación limpia y optimizada de producción (`Compiled successfully`).
- `npm.cmd test`: 22 suites ejecutadas con paso exitoso determinista (`starter.spec.mjs: PASS`). La suite `security` ejecutó sus 8 checks en verde (`PASS`).
- `npm.cmd run check-secrets`: `check-secrets: PASS`.

### Prueba negativa
- Modificación temporal en `sanitizeString` para devolver la cadena sin procesar: fallaron 3 checks de sanitización (`sanitize-strips-script-tags`, `sanitize-escapes-html-entities`, `validate-sanitizes-summary-content`), produciendo `security: FAIL`.
- Restauración de la función: recuperación total en verde (`security: PASS`).

- 2026-10-28 | Ismael | Bloque B semana 9: inventario LGPDPPSO, privacy-controls.ts, suite unitaria y prueba negativa.


## Semana 9 — Juan Andrés — 29 de octubre de 2026

Integración local de master 7ae9f209194ef2b48d891827dabe0d9247824e2a y rama de Ismael
0813967573d0f739f76170c509f33db00e853d8b, conservando su autoría. Codex ejecutó
instalación limpia y verify sobre 8e6ca6e3efab428a4b2d279c2aef7cbb0101a1b7:
214 comprobaciones en 23 suites, build y barrido aprobados, árbol limpio.

El commit de implementación de7a554e6f64f230b08a1e6d1144b534b5bdb346 añade modelo
STRIDE, contrato y aplicación de CSP, robots, siete comprobaciones de cabeceras,
workflows y rutas de reportes derivadas de la actividad. Verify, cobertura y chequeo
público acumulado aprobaron: 221 comprobaciones en 24 suites y PUBLIC_OK.

La regresión temporal DENY -> ALLOWALL produjo código 1. Restaurar el archivo
original recuperó las siete comprobaciones, código 0 y blob idéntico. Las salidas
están en evidence/week-09/andres-negativo.txt y andres-restaurado.txt.

El script original del kit imprimió PUBLIC_OK pese a coincidencias léxicas con nombres
de herramientas; no se reemplazó con ese resultado la comprobación acumulada.
La auditoría de dependencias informó dos avisos altos y uno crítico, código 1.
Quedan registrados el riesgo y la actualización mayor pendiente. El inventario del
Bloque B aún describe almacenamiento y retención distintos del código real.

Los comandos fueron ejecutados por Codex. La revisión personal de esta semana está
pendiente; no se atribuye ejecución humana ni trabajo de otros integrantes.


## Semana 9 — Cierre de integración — 31 de octubre de 2026

Se revisaron las correcciones del PR #28 de Ismael: inventario de datos y evidencia
consistentes con localStorage, retención después de sincronizar y utilidades aisladas.
Las seis comprobaciones del PR sobre la integración aprobaron. La ejecución aislada
de su rama utilizaba el resumen de semana 8; la combinación con master contiene el
resumen actualizado de semana 9. Se integró preservando sus commits y su autoría.

Juan Andrés confirmó la revisión del modelo de amenazas y de los resultados. Se
actualizaron únicamente su evidencia, el README, el modelo y la guía de entrega.
Las comprobaciones técnicas siguen atribuidas a Codex y Actions. La auditoría de
dependencias del 29 de octubre se conserva como riesgo documentado, sin exigir una
actualización mayor para este cierre. El SHA y los adjuntos se fijan tras el último
merge y la comprobación de sus workflows; la etiqueta del equipo es week-09-final.
