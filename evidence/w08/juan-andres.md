# Semana 8 · Juan Andrés

## Contribución y commit

Implementé con apoyo de Codex la captura `/captura`, validación compartida, almacenamiento local conectado a la cola existente, API sintética idempotente, pruebas HTTP y de interfaz, CI y documentación de entrega.

- Commit de captura y E2E: [d4acc2fc37f3712b563c8eab03d15336ccb44a2a](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/commit/d4acc2fc37f3712b563c8eab03d15336ccb44a2a).
- Integración y entrega: [PR #22](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/pull/22).
- Evidencia visual: [captura sincronizada sin geolocalización](andres-captura-sin-ubicacion.png).

Revisión técnica de compañeros ejecutada por Codex: el [PR #21 de Kevin](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/pull/21) aprobó 168 checks en 15 suites; el [PR #23 de Ismael](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/pull/23) aprobó 177 en 17, además de build, verify y chequeo público con árbol limpio. Se integraron conservando su autoría. Sus evidencias no se escribieron por ellos.

## Decisión técnica y motivo

Reutilizar `SyncQueue` e `InspectionStore` y agregar el adaptador de localStorage permite guardar datos y cola antes de enviar. Al recargar se reconstruye el estado. La API de demostración usa la clave de operación para que perder una respuesta no produzca otra inspección.

Las peticiones HTTP se conservan para las rutas, pero el flujo crítico se prueba en Chrome/Edge sin ventana, con la interfaz y el SW reales. Se usa CDP con el WebSocket de Next y no se añaden paquetes npm. Esta prueba cubre lo que el HTTP solo no demostraba.

## Pruebas y resultados

Comprobaciones ejecutadas por Codex el 22 de octubre de 2026 en Windows, Node v26.4.0 y Edge 155.0.4283.62. La CI utiliza Ubuntu y Node 20.19.6; sus ejecuciones están en los checks del PR #22 y el SHA final común se entrega después del último merge.

- `npm.cmd ci --ignore-scripts --no-audit --no-fund`: instalación limpia aprobada.
- `npm.cmd run build`: compilación aprobada, con `/captura` y `/api/inspecciones`.
- `node scripts/test-with-coverage.mjs`: 200 comprobaciones en 21 suites aprobadas, con cobertura V8 y de navegador.
- Escenarios E2E: rechazar captura inválida; guardar offline, recargar, reconectar y reintentar sin duplicar; repetir con geolocalización ausente.
- Se descarta la primera respuesta de un POST ya aplicado. Se observa un registro remoto antes y después del reintento y una sola inspección local.

Los comandos exactos y la correspondencia por capa están en [la estrategia](../../docs/test-strategy.md). El cierre exige reportes del SHA actual, árbol limpio, entregables y escenarios E2E aprobados. Los reportes generados se adjuntan o descargan de Actions; no se versionan dentro del commit que identifican.

## Defecto controlado

En la rama temporal `codex/w08-regresion-persistencia`, Codex cambió el adaptador para serializar siempre una lista vacía. Fallaron recuperación de datos y reintento tras respuesta perdida; código 1. Se restauró el archivo original y aprobaron los seis checks de esa suite. Se comprobó que el archivo coincide con el blob del commit y se eliminó la rama temporal.

- [Salida del fallo](andres-persistencia-fallo.txt).
- [Salida tras restaurar](andres-persistencia-recuperacion.txt).

También se conserva la rotura anterior de `start_url` del manifest, detectada por el check HTTP: [fallo](andres-http-fallo.txt) y [recuperación](andres-http-recuperacion.txt). Ningún defecto de demostración se integró.

## Qué demuestra y límites

Demuestra el flujo desde una interfaz real, con persistencia tras recarga offline, rechazo de datos inválidos, reintento idempotente y alternativa sin geolocalización. No demuestra despliegue, cámara/GPS físicos ni instalación en un teléfono.

localStorage puede borrarse o agotar cuota. La API es sintética y pierde su memoria al reiniciar; no es un backend multiusuario. Los adjuntos opcionales siguen siendo temporales. La cobertura identifica JS ejecutado, pero no da un porcentaje fiable de líneas originales de TypeScript. Las fechas del fixture se fijaron para no depender del reloj del equipo.

La [protección de master](andres-proteccion.json) exige PR incluso para administradores, sin push forzado ni borrado. No se hicieron cambios directos a la rama principal.

## Uso de IA

Codex apoyó implementación, pruebas, diagnóstico y documentación, y ejecutó las comprobaciones indicadas. La revisión y ejecución humana personal de Juan Andrés están pendientes; no se presentan los comandos de Codex como ejecución propia.
