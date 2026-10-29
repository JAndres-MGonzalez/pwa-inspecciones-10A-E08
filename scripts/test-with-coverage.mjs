import { mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { loadSource } from "../tests/source-loader.cjs";

const { ASSIGNMENT_ID } = loadSource("src/lib/storage/schema.ts");

mkdirSync("coverage", { recursive: true });
const directory = mkdtempSync(resolve("coverage", `${ASSIGNMENT_ID}-`));
const run = spawnSync(process.execPath, ["tests/starter.spec.mjs"], {
  stdio: "inherit", env: { ...process.env, NODE_V8_COVERAGE: directory }
});
const prefix = pathToFileURL(resolve(".")).href + "/";
const files = [];
for (const name of readdirSync(directory).filter((file) => file.endsWith(".json"))) {
  const raw = JSON.parse(readFileSync(resolve(directory, name), "utf8"));
  for (const entry of raw.result) {
    if (!entry.url.startsWith(prefix) || /\/(node_modules|\.next)\//.test(entry.url)) continue;
    files.push({
      file: entry.url.slice(prefix.length),
      functions: entry.functions.length,
      coveredFunctions: entry.functions.filter((fn) => fn.ranges[0]?.count > 0).length
    });
  }
}
mkdirSync(`reports/${ASSIGNMENT_ID}`, { recursive: true });
writeFileSync(`reports/${ASSIGNMENT_ID}/coverage-summary.json`, JSON.stringify({
  provider: "V8", rawDirectory: directory, files,
  limitation: "Cobertura de JS con URL de archivo. El TypeScript ejecutado con new Function no tiene mapa al código original; no se calcula un porcentaje de cobertura de src/."
}, null, 2) + "\n");
process.exitCode = run.status === 0 && !run.error ? 0 : 1;
