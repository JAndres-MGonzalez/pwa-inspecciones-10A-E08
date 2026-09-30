# Public tests: w05-sync-data

Ejecuta `npm test` y después `bash public-tests/check.sh` desde la raíz del repositorio.
En Windows utiliza Git Bash (el `bash` de WSL requiere su propio entorno de Node).

- `files`: exige archivos no vacíos de la aplicación y los entregables de Semana 5.
- `cursors`: ejecuta el mismo comprobador de palabras que la verificación local.
- `tests`: exige el reporte del SHA actual (`reports/w05-sync-data/tests.json`), con **todas**
  las suites presentes en `tests/*.spec.ts`, no vacías y sin fallos. Debe regenerarse con
  `npm test`. Las rutas y la lista de suites salen de `src/lib/storage/schema.ts` y de los
  archivos presentes: nadie las escribe a mano.
- `package`: comprueba que no se añadió vitest al paquete ni al lockfile.
- `sync`: comprueba que el contrato expone los símbolos compartidos, que la clave de
  idempotencia es determinista y que distingue versiones, y que la migración descendente
  falla en vez de adivinar. Imprime cuántas suites de sincronización hay.

Una comprobación fallida produce salida 1. Estos archivos están versionados;
`reports/` y las guías del equipo permanecen fuera de Git.

## Correcciones respecto de la guía

La comprobación de archivos usa `test -s` para verificar existencia y contenido. El estado de
las suites se valida en el reporte estructurado (`assignmentId`, `status`, SHA y cada suite),
no buscando palabras sueltas. Este es el verificador local del equipo, no una copia del kit
docente.

Desde la Semana 5 el reporte se escribe en `reports/<ASSIGNMENT_ID>/tests.json` y el
identificador se lee de `src/lib/storage/schema.ts`. Antes cada transición de semana obligaba a
editar a mano la misma ruta y el mismo identificador en dos archivos distintos; en w03 → w04
fueron ocho valores. Ahora se edita un contrato.

El identificador de suite se deriva del nombre del archivo, con una excepción declarada
(`manifest.spec.ts` → `manifest02`) porque `check.sh` y la evidencia de la Semana 4 lo citan
por nombre. Renombrarlo sería una regresión silenciosa.

## Alcance del comprobador de palabras

`npm run check-secrets` revisa los archivos versionados y los nuevos no ignorados por Git;
omite binarios, este wrapper y el propio script. Conserva intacto el reporte histórico
`evidence/week-02/integration-check.json`. Acepta únicamente dos nombres literales conocidos:
el del comando requerido y el de la dependencia `js-tokens`. Las coincidencias se indican
con archivo y línea.

## Qué exige la puerta y cuándo

Durante la semana la puerta se endurece por etapas, para no dejar `master` en rojo mientras los
tres integrantes entregan en paralelo:

| Momento | `files` y `verify.mjs` exigen | `check.sh` `sync:` exige |
|---|---|---|
| Arranque (lunes) | contrato, política y las tres secciones | símbolos del contrato, comportamiento de la clave y de la migración |
| Integración (sábado) | además `queue.ts`, `conflict-policy.ts` y `sync.spec.ts` | además, que esos archivos no sean triviales |

El bloque `sync:` acepta los tres artefactos del Bloque B y C **si ya existen** y valida que
tengan contenido real; si no existen, no falla. Eso separa "todavía no lo escribí" de "lo
escribí mal". En la entrega los tres están.

El workflow `.github/workflows/week-05-w05-sync-data.yml` queda fuera de este mecanismo: se agregó
copiado sin modificar del kit de la actividad y su `AC-02` exige los cinco artefactos desde el
primer día. Saldrá en rojo mientras la actividad no esté terminada y se pondrá verde el sábado por
sí solo. Los workflows del profesor no se editan.

## Lo que esta puerta no comprueba

- **No hay servidor.** La cola y la política se prueban contra un transporte simulado en
  memoria. Nada aquí demuestra que funcionen contra un backend real.
- **No hay IndexedDB.** La persistencia local usa `MemoryInspectionStore`. La interfaz
  `InspectionStore` declara el contrato, no la conexión real al navegador.
- **No comprueba Conflictos ni Reintentos todavía.** El bloque `sync:` valida el contrato
  compartido; el comportamiento de los Bloques B y C se valida cuando sus suites existan y
  mediante la suite de integración del sábado.
- **No es el verificador docente.** Este es el verificador local del equipo.
