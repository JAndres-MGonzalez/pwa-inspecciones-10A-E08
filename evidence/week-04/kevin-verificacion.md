# Verificación del Turno 1 — Kevin (Semana 4)

- **Integrante:** Montalvo Marcial Kevin Armando (10A-E08).
- **Fecha:** 23 de septiembre de 2026.
- **Entorno:** Windows, Node v22.22.0, npm 11.x, Git.
- **Base:** `master` limpio en `e9ff3c4`.
- **Rama:** `semana-4-t1-kevin-rutas`.
- **Asistente de IA:** opencode (este registro documenta las comprobaciones que ejecutó el asistente; la validación humana queda registrada en `individual.md`).

## Archivos del turno

Creados:

- `src/components/loading-state.tsx`
- `src/components/inspecciones-view.tsx` (grid, vacío y error del listado)
- `src/app/inspecciones/page.tsx` (CSR)
- `src/app/inspecciones/[id]/page.tsx` (SSR)
- `src/app/inspecciones/[id]/not-found.tsx` (opcional incluido)
- `src/app/inspecciones/loading.tsx` y `src/app/inspecciones/error.tsx`
- `src/app/inspecciones/[id]/loading.tsx` y `src/app/inspecciones/[id]/error.tsx`

Modificados:

- `src/components/app-shell.tsx` (enlace "Inspecciones")
- `src/app/page.tsx` (enlace "Ver detalle" en las tres tarjetas)
- `src/app/globals.css` (estilos opcionales)

## Comprobaciones

### 1. Suites existentes (Semanas 1–3)

`npm.cmd test` → `starter.spec.mjs: PASS`, código 0.

- 3 suites: `manifest02`, `service-worker`, `offline`.
- 35 casos: 9 de manifest y estructura, 19 del Service Worker y 7 de offline.
- Los casos de Semanas 1 y 2 quedaron intactos.

### 2. Build de producción

`npm.cmd run build` → código 0.

| Ruta | Tipo | Tamaño | First Load JS |
|---|---|---|---|
| `/` | dinámica | 181 B | 96.1 kB |
| `/inspecciones` | estática (CSR con estado inicial) | 1.68 kB | 97.6 kB |
| `/inspecciones/[id]` | dinámica (SSR) | 181 B | 96.1 kB |

5 páginas generadas (incluye `/_not-found`).

### 3. Fallo diagnosticado y solución (build)

El primer intento de build falló:

```
Type error: Type 'OmitWithTag<typeof import(".../src/app/inspecciones/page")...>' does not
satisfy the constraint '{ [x: string]: never; }'. Property 'InspeccionesGrid' is incompatible
with index signature. Type '({ items }: { items: Inspection[]; }) => Element' is not assignable
to type 'never'.
```

**Diagnóstico:** Next.js valida que un `page.tsx` solo exporte los nombres permitidos (`default`, `metadata`, `generateStaticParams`, etc.). Al exportar los subcomponentes `InspeccionesGrid`, `InspeccionesEmpty` e `InspeccionesError` desde la página, la compilación de tipos falla.

**Solución:** mover esos tres subcomponentes a un módulo normal **fuera de la ruta** (`src/components/inspecciones-view.tsx`) e importarlos en la página, que queda con solo el componente `default`. Las pruebas del Turno 2 importan los subcomponentes desde el módulo de vista, no desde la página. Con esto el build compila correctamente.

### 4. Verificación HTTP (rutas y contenido servido)

Servidor de desarrollo (`npm.cmd run dev`):

| Ruta | Status | Contenido servido |
|---|---|---|
| `/` | 200 | Tres tarjetas con "Ver detalle" y enlace "Inspecciones" en la navegación |
| `/inspecciones` | 200 | HTML inicial con estado "Cargando listado" (CSR, sin hydration mismatch) |
| `/inspecciones/inspection-001` | 200 | Detalle SSR en el HTML inicial: "Laboratorio de Redes", "Datos en servidor", "Volver al listado" |
| `/inspecciones/inspection-999` | 200 | UI de "Inspección no encontrada" (boundary `not-found`) |

Servidor de producción (`next start`, puerto 3100): mismas rutas y contenidos.

**Nota sobre el status del 404:** la ruta inexistente **renderiza** la página "Inspección no encontrada" (se verificó el HTML y el payload RSC con digest `NEXT_NOT_FOUND`, y la prueba del Turno 2 `rendering-ssr-missing-id` valida que el componente rechaza con ese error). El status HTTP permanece 200 porque la ruta usa *streaming* (`loading.tsx`): Next.js fija los headers (incluido el status) al empezar a enviar el shell, antes de saber que habrá `notFound()`. Es un comportamiento de plataforma, no un defecto del código.

### 5. Métrica repetible

- La ruta CSR muestra al usuario "Datos cargados en N ms (cliente)" calculado con `performance.now()`; las pruebas no afirman su valor, por lo que siguen siendo deterministas.
- First Load JS del build de producción: `97.6 kB` para `/inspecciones` y `96.1 kB` para `/inspecciones/[id]` (métrica que se registra en `docs/rendering-decision.md` en el Turno 3).

## Pendientes

- Validación humana en navegador de Kevin y capturas en `evidence/week-04/` (si la conexión del navegador lo permite).
- Merge del PR por **Ismael** y registro del SHA del merge en `individual.md`.
- Guardado del SHA de la rama, PR URL y resultado de la revisión de Ismael al final de la semana.