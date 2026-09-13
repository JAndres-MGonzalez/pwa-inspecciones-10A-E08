const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");

// Ejecuta componentes reales con el TypeScript incluido en el starter.
// Las sustituciones de datos solo existen dentro de cada prueba.
function loadSource(entry, overrides = {}, cache = new Map()) {
  const base = path.resolve(root, entry);
  const filename = [base, `${base}.ts`, `${base}.tsx`].find(fs.existsSync);
  if (!filename) throw new Error(`Módulo no encontrado: ${entry}`);
  const key = path.relative(root, filename).replaceAll(path.sep, "/");
  if (Object.hasOwn(overrides, key)) return overrides[key];
  if (cache.has(filename)) return cache.get(filename).exports;
  if (filename.endsWith(".css")) return {};
  const nativeRequire = createRequire(filename);
  if (!/\.tsx?$/.test(filename)) return nativeRequire(filename);
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    fileName: filename,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true
    }
  });
  const module = { exports: {} };
  cache.set(filename, module);
  const localRequire = (name) => name.startsWith(".") || name.startsWith("@/")
    ? loadSource(name.startsWith("@/") ? path.join(root, "src", name.slice(2)) : path.resolve(path.dirname(filename), name), overrides, cache)
    : nativeRequire(name);
  new Function("require", "module", "exports", "__filename", "__dirname", compiled.outputText)(
    localRequire, module, module.exports, filename, path.dirname(filename)
  );
  return module.exports;
}
module.exports = { loadSource };
