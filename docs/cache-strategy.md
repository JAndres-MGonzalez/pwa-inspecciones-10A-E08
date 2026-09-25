# Estrategia de caché y funcionamiento offline

Semana 3 · Equipo 10A-E08 · Turno de Ismael.

## Preparación inicial

`public/sw.js` se registra desde `src/lib/pwa/register-service-worker.ts`, montado
en el layout mediante `RegisterSw`, con alcance `/`. Requiere HTTPS o localhost.
La primera visita necesita conexión hasta que termine la instalación del worker.
La comprobación de navegador debe hacerse con `npm run build` y `npm start`;
el servidor de desarrollo contiene recursos transitorios y no es la entrega PWA.

| Caché | Contenido | Estrategia |
|---|---|---|
| `inspecciones-static-v2` | Inicio, `/offline.html`, manifest, los tres iconos y el icono Apple; CSS y JavaScript de `/_next/static/` enlazados por el HTML inicial | Precache durante `install` |
| `inspecciones-runtime-v2` | Páginas visitadas y recursos públicos solicitados después de la instalación, con un máximo de 24 entradas | Red primero para navegación; copia y actualización de fondo para `/_next/static/`; caché primero para otros GET |

Durante `install` se descargan los archivos obligatorios y se leen los enlaces
de assets del HTML generado por Next.js. Esto prepara también estilos y scripts
que el navegador cargó antes del registro. Si falla un recurso obligatorio,
la instalación falla; `skipWaiting()` solo se ejecuta al finalizar el precache.
No se promete disponibilidad de chunks que no están enlazados en el HTML ni se
han solicitado todavía (por ejemplo, pantallas futuras con carga diferida).

## Peticiones y respaldo sin conexión

- Navegación: se intenta la red y se guarda una copia de las respuestas exitosas.
  Si no hay red, se busca en runtime, después en la caché inicial y finalmente
  se responde con `/offline.html`. Si no existe ninguna copia, se devuelve 503.
- `/_next/static/*`: se entrega la copia disponible mientras se actualiza en
  segundo plano mediante `waitUntil`. Sin copia se espera a la red; si falla, 503.
- Otros GET del mismo origen: caché primero y red si no hay copia; sin ambas, 503.
- `/api`, `/api/*`, peticiones con `authorization`, métodos distintos de GET,
  otros orígenes y `/sw.js` pasan a la red sin intervención del worker.
- Las peticiones RSC de Next.js (cabecera `rsc` o parámetro `_rsc`) pasan a la red
  para evitar mezclar HTML y respuestas internas del router.

Las respuestas HTTP fallidas no se guardan y conservan su estado. Un error al
escribir en caché no descarta una respuesta válida de la red. Cada respuesta se
clona al guardarla para que el navegador pueda consumir su cuerpo normalmente.

## Actualización y limpieza

En `activate` se eliminan únicamente cachés con el prefijo `inspecciones-` que
no correspondan a la versión vigente y luego se llama a `clients.claim()`.
Las cachés ajenas se conservan y nunca se consultan para responder peticiones.
Los nombres antiguos sin prefijo (`shell-v1`, `runtime-v1`) se conservan porque
no identifican de forma segura a esta app; ya no se consultan.

`SKIP_WAITING` activa la versión instalada. `PURGE_CACHES` elimina solo las cachés
del prefijo y confirma con `PURGE_CACHES_DONE` en el primer puerto, cuando exista.
Tras una purga, una página desconocida puede recibir 503 hasta que se prepare
de nuevo el precache o se visite con conexión.

Para publicar una nueva shell se cambia `VERSION` (por ejemplo de `v2` a `v3`),
actualizando también los nombres esperados en las pruebas. Se instala primero el
nuevo precache; al activar se borran las dos cachés de la versión anterior. El
header `Cache-Control: public, max-age=0, no-cache` de `/sw.js` fuerza su
revalidación.

## Límite de la caché runtime

La caché `inspecciones-runtime-v2` tiene un tope de `MAX_RUNTIME_ENTRIES = 24`.
Al guardar una respuesta que supera el tope se elimina la entrada más antigua
(la primera en orden de inserción), para que el almacenamiento del dispositivo
no crezca sin límite a medida que se visitan páginas. El precache de la shell
(`inspecciones-static-v2`) no participa en este límite: su tamaño lo define la
aplicación y solo cambia cuando se publica una versión nueva.

## Verificación y límites

`npm test` ejecuta `manifest02`, `service-worker` y `offline` con APIs simuladas en
memoria, sin dependencias nuevas. Comprueba instalación, limpieza, estrategias,
mensajes, exclusiones, lectura repetida, actualización y respaldo, y escribe
`reports/week-03/tests.json`. `npm run verify` añade estructura, comprobador local
y build; `bash public-tests/check.sh` comprueba el contrato público del equipo.

El dataset es sintético. Este incremento no añade captura, sincronización ni
autenticación. Si se introducen sesiones o datos privados, debe revisarse qué
páginas pueden guardarse: excluir una cabecera no protege sesiones con cookies.
El navegador puede borrar la caché; no es almacenamiento permanente. Las pruebas
en memoria no acreditan instalación en todos los dispositivos ni revisión humana.

Referencias de plataforma: [caché en PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching)
y [uso de Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers).
