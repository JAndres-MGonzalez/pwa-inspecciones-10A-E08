/* public/sw.js */
const CACHE_PREFIX = "inspecciones-";
const STATIC_CACHE = CACHE_PREFIX + "static-v1";
const RUNTIME_CACHE = CACHE_PREFIX + "runtime-v1";

const PRECACHE_URLS = [
  "/",
  "/offline.html",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png"
];

const NAVIGATION_FALLBACK = "/offline.html";

self.addEventListener("install", async (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(STATIC_CACHE);
        await cache.addAll(PRECACHE_URLS);
      } catch (error) {
        console.error("[SW] No se pudo completar el precache", error);
      }
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", async (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== STATIC_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  if (typeof event.data === "object" && event.data !== null) {
    if (event.data.type === "SKIP_WAITING") {
      event.waitUntil(self.skipWaiting());
    }
    if (event.data.type === "PURGE_CACHES") {
      event.waitUntil(
        (async () => {
          const keys = await caches.keys();
          await Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX)).map((key) => caches.delete(key)));
          for (const port of event.ports) {
            port.postMessage({ type: "PURGE_CACHES_DONE" });
          }
        })()
      );
    }
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  const hasAuthHeader = typeof request.headers.get === "function" && request.headers.get("authorization") !== null;
  if (url.pathname.startsWith("/api/") || hasAuthHeader) {
    return;
  }

  const isNavigation = request.mode === "navigate";
  const isStatic = url.pathname.startsWith("/_next/static/");

  if (isNavigation) {
    event.respondWith(networkFirstOrFallback(request));
    return;
  }

  if (isStatic) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});

async function networkFirstOrFallback(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    const fallbackCache = await caches.open(STATIC_CACHE);
    const fallback = await fallbackCache.match(NAVIGATION_FALLBACK);
    if (fallback) {
      return fallback;
    }
    return new Response("Sin conexión. No hay respaldo disponible por el momento.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => cached);
  return cached || (await networkPromise);
}

async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response("", {
      status: 503,
      headers: { "Content-Type": "text/plain" }
    });
  }
}