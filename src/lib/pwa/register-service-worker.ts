export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | undefined> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return undefined;
  }

  try {
    return await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  } catch (error) {
    console.error('No se pudo registrar el service worker', error);
    return undefined;
  }
}

export default registerServiceWorker;
