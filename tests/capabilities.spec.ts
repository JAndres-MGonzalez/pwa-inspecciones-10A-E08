import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { loadSource } from "./source-loader.cjs";

export async function runChecks() {
  const checks: Array<{ id: string; status: string; detail?: string }> = [];
  async function check(id: string, action: () => unknown) {
    try { await action(); checks.push({ id, status: "pass" }); }
    catch (error) { checks.push({ id, status: "fail", detail: String(error) }); }
  }
  const camera = loadSource("src/lib/device/camera.ts");
  const geo = loadSource("src/lib/device/geolocation.ts");
  const notifications = loadSource("src/lib/notifications/client.ts");
  const env = { mediaDevices: null, geolocation: null, notification: null, serviceWorker: null, now: () => 1000 };
  const input = { title: "Cambio sintético", body: "Evidencia opcional actualizada." };

  await check("all-modules-load", () => {
    for (const name of ["isCameraSupported", "captureEvidence", "evidenceFromFile", "getCameraPermission"]) assert.equal(typeof camera[name], "function");
    for (const name of ["isGeolocationSupported", "getCurrentPosition"]) assert.equal(typeof geo[name], "function");
    for (const name of ["isNotificationSupported", "requestPermission", "notifyChange"]) assert.equal(typeof notifications[name], "function");
  });
  await check("no-exceptions-without-apis", async () => {
    const results = await Promise.all([
      camera.captureEvidence({ inspectionId: "synthetic-integration" }, env),
      geo.getCurrentPosition({}, env), notifications.notifyChange(input, env)
    ]);
    for (const result of results) {
      assert.equal(typeof result.ok, "boolean");
      assert.equal(typeof result.degraded, "boolean");
      assert.ok(typeof result.message === "string" && result.message.length > 10);
    }
    assert.equal(results[0].ok, false);
    assert.equal(results[1].ok, false);
    assert.equal(results[2].ok, true);
  });
  await check("fallbacks-declare-degraded", async () => {
    const photo = await camera.captureEvidence({ inspectionId: "synthetic-integration" }, env);
    const position = await geo.getCurrentPosition({}, env);
    const notice = await notifications.notifyChange(input, env);
    assert.equal(photo.error, "unsupported");
    assert.equal(position.error, "unsupported");
    assert.equal(notice.error, undefined);
    for (const result of [photo, position, notice]) assert.equal(result.degraded, true);
    assert.equal(notice.value.via, "in-app");
    const file = camera.evidenceFromFile({ name: "synthetic.png", size: 10, dataUrl: "data:image/png;base64,c3ludGhldGlj" }, { inspectionId: "synthetic-integration" }, env);
    assert.equal(file.ok, true);
    assert.equal(file.value.source, "file");
    assert.equal(file.value.coords, null);
    assert.equal(file.value.createdAt, 1000);
  });
  await check("no-network-in-device-layer", () => {
    const forbidden = new Set(["fetch", "XMLHttpRequest", "sendBeacon"]);
    for (const file of ["src/lib/device/camera.ts", "src/lib/device/geolocation.ts", "src/lib/notifications/client.ts"]) {
      const tree = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
      // El parser distingue referencias de código de palabras dentro de comentarios.
      function visit(node: ts.Node) {
        if (ts.isIdentifier(node)) assert.ok(!forbidden.has(node.text), `${file}: referencia de red ${node.text}`);
        ts.forEachChild(node, visit);
      }
      visit(tree);
    }
  });
  await check("shared-contract-types", () => {
    const source = readFileSync("src/lib/device/types.ts", "utf8");
    for (const name of ["PermissionState", "CapabilityError", "CapabilityResult", "GeoCoordinates", "EvidenceRecord", "DeviceEnv"]) assert.ok(source.includes(name));
  });
  await check("synchronous-api-failure-keeps-flow", async () => {
    for (const name of ["SecurityError", "Error"]) {
      const result = await geo.getCurrentPosition({}, {
        geolocation: { getCurrentPosition() { throw Object.assign(new Error("Fallo sintético"), { name }); } }
      });
      assert.equal(result.ok, false);
      assert.equal(result.degraded, true);
      assert.equal(result.value, undefined);
      assert.equal(result.error, name === "SecurityError" ? "denied" : "error");
      assert.match(result.message, /sin coordenadas/i);
      assert.ok(!result.message.includes("Fallo sintético"));
    }
  });
  return checks;
}
