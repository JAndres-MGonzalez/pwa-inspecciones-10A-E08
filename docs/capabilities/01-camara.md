# Cámara y evidencia opcional

**Autor: Kevin Montalvo** · Bloque A · Semana 6 `w06-device-push`

## Qué hace

`src/lib/device/camera.ts` expone cuatro funciones para adjuntar evidencia opcional a una
inspección. Ninguna pide nada al importarse y ninguna lanza: el resultado siempre es un
`CapabilityResult<EvidenceRecord>` que la interfaz puede mostrar tal cual.

| Función | Para qué |
|---|---|
| `isCameraSupported(env?)` | Informa si el dispositivo ofrece `getUserMedia`, para redactar la interfaz. |
| `getCameraPermission(env?)` | Lee el estado del permiso **sin pedirlo**. |
| `captureEvidence(options, env?)` | Abre la cámara, toma un fotograma y devuelve el registro. |
| `evidenceFromFile(file, options, env?)` | Respaldo: adjunta un archivo sin tocar la cámara. |

El registro (`EvidenceRecord`) vive **solo en memoria** durante la sesión. El módulo no
contiene `fetch` ni `XMLHttpRequest`: la evidencia no sale del equipo.

## Por qué el permiso se pide en el clic y no al cargar

La consigna pide permisos **solo bajo acción del usuario**. Importar `camera.ts` no ejecuta
`getUserMedia` ni `permissions.query`: esas llamadas viven dentro de las funciones y solo se
invocan desde los manejadores `tomarFoto` / `elegirArchivo` de
`src/components/device-evidence.tsx`. `getCameraPermission` **lee** el estado
(`permissions.query`), no lo solicita; pedir permiso es una acción de la persona, no del
render.

## Por qué el stream se cierra en `finally`

Si la captura falla a mitad (sin lienzo, permiso revocado, error del canvas), un `catch` sin
`finally` dejaría el stream abierto y la cámara encendida. El bloque `finally` llama a
`stopTracks` pase lo que pase: cerrar siempre es la única posición defendible. La suite lo
comprueba en el camino feliz y en el fallo.

## Límite de tamaño y de memoria

Un `dataUrl` gigante guardado en el estado de React bloquea la pestaña. `captureEvidence`
rechaza cualquier imagen mayor a `maxDataUrlLength` (por defecto 750 000 caracteres ≈ una foto
JPEG de ~550 kB en base64) con un resultado degradado y un mensaje claro, en vez de guardarla.

## Fallback por archivo: qué cubre y qué no

`evidenceFromFile` deja adjuntar una imagen cuando la cámara no existe, el permiso se niega o
la persona simplemente elige un archivo. **Cubre:** que el flujo de inspección siga siendo útil
sin cámara. **No cubre:** comprimir, validar el contenido ni subir el archivo a ningún lado;
solo lo convierte en un `EvidenceRecord` en memoria. Marca `degraded: true` siempre: el módulo
no adivina la intención, el respaldo queda declarado y medible.

## Privacidad: qué se guarda, qué no sale del equipo

- No se pide audio (`audio: false`) ni se abre la cámara hasta que se necesita.
- El stream se cierra en `finally`.
- Los mensajes de fallo no incluyen rutas, tamaños ni datos personales.
- Nada se envía por red: no hay `fetch` ni `XMLHttpRequest` en el módulo.

## Pruebas que lo demuestran (`tests/capabilities.camera.spec.ts`)

Ocho checks que corren en Node con un `DeviceEnv` inyectado: contrato exportado, fallback sin
API, permiso denegado, camino feliz (tiempo inyectado y stream cerrado), cierre del stream ante
fallo, límite de tamaño, respaldo por archivo y un lector de permisos que consulta pero no pide.

## Límites conocidos

- La evidencia **no se persiste**: al recargar la página se pierde. No hay servidor ni
  IndexedDB conectados; `MemoryInspectionStore` es de la capa de datos, no de este módulo.
- `defaultCaptureFrame` depende del navegador real (`video` + `canvas`): la suite inyecta el
  fotograma, así que el dibujo real solo se ejerce a mano en el navegador.
- No se redimensiona ni comprime más allá de la calidad JPEG 0.7 ni del límite de tamaño.
