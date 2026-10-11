import type { CapabilityResult, DeviceEnv, PermissionState } from "../device/types";

export interface NotifyInput {
  title: string;
  body: string;
}

export interface NotifyOutcome {
  via: "notification" | "in-app";
}

function resolveEnv(env?: DeviceEnv): DeviceEnv {
  let notification: DeviceEnv["notification"] = null;
  let serviceWorker: DeviceEnv["serviceWorker"] = null;
  try {
    notification = typeof Notification === "undefined" ? null : Notification;
    serviceWorker = typeof navigator === "undefined" ? null : navigator.serviceWorker ?? null;
  } catch {
    // Un contexto restringido también debe poder usar el aviso en pantalla.
  }
  return { notification, serviceWorker, ...env };
}

export function isNotificationSupported(env?: DeviceEnv): boolean {
  const e = resolveEnv(env);
  return typeof e.notification === "function" || typeof e.serviceWorker?.getRegistration === "function";
}

function readPermission(e: DeviceEnv): PermissionState {
  if (typeof e.notification !== "function") {
    return typeof e.serviceWorker?.getRegistration === "function" ? "default" : "unsupported";
  }
  try {
    const state = e.notification.permission;
    return state === "granted" || state === "denied" ? state : "default";
  } catch {
    return "default";
  }
}

/** La interfaz llama a esta función desde el clic; notificar nunca abre el diálogo. */
export async function requestPermission(env?: DeviceEnv): Promise<PermissionState> {
  const e = resolveEnv(env);
  if (typeof e.notification !== "function") return "unsupported";
  const current = readPermission(e);
  if (current === "granted" || current === "denied") return current;
  try {
    const state = await e.notification.requestPermission();
    return state === "granted" || state === "denied" ? state : "default";
  } catch {
    return "default";
  }
}

/** Devuelve el aviso de respaldo para que la interfaz lo muestre en su región viva. */
export async function notifyChange(
  input: NotifyInput,
  env?: DeviceEnv
): Promise<CapabilityResult<NotifyOutcome>> {
  const e = resolveEnv(env);
  const state = readPermission(e);
  if (state === "granted") {
    try {
      // showNotification pertenece al registro, no a navigator.serviceWorker.
      // getRegistration puede devolver undefined; no esperamos a ready indefinidamente.
      const registration = typeof e.serviceWorker?.getRegistration === "function"
        ? await e.serviceWorker.getRegistration() : undefined;
      if (typeof registration?.showNotification === "function") {
        await registration.showNotification(input.title, { body: input.body });
      } else if (typeof e.notification === "function") {
        new e.notification(input.title, { body: input.body });
      } else {
        throw new Error("Sin canal de notificación");
      }
      return {
        ok: true, degraded: false, message: "Notificación enviada al sistema.",
        value: { via: "notification" }
      };
    } catch {
      // El aviso en pantalla mantiene el flujo si falla el sistema.
    }
  }
  const reason = state === "granted" ? "el sistema no pudo mostrar la notificación"
    : state === "unsupported" ? "este navegador no ofrece notificaciones"
    : "no se ha concedido el permiso de notificaciones";
  return {
    ok: true, degraded: true,
    message: `Aviso en pantalla: ${input.title}. ${input.body} (${reason}).`,
    value: { via: "in-app" }
  };
}
