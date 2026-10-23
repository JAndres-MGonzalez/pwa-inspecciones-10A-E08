# Estrategia de pruebas · Semana 8

Actividad `w08-testing-ci`, equipo 10A-E08. Se conserva el mismo proyecto y se usan datos sintéticos.

## Diagnóstico y decisiones

La base de semana 6 tenía listado, detalle y capacidades opcionales, pero no captura ni almacenamiento que sobreviviera a recargar. Las pruebas en memoria no demostraban ese flujo. Se agregó `/captura`, validación compartida por formulario y API, y `LocalInspectionStore` sobre localStorage, reutilizando `InspectionStore` y `SyncQueue`.

La API `/api/inspecciones` es una demostración: guarda inspecciones y operaciones en memoria durante su ejecución, valida la clave `id::vN` y rechaza reutilizarla con otro contenido. El navegador guarda datos y cola antes de enviar. Un reintento después de perder una respuesta conserva una sola operación.

La guía inicial proponía HTTP. Se conservan esos ocho checks para las rutas, pero el flujo exigido se prueba además en Chrome/Edge sin ventana, con DOM y JavaScript reales. Se usa CDP local y el WebSocket incluido en la versión fijada de Next, sin dependencias npm nuevas ni cambios al lockfile. Referencia: [Chrome Headless](https://developer.chrome.com/docs/automation-and-testing/headless).

## Matriz de riesgos y pruebas

| Riesgo | Capa y archivo | Aserción principal |
|---|---|---|
| Captura inválida | `unit/captura-validacion.spec.ts` | Acepta datos válidos; rechaza resumen vacío, fechas inválidas o futuras, hallazgos fuera de rango y estado incoherente |
| Clave incorrecta o duplicado | `unit/schema-idempotencia.spec.ts` | Misma operación conserva clave; otra versión genera una diferente |
| Conflictos o respuestas tardías | `unit/sync-bordes.spec.ts`, `integration/sync-ciclo-completo.spec.ts` | Backoff y acuerdo entre claves, versiones y resolución |
| Pérdida offline al recrear almacenamiento | `integration/persistencia-captura.spec.ts` | Un almacén y una cola nuevos recuperan datos serializados; guardar offline no envía |
| Respuesta perdida después de aplicar el cambio | `integration/persistencia-captura.spec.ts` | Reintento con la misma clave, una sola operación en servidor simulado |
| API que acepta datos inválidos o sobreescribe | `integration/persistencia-captura.spec.ts` | 400 para captura inválida; 409 para otro contenido con la misma clave; repetición válida idempotente |
| Registro o actualización del SW | `integration/sw-registro.spec.ts` y suites históricas | Archivo real, registro degradado y limpieza selectiva de cachés |
| Pérdida al recargar o duplicado al reconectar | `e2e/captura-offline.spec.ts` | Crear → guardar offline → recargar → reconectar → sincronizar; una sola inspección local y remota |
| Capacidad ausente | `e2e/captura-offline.spec.ts` | Geolocalización ausente y captura completa todavía utilizable |
| Recurso o página inaccesible | `e2e/camino-critico.spec.ts` | Ocho peticiones HTTP: inicio, navegación, CSR, SSR, inexistente, manifest, SW y respaldo |

Las unitarias aíslan reglas con bajo costo y diagnóstico preciso. La integración comprueba contratos entre módulos. E2E se concentra en perder o duplicar datos desde la interfaz compilada; no repite en navegador cada valor de borde.

## Preparación, acciones y resultados esperados

Cada caso crea un perfil temporal nuevo y lo cierra al terminar. La suite inicia un servidor de producción en puerto libre, sin servicios privados.

1. **Inválida:** guardar con resumen vacío. Debe mostrar error y conservar cero registros.
2. **Offline:** visitar `/captura` online y esperar el SW. Cortar la red solo del navegador, llenar datos sintéticos y guardar. El servidor debe seguir con cero registros.
3. **Recarga:** recargar todavía offline. El SW entrega la página y localStorage conserva una inspección pendiente y su operación.
4. **Reintento:** reconectar y pulsar Sincronizar. El fixture CDP deja aplicar el POST y descarta su primera respuesta. La cola queda pendiente; avanzar el reloj inyectado y reintentar. Debe quedar sincronizada con un solo registro remoto. Sincronizar otra vez no agrega otro.
5. **Sin capacidad:** repetir el flujo con geolocalización ausente desde la carga, activar su botón y comprobar el respaldo antes de guardar.

Cada paso tiene aserciones; no se sustituye el E2E por buscar texto en el código. Los resultados observados están en `reports/w08-testing-ci/tests.json`, y las capturas, versiones y cobertura de navegador en `reports/w08-testing-ci/browser/`.

## Determinismo y aislamiento

- Reloj y azar inyectados en cola. El dataset usa la referencia fija `2026-10-22`, independiente del reloj del equipo.
- En navegador se fijan ID y `Date.now`. CDP corta la red del navegador; no se desconecta la computadora ni se solicitan permisos físicos.
- Las esperas comprueban condiciones del DOM con límite; no suponen que un trabajo terminó por haber dormido un tiempo fijo.
- El perfil nuevo y los IDs por caso evitan contaminación. La API se reinicia con el servidor de cada suite; los fixtures de integración se crean por comprobación.
- No se necesitan cuentas, imágenes ni coordenadas reales.

El detalle inexistente puede responder 200 por streaming. El check HTTP exige el texto de la página no encontrada y `NEXT_NOT_FOUND`; no supone un render visual a partir de esa respuesta.

## Defecto controlado y recuperación

Kevin quitó la versión de `idempotencyKey` y nueve checks detectaron el defecto. Ismael repitió esa rotura con su integración y fallaron doce. Se conservan sus resultados y atribuciones:

- Kevin: [fallo](../evidence/week-08/kevin-regresion-02-rotura-detectada.txt) y [recuperación](../evidence/week-08/kevin-regresion-03-restaurado.txt).
- Ismael: [fallo](../evidence/week-08/ismael-04-negativa-rota.txt) y [recuperación](../evidence/week-08/ismael-05-restaurado.txt).
- Juan Andrés: Codex quitó `start_url` del manifest en la rama temporal `codex/w08-regresion-http`: `manifest-accesible` falló con código 1. Restaurado el archivo, aprobaron los ocho checks. [Fallo](../evidence/w08/andres-http-fallo.txt) y [recuperación](../evidence/w08/andres-http-recuperacion.txt). No se integró el defecto.

Durante el arranque local de Edge se evitó su relanzamiento de compatibilidad para conservar la conexión con el proceso de prueba. Los perfiles son independientes del navegador personal; se cerraron normalmente los navegadores de prueba.

En Ubuntu se diagnosticaron limpieza prematura del perfil y arranque en frío:
[fallo inicial](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/actions/runs/39885027179)
y [diagnóstico de arranque](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/actions/runs/39885338490).
Se espera el cierre normal y se lee el puerto de depuración para comprobar disponibilidad,
con límite de 45 segundos. La limpieza temporal no oculta un error de la prueba.
La [recuperación en CI](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08/actions/runs/39885685342)
aprobó todas las etapas y conservó resultados y cobertura.

Codex comprobó además el adaptador persistente en una rama temporal: cambiar la serialización para guardar listas vacías hizo fallar recuperación y reintento. Restaurado el adaptador, los seis checks aprobaron. [Fallo](../evidence/w08/andres-persistencia-fallo.txt) y [recuperación](../evidence/w08/andres-persistencia-recuperacion.txt).

## Comandos reproducibles

Requisitos: Node 20.19.6 o posterior compatible, npm, Git, Chrome/Edge instalado y Git Bash en Windows. `CHROME_PATH` permite elegir el ejecutable. Si falta navegador, el E2E falla y no se omite. CI usa el Chrome instalado en Ubuntu.

```powershell
npm.cmd ci --ignore-scripts --no-audit --no-fund
node scripts/lint.mjs
node node_modules/typescript/bin/tsc --noEmit
npm.cmd run build
node scripts/test-with-coverage.mjs
npm.cmd run verify
& 'C:\Program Files\Git\bin\bash.exe' public-tests/check.sh
node scripts/evaluation-result.mjs
```

En Ubuntu se usa `npm`. `npm run verify` equivale exactamente a `make verify`: estructura, pruebas, barrido de información sensible, build y consistencia del reporte con HEAD. Se compila antes del primer test. `npm test` también ejecuta HTTP y navegador con inicio y cierre automático de servidores. No se compila sobre un servidor en uso.

Para usar un `npm run start` ya iniciado: definir `E2E_BASE_URL=http://127.0.0.1:3000`. Solo se admiten direcciones locales y quien inició ese servidor lo detiene con Ctrl+C. Sin esa variable, las suites gestionan sus procesos.

## CI, resultados y cobertura

`.github/workflows/academic-evaluation.yml` ejecuta instalación limpia, lint sintáctico JS/TS, tipos, build, navegador, pruebas con cobertura, verificación y chequeo público. No usa `continue-on-error`. Resumen y artefactos usan `always()` para conservar fallos. No se modifican los workflows históricos. El ZIP solo contenía instrucciones y plantilla; no incluía otro workflow original de semana 8.

El artefacto `academic-evidence-w08-testing-ci` contiene:

- `reports/w08-testing-ci/tests.json`: checks, suites, SHA y estado del árbol.
- `reports/verification.json`: verificación técnica; instalación por separado.
- `coverage/w08-*/` y `coverage-summary.json`: V8 de Node y resumen del JS identificable.
- `reports/w08-testing-ci/browser/`: capturas reales, versiones y cobertura precisa de JS del navegador.
- `evaluation-result.json`: resumen que falla si faltan reportes limpios del SHA actual, entregables, capas o los dos escenarios de interfaz.

La cobertura permite revisar código ejecutado y huecos. El TypeScript cargado con `new Function` y los bundles compilados no producen un porcentaje fiable de líneas de TypeScript original. No se presenta uno ni se fija un porcentaje arbitrario para aprobar.

## Límites

localStorage tiene cuota y puede borrarse; no reemplaza un respaldo. La API de demostración pierde su memoria al reiniciar y no es un backend multiusuario. Los adjuntos opcionales de semana 6 siguen siendo temporales. No se probaron IndexedDB, cámara/GPS físicos, despliegue ni accesibilidad integral. Sí se usa un SW real en navegador local, sin demostrar instalación en un teléfono ni desconexión física.

`master` exige PR incluso para administradores, sin push forzado ni borrado. Las evidencias de Kevin, Ismael y Juan Andrés permanecen separadas y con su autoría real.
