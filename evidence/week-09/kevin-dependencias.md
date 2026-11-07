# Evidencia de Auditoría de Dependencias — Kevin Armando Montalvo Marcial

- **Responsable:** Kevin Armando Montalvo Marcial (3523110092)
- **Actividad:** `w09-security-privacy` — Seguimiento de dependencias (Semana 10)
- **Rama de trabajo:** `semana-10-kevin-dependencias` (creada desde `master` en `2990482`)
- **Fecha:** 2026-11-04
- **Entorno de ejecución:** Windows 11, PowerShell, Node `v22.22.0`, npm `10.9.4`

## Contexto

La auditoría de Semana 9 (`evidence/week-09/andres-auditoria.txt`) reportó 3 vulnerabilidades:

- 1 crítica en `next@14.2.35`
- 2 altas en `postcss` y `source-map-js` (dependencias transitivas de `next`)

Repetí la auditoría como línea base y confirmé el reporte:

```text
next  9.3.4-canary.0 - 16.3.0-preview.10
Severity: critical
  (26 avisos: DoS en Image Optimizer, RCE en Windows-hosted servers, RCE en Image
   Optimization API con SVG/AVIF, request smuggling en rewrites, cache poisoning,
   SSRF en Server Actions/rewrites, XSS en App Router con CSP nonces, etc.)

postcss  <=8.5.22
Severity: high
  (XSS sin escapar `</style>`, lectura arbitraria de archivos vía sourceMappingURL)

source-map-js  1.0.0 - 1.2.1
Severity: high
  (DoS del event loop por offsets de secciones en source maps)

3 vulnerabilities (2 high, 1 critical)
```

> **Nota sobre la versión propuesta:** la guía de arranque mencionaba `next@16.4.3`.
> La auditoría real de hoy (`npm audit fix --force`) propone **`next@16.4.5`**, que es la
> versión estable más reciente de la línea 16 y la que se evaluó en la rama.

## Investigación de compatibilidad

**Versión actual:** `next@14.2.35`
**Versión propuesta por npm:** `next@16.4.5` (cambio de versión mayor)
**Versión evaluada:** `next@16.4.5`

Comprobaciones hechas antes de instalar:

| Requisito de Next.js 16 | Valor en el proyecto | Resultado |
|---|---|---|
| Node.js `>=20.9.0` | CI `20.19.6`; local `22.22.0` | Cumple |
| TypeScript `>=5.1.0` | `5.4.5` | Cumple |
| `react` / `react-dom` peer `^18.2.0 \|\| ^19` | `18.3.1` | Cumple, **pero React 18 está en desuso en Next 16** (aviso del build; se elimina en Next 17) |
| Router | App Router (`src/app/`) | Aplica el breaking change de `params` como Promise |

**Corrección a la guía:** el documento de arranque indicaba que el proyecto usa Pages Router.
No es así: el proyecto usa **App Router** (`src/app/layout.tsx`, `src/app/page.tsx`,
`src/app/api/inspecciones/route.ts`). Esto es relevante porque el cambio de `params`
sincrónico a `params` como `Promise` es justamente el que rompió la suite.

### Línea 14.x: ¿existe una opción sin cambio mayor?

`npm view next@14 version` devuelve hasta **`14.2.35`**, que es exactamente la versión
instalada. El rango afectado por el aviso crítico es `9.3.4-canary.0 - 16.3.0-preview.10`,
así que **ninguna versión 14.x ni 15.x corrige los CVEs**: la guía llama "Opción B" a
buscar una patch de la línea 14, pero esa opción no existe hoy. La única ruta de corrección
real es `next >= 16.4.5`.

### Breaking changes de Next.js 16 revisados contra este proyecto

Revisé la guía oficial de actualización a la versión 16 y contrasté cada punto con el
código real del repositorio:

| Cambio de Next 16 | ¿Nos afecta? | Evidencia |
|---|---|---|
| `params`/`searchParams`/`cookies`/`headers` solo asíncronos | **Sí** → corregido | `src/app/inspecciones/[id]/page.tsx` |
| Turbopack por defecto en `build` | No rompe: no hay configuración `webpack` propia | `next.config.mjs` |
| `next lint` eliminado y `eslint` fuera de la config | No afecta: el proyecto no usa ESLint | `package.json` |
| `middleware` → `proxy` | No aplica: no hay middleware | búsqueda en `src/` |
| Eliminación de `serverRuntimeConfig`/`publicRuntimeConfig` | No aplica | búsqueda en `src/` |
| `next/image` (localPatterns, qualities, minimumCacheTTL, IPs locales) | No aplica: no se usa `next/image` | búsqueda en `src/` |
| `revalidateTag` con segundo argumento, `unstable_*` estabilizados | No aplica | búsqueda en `src/` |
| AMP eliminado; PPR → `cacheComponents` | No aplica | `next.config.mjs` |
| Rutas paralelas requieren `default.js` | No aplica: no hay rutas paralelas | `src/app/` |
| `tsconfig.json` reconfigurado por Next (`jsx: react-jsx`, `.next/dev/types`) | **Sí** → aplicado por Next | `tsconfig.json`, `next-env.d.ts` |
| Service Worker (`public/sw.js`) | Sin cambios; precache y revalidación siguen en verde | `tests/service-worker.spec.ts`, `tests/offline.spec.ts` |

## Cambios aplicados en la rama

| Archivo | Cambio | Motivo |
|---|---|---|
| `package.json` | `next` `14.2.35` → `16.4.5` | Corrección de los 3 avisos |
| `package-lock.json` | Regenerado por `npm install` | Fijar el árbol resuelto |
| `src/app/inspecciones/[id]/page.tsx` | `const { id } = await params` | Next 16 ya no entrega `params` sincrónico (el detalle SSR y el 404 fallaban) |
| `tests/e2e/camino-critico.spec.ts` | El check del 404 acepta `NEXT_NOT_FOUND` **o** `NEXT_HTTP_ERROR_FALLBACK;404` | Next 16 cambió el digest interno del `notFound()` |
| `tsconfig.json` | `jsx: react-jsx` y `.next/dev/types/**/*.ts` en `include` | Reconfiguración automática de Next 16 (mantuve el formato compacto original) |
| `next-env.d.ts` | Referencias a `.next/types/routes.d.ts` y `root-params.d.ts` | Archivo autogenerado por Next 16 |

Los tres ajustes de código son mínimos y **no cambian el comportamiento observable de la
app**: el detalle sigue mostrando el laboratorio y el 404 sigue mostrando "Inspección no
encontrada". Se puede revertir `src/` y `tests/` dejando solo el cambio de versión, pero
entonces el build compila y **la suite falla en 3 checks** (detalle SSR, 404 inexistente,
y el conteo global), como se registró en la primera corrida.

## Resultados de la prueba

Línea base (`next@14.2.35`, con build previo):

| Comando | Resultado |
|---|---|
| `npm.cmd run build` | PASS (Next 14.2.35) |
| `npm.cmd test` | **246 checks en verde**, 0 fallos |
| `npm.cmd audit --omit=dev` | 3 vulnerabilidades (2 high, 1 critical) |

Con `next@16.4.5`:

| Comando | Resultado |
|---|---|
| `npm.cmd run build` | **PASS** (Next 16.4.5 con Turbopack, TypeScript en verde) |
| `npm.cmd test` | **246 checks en verde**, 0 fallos (mismo conteo que la línea base) |
| `npm.cmd audit --omit=dev` | **0 vulnerabilidades** |
| `npm.cmd ci` (instalación limpia desde el lockfile) | Reinstala `next@16.4.5` sin conflictos; build y suite repiten en verde |
| `npm.cmd run check-secrets` | PASS |
| `npm.cmd run verify` | **`status: pass`** |
| `bash public-tests/check.sh` | **`PUBLIC_OK`**, código 0 |

Detalle del diagnóstico durante la migración:

1. Primera corrida de `npm test` sobre `master` dio **1 fallo falso**: el E2E de cabeceras
   CSP comparó contra el `.next` viejo (build anterior al contrato de `worker-src`). Al
   reconstruir con `npm run build`, la línea base quedó en verde. Conclusión operativa:
   `npm test` **exige `npm run build` previo** en este proyecto.
2. Primera corrida con `next@16.4.5` sin tocar código: `e2e/camino-critico` falló en
   `detalle-ssr-muestra-laboratorio` (el `<h1>` mostraba el listado, no el laboratorio)
   porque `params` llegaba como `Promise`. Corregido con `await params`.
3. Segunda corrida: quedó el `detalle-inexistente-contenido-404`, que exigía el literal
   `NEXT_NOT_FOUND`. En Next 16 el HTML sirve `{"digest":"NEXT_HTTP_ERROR_FALLBACK;404"}`.
   El check se hizo tolerante a ambas marcas en vez de relajar la comprobación.

## Decisión

**Se integra la actualización a `next@16.4.5`.** Resuelve las 3 vulnerabilidades
(2 altas + 1 crítica) sin cambios de comportamiento observables y con la suite completa
en verde (246/246), `verify` en pass y el comprobador público en `PUBLIC_OK`.

La rama `semana-10-kevin-dependencias` queda preparada; el `commit` y el `push` se hacen
**solo con aprobación explícita de Kevin**, como pide la coordinación del equipo.

## Deuda técnica y limitaciones

- **React 18.3.1 queda en desuso en Next 16** (aviso del build: se elimina en Next 17).
  Migrar a React 19.x implica actualizar `react`, `react-dom`, `@types/react` y
  `@types/react-dom`; no se hizo aquí para no mezclar dos cambios mayores en la misma rama.
- El upgrade **no se probó en CI** hasta que se haga `push`; la validación registrada es
  local (Windows, Node 22). El CI usa Node 20.19.6, que cumple el mínimo `>=20.9.0`.
- El proyecto no tiene linter (`next lint` ya no existe en 16 y no hay ESLint instalado),
  así que "build en verde" no incluye linting.
- `next-env.d.ts` ahora importa tipos generados en `.next/`; sin un `build` previo, el
  typecheck de un clon limpio depende de que Next los regenere (lo hace `next build`/`next dev`).

## Archivos de evidencia

| Archivo | Contenido |
|---|---|
| `evidence/week-09/kevin-audit-antes.txt` | `npm audit --omit=dev` con `next@14.2.35` (3 vulnerabilidades) |
| `evidence/week-09/kevin-audit-linea-base.txt` | `npm test` línea base con build previo (246 checks, PASS) |
| `evidence/week-09/kevin-audit-build-v16.txt` | `npm run build` con `next@16.4.5` |
| `evidence/week-09/kevin-audit-npm-ci-v16.txt` | `npm ci` limpio desde el `package-lock.json` actualizado |
| `evidence/week-09/kevin-audit-tests-v16.txt` | `npm test` con `next@16.4.5` (246 checks, PASS) |
| `evidence/week-09/kevin-audit-despues-v16.txt` | `npm audit --omit=dev` con `next@16.4.5` (0 vulnerabilidades) |
| `evidence/week-09/kevin-audit-verify-v16.txt` | `npm run verify` (pass) |
| `evidence/week-09/kevin-audit-check-secrets-v16.txt` | `npm run check-secrets` (PASS) |
| `evidence/week-09/kevin-audit-public-tests-v16.txt` | `bash public-tests/check.sh` (`PUBLIC_OK`) |

## Declaración de uso de IA

Investigación de compatibilidad, ejecución asistida de comandos y redacción de este
documento con apoyo de IA (OpenCode). Validación humana: revisión de la auditoría, lectura
de los breaking changes oficiales de Next 16, confirmación de que los tres ajustes de código
son mínimos y decisión de integrar la actualización. El `commit`, el `push` y el PR se
hacen con aprobación explícita de Kevin.
