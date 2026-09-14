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
