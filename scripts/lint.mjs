import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import ts from "typescript";

const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
  encoding: "utf8"
}).split("\0").filter(Boolean);
let failures = 0;
for (const file of new Set(files)) {
  if (/\.(cjs|mjs)$/.test(file)) {
    const run = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
    if (run.status !== 0) { console.error(run.stderr); failures += 1; }
  } else if (/\.(ts|tsx)$/.test(file) && !file.endsWith(".d.ts")) {
    const result = ts.transpileModule(readFileSync(file, "utf8"), {
      fileName: file, reportDiagnostics: true,
      compilerOptions: { target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX }
    });
    for (const diagnostic of result.diagnostics ?? []) {
      if (diagnostic.category !== ts.DiagnosticCategory.Error) continue;
      console.error(`${file}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")}`);
      failures += 1;
    }
  }
}
console.log(`Lint de sintaxis JS/TS: ${failures ? "FAIL" : "PASS"}`);
process.exitCode = failures ? 1 : 0;
