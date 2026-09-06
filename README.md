# Inspecciones de laboratorio · Semana 1

Starter Next.js de la Actividad 1: consulta de tres inspecciones sintéticas, definición del producto y justificación de su trayectoria PWA.

Repositorio privado: [JAndres-MGonzalez/pwa-inspecciones-10A-E08](https://github.com/JAndres-MGonzalez/pwa-inspecciones-10A-E08).

Grupo **10A**, equipo **E08** (**10A-E08**). Los tres integrantes y sus matrículas están registrados en [evidence/individual.md](evidence/individual.md).

## Estado del trabajo

- Starter instalado y pantalla inicial inspeccionada en navegador: tres registros y sus valores esperados.
- `npm run verify` ejecutado con resultado técnico `pass`: estructura, prueba proporcionada y build.
- [Requisitos](docs/requirements.md) y [decisión PWA](docs/decision-record.md) preparados como propuestas para revisión del equipo.
- [Evidencia](evidence/individual.md) incluye la identificación de los tres integrantes y una sección por persona. Juan Andrés registró la instalación, los comandos ejecutados, los resultados y las limitaciones. Jose Ismael y Kevin Armando tienen pendiente registrar sus aportaciones.
- Cuenta del docente e integrantes de GitHub pendientes de indicar; no se han enviado invitaciones.

La aceptación de los documentos por el equipo, las dos secciones personales restantes y la revisión académica siguen pendientes. No se presenta el resultado técnico como calificación.

## Entorno comprobado

| Herramienta | Versión local |
|---|---|
| Sistema | Windows NT 10.0.26200.0 |
| Node.js | v26.4.0 |
| npm | 11.17.0 |
| Git | 2.55.0.windows.3 |
| Next.js del starter | 14.2.35 |
| React del starter | 18.3.1 |

La actividad admite Node 20.19 o posterior compatible y npm 10 o posterior. El workflow proporcionado usa Node **20.19.6**; sus resultados se comprueban por separado en Actions.

## Instalar y ejecutar

Desde la carpeta que contiene `package.json`:

```bash
npm ci
npm run dev
```

Abrir [localhost:3000](http://localhost:3000). Deben aparecer Redes (0 hallazgos), Electrónica (2) y Software (0), con alias ficticios Técnica A, Técnico B y Técnica C. Detener con Ctrl+C antes de verificar.

En PowerShell puede usarse `npm.cmd` para invocar directamente el ejecutable de npm. En esta sesión se utilizó `npm.cmd run dev -- --hostname 127.0.0.1`, limitando el servidor a la máquina local.

## Verificar

```bash
npm run verify
```

El comando comprueba archivos, ejecuta `tests/starter.spec.mjs` y compila; genera `reports/verification.json`. `make verify` es equivalente y Make no es necesario.

La prueba inicial comprueba que el script de build sea `next build` y que el archivo de página contenga el título y la mención de datos sintéticos. No renderiza, cuenta tarjetas, prueba accesibilidad ni valida offline. La inspección del navegador se documenta aparte.

Los resultados de instalación, verificación y los problemas encontrados están en [la bitácora](evidence/session-log.md). Se utilizan las pruebas y dependencias proporcionadas en el starter.

## Incidencias observadas

1. El primer `npm ci` falló con `EACCES` al descargar dependencias y escribir en la caché de npm por restricciones del entorno. El reintento autorizado terminó con código 0: 28 paquetes instalados y 29 auditados.
2. `npm audit --json` reportó **2 dependencias con severidad alta**, Next.js y PostCSS, y terminó con código 1. No significa que se haya demostrado explotación de esta pantalla. Se conserva el lockfile del starter para la actividad; hace falta revisar y corregir o justificar los avisos antes de publicar el servicio. No se ejecutó `npm audit fix --force`, que proponía un cambio de versión mayor.
3. Webpack emitió `Caching failed for pack: Error: Unable to snapshot resolve dependencies`. A pesar del aviso, la página respondió HTTP 200 y el build terminó con código 0. No se afirma que el aviso haya sido resuelto.
4. El reporte de una ejecución previa al commit tiene `commitSha: null` y árbol sin confirmar. El reporte entregable se regenera después del commit, con árbol limpio.

## Estructura

- `src/app/`: pantalla inicial y estilos.
- `src/lib/data/inspections.ts`: datos sintéticos.
- `docs/`: análisis de requisitos y decisión.
- `evidence/`: evidencia compartida e individual, con atribución explícita.
- `tests/` y `scripts/`: prueba y verificación proporcionadas.
- `.github/workflows/week-01-starter-feedback.yml`: workflow original del starter.
- `referencias/PWA-w01-kit-estudiante/`: kit descomprimido aparte para lectura, excluido de Git; no sobrescribe archivos del starter.
- `reports/`: salidas locales excluidas de Git.

## Límites y entrega

Todavía no existen manifest, service worker, instalación PWA, captura, persistencia offline, sincronización ni autenticación. Solo se usan datos ficticios. No versionar `.env`, credenciales, `node_modules`, `.next` ni reportes generados. Los nombres académicos de integrantes se limitan al repositorio privado y Classroom.

Seguir [ENTREGA.md](ENTREGA.md) para identificar la versión final. Después del último cambio personal o del equipo, crear el commit, hacer push, obtener `git rev-parse HEAD` y comprobar Actions sobre ese mismo SHA. Cada integrante entrega en Classroom el mismo repositorio y SHA, identificando su propia sección. El SHA final se copia después del último commit y no se incorpora dentro de otro commit.
