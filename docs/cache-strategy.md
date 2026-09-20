# Estrategia de caché del service worker

## Objetivo
Permitir que la PWA de inspecciones abra y muestre contenido útil sin conexión, sin servir datos viejos en las rutas que deben ser frescas.

## Cachés y versionado
- `shell-vN`: app shell (`/`, `/offline.html`) y páginas visitadas.
- `runtime-vN`: recursos estáticos propios (JS, CSS, imágenes, fuentes).
- `VERSION` se incrementa cuando cambia el shell. En `activate` se borran todas las cachés que no pertenecen a la versión actual.

## Estrategia por tipo de petición

| Petición | Estrategia | Motivo |
|---|---|---|
| Navegación (HTML) | Network-first; si falla, caché; si no hay, `/offline.html` | Contenido fresco con red y nunca pantalla en blanco sin ella |
| JS, CSS, imágenes propias | Stale-while-revalidate | Carga rápida y actualización en segundo plano |
| `/api/*` | No se intercepta (network-only) | Evita datos desactualizados |
| Peticiones no GET | No se interceptan | Las escrituras nunca se cachean |
| Peticiones RSC de Next.js (`_rsc`) | No se interceptan | Evita estados de navegación obsoletos |
| Otros orígenes | No se interceptan | Menor superficie de riesgo |

## Supuestos
- Solo se usan datos sintéticos; no hay sesión, tokens ni PII en la caché.
- El service worker solo se registra en producción y sobre HTTPS o localhost.

## Límites
- Sin conexión solo se puede ver lo ya visitado y la pantalla `/offline.html`.
- No hay sincronización de formularios ni de inspecciones creadas offline.
- La primera visita siempre requiere red.

## Trade-offs
- Network-first en navegación da frescura, pero con red lenta espera a la petición antes de recurrir a la caché.
- Stale-while-revalidate puede mostrar un recurso una vez desactualizado hasta la siguiente carga.
- Precachear solo un shell mínimo reduce el riesgo de fallos de instalación, a costa de que otras rutas dependan de haberse visitado antes.

## Actualización segura
- El service worker **no** llama a `skipWaiting()` por su cuenta. Una versión nueva se instala y queda en estado *waiting*.
- La app detecta la versión en espera y muestra el aviso "Nueva versión disponible".
- Al pulsar "Actualizar", la página envía `{ type: 'SKIP_WAITING' }` al SW nuevo, este toma el control, se dispara `controllerchange` y la página se recarga una sola vez.
- Al activarse, el SW nuevo borra las cachés de versiones anteriores.
- Motivo: evitar que un deploy cambie archivos en mitad de una inspección y mezcle recursos de dos versiones.
- Limitación: si el usuario ignora el aviso, sigue usando la versión anterior hasta que cierre todas las pestañas.
