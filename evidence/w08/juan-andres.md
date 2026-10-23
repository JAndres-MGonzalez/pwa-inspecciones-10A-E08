# Semana 8 · Juan Andrés

- **Nombre:** Medina González Juan Andrés.
- **Matrícula:** 3523110131.
- **Grupo y equipo:** 10A-E08.

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

Comprobaciones ejecutadas por Codex el 22 de octubre de 2026 en Windows, Node v26.4.0 y Edge 155.0.4283.62. GitHub Actions confirmó los resultados en Ubuntu con Node 20.19.6 y Chrome 155.0.8059.39.

- `npm.cmd ci --ignore-scripts --no-audit --no-fund`: instalación limpia aprobada.
- `npm.cmd run build`: compilación aprobada, con `/captura` y `/api/inspecciones`.
- `node scripts/test-with-coverage.mjs`: 200 comprobaciones en 21 suites aprobadas, con cobertura V8 y de navegador.
- `npm.cmd run verify`: resultado `pass`, con build, pruebas y revisión de archivos sensibles aprobados. Es el equivalente de `make verify`, porque ese objetivo del Makefile ejecuta `npm run verify`.
- `bash public-tests/check.sh`: resultado `PUBLIC_OK`.
- Escenarios E2E: rechazar captura inválida; guardar offline, recargar, reconectar y reintentar sin duplicar; repetir con geolocalización ausente.
- Se descarta la primera respuesta de un POST ya aplicado. Se observa un registro remoto antes y después del reintento y una sola inspección local.

Los comandos exactos y la correspondencia por capa están en [la estrategia](../../docs/test-strategy.md). El cierre exige reportes del SHA actual, árbol limpio, entregables y escenarios E2E aprobados. Los reportes generados se adjuntan o descargan de Actions; no se versionan dentro del commit que identifican.

## CI de la integración

La versión integrada comprobada antes de este cierre documental es
[`50b44edd40f769e63503613dbc2593b459ea2ea2`](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/commit/50b44edd40f769e63503613dbc2593b459ea2ea2).
[Actions 39886721439](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/actions/runs/39886721439)
aprobó instalación, lint, tipos, build, navegador, pruebas, verificación, chequeo público y reporte.
Las seis ejecuciones de Actions de esa versión terminaron correctamente.

El [artefacto de resultados y cobertura](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/actions/runs/39886721439/artifacts/12473356103)
contiene `verification.json` con `status: pass`, `workingTreeClean: true` y ese mismo SHA.
El resumen registra 200 comprobaciones en 21 suites: cuatro suites unitarias, tres de
integración, dos E2E y doce de las semanas anteriores. El cierre técnico indica `pass`.

Se conserva el [registro de la comprobación anterior](andres-ci-integracion.json).
Después de integrar esta actualización documental, el TXT de entrega y los adjuntos se
generan con el nuevo SHA y su ejecución de Actions.

Dos ejecuciones anteriores detectaron problemas del auxiliar en Ubuntu: limpieza del perfil
antes del cierre completo y arranque en frío con límite insuficiente. Se esperó el cierre
normal y se detecta el puerto real del navegador con límite de 45 segundos. No se omitieron
escenarios ni se ocultó un fallo del flujo.

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

Codex (OpenAI): apoyo en código, pruebas y documentación. Las comprobaciones técnicas fueron ejecutadas por Codex y GitHub Actions. Validación personal de Juan Andrés: pendiente.
