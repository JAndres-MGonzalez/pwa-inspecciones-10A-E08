# Public tests: w03-service-worker-offline

Ejecuta `npm test` y después `bash public-tests/check.sh` desde la raíz del repositorio.
En Windows utiliza Git Bash (el `bash` de WSL requiere su propio entorno de Node).

- `files`: exige archivos no vacíos de la aplicación y los entregables de Semana 3.
- `cursors`: ejecuta el mismo comprobador de palabras que la verificación local.
- `tests`: exige el reporte de Semana 3 del SHA actual, con las tres suites presentes,
  no vacías y sin fallos. Debe regenerarse después de modificar el código.
- `package`: comprueba que no se añadió vitest al paquete ni al lockfile.

Una comprobación fallida produce salida 1. Estos archivos están versionados;
`reports/` y la guía del equipo permanecen fuera de Git.

## Correcciones respecto de la guía

La búsqueda de nombres dentro del contenido no comprueba si un archivo existe:
se usa `test -s` para verificarlo directamente. Tampoco basta encontrar la palabra
offline en un JSON: se validan el resultado y las comprobaciones de cada suite.
No se dispone del kit original de Semana 3 en este checkout; este es el verificador
local del equipo, no una copia certificada del kit docente.

## Alcance del comprobador de palabras

`npm run check-secrets` revisa los archivos versionados y los nuevos no ignorados
por Git; omite binarios, este wrapper y el propio script. Conserva intacto el
reporte histórico `evidence/week-02/integration-check.json`, que contiene salidas
originales de herramientas. Acepta únicamente dos nombres literales conocidos:
el del comando requerido y el de la dependencia `js-tokens`. Los demás contenidos
del lockfile, JSON y documentación sí se revisan. Las coincidencias se indican
por archivo y línea sin imprimir su contenido. No constituye una auditoría de
credenciales ni examina el historial de Git.

