# Bitácora de ejecución asistida

Sesión iniciada el 4 de septiembre de 2026, zona America/Mexico_City. Ejecutor de los comandos de la primera sesión: **Codex**, en el entorno del usuario. La ejecución posterior compartida por el usuario se registra en una sección aparte. Equipo identificado el 5 de septiembre de 2026: **10A-E08**.

## Entorno

Windows NT 10.0.26200.0; Node v26.4.0; npm 11.17.0; Git 2.55.0.windows.3. Starter original con Next.js 14.2.35 y React 18.3.1.

## Resultados observados

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

## Ejecución local compartida por el usuario

El 5 de septiembre de 2026, después de clonar el repositorio en `C:\Users\Ra1zeR\Documents\pwa-inspecciones-laboratorio`, el usuario compartió las siguientes salidas de PowerShell:

| Comando | Resultado comunicado |
|---|---|
| `npm ci` | 28 paquetes instalados y 29 auditados en 13 s; 2 vulnerabilidades de severidad alta |
| `npm run dev` | Next.js 14.2.35 listo en 3.9 s; compilación de `/` en 5 s y respuesta `GET / 200` |
| `npm run verify` | `starter.spec.mjs: PASS`, `Compiled successfully`, generación de 4/4 páginas estáticas y `Verificación técnica: pass. Revisión académica: pendiente.` |

El reporte local consultado antes de actualizar la identificación tiene `checkedAt: 2026-09-05T06:33:29.163Z`, Node `v26.4.0`, árbol limpio y los checks de estructura, prueba y build en `pass`. La salida comunicada constituye evidencia de esta ejecución concreta; no demuestra que cada integrante la haya realizado ni que haya revisado los documentos. Las secciones personales deben vincular la aportación y explicación correspondiente.

## Explicación de la prueba proporcionada

`tests/starter.spec.mjs` lee `package.json` y `src/app/page.tsx`. Comprueba que el script `build` sea exactamente `next build`, que el texto de la página contenga «Inspecciones de laboratorio» y que incluya «sintéticos» sin distinguir mayúsculas.

Un PASS confirma esas aserciones. No importa el dataset ni cuenta tarjetas, no abre un navegador, no mide cobertura y no verifica instalación PWA, persistencia, sincronización, accesibilidad completa o calidad documental. La inspección visual realizada fue una comprobación separada, sin añadir una suite de pruebas.

## Versión y límites

La primera ejecución ocurrió antes de crear el primer commit: su reporte tenía `commitSha: null` y `workingTreeClean: false`. No se presenta como reporte del SHA final. Tras integrar los documentos, se regenera el reporte sobre el commit y árbol limpio; el SHA y la hora autoritativos están en ese JSON y en Actions.

La documentación de requisitos y la comparación contienen análisis para revisión del equipo. Los objetivos de 100 registros, contraste, zoom y recuperación offline aún no tienen un ensayo completo registrado. Las contribuciones personales y aceptación del equipo permanecen pendientes de confirmación.
