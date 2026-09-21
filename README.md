# Inspecciones de laboratorio · Semana 3

Proyecto del equipo **10A-E08** para consultar inspecciones y mantenimiento de laboratorios con datos sintéticos.

Repositorio: [pwa-inspecciones-10A-E08](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08).

## Estado de Semana 3

La aplicación muestra tres inspecciones de ejemplo, navegación, manifest, iconos y estados de carga, error y lista vacía. El layout registra `public/sw.js` con alcance `/`.

La revisión del Turno 3 encontró una integración incompleta: el Service Worker guarda `/` durante la instalación, pero no tiene un manejador de peticiones que devuelva contenido sin conexión. Existe `public/offline.html`, aunque todavía no se guarda ni se utiliza como respaldo en la versión integrada.

Faltan los entregables `docs/cache-strategy.md`, `tests/service-worker.spec.ts` y `tests/offline.spec.ts`. También falta `scripts/check-secrets.mjs`, indicado en la guía del equipo. No se considera terminada la entrega offline por obtener un resultado aprobado en las pruebas anteriores.

## Instalar y ejecutar

Requisitos: Git, Node.js 20.19.6 o posterior compatible y npm. Desde la carpeta del proyecto, en PowerShell:

```powershell
npm.cmd ci --ignore-scripts --no-audit --no-fund
npm.cmd run dev
```

Abrir [localhost:3000](http://localhost:3000). Detener con Ctrl+C antes de compilar. Para ejecutar la versión de producción:

```powershell
npm.cmd run build
npm.cmd run start
```

Los scripts disponibles son `dev`, `build`, `start`, `test` y `verify`. En otros sistemas se puede escribir `npm` en lugar de `npm.cmd`.

## Verificación

```powershell
npm.cmd run verify
bash public-tests/check.sh
```

`npm.cmd run verify` es el equivalente exacto de `make verify`: el Makefile llama a `npm run verify`. El script comprueba archivos, ejecuta las pruebas y compila. Genera `reports/verification.json`. El chequeo público necesita Git Bash y ripgrep en Windows.

| Comprobación | Estado de la integración revisada |
|---|---|
| Instalación con `npm.cmd ci --ignore-scripts --no-audit --no-fund` | 28 paquetes instalados; sin cambios en el lockfile |
| `npm.cmd test` | Nueve casos de manifest, estructura y estados de Semana 2 aprobados |
| Pruebas de Service Worker y offline | Archivos pendientes de integrar |
| Comprobador de secretos | Archivo pendiente de integrar |
| Chequeo público | Sigue siendo el de Semana 2; no contiene los cuatro casos de Semana 3 |

La verificación de Semana 3 debe ejecutar las pruebas del Service Worker, offline, el comprobador de secretos y el build. El verificador actual todavía identifica el reporte como `w02-shell-manifest`.

## Entorno del Turno 3

| Herramienta | Comprobación local | Workflow de Semana 3 |
|---|---|---|
| Sistema | Windows | Ubuntu de GitHub Actions |
| Node.js | 26.4.0 | 20.19.6 |
| npm | 11.17.0 | Versión incluida con Node.js en Actions |
| Git | 2.55.0.windows.3 | Versión del entorno de Actions |

## Decisiones y límites

La [nota de decisiones](docs/decision-record.md#semana-3--actualización-automática-y-caché) define el funcionamiento previsto: guardar los recursos de la aplicación, intentar la red primero para las páginas y disponer de un respaldo sin conexión. La primera preparación requiere conexión y que termine la instalación del Service Worker.

En la versión revisada, la activación elimina cualquier caché distinta de `shell-v1` y `runtime-v1`; falta limitar la limpieza a las cachés de esta aplicación. El cambio `0cf85bd` sustituyó el Service Worker anterior y retiró el manejo de peticiones y mensajes. Se registra el fallo para completar la integración.

Se usan únicamente inspecciones ficticias. No hay captura, almacenamiento de nuevos registros ni sincronización. Un build aprobado no comprueba el funcionamiento offline ni sustituye la revisión académica.

## Entrega Semana 3

El workflow `week-03-w03-service-worker-offline.yml` ejecuta instalación, build y pruebas al subir a `master`. Usa el contenido indicado en la guía. Los pasos opcionales de feedback no generan un reporte porque el proyecto no tiene `test:feedback`; por sí solos no acreditan la actividad.

La evidencia de cada integrante está en [evidence/individual.md](evidence/individual.md) y la bitácora en [evidence/session-log.md](evidence/session-log.md). Cada persona registra su propia contribución y sus pruebas.

Antes de entregar deben integrarse los archivos faltantes, comprobarse el offline y quedar Actions en verde. Para Classroom se entrega el enlace o SHA final del repositorio, dentro del plazo asignado. La guía del equipo también pide conservar la URL y la captura del run de Semana 3. Los reportes generados y la guía de trabajo se conservan fuera de Git.
