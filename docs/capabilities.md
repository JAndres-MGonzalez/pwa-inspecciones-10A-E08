# Capacidades del dispositivo

Semana 6 · `w06-device-push` · Equipo 10A-E08

Este documento es el indice de las capacidades de dispositivo. Cada seccion tiene un dueno
y se escribio de forma independiente. El contrato compartido vive en
`src/lib/device/types.ts`.

| Seccion | Contenido | Autor |
|---|---|---|
| [Camara y evidencia](capabilities/01-camara.md) | Captura opcional, permiso bajo gesto, cierre del stream, respaldo por archivo | Kevin |
| [Geolocalizacion](capabilities/02-geolocalizacion.md) | Coordenadas opcionales, timeout, permiso denegado, registro sin coordenadas | Ismael |
| [Notificaciones](capabilities/03-notificaciones.md) | Permiso bajo gesto, envio por service worker, aviso en pantalla como respaldo | Juan Andres |

## Decisiones que comparten los tres modulos

- **Ninguno lanza excepciones.** El fallo es un valor (`CapabilityResult`) con un motivo y un
  mensaje apto para mostrar.
- **Ninguno pide permiso al importarse.** El permiso solo se pide desde un manejador de la
  interfaz, es decir, cuando la persona presiona un boton.
- **Fallback siempre disponible.** Si la API no existe o el permiso se deniega, el flujo de
  inspeccion continua: evidencia por archivo, registro sin coordenadas y aviso en pantalla.
- **Minimo recolectado.** No se pide la ubicacion con precision alta por defecto, no se pide
  audio, no se abre la camara hasta que se necesita y el stream se cierra siempre.
- **Sin red.** Los tres modulos carecen de `fetch` y `XMLHttpRequest`: la evidencia no sale
  del equipo.

## Limites conocidos

- < completar en el cierre: que no cubre esta solucion (persistencia, servidores, etc.) >
