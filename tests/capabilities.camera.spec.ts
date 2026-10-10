/* tests/capabilities.camera.spec.ts */
import assert from "node:assert/strict";
import { loadSource } from "./source-loader.cjs";

/**
 * Bloque A de la Semana 6: cámara y evidencia opcional.
 * Todo corre en Node: el entorno se inyecta, así que no hace falta navegador.
 */
export async function runChecks() {
  const checks: Array<{ id: string; status: string; detail?: string }> = [];
  async function check(id: string, action: () => unknown) {
    try {
      await action();
      checks.push({ id, status: "pass" });
    } catch (error) {
      checks.push({ id, status: "fail", detail: String(error) });
    }
  }

  const { isCameraSupported, captureEvidence, evidenceFromFile, getCameraPermission } =
    loadSource("src/lib/device/camera.ts");

  /** Doble de mediaDevices: cuenta llamadas y cierra deTracks. */
  function dobleCamera(behavior: { rejectAs?: string } = {}) {
    const calls = { getUserMedia: 0, stops: 0 };
    const mediaDevices = {
      getUserMedia: async () => {
        calls.getUserMedia += 1;
        if (behavior.rejectAs) {
          const error = new Error("rechazado");
          error.name = behavior.rejectAs;
          throw error;
        }
        return { getTracks: () => [{ stop: () => { calls.stops += 1; } }] };
      }
    };
    return { mediaDevices, calls };
  }

  await check("contract-exports", () => {
    assert.equal(typeof isCameraSupported, "function");
    assert.equal(typeof captureEvidence, "function");
    assert.equal(typeof evidenceFromFile, "function");
    assert.equal(typeof getCameraPermission, "function");
  });

  await check("unsupported-without-camera", async () => {
    // API inexistente: el caso "este navegador no tiene cámara".
    assert.equal(isCameraSupported({ mediaDevices: null }), false);
    const res = await captureEvidence({ inspectionId: "cap-001" }, { mediaDevices: null });
    assert.equal(res.ok, false);
    assert.equal(res.error, "unsupported");
    assert.equal(res.degraded, true);
    assert.ok(res.message.length > 10, "el fallback debe explicarse en pantalla");
  });

  await check("denied-falls-back", async () => {
    const { mediaDevices } = dobleCamera({ rejectAs: "NotAllowedError" });
    const res = await captureEvidence({ inspectionId: "cap-002" }, { mediaDevices: mediaDevices as never });
    assert.equal(res.ok, false);
    assert.equal(res.error, "denied");
    assert.equal(res.degraded, true);
    assert.equal(res.value, undefined, "un permiso denegado no produce evidencia");
  });

  await check("granted-creates-record", async () => {
    const { mediaDevices, calls } = dobleCamera();
    const ahora = 1750000000000;
    const res = await captureEvidence({ inspectionId: "cap-003", note: "cable suelto" }, {
      mediaDevices: mediaDevices as never,
      captureFrame: async () => "data:image/jpeg;base64,AAAA",
      now: () => ahora
    });
    assert.equal(res.ok, true);
    assert.equal(res.degraded, false);
    assert.equal(res.value?.source, "camera");
    assert.equal(res.value?.inspectionId, "cap-003");
    assert.equal(res.value?.createdAt, ahora, "el tiempo viene de env.now, no de Date.now()");
    assert.equal(res.value?.coords, null, "sin ubicación salvo que se pida aparte");
    assert.equal(calls.stops, 1, "la cámara debe cerrarse siempre");
  });

  await check("stream-closed-on-failure", async () => {
    // Si el fotograma falla, el stream igual se cierra: la luz no puede quedarse encendida.
    const { mediaDevices, calls } = dobleCamera();
    const res = await captureEvidence({ inspectionId: "cap-004" }, {
      mediaDevices: mediaDevices as never,
      captureFrame: async () => { throw new Error("sin lienzo"); }
    });
    assert.equal(res.ok, false);
    assert.equal(res.error, "error");
    assert.equal(calls.stops, 1, "el stream quedó abierto tras el fallo");
  });

  await check("size-limit-rejects-huge-image", async () => {
    const { mediaDevices } = dobleCamera();
    const res = await captureEvidence({ inspectionId: "cap-005", maxDataUrlLength: 10 }, {
      mediaDevices: mediaDevices as never,
      captureFrame: async () => "data:image/jpeg;base64," + "A".repeat(500)
    });
    assert.equal(res.ok, false);
    assert.equal(res.error, "error");
    assert.match(res.message, /límite/i);
  });

  await check("file-fallback-works-without-camera", async () => {
    const ahora = 1750000000001;
    const ok = evidenceFromFile(
      { name: "evidencia.jpg", size: 1234, dataUrl: "data:image/jpeg;base64,BBBB" },
      { inspectionId: "cap-006" },
      { mediaDevices: null, now: () => ahora }
    );
    assert.equal(ok.ok, true);
    assert.equal(ok.degraded, true, "el respaldo debe quedar declarado como degradado");
    assert.equal(ok.value?.source, "file");
    assert.equal(ok.value?.dataUrl, "data:image/jpeg;base64,BBBB");

    const vacio = evidenceFromFile({ name: "nada.jpg", size: 0 }, { inspectionId: "cap-006" });
    assert.equal(vacio.ok, false, "un archivo vacío no es evidencia");
  });

  await check("permission-reporter-never-prompts", async () => {
    let consultas = 0;
    const mediaDevices = { getUserMedia: async () => ({ getTracks: () => [] }) };
    const permissions = { query: async () => { consultas += 1; return { state: "denied" }; } };
    assert.equal(await getCameraPermission({ mediaDevices: mediaDevices as never, permissions: permissions as never }), "denied");
    assert.equal(consultas, 1, "debe consultar la API de permisos, no abrir la cámara");
    // Sin API de permisos: desconocido, no denegado.
    assert.equal(await getCameraPermission({ mediaDevices: mediaDevices as never, permissions: null }), "default");
    assert.equal(await getCameraPermission({ mediaDevices: null }), "unsupported");
  });

  return checks;
}
