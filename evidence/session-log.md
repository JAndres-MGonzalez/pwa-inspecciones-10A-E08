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
5. **Evidencia y límites:** uso declarado de Codex para código, pruebas y documentación. La revisión personal de Ismael y Actions sobre el futuro SHA de publicación están pendientes; no se atribuye a esta ejecución el resultado anterior de Actions. Los reportes completos están en `reports/week-03/` y `reports/verification.json`, ignorados por Git. La guía original no se incorpora al repositorio.

Para repetir la comprobación visual: compilar, iniciar producción, abrir el inicio y esperar a
que el Service Worker controle la página; desactivar la conexión desde las herramientas de
desarrollo y recargar. Deben conservarse tres tarjetas y estilos. Abrir una ruta desconocida
debe mostrar «Estás sin conexión». La conexión inicial y el fin del precache son requisitos.
