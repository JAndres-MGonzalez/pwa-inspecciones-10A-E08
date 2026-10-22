# Estrategia de pruebas · Semana 8

Actividad `w08-testing-ci`, equipo 10A-E08. Se conserva la PWA de la semana 6.

## Diagnóstico y alcance

La base de Kevin, commit `f0ef1f268893da2b3d59ecd334a4f7c76533a343`, aprobó instalación,
168 comprobaciones en 15 suites, build, verificación y chequeo público durante la revisión
de integración ejecutada por Codex. Se integró mediante el PR #21, sin push directo a master.

La aplicación permite consultar inspecciones sintéticas y adjuntar evidencia temporal al
detalle. No tiene formulario para crear inspecciones, adaptador persistente de navegador ni
servidor de sincronización. `MemoryInspectionStore` pierde sus datos al terminar el proceso.
Recrear una cola sobre el mismo objeto en memoria no demuestra que una recarga conserve datos.

La consigna `ACTIVIDAD.txt` pide un E2E desde la interfaz. La guía del Bloque C propone HTTP
sin navegador; ese alcance permite revisar las rutas, pero no sustituye el flujo solicitado.
Por eso se publica un avance y el reporte de cierre devuelve `incomplete` mientras falte
evidencia automatizada del flujo. El verde de las pruebas existentes no equivale a terminar
la semana.

## Matriz de riesgos y capas

| Riesgo | Capa y archivo | Aserción o límite actual |
|---|---|---|
| Captura inválida | Unitaria; pendiente de una regla de validación consumida por el formulario | Las unitarias de Kevin comprueban campos del dataset, no rechazan una captura inválida del usuario |
| Clave incorrecta o reintento duplicado | `tests/unit/schema-idempotencia.spec.ts` | Misma operación conserva su clave; cambiar versión genera otra |
| Migración o conflicto que pierde información | `tests/unit/sync-bordes.spec.ts`, `tests/unit/schema-idempotencia.spec.ts` | Conservación de campos, copias y resolución de conflictos con valores de borde |
| Datos personales en ejemplos | `tests/unit/dataset-sintetico.spec.ts` | Aserciones sobre los valores del dataset sintético; no es una revisión integral de privacidad |
| Pérdida al guardar offline o recargar | Integración, Bloque B pendiente | Las suites históricas de sync comprueban rehidratación en memoria, no almacenamiento durable |
| Respuesta remota repetida o desordenada | `tests/sync.cola.spec.ts`, `tests/sync.spec.ts`; falta la integración nueva | Transporte simulado, claves y versiones; sin servicio privado |
| Caché o actualización del SW incorrecta | `tests/service-worker.spec.ts`, `tests/offline.spec.ts`; integración nueva pendiente | Harness en memoria; no prueba un SW registrado en dispositivo |
| Permiso denegado o API ausente | `tests/capabilities*.spec.ts` | Dobles de cámara, ubicación y notificaciones; se conservan los respaldos |
| Página o recurso inaccesible | `tests/e2e/camino-critico.spec.ts` | Ocho peticiones HTTP contra producción: inicio, enlace, CSR, SSR, inexistente, manifest, SW y respaldo |
| Crear → offline → recargar → reconectar → sincronizar una sola vez | E2E de interfaz pendiente | No existe todavía una prueba de ese flujo ni de completar la captura con una capacidad ausente |

Se usan unitarias para aislar reglas de bajo costo y diagnóstico preciso; integración para
contratos entre almacenamiento, cola y transporte; HTTP para detectar fallos de rutas y de
compilación servida. La selección sigue el riesgo de perder o duplicar datos, el costo y la
posibilidad de repetir el caso con el mismo resultado.

## Determinismo y aislamiento

- Las pruebas de cola usan reloj y fuente aleatoria inyectados y transportes falsos.
- Los datos de inspecciones y permisos son sintéticos; no se necesitan cuentas, GPS ni cámara.
- Las pruebas HTTP solo llaman a un servidor local. La compilación se hace antes de probar.
  El servidor se inicia una vez por suite en puerto libre y se cierra en `finally`.
- No hay pausas arbitrarias: el inicio se detecta mediante un evento y hay límites de tiempo
  para arranque y peticiones. Esos límites son controles del entorno, no el reloj de negocio.
- La prueba heredada de fechas del dataset usa el día del sistema. Es una limitación del
  Bloque A que debe cambiar a una fecha de referencia inyectada para ser completamente fija.

El detalle inexistente puede responder 200 por streaming. El check exige el texto de la
página no encontrada y el marcador `NEXT_NOT_FOUND` de la respuesta; no supone que el texto
ya se haya pintado en pantalla sin ejecutar JavaScript.

## Fallo y recuperación

Kevin dejó la demostración de `idempotencyKey`: quitar la versión de la clave hizo fallar
nueve comprobaciones; al restaurarla regresaron al verde. Salidas originales:

- [Línea base](../evidence/week-08/kevin-regresion-01-linea-base.txt).
- [Defecto detectado](../evidence/week-08/kevin-regresion-02-rotura-detectada.txt).
- [Recuperación](../evidence/week-08/kevin-regresion-03-restaurado.txt).
- [Prueba negativa de la puerta](../evidence/week-08/kevin-regresion-04-prueba-negativa-puerta.txt).

Es evidencia proporcionada por Kevin; no se atribuye a Juan Andrés. La integración nueva y
la prueba negativa de Ismael todavía no están publicadas. No se inventan resultados para ellas.
La prueba negativa HTTP de Juan Andrés se registra en [su evidencia](../evidence/w08/juan-andres.md).

## Ejecución

En Windows se usa `npm.cmd`; en Ubuntu, `npm`. Node local y Node de CI se registran por separado.

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

`npm run verify` es el equivalente exacto de `make verify`: estructura, suite completa,
barrido de información sensible, build y consistencia del reporte con HEAD. En un clon
nuevo se compila primero porque HTTP usa el build de producción. Las pruebas también se
pueden repetir con `npm test`; no descargan navegador ni agregan dependencias.

Con un servidor externo: primera terminal `npm run start`; segunda terminal, en PowerShell:

```powershell
$env:E2E_BASE_URL = 'http://127.0.0.1:3000'
npm.cmd test
Remove-Item Env:E2E_BASE_URL
```

Quien inició ese servidor lo detiene con Ctrl+C. Sin esa variable, la suite gestiona su propio
servidor. No se omiten pruebas si falla el inicio o falta `.next/BUILD_ID`.

## CI y reportes

Se usa un solo workflow nuevo: `.github/workflows/academic-evaluation.yml`. Ejecuta instalación,
lint de sintaxis JS/TS, comprobación de tipos, build, pruebas con cobertura, verificación y
chequeo público. Una etapa obligatoria fallida conserva su error; no se usa `continue-on-error`.
El reporte y la subida de artefactos usan `always()` para conservar evidencia también del fallo.

El ZIP recibido contiene `ACTIVIDAD.txt` y `PLANTILLA-EVIDENCIA.md`; no incluye el workflow
`week-08-w08-testing-ci.yml` que menciona la guía. No se fabrica una copia atribuida al kit ni
se duplica el workflow equivalente del equipo. Los workflows anteriores permanecen intactos.

- `reports/w08-testing-ci/tests.json`: resultados de cada comprobación, capas y SHA.
- `reports/verification.json`: instalación por separado, verificación técnica y árbol limpio.
- `coverage/w08-*/`: cobertura V8 real de la ejecución de Node.
- `reports/w08-testing-ci/coverage-summary.json`: funciones JS identificadas por archivo.
- `evaluation-result.json`: resumen de los reportes; rechaza reportes ausentes, fallidos,
  sucios o de otro SHA, capas vacías y ausencia de los dos escenarios E2E del flujo solicitado.

Los escenarios del flujo se identifican en el reporte por
`crear-offline-recargar-sincronizar-sin-duplicar` y `captura-con-capacidad-no-disponible`.
Deben contener acciones y aserciones reales sobre la interfaz; el nombre de un check por sí
solo no demuestra el comportamiento y se revisa su implementación antes de cerrar.

V8 permite guardar cobertura sin otra dependencia. El cargador de TypeScript usa
`new Function` sin mapas a los archivos originales: el resumen corresponde a JS del runner y
auxiliares y no ofrece un porcentaje fiable de `src/`. Los JSON crudos se conservan para
inspección. Faltan cobertura atribuida al TypeScript, IndexedDB real, navegador, accesibilidad
automatizada y la prueba E2E de recarga. Son huecos declarados, no verificaciones aprobadas.

## Regla de integración

`master` requiere PR incluso para administradores; no permite push forzado ni borrado. La
regla no exige un número automático de aprobaciones: la revisión técnica se registra en los
PR del equipo. Cada integrante conserva la autoría y su evidencia individual. El avance de
Juan Andrés se publica en su propia rama para no modificar la rama de Kevin.
