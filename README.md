# Inspecciones de laboratorio · Semana 4

Proyecto del equipo **10A-E08** para consultar inspecciones y mantenimiento de laboratorios con datos sintéticos.

Repositorio: [pwa-inspecciones-10A-E08](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08).

## Estado de Semana 4

La página principal muestra tres inspecciones de ejemplo y enlaces al detalle. El listado `/inspecciones` carga los datos en el cliente (CSR), con estados de carga, error con reintento y vacío. Muestra el tiempo de carga de los datos en milisegundos. El detalle `/inspecciones/[id]` obtiene los datos en el servidor (SSR) e incluye el contenido en el HTML inicial.

Se conservan el manifest, los iconos y el Service Worker. La primera preparación offline requiere conexión y la instalación completa del worker. No hay captura ni sincronización de nuevas inspecciones.

Las rutas, las cuatro suites y el verificador de Semana 4 están integrados. La [decisión de renderizado](docs/rendering-decision.md) compara CSR y SSR; el [registro del Turno 3](evidence/session-log.md#turno-3-de-juan-andrés--semana-4) conserva los resultados y las correcciones de integración.

## Instalar y ejecutar

Requisitos: Git, Node.js 20.19.6 o posterior compatible y npm. En PowerShell:

```powershell
npm.cmd ci --ignore-scripts --no-audit --no-fund
npm.cmd run dev
```

Abrir [localhost:3000](http://localhost:3000). Detener con Ctrl+C antes de compilar. Para ejecutar en producción:

```powershell
npm.cmd run build
npm.cmd run start
```

En otros sistemas se puede escribir `npm` en lugar de `npm.cmd`. Los scripts disponibles son `dev`, `build`, `start`, `test`, `check-secrets` y `verify`.

## Verificación

```powershell
npm.cmd run verify
bash public-tests/check.sh
```

`npm.cmd run verify` es el equivalente exacto de `make verify`: el Makefile llama a `npm run verify`. El script comprueba archivos, ejecuta las suites, revisa palabras sensibles y compila. Genera `reports/verification.json`. En Windows, el chequeo público requiere Git Bash y Node.

| Comprobación | Alcance |
|---|---|
| Instalación | 28 paquetes instalados sin modificar el lockfile |
| `npm.cmd test` | 45 casos: 9 de manifest y estructura, 20 del Service Worker, 7 de offline y 9 de renderizado; reporte en `reports/week-04/tests.json` |
| `npm.cmd run check-secrets` | Barrido de palabras con las excepciones documentadas en `public-tests/README.md` |
| `npm.cmd run verify` | Estructura, cuatro suites, barrido y build; reporte `w04-csr-ssr` |
| Chequeo público de Semana 4 | `files`, `cursors`, `tests` y `package`; devuelve `PUBLIC_OK` cuando todos aprueban |

La revisión del Turno 2 aprobó las 45 pruebas, la compilación y los cuatro chequeos públicos. El total incluye una prueba del límite de caché añadida por Kevin. Los reportes se regeneran después de cambiar el código y deben corresponder al SHA revisado. Un resultado del verificador anterior de Semana 3 no acredita Semana 4.

## Entorno del Turno 3

| Herramienta | Comprobación local | Workflow de Semana 4 |
|---|---|---|
| Sistema | Windows | Ubuntu de GitHub Actions |
| Node.js | 26.4.0 | 20.19.6 |
| npm | 11.17.0 | Incluido con Node.js en Actions |
| Git | 2.55.0.windows.3 | Incluido en el entorno de Actions |

## Decisiones y límites

La [nota de decisiones](docs/decision-record.md#semana-4--renderizado-csr-para-listado-y-ssr-para-detalle) explica el listado CSR y el detalle SSR. El listado empieza en estado de carga y utiliza `useEffect` para obtener los datos. El detalle usa `force-dynamic` y `notFound()` cuando el identificador no existe. Con el streaming de Next.js, mostrar la página de no encontrado no garantiza un estado HTTP 404.

La medición del listado usa `performance.now()` y depende del equipo; incluye los 700 ms de espera del cargador sintético. El build de la integración registró First Load JS de 97.6 kB para el listado y 96.1 kB para el detalle. Estos tamaños no son tiempos de carga. Comparar dos renderizados con ReactDOMServer comprueba que el HTML inicial es repetible; no ejecuta la hidratación de un navegador.

## Entrega Semana 4

El workflow `week-04-w04-csr-ssr.yml` ejecuta instalación, build y pruebas al subir a `master` y en los pull requests dirigidos a `master`. Los pasos opcionales de feedback no producen un reporte porque no existe el script `test:feedback`; no acreditan la actividad por sí solos.

La [evidencia individual](evidence/individual.md) y la [bitácora](evidence/session-log.md) mantienen las aportaciones separadas. Cada integrante debe completar su revisión personal, enlace al PR y datos de integración reales.

Kevin revisa y mergea el PR del Turno 3. Después se comprueban los cuatro workflows sobre el SHA del merge y se entrega en Classroom el enlace o SHA final, dentro del plazo asignado. La guía y los reportes generados se conservan fuera de Git.
