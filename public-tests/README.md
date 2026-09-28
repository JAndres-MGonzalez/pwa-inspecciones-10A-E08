# Public tests: w04-csr-ssr

Ejecuta `npm test` y después `bash public-tests/check.sh` desde la raíz del repositorio.
En Windows utiliza Git Bash (el `bash` de WSL requiere su propio entorno de Node).

- `files`: exige archivos no vacíos de la aplicación y los entregables de Semana 4.
- `cursors`: ejecuta el mismo comprobador de palabras que la verificación local.
- `tests`: exige el reporte de Semana 4 del SHA actual (`reports/week-04/tests.json`), con las
  cuatro suites presentes, no vacías y sin fallos. Debe regenerarse con `npm test`.
- `package`: comprueba que no se añadió vitest al paquete ni al lockfile.

Una comprobación fallida produce salida 1. Estos archivos están versionados;
`reports/` y las guías del equipo permanecen fuera de Git.

## Correcciones respecto de la guía

La comprobación de archivos usa `test -s` para verificar existencia y contenido. El estado de
las suites se valida en el reporte estructurado (`assignmentId`, `status`, SHA y cada suite),
no buscando palabras sueltas. Este es el verificador local del equipo, no una copia del kit
docente.

## Alcance del comprobador de palabras

`npm run check-secrets` revisa los archivos versionados y los nuevos no ignorados por Git;
omite binarios, este wrapper y el propio script. Conserva intacto el reporte histórico
`evidence/week-02/integration-check.json`. Acepta únicamente dos nombres literales conocidos:
el del comando requerido y el de la dependencia `js-tokens`. Las coincidencias se indican
con archivo y línea.