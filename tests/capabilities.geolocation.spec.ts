/* tests/capabilities.geolocation.spec.ts */
import assert from "node:assert/strict";
import { loadSource } from "./source-loader.cjs";

/**
 * Bloque B de la Semana 6: geolocalización opcional con fallback.
 * Doble de `navigator.geolocation` inyectado: corre en Node, sin navegador y sin red.
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

  const { isGeolocationSupported, getCurrentPosition } =
    loadSource("src/lib/device/geolocation.ts");

  /** Doble de geolocalización: registra las opciones y responde según el caso. */
  function dobleGeo(behavior: { success?: unknown; failure?: unknown; never?: boolean }) {
    const calls: { opciones?: Record<string, unknown> } = {};
    const geolocation = {
      getCurrentPosition: (
        onSuccess: (position: unknown) => void,
        onFailure?: (failure: unknown) => void,
        opciones?: Record<string, unknown>
      ) => {
        calls.opciones = opciones;
        if (behavior.never) return; // nunca responde: no lo usamos, el timeout es del navegador
        if (behavior.failure) { onFailure?.(behavior.failure); return; }
        onSuccess(behavior.success);
      }
    };
    return { geolocation, calls };
  }

  await check("contract-exports", () => {
    assert.equal(typeof isGeolocationSupported, "function");
    assert.equal(typeof getCurrentPosition, "function");
  });

  await check("unsupported-without-api", async () => {
    assert.equal(isGeolocationSupported({ geolocation: null }), false);
    const res = await getCurrentPosition({}, { geolocation: null });
    assert.equal(res.ok, false);
    assert.equal(res.error, "unsupported");
    assert.equal(res.degraded, true);
    assert.equal(res.value, undefined, "sin API no hay coordenadas que inventar");
    assert.match(res.message, /sin coordenadas/i, "el mensaje debe decir cómo sigue el flujo");
  });

  await check("granted-returns-coords", async () => {
    const { geolocation, calls } = dobleGeo({
      success: { coords: { latitude: 18.4567, longitude: -97.3891, accuracy: 42.5 } }
    });
    const res = await getCurrentPosition({ timeoutMs: 4000, enableHighAccuracy: true }, { geolocation: geolocation as never });
    assert.equal(res.ok, true);
    assert.equal(res.degraded, false);
    assert.deepEqual(res.value, { lat: 18.4567, lon: -97.3891, accuracy: 42.5 });
    // Las opciones declaradas llegan al navegador: el timeout no es decorativo.
    assert.equal(calls.opciones?.timeout, 4000);
    assert.equal(calls.opciones?.enableHighAccuracy, true);
  });

  await check("defaults-limit-data", async () => {
    // Consigna: "limita datos recolectados". Sin opciones, la precisión alta queda apagada.
    const { geolocation, calls } = dobleGeo({ success: { coords: { latitude: 1, longitude: 2, accuracy: 999 } } });
    await getCurrentPosition({}, { geolocation: geolocation as never });
    assert.equal(calls.opciones?.enableHighAccuracy, false);
    assert.equal(calls.opciones?.timeout, 5000, "siempre debe declararse un timeout");
  });

  await check("denied-code-1", async () => {
    const { geolocation } = dobleGeo({ failure: { code: 1, message: "User denied Geolocation" } });
    const res = await getCurrentPosition({}, { geolocation: geolocation as never });
    assert.equal(res.ok, false);
    assert.equal(res.error, "denied");
    assert.equal(res.degraded, true);
    assert.match(res.message, /denegada/i);
  });

  await check("timeout-code-3", async () => {
    const { geolocation } = dobleGeo({ failure: { code: 3, message: "Timeout" } });
    const res = await getCurrentPosition({}, { geolocation: geolocation as never });
    assert.equal(res.ok, false);
    assert.equal(res.error, "timeout");
    assert.equal(res.degraded, true);
  });

  await check("failure-message-leaks-no-coordinates", async () => {
    // Privacidad: si no hubo permiso, no puede quedar ni un resto de la ubicación.
    const { geolocation } = dobleGeo({ failure: { code: 1, message: "User denied Geolocation" } });
    const res = await getCurrentPosition({}, { geolocation: geolocation as never });
    assert.ok(!/-?\d+\.\d+/.test(res.message), "el mensaje no puede contener coordenadas");
    assert.equal(res.value, undefined);
  });

  await check("never-prompts-on-import", async () => {
    // Importar el módulo no debe tocar el navegador: el permiso nace de un clic en la interfaz.
    // Se instala un navigator falso ANTES de recargar el módulo y se cuenta cualquier llamada.
    let llamadas = 0;
    const falso = { geolocation: { getCurrentPosition: () => { llamadas += 1; } } };
    const original = Object.getOwnPropertyDescriptor(globalThis, "navigator");
    Object.defineProperty(globalThis, "navigator", { value: falso, configurable: true, writable: true });
    try {
      loadSource("src/lib/device/geolocation.ts", {}, new Map());
    } finally {
      if (original) Object.defineProperty(globalThis, "navigator", original);
      else delete (globalThis as { navigator?: unknown }).navigator;
    }
    assert.equal(llamadas, 0, "el módulo no debe pedir posición al cargarse");
  });

  return checks;
}