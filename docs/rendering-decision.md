# Decisión de renderizado: CSR para listado y SSR para detalle

Semana 4 · Equipo 10A-E08 · Turno de Ismael.

## Problema

La consigna pide una ruta con datos renderizados en servidor (SSR) y otra con interacción en
cliente (CSR) para el mismo dominio, ambas con estados de carga, error y contenido verificable,
sin hydration mismatch y con al menos una métrica de carga repetible.

## Decisión

- `/inspecciones` (listado) se implementa como **CSR**: el estado inicial es "cargando" para que
  el HTML del servidor y el del cliente coincidan (sin hydration mismatch); los datos se cargan
  en el cliente con `loadInspections()` en `useEffect`. Ofrece reintento ante error y muestra la
  métrica "Datos cargados en N ms (cliente)".
- `/inspecciones/[id]` (detalle) se implementa como **SSR**: `force-dynamic` y
  `await loadInspections()` en el servidor; el contenido (ubicación, fecha, responsable,
  hallazgos y resumen) llega en el HTML inicial; `notFound()` para identificadores inexistentes.
- Ambas rutas tienen `loading.tsx` y `error.tsx` locales.

## Comparación

| Aspecto | CSR (`/inspecciones`) | SSR (`/inspecciones/[id]`) |
|---|---|---|
| Dónde se cargan los datos | Cliente, tras el montaje | Servidor, antes del HTML inicial |
| Primer render | Estado de carga (idéntico en servidor y cliente) | Contenido completo |
| Interacción | Reintento y métrica visibles | Navegación simple |
| Complejidad | Estados en `useState` + `useEffect` | Componente asíncrono + `notFound()` |
| Hydration | Sin mismatch (primer estado igual) | No aplica (servidor) |

## Métrica de carga repetible

1. **Build:** `npm run build` reporta el "First Load JS" de cada ruta; se registra en la
   evidencia para comparar `/inspecciones` y `/inspecciones/[id]`.
2. **Cliente:** el listado CSR mide con `performance.now()` el tiempo entre el inicio de la
   carga y los datos listos, y lo muestra en pantalla. La medición es local y varía por equipo;
   por eso **las pruebas no afirman su valor** (siguen deterministas).

## Límites

- Los datos son sintéticos y viven en `src/lib/data/*`; no hay backend ni red real.
- La métrica depende del equipo y del navegador; documentarla no la convierte en umbral.
- Las pruebas renderizan componentes reales con `ReactDOMServer` y una caché en memoria;
  no verifican rendimiento ni accesorios visuales.
- No se agregaron dependencias nuevas (sin Vitest).