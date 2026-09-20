# Inspecciones de laboratorio · Semana 2

Aplicación de ejemplo para consultar inspecciones de mantenimiento. Esta semana se integraron la estructura de navegación, el manifest, los iconos y los estados de carga, error y lista vacía.

Repositorio: [JAndres-MGonzalez/pwa-inspecciones-10A-E08](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08). Grupo **10A**, equipo **E08**. El repositorio está público por decisión del propietario; la actividad anterior lo solicitaba privado. Falta indicar la cuenta del docente para una invitación.

## Integrantes

| Matrícula | Nombre completo |
|---|---|
| 3523110131 | Medina González Juan Andrés |
| 3523110741 | Montalvo Lopez Jose Ismael |
| 3523110092 | Montalvo Marcial Kevin Armando |

## Qué funciona

- Encabezado, navegación principal, un área principal y un pie de página.
- Enlace «Saltar al contenido» usable con teclado y acceso a «Inspecciones recientes».
- Tres registros ficticios: Redes y Software sin hallazgos; Electrónica con dos.
- Manifest con nombre, colores, inicio y alcance en `/`, y presentación `standalone`.
- Iconos PNG de 192 y 512 píxeles, uno de 512 declarado maskable, e icono Apple de 180.
- Estado de carga con espera simulada de 700 ms, error con botón para reintentar y mensaje para una lista sin registros.

Kevin preparó la estructura y los estados. Ismael agregó el manifest, los iconos y la integración en el layout. Juan Andrés solicitó la integración final: comprobaciones, corrección de la navegación y de las áreas repetidas, workflow y evidencia. La [evidencia individual](evidence/individual.md) distingue las declaraciones personales y las comprobaciones automatizadas.

## Instalar y ejecutar

Requisitos: Git, Node.js 20.19 o posterior compatible y npm 10 o posterior. Desde la carpeta de `package.json`:

```powershell
npm.cmd ci
npm.cmd run dev
```

Abrir [localhost:3000](http://localhost:3000). Detener con Ctrl+C antes de compilar. En otros sistemas se puede usar `npm` en lugar de `npm.cmd`.

## Comprobar el proyecto

```powershell
npm.cmd run verify
```

Es el equivalente de `make verify`: comprueba los archivos, ejecuta la suite y compila. Genera `reports/verification.json` con el SHA, el estado del árbol, los resultados y los documentos. La prueba también genera `reports/week-02/tests.json`. Para ejecutar solo las pruebas: `npm.cmd test`; para compilar por separado: `npm.cmd run build`.

La suite ejecuta **nueve casos** en `tests/manifest.spec.ts`: contrato inicial, campos del manifest, dimensiones reales de PNG, área principal y pie únicos, destinos de navegación, tres inspecciones, estado vacío, carga y error con recuperación del cargador. `tests/starter.spec.mjs` es la entrada ya configurada en el starter. Un ayudante usa el TypeScript existente para ejecutar el spec y los componentes en Node 20, sin instalar dependencias ni mantener dos versiones de las mismas pruebas.

Los casos renderizan los componentes con React en memoria y sustituyen únicamente datos y tiempos dentro del proceso de pruebas. No modifican los datos de la aplicación. No comprueban todos los navegadores, instalación en un teléfono real, offline ni todos los aspectos de accesibilidad.

## Evidencia de integración

La primera ejecución detectó dos problemas: dos etiquetas `main` y un enlace sin destino. Con la misma suite, después de corregir la integración, pasaron los nueve casos. El registro del [antes y después](evidence/week-02/integration-check.json) identifica el commit de partida y los resultados reales.

La comprobación de navegador revisó 1280 × 900 y 320 × 800, tres tarjetas, un área principal, un pie, enlaces internos y el foco del teclado. Las capturas y observaciones están en [el reporte de Juan Andrés](evidence/week-02/reports/3523110131.md). Estas comprobaciones las ejecutó Codex; no sustituyen la revisión personal del integrante.

El 13 de septiembre Juan Andrés ejecutó personalmente `npm.cmd run verify` sobre la integración: nueve pruebas y build aprobados, con el árbol de Git limpio. Su [registro de ejecución](evidence/session-log.md#verificación-personal-de-juan-andrés--semana-2) conserva la fecha y el SHA comprobado.

## Entornos registrados

| Herramienta | Juan Andrés, Semana 1 | Kevin, Semana 2 | Ismael, Semana 1 | Integración automatizada, Semana 2 |
|---|---|---|---|---|
| Sistema | Windows | Windows | Windows | Windows |
| Node.js | 26.4.0 | 22.22.0 | 24.20.0 | 26.4.0 |
| npm | 11.17.0 | 10.9.4 | 11.19.0 | 11.17.0 |
| Git | 2.55.0.windows.3 | 2.47.0.windows.2 | 2.55.0.windows.3 | 2.55.0.windows.3 |

Next.js permanece en 14.2.35 y React en 18.3.1. Se conservan `package.json` y el lockfile. El workflow de Semana 1 utiliza Node 20.19.6; el de Semana 2 conserva la configuración del kit y usa el entorno de GitHub.

## Comprobación pública e incidencias

El comando `bash public-tests/check.sh` necesita Bash y ripgrep. Se conserva exactamente el script del kit. En la integración imprimió coincidencias de palabras en documentación y en la dependencia `js-tokens`, y después `PUBLIC_OK`, con código 0. La negación de la búsqueda evita que `set -e` interrumpa el script; por tanto, ese código no demuestra que la búsqueda no encontrara coincidencias. Se registra esta limitación sin cambiar el comprobador ni retirar una dependencia para ocultar el resultado.

La instalación actual añadió 28 paquetes y auditó 29. `npm audit` informó una dependencia de severidad alta (PostCSS) y una crítica (Next.js). Son los resultados del momento de esta integración; las dos alertas altas anotadas en Semana 1 corresponden a aquella fecha. No se ejecutó una actualización mayor forzada. Los resultados completos están en `reports/week-02/` de la copia local.

El comportamiento sin conexión, almacenamiento, sincronización, autenticación y notificaciones siguen fuera de esta entrega. No hay service worker. La presencia del manifest por sí sola no acredita todas las condiciones de instalación en cada navegador. La visualización móvil comprobada es un viewport de navegador, no un ensayo en un teléfono físico.

## Entrega

La actividad PWA de Semana 2 usa el mismo repositorio y el commit fijado en Classroom. El kit no utiliza los comandos ni la etiqueta de CampusOps.

Después del último commit, usar su SHA completo y la ejecución **Academic Evaluation Feedback** de ese mismo SHA. El workflow **Starter Semana 1 — feedback** se conserva y ejecuta el verificador actualizado, que produce el reporte descargable `starter-week-01-evidence`. El workflow de Semana 2 puede no producir artefacto, porque sus checks no generan las rutas que declara para subir.

Cada integrante entrega sus enlaces e identifica su propia sección en `evidence/individual.md`. El SHA del reporte debe coincidir y `workingTreeClean` debe ser `true`. Los reportes generados se mantienen fuera de Git. No se deben enviar `.env`, `node_modules` ni `.next`.

## Semana 3 · Service worker, caché y modo sin conexión

Esta sección reemplaza la afirmación «No hay service worker» de la Semana 2: desde la Semana 3 la app registra un service worker y ofrece una página de respaldo sin conexión.

### Qué se entrega

| Pieza | Archivo | Autor |
|---|---|---|
| Service worker | `public/sw.js` | Kevin (Turno 1, commit d7a92e4) |
| Registro | `src/lib/pwa/register-service-worker.ts`, `src/components/register-sw.tsx` | Kevin (Turno 1) |
| Página sin conexión | `public/offline.html` | Kevin (Turno 1) |
| Estrategia de caché | `docs/cache-strategy.md` | Ismael |
| Pruebas | `tests/service-worker.spec.ts`, `tests/offline.spec.ts`, `tests/sw-harness.ts`, `tests/pwa.spec.mjs` | Ismael |

### Instalar y ejecutar

Ejecutar `npm ci`, luego `npm run build` y `npm run start`, y abrir localhost:3000. Para probar el service worker conviene usar el build de producción y no `npm run dev`, para no mezclar cachés del modo desarrollo.

### Verificar

Ejecutar `npm ci` y después `npm run verify`. Es el equivalente exacto de `make verify` (en Windows `make` puede no estar instalado). `npm test` corre las pruebas del starter y las de esta semana.

### Pruebas automatizadas

Se agregaron **12 casos**. Cargan `public/sw.js` en Node con `caches`, `fetch` y `self` simulados, y disparan los eventos `install`, `activate`, `fetch` y `message`.

- `tests/service-worker.spec.ts` (5): precaché al instalar, limpieza de cachés viejas con el prefijo propio, mensaje `SKIP_WAITING`, mensaje `PURGE_CACHES` y exportación del módulo de registro.
- `tests/offline.spec.ts` (7): existencia de `offline.html`, página visitada servida sin red, respaldo para una ruta nueva, respuesta 503 si no hay respaldo, stale-while-revalidate para `/_next/static/`, cache-first para otros recursos y peticiones que no se interceptan (POST, `/api/*`, `Authorization`, otros orígenes).

### Comprobación manual en el navegador

ESCRIBE que viste en la prueba manual: estado del service worker, cachés, app sin conexión, ruta inventada

### Evidencia

- Commit de las pruebas: `e6e5617639c0252a4ff3443d1da6762149730d3c`.
- Commit de la documentación de la estrategia: `9b7620826c4d29c66298e2fc1705c2f8b562df2b`.
- Estado verificado (`npm test` y `npm run verify` en pass el 2026-09-20): `5be4aabb89503fcc5a88180b652544474d1d4d94`.
- Ejecución de GitHub Actions: ESCRIBE la URL de la ejecucion de Actions en verde
- Detalle y declaración de IA: sección «Semana 3» de Ismael en [evidence/individual.md](evidence/individual.md).
- Estrategia documentada: [docs/cache-strategy.md](docs/cache-strategy.md).

### Límites y riesgos abiertos

- Las pruebas simulan el navegador: verifican la lógica de `sw.js`, no el comportamiento de un navegador real. Eso se comprobó a mano.
- No hay sincronización de inspecciones creadas sin conexión.
- Riesgos detectados en `sw.js` (detalle en `docs/cache-strategy.md`): `install` llama a `skipWaiting()`, por lo que una versión nueva se activa sin avisar al usuario, y todo GET del mismo origen fuera de `/_next/static/` usa cache-first.