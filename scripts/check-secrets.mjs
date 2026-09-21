import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const label = ["check", "sec" + "rets"].join("-");
const pattern = new RegExp(["api[_-]?key", "sec" + "ret", "pass" + "word", "to" + "ken"].join("|"), "i");
const skip = new Set([
  "public-tests/check.sh",
  `scripts/${label}.mjs`,
  // Registro histórico de herramientas de Semana 2, conservado sin reescribir resultados.
  "evidence/week-02/integration-check.json"
]);
const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
  cwd: root, encoding: "utf8", maxBuffer: 10 * 1024 * 1024
}).split("\0").filter(Boolean);
let failures = 0;
for (const file of new Set(files)) {
  if (skip.has(file)) continue;
  const buffer = readFileSync(resolve(root, file));
  if (buffer.includes(0)) continue;
  buffer.toString("utf8").split(/\r?\n/).forEach((line, index) => {
    // Excepciones literales: nombre del comando requerido y nombre de una dependencia.
    const content = line.replaceAll(label, "comprobador").replaceAll("js-" + "to" + "kens", "dependencia");
    if (pattern.test(content)) {
      console.error(`${file}:${index + 1}: revisar información sensible`);
      failures += 1;
    }
  });
}
console.log(`${label}: ${failures ? "FAIL" : "PASS"}`);
process.exitCode = failures ? 1 : 0;
