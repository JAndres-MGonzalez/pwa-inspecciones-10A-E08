# Notificación de cambio

**Autor: Juan Andrés Medina** · Bloque C · Semana 6 `w06-device-push`

## Permiso y aviso

`requestPermission()` solicita permiso únicamente cuando la interfaz lo llama desde un clic.
Si ya está concedido o denegado, conserva ese estado sin volver a solicitarlo. Importar el
módulo o llamar a `notifyChange()` no abre el diálogo.

`notifyChange({ title, body })` lee el permiso. Si está concedido, busca el registro del
Service Worker mediante `navigator.serviceWorker.getRegistration()` y utiliza su
`showNotification()`. Si no existe un registro, usa `new Notification()` como respaldo.
No espera indefinidamente a `serviceWorker.ready`.

El contrato compartido es [`device/types.ts`](../../src/lib/device/types.ts).
`showNotification()` pertenece a `ServiceWorkerRegistration`; no es un método del
contenedor `navigator.serviceWorker`. La implementación respeta esa diferencia y la ruta
real del contrato, en lugar de copiar las referencias incompletas del ejemplo de la guía.

## Respaldo en pantalla

Cuando la API falta, el permiso no está concedido o el sistema falla, el resultado contiene
`ok: true`, `degraded: true` y `value.via: "in-app"`. Su mensaje conserva el título y el cuerpo
del cambio para que la interfaz pueda mostrarlos en una región viva.

Aquí `ok: true` significa que existe un aviso útil para mostrar; el módulo por sí solo no
modifica la pantalla. La interfaz debe presentar `message`. Cámara y ubicación, en cambio,
devuelven `ok: false` cuando no pueden obtener sus datos: no se inventa una foto o una posición.

## Privacidad

El aviso solo lleva un título y un texto sintético sobre el cambio. La interfaz no incluye
imágenes, coordenadas ni nombres de personas en la notificación del sistema. No hay envío
propio a un servidor y no se solicitan otros permisos.

El texto del sistema puede verse fuera de la pestaña. Por eso el llamador debe usar mensajes
generales sobre la inspección y reservar el detalle para la aplicación.

## Pruebas

[`capabilities.notifications.spec.ts`](../../tests/capabilities.notifications.spec.ts) utiliza
dobles del constructor y del contenedor del Service Worker, sin navegador ni red. Comprueba
los ocho casos de la guía y además: constructor sin registro, permiso ya decidido, estado
desconocido y ausencia de llamadas al importar. Incluye fallos de lectura, solicitud y envío.

Los resultados se reproducen desde la raíz con `npm.cmd test` y `npm.cmd run verify`.
La prueba del módulo no demuestra que el sistema operativo haya mostrado o que una persona
haya leído el aviso; esa comprobación requiere el navegador.

## Límites

- Son notificaciones locales de un cambio; no hay un servicio de mensajes remotos.
- Hace falta HTTPS o un contexto local compatible. Las opciones del navegador y del sistema
  pueden impedir mostrar el aviso aunque la API acepte la solicitud.
- Sin constructor de notificaciones no se puede leer su permiso; el módulo conserva el
  respaldo en pantalla, aunque exista un contenedor del Service Worker.
- Los fallos devuelven mensajes generales. No se muestran detalles internos de excepciones.
