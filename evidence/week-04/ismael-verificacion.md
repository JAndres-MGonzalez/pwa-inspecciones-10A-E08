# Verificación del Turno 2 — Ismael (Semana 4)

- **Integrante:** Ismael (GitHub: Ismael-2509), 10A-E08.
- **Fecha:** 27 de septiembre de 2026.
- **Entorno:** Windows, PowerShell y Git Bash, Node v24.20.0, npm 11.19.0, Git.
- **Base:** rama creada desde `master` en `e9ff3c4` y actualizada con `origin/master` (`e230314`) mediante el merge `2e51d79`.
- **Rama:** `semana-4-t2-ismael-pruebas` (PR #4 hacia `master`).
- **Asistente de IA:** Claude (Anthropic), en chat, para guiar comandos y redactar borradores. Las comprobaciones las ejecuté yo en mi terminal y revisé cada salida; la declaración completa está en `individual.md`.

## Archivos del turno

Creados:

- `tests/rendering.spec.ts`
- `docs/rendering-decision.md`
- `evidence/week-04/` (capturas y este registro)

Modificados:

- `tests/starter.spec.mjs` (suite `rendering` y reporte `w04-csr-ssr`)
- `scripts/verify.mjs`
- `public-tests/check.sh` y `public-tests/README.md`
- `evidence/individual.md` y `evidence/session-log.md`

No toqué `src/app/*`, `src/components/*` ni `next.config.mjs` (Turno 1 de Kevin).

## Comprobaciones

### 1. Suites (`npm.cmd test`)

`starter.spec.mjs: PASS`, código 0.

- 4 suites: `manifest02`, `service-worker`, `offline` y `rendering`.
- 45 casos: 9 de manifest y estructura, 20 del Service Worker, 7 de offline y 9 de renderizado.
- La suite `rendering` valida el primer render del listado CSR (estado de carga y sin hydration mismatch), la grilla, el estado vacío y el de error, el contenido del detalle SSR, el rechazo ante un id inexistente, el enlace del shell y el componente de carga.

### 2. Verificación local y build (`npm.cmd run verify`)

Resultado: `Verificación técnica: pass`.

- Estructura, pruebas, barrido de palabras y build en verde.
- Build de producción, código 0:

| Ruta | Tipo | Tamaño | First Load JS |
|---|---|---|---|
| `/` | dinámica | 181 B | 96.1 kB |
| `/_not-found` | estática | 873 B | 88.1 kB |
| `/inspecciones` | estática (CSR con estado inicial) | 1.68 kB | 97.6 kB |
| `/inspecciones/[id]` | dinámica (SSR) | 181 B | 96.1 kB |

### 3. Chequeo público (`bash public-tests/check.sh` con Git Bash)

`files`, `cursors`, `tests` y `package` en PASS, y `PUBLIC_OK` al final. Captura en `PUBLIC_OK.png`.

### 4. GitHub Actions

En el PR #4, los 4 checks pasaron en el commit `8b13938`, después de corregir las importaciones. El commit intermedio `8677aa9` mostró una falla porque la suite de renderizado todavía tenía las importaciones anteriores.

### 5. Fallos diagnosticados y solución

1. **Módulos no encontrados en `rendering`.** Mi `master` local no tenía las rutas de Kevin, y el build solo listaba `/` y `/_not-found`. Solución: traer `origin/master` y hacer merge en mi rama.
2. **Importaciones de la prueba tras el merge.** `InspeccionesGrid`, `InspeccionesEmpty` e `InspeccionesError` se cargan desde `src/components/inspecciones-view.tsx`, y `AppShell` es una exportación con nombre. No cambié las páginas de Kevin. Commit `8b13938`.
3. **`node: command not found` en `check.sh`.** El `bash` de PowerShell abría WSL, que no tiene Node. Solución: usar Git Bash.
4. **Marcadores de conflicto en `session-log.md`.** Quedaron dentro del archivo tras el merge. Los quité conservando las entradas de ambos integrantes. Commit `37185a0`.
5. **Capturas en `evidence/week-4`.** La carpeta correcta es `evidence/week-04`, así que las moví.

### 6. Métrica repetible

`First Load JS` del build de producción: 97.6 kB para `/inspecciones` (CSR) y 96.1 kB para `/inspecciones/[id]` (SSR). Las pruebas no afirman tiempos, así que siguen deterministas.

## Commits del turno

`a42bd8b`, `401374c`, `d037ada`, `8677aa9`, `2e51d79` (merge), `8b13938`, `27e1d08` y `37185a0`.

## Pendientes

- Revisión y merge del PR #4 por Juan Andrés.
- Registrar el SHA del merge cuando se complete.
