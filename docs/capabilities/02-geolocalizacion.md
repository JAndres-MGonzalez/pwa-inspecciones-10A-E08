# Geolocalización opcional

**Autor: Ismael Montalvo** · Bloque B · Semana 6 `w06-device-push`

## Qué hace

`src/lib/device/geolocation.ts` expone dos funciones: `isGeolocationSupported(env?)` y
`getCurrentPosition(options?, env?)`. La segunda devuelve una promesa de
`CapabilityResult<GeoCoordinates>` (`lat`, `lon`, `accuracy`) y **nunca lanza**: todo fallo
llega como resultado con `ok: false`, `error`, `degraded: true` y un `message` apto para
mostrar. El parámetro `env` es el `DeviceEnv` inyectable del contrato: en el navegador no se
pasa y se usa `navigator.geolocation`; en las pruebas se inyecta un doble, porque en Node esa
API no existe.

## Por qué la precisión alta está apagada por defecto

La consigna pide limitar los datos recolectados. Para una inspección de laboratorio basta
una ubicación aproximada; la precisión alta enciende el GPS durante más tiempo, gasta batería
y no cambia lo que la persona necesita registrar. Por eso `enableHighAccuracy` vale `false`
salvo que quien llama lo pida de forma explícita. La posición cacheada se acepta hasta 60
segundos (`maxAgeMs`) para no volver a consultar el sensor sin necesidad.

## Quién aplica el timeout (y por qué es un límite conocido)

El tiempo de espera se **declara** en `PositionOptions` (5000 ms por defecto, `timeoutMs`) y
lo aplica el navegador. No hay temporizador propio: implementarlo exigiría relojes falsos en
las pruebas y, si el navegador no respondiera nunca, dejaría una promesa pendiente. El costo
es un límite: mientras la ventana de permiso siga abierta, el navegador no cuenta el tiempo y
no existe un timeout nuestro que la cierre.

## Permiso denegado, API inexistente y timeout: tres fallos distintos

| Situación | `error` | Qué le pasa a la persona |
|---|---|---|
| El dispositivo no tiene la API | `unsupported` | Se le dice que no hay geolocalización; no hay nada que arreglar. |
| Código 1: permiso denegado | `denied` | Se arregla en la configuración del navegador. |
| Código 3: tiempo agotado | `timeout` | Puede reintentar. |
| Código 2 u otro fallo | `error` | Mensaje genérico, también sin coordenadas. |

La interfaz decide qué ofrecer en cada caso porque el motivo llega separado.

## Registro sin coordenadas: el flujo continúa

Todo mensaje de fallo termina diciendo que la inspección se registra sin coordenadas. El
llamador guarda `coords: null` en el `EvidenceRecord` y el registro es válido igual: la
ubicación mejora la evidencia pero nunca es condición para completar la inspección.

## Privacidad: qué no aparece en los mensajes ni en la evidencia

- Los mensajes de fallo no contienen coordenadas ni precisión.
- Si el permiso se niega, `value` queda indefinido: no se inventa ni se conserva un resto.
- El módulo no usa `fetch` ni `XMLHttpRequest`; nada sale del equipo.
- El permiso nunca se pide al importar el módulo: solo ocurre dentro de una llamada a
  `getCurrentPosition`, que debe salir de un manejador de la interfaz (acción de la persona).

## Pruebas que lo demuestran (`tests/capabilities.geolocation.spec.ts`)

| Check | Qué demuestra |
|---|---|
| `contract-exports` | Las dos funciones del contrato existen. |
| `unsupported-without-api` | Sin API el resultado es degradado, sin valor y con mensaje útil. |
| `granted-returns-coords` | Camino feliz; las opciones declaradas llegan al navegador. |
| `defaults-limit-data` | Precisión alta apagada y timeout siempre declarado. |
| `denied-code-1` | Permiso denegado: `denied`, degradado. |
| `timeout-code-3` | Tiempo agotado: `timeout`, degradado. |
| `failure-message-leaks-no-coordinates` | El mensaje de fallo no lleva números de coordenadas. |
| `never-prompts-on-import` | Cargar el módulo no consulta la ubicación. |

Las pruebas corren en Node con un doble de `navigator.geolocation`. Además se rompió el
módulo a propósito cinco veces para comprobar que cada check falla cuando debe; el resultado
queda anotado en `evidence/individual.md`.

## Límites conocidos

- El timeout lo aplica el navegador; si la ventana de permiso queda abierta, no hay timeout
  propio que la cierre.
- Las suites usan un doble: no demuestran el comportamiento de un navegador real, y la interfaz todavía no llama a este módulo: no hay una prueba de punta a punta desde la página. Eso queda para la integración.
- La cabecera `Permissions-Policy` de `next.config.mjs` declara `geolocation=()`: mientras siga así, el navegador negará la ubicación en cualquier página del proyecto aunque la persona la acepte.
- La posición cacheada puede tener hasta 60 segundos de antigüedad.
- Las coordenadas viven solo en memoria durante la sesión: no hay servidor ni persistencia.