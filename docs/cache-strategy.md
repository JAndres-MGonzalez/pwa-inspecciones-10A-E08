# Estrategia de caché del service worker

Documenta el comportamiento real de `public/sw.js` (entregado en el Turno 1 de la Semana 3) y qué cubren las pruebas de `tests/service-worker.spec.ts` y `tests/offline.spec.ts`.

## Objetivo
Que la app de inspecciones abra sin conexión después de la primera visita y muestre una página de respaldo cuando no hay nada guardado, sin guardar respuestas de la API ni peticiones con credenciales.

## Cachés
| Nombre | Contenido |
|---|---|
| `inspecciones-static-v1` | Precaché del app shell: `/`, `/offline.html`, `/manifest.webmanifest` y los tres iconos PNG |
| `inspecciones-runtime-v1` | Páginas visitadas y recursos guardados mientras se usa la app |

Todas las cachés usan el prefijo `inspecciones-`. Al activarse, el service worker borra las cachés con ese prefijo que no sean las dos actuales. Las cachés de otros nombres no se tocan.

## Ciclo de vida y mensajes
- `install`: precachea el app shell. Si el precaché falla, el error se registra en consola y la instalación continúa. Después llama a `skipWaiting()`.
- `activate`: limpia cachés viejas y toma control con `clients.claim()`.
- Mensaje `SKIP_WAITING`: activa una versión en espera.
- Mensaje `PURGE_CACHES`: borra todas las cachés con prefijo `inspecciones-` y responde `PURGE_CACHES_DONE` por el puerto recibido (útil para depurar).

## Estrategia por tipo de petición
| Petición | Estrategia | Si falla la red |
|---|---|---|
| Navegación (HTML) | Network-first; guarda la respuesta en la caché runtime | Página guardada, luego `/offline.html`, luego respuesta 503 de texto |
| `/_next/static/*` | Stale-while-revalidate | Se sirve la copia guardada |
| Otros GET del mismo origen (iconos, imágenes) | Cache-first | Respuesta 503 vacía si no hay copia |
| Métodos distintos de GET | No se interceptan | No aplica |
| Otros orígenes | No se interceptan | No aplica |
| `/api/*` | No se interceptan | No aplica |
| Peticiones con encabezado `Authorization` | No se interceptan | No aplica |

Las exclusiones evitan guardar datos personales o de sesión en la caché.

## Registro y cabeceras
El registro está en `src/lib/pwa/register-service-worker.ts` y se monta con el componente `RegisterSw` en el layout. `next.config.mjs` sirve `/sw.js` con `Cache-Control: public, max-age=0, no-cache` para que el navegador siempre revise si hay una versión nueva del worker.

## Supuestos
- Solo se usan datos sintéticos; no hay sesión, tokens ni PII en las cachés.
- El service worker solo funciona en HTTPS o en `localhost`.

## Límites
- Sin conexión solo se ve lo que ya se visitó y la página `/offline.html`.
- No hay sincronización de inspecciones creadas offline.
- La primera visita siempre requiere red.

## Riesgos y decisiones abiertas
1. **Activación inmediata.** `install` llama a `skipWaiting()`, así que una versión nueva se activa sin que el usuario decida y sin aviso. Un despliegue podría cambiar recursos en mitad de una sesión. Alternativa: quitar esa llamada y activar solo con el mensaje `SKIP_WAITING`, mostrando un aviso en la UI.
2. **Cache-first para todo lo que no sea `/_next/static/`.** Puede servir una versión vieja de recursos que cambian sin cambiar de nombre. Falta comprobar en el navegador si las peticiones internas de Next.js (parámetro `_rsc`) pasan por esta estrategia.
3. **Precaché silencioso.** Si una URL del precaché falla, `addAll` no guarda ninguna y la instalación sigue sin avisar. Entonces `/offline.html` podría no existir sin conexión (la respuesta 503 de texto es el último recurso).
4. **Versionado manual.** Cambiar el shell exige subir a mano `-v1` en los nombres de caché.

## Cómo se prueba
- `tests/service-worker.spec.ts`: precaché al instalar, limpieza de cachés viejas, `SKIP_WAITING`, `PURGE_CACHES` y exportación del módulo de registro.
- `tests/offline.spec.ts`: página guardada sin red, respaldo para rutas nuevas, 503 sin respaldo, stale-while-revalidate, cache-first y peticiones no interceptadas.
- Ambas usan un entorno simulado (`tests/sw-harness.ts`) que carga `public/sw.js` con `caches`, `fetch` y `self` falsos. Verifican la lógica, no el navegador real.
- La comprobación en navegador (DevTools → Application → modo Offline) se hace a mano.
