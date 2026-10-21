/* tests/discover.cjs
 *
 * Unica fuente de verdad del descubrimiento de suites.
 *
 * La semana 8 agrega la piramide por capas (tests/unit, tests/integration, tests/e2e)
 * sin listas escritas a mano: quien deja una spec en su carpeta aparece sola en el
 * reporte. starter.spec.mjs, scripts/verify.mjs y public-tests/check.sh consumen esta
 * funcion; si cada uno escaneara por su cuenta, una suite nueva podria quedar fuera del
 * reporte sin que nadie lo notara (el mismo tipo de desincronizacion que endurecio la
 * puerta en la semana 5).
 */
const fs = require("node:fs");
const path = require("node:path");

/**
 * Ides historicos que NO coinciden con el nombre del archivo. Se conservan porque
 * `public-tests/check.sh` y la evidencia de w04 los referencian por nombre; renombrarlos
 * seria una regresion silenciosa. Las suites nuevas se derivan del nombre del archivo.
 */
const LEGACY_SUITE_IDS = { "manifest.spec.ts": "manifest02" };

/**
 * Capas de la piramide. Sus ids llevan prefijo "<capa>/<nombre>" para que nunca choquen
 * con los ids historicos de nivel superior.
 */
const LAYERS = ["unit", "integration", "e2e"];

/**
 * Escanea <root>/tests y devuelve [{ suiteId, file }] ordenado de forma estable.
 *
 * @param {string} root raiz del repositorio (no la carpeta tests)
 */
function discoverSuites(root) {
  const testsDir = path.join(root, "tests");
  const suites = [];
  const topLevel = fs.readdirSync(testsDir).filter((f) => f.endsWith(".spec.ts")).sort();
  for (const file of topLevel) {
    suites.push({ suiteId: LEGACY_SUITE_IDS[file] ?? file.replace(/\.spec\.ts$/, ""), file: `tests/${file}` });
  }
  for (const layer of LAYERS) {
    const dir = path.join(testsDir, layer);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".spec.ts")).sort();
    for (const file of files) {
      suites.push({ suiteId: `${layer}/${file.replace(/\.spec\.ts$/, "")}`, file: `tests/${layer}/${file}` });
    }
  }
  return suites;
}

module.exports = { discoverSuites, LEGACY_SUITE_IDS, LAYERS };
