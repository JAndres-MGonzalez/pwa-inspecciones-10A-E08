/* src/lib/device/camera.ts */
import type { CapabilityResult, DeviceEnv, EvidenceRecord, PermissionState } from "./types";

/**
 * Cámara y evidencia opcional — Semana 6 (w06-device-push).
 *
 * Reglas:
 * 1. Nunca lanza: el fallo es un CapabilityResult con `error` y `message`.
 * 2. El permiso solo se pide desde la interfaz (gesto del usuario); importar este archivo
 *    no abre la cámara.
 * 3. El stream se cierra SIEMPRE en `finally`: la cámara no queda encendida después de la foto.
 * 4. Sin red: no hay `fetch` ni `XMLHttpRequest`. La evidencia vive en memoria.
 */

export interface CaptureOptions {
  inspectionId: string;
  /** Límite del data URL en caracteres (por defecto ~750 kB en base64). */
  maxDataUrlLength?: number;
  note?: string;
}

function resolveEnv(env?: DeviceEnv): DeviceEnv {
  const nav = typeof navigator === "undefined" ? undefined : navigator;
  const base: DeviceEnv = {
    mediaDevices: nav?.mediaDevices ?? null,
    permissions: nav?.permissions ?? null,
    captureFrame: defaultCaptureFrame,
    now: () => Date.now()
  };
  return { ...base, ...env };
}

export function isCameraSupported(env?: DeviceEnv): boolean {
  return typeof resolveEnv(env).mediaDevices?.getUserMedia === "function";
}

/**
 * Estado del permiso sin pedirlo. Si la API de permisos no existe devuelve "default":
 * desconocido no significa denegado, y no vamos a preguntar abriendo la cámara.
 */
export async function getCameraPermission(env?: DeviceEnv): Promise<PermissionState> {
  const e = resolveEnv(env);
  if (!e.mediaDevices) return "unsupported";
  const consultar = e.permissions?.query?.bind(e.permissions);
  if (typeof consultar !== "function") return "default";
  try {
    // La lib de DOM instalada no declara "camera" dentro de PermissionName; el descriptor
    // es válido en el navegador, así que se afirma el tipo sin cambiar el tsconfig.
    const descriptor = { name: "camera" } as unknown as PermissionDescriptor;
    const status = await consultar(descriptor);
    return status.state === "granted" || status.state === "denied" ? status.state : "default";
  } catch (error) {
    return "default";
  }
}

/**
 * Fotograma por defecto: proyecta el stream en un `<video>` oculto y lo dibuja en un canvas.
 * En Node no existe `document`, así que lanza y el llamador lo traduce a un resultado
 * fallido. Las pruebas inyectan `captureFrame` y no llegan nunca aquí.
 */
async function defaultCaptureFrame(stream: MediaStream): Promise<string> {
  if (typeof document === "undefined") throw new Error("sin lienzo");
  const video = document.createElement("video");
  video.autoplay = true;
  video.muted = true;
  video.srcObject = stream;
  await video.play();
  await new Promise((resolve) => {
    if (video.readyState >= 2) {
      resolve(undefined);
      return;
    }
    video.addEventListener("loadeddata", () => resolve(undefined), { once: true });
  });
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("sin contexto de dibujo");
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  video.srcObject = null;
  return canvas.toDataURL("image/jpeg", 0.7);
}

/** Cierra la cámara sin importar cómo termine la captura. Privacidad, no estética. */
function stopTracks(stream: MediaStream | null): void {
  if (!stream || typeof stream.getTracks !== "function") return;
  stream.getTracks().forEach((track) => {
    if (typeof track.stop === "function") track.stop();
  });
}

export async function captureEvidence(
  options: CaptureOptions,
  env?: DeviceEnv
): Promise<CapabilityResult<EvidenceRecord>> {
  const e = resolveEnv(env);
  const abrir = e.mediaDevices?.getUserMedia?.bind(e.mediaDevices);
  if (typeof abrir !== "function") {
    return {
      ok: false,
      error: "unsupported",
      degraded: true,
      message: "Este navegador no ofrece cámara. Adjunta un archivo o escribe una nota."
    };
  }

  let stream: MediaStream | null = null;
  try {
    stream = await abrir({ video: { facingMode: "environment" }, audio: false });
    const dataUrl = await e.captureFrame!(stream);
    const limite = options.maxDataUrlLength ?? 750000;
    if (typeof dataUrl !== "string" || dataUrl.length > limite) {
      return {
        ok: false,
        error: "error",
        degraded: true,
        message: "La imagen supera el límite permitido y no se guardó."
      };
    }
    const createdAt = e.now!();
    return {
      ok: true,
      degraded: false,
      message: "Evidencia capturada con la cámara.",
      value: {
        id: `${options.inspectionId}-ev-${createdAt}`,
        inspectionId: options.inspectionId,
        source: "camera",
        createdAt,
        dataUrl,
        note: options.note,
        coords: null
      }
    };
  } catch (error) {
    const nombre = (error as { name?: string } | null)?.name;
    if (nombre === "NotAllowedError" || nombre === "SecurityError" || nombre === "PermissionDeniedError") {
      return {
        ok: false,
        error: "denied",
        degraded: true,
        message: "Permiso de cámara denegado. Usa el respaldo de archivo."
      };
    }
    return {
      ok: false,
      error: "error",
      degraded: true,
      message: "No fue posible capturar la evidencia. Intenta de nuevo."
    };
  } finally {
    stopTracks(stream);
  }
}

/**
 * Respaldo: adjuntar evidencia sin cámara (permiso denegado, API inexistente o archivo
 * elegido a propósito). No lee la cámara ni pide permiso de ningún tipo.
 */
export function evidenceFromFile(
  file: { name?: string; size?: number; type?: string; dataUrl?: string },
  options: CaptureOptions,
  env?: DeviceEnv
): CapabilityResult<EvidenceRecord> {
  if (!file || !file.size) {
    return {
      ok: false,
      error: "error",
      degraded: true,
      message: "El archivo está vacío o no se pudo leer."
    };
  }
  const e = resolveEnv(env);
  const createdAt = e.now!();
  return {
    ok: true,
    degraded: true,
    message: "Respaldo sin cámara: evidencia adjuntada desde un archivo.",
    value: {
      id: `${options.inspectionId}-ev-${createdAt}`,
      inspectionId: options.inspectionId,
      source: "file",
      createdAt,
      note: options.note ?? file.name,
      dataUrl: file.dataUrl,
      coords: null
    }
  };
}
