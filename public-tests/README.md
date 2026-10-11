# Public tests: w06-device-push

Ejecuta `npm test` y después `bash public-tests/check.sh` desde la raíz del repositorio.
En Windows utiliza Git Bash (el `bash` de WSL requiere su propio entorno de Node).

- `files`: exige archivos no vacíos de la aplicación y los entregables de Semana 6.
- `cursors`: ejecuta el mismo comprobador de palabras que la verificación local.
- `tests`: exige el reporte del SHA actual (`reports/w06-device-push/tests.json`), con **todas**
  las suites presentes en `tests/*.spec.ts`, no vacías y sin fallos. Debe regenerarse con
  `npm test`. Las rutas y la lista de suites salen de `src/lib/storage/schema.ts` y de los
  archivos presentes: nadie las escribe a mano.
- `package`: comprueba que no se añadió vitest al paquete ni al lockfile.
- `sync`: comprueba que el contrato expone los símbolos compartidos, que la clave de
  idempotencia es determinista y que distingue versiones, y que la migración descendente
  falla en vez de adivinar. Imprime cuántas suites de sincronización hay.
- `capabilities`: comprueba que el contrato de la Semana 6 expone sus tipos compartidos, carga de
  verdad los módulos de dispositivo que ya existan (`camera.ts`, `geolocation.ts`, `client.ts`),
  exige que no sean triviales y que exporten su firma, y ejecuta el fallback de la cámara sin
  API. El `if (existsSync)` separa "todavía no lo escribí" de "lo escribí mal".

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

| Momento | `files` y `verify.mjs` exigen | `check.sh` `capabilities:` exige |
|---|---|---|
| Arranque | `types.ts` y `capabilities.md`, más todo lo de w05 | símbolos del contrato; módulos solo si existen |
| Integración | además los tres módulos, las tres secciones y `tests/capabilities.spec.ts` | además, que no sean triviales, exporten su firma y el fallback degrade |

El `check.sh` docente **no** se copió, por dos motivos verificables: (1) su línea de comprobación
de palabras usa `rg`, que no está instalado en nuestras máquinas, y `scripts/check-secrets.mjs`
cubre exactamente el mismo patrón con el mismo alcance; (2) el kit trae un archivo de 7 líneas
que reemplazaría los checks de cinco semanas. Este es el verificador local del equipo, no una
copia del kit docente.

El workflow `week-06-w06-device-push.yml` queda fuera de este mecanismo: se agregó copiado sin
modificar y su `AC-02` exige los cinco artefactos desde el primer día (rojo hasta la integración,
verde solo). Los workflows no se editan.

## Lo que esta puerta no comprueba

- **No hay servidor.** La cola y la política se prueban contra un transporte simulado en
  memoria. Nada aquí demuestra que funcionen contra un backend real.
- **No hay IndexedDB.** La persistencia local usa `MemoryInspectionStore`. La interfaz
  `InspectionStore` declara el contrato, no la conexión real al navegador.
- **No comprueba Conflictos ni Reintentos todavía.** El bloque `sync:` valida el contrato
  compartido; el comportamiento de los Bloques B y C se valida cuando sus suites existan y
  mediante la suite de integración del sábado.
- **No es el verificador docente.** Este es el verificador local del equipo.
