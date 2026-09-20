export type ApplyUpdate = () => void;

export async function registerServiceWorker(
  onUpdateReady?: (applyUpdate: ApplyUpdate) => void,
): Promise<ServiceWorkerRegistration | undefined> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return undefined;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });

    let updateRequested = false;

    const notify = (worker: ServiceWorker) => {
      onUpdateReady?.(() => {
        updateRequested = true;
        worker.postMessage({ type: 'SKIP_WAITING' });
      });
    };

    // Ya habia una version esperando (por ejemplo, tras recargar la pagina)
    if (registration.waiting && navigator.serviceWorker.controller) {
      notify(registration.waiting);
    }

    registration.addEventListener('updatefound', () => {
      const installing = registration.installing;
      if (!installing) return;
      installing.addEventListener('statechange', () => {
        if (installing.state === 'installed' && navigator.serviceWorker.controller) {
          notify(installing);
        }
      });
    });

    let reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!updateRequested || reloading) return;
      reloading = true;
      window.location.reload();
    });

    return registration;
  } catch (error) {
    console.error('No se pudo registrar el service worker', error);
    return undefined;
  }
}

export default registerServiceWorker;
