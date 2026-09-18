/* src/lib/pwa/register-service-worker.ts */
interface RegisterOptions {
  onError?: (error: unknown) => void;
}

type DefaultExports = { default: (...args: unknown[]) => void; SW_PATH: string };

export const SW_PATH = "/sw.js";
export const SW_SCOPE = "/";

function registerServiceWorker(): void;

function registerServiceWorker(options?: RegisterOptions): Promise<unknown> | null;

function registerServiceWorker(options: RegisterOptions = {}): Promise<unknown> | null {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return null;
  }
  if (!("serviceWorker" in navigator)) {
    if (options.onError) {
      const error = new Error("El navegador no soporta service workers.");
      queueMicrotask(() => options.onError?.(error));
    }
    return null;
  }
  return navigator.serviceWorker
    .register(SW_PATH, { scope: SW_SCOPE })
    .then((registration) => {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }
      return registration;
    })
    .catch((error: unknown) => {
      if (options.onError) {
        options.onError(error);
      }
      return null;
    });
}

export default registerServiceWorker;
export { registerServiceWorker };

export type { DefaultExports };