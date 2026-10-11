/* src/lib/device/geolocation.ts */
import type { CapabilityResult, DeviceEnv, GeoCoordinates } from "./types";

/**
 * Geolocalización opcional — Semana 6 (w06-device-push).
 *
 * Reglas:
 * 1. Nunca lanza: el fallo es un CapabilityResult con `error` y `message`.
 * 2. No pide permiso por su cuenta: el navegador lo hace dentro de `getCurrentPosition`,
 *    y esa llamada solo debe ocurrir desde un manejador de la interfaz (gesto del usuario).
 * 3. Si no hay coordenadas, el registro continúa igual: el llamador guarda `coords: null`.
 * 4. Los mensajes de fallo nunca incluyen coordenadas ni precisión (privacidad).
 */

export interface LocationOptions {
  /** Lo declaramos y lo aplica el navegador dentro de PositionOptions. */
  timeoutMs?: number;
  /** Apagado por defecto: precisión alta gasta batería y no aporta a una inspección. */
  enableHighAccuracy?: boolean;
  /** Edad máxima de una posición cacheada. */
  maxAgeMs?: number;
}

function resolveEnv(env?: DeviceEnv): DeviceEnv {
  const nav = typeof navigator === "undefined" ? undefined : navigator;
  const base: DeviceEnv = { geolocation: nav?.geolocation ?? null };
  return { ...base, ...env };
}

export function isGeolocationSupported(env?: DeviceEnv): boolean {
  return typeof resolveEnv(env).geolocation?.getCurrentPosition === "function";
}

export function getCurrentPosition(
  options: LocationOptions = {},
  env?: DeviceEnv
): Promise<CapabilityResult<GeoCoordinates>> {
  const api = resolveEnv(env).geolocation;
  const obtener = api?.getCurrentPosition?.bind(api);
  if (typeof obtener !== "function") {
    return Promise.resolve({
      ok: false,
      error: "unsupported",
      degraded: true,
      message: "Sin geolocalización en este dispositivo: la inspección se registra sin coordenadas."
    });
  }

  return new Promise((resolve) => {
    obtener(
      (position) =>
        resolve({
          ok: true,
          degraded: false,
          message: "Ubicación capturada.",
          value: {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy
          }
        }),
      (failure) => resolve(mapFailure(failure)),
      {
        enableHighAccuracy: options.enableHighAccuracy ?? false,
        timeout: options.timeoutMs ?? 5000,
        maximumAge: options.maxAgeMs ?? 60000
      }
    );
  });
}

/**
 * code 1 = permiso denegado, 2 = posición no disponible, 3 = tiempo agotado.
 * Ningún mensaje lleva coordenadas: si la ubicación se niega, no queda ni un resto de ella.
 */
function mapFailure(failure: { code?: number; message?: string } | null): CapabilityResult<GeoCoordinates> {
  if (failure?.code === 1) {
    return {
      ok: false,
      error: "denied",
      degraded: true,
      message: "Ubicación denegada: la inspección se registra sin coordenadas."
    };
  }
  if (failure?.code === 3) {
    return {
      ok: false,
      error: "timeout",
      degraded: true,
      message: "Se agotó el tiempo de espera de la ubicación: la inspección se registra sin coordenadas."
    };
  }
  return {
    ok: false,
    error: "error",
    degraded: true,
    message: "No fue posible obtener la ubicación: la inspección se registra sin coordenadas."
  };
}