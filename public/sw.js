const CACHE_PREFIX = "inspecciones-";
const VERSION = "v2";
// La caché runtime se acota para no crecer sin límite en el dispositivo.
const MAX_RUNTIME_ENTRIES = 24;
const SHELL_CACHE = `${CACHE_PREFIX}static-${VERSION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}runtime-${VERSION}`;
const SHELL_ASSETS = [
  "/", "/offline.html", "/manifest.webmanifest", "/apple-touch-icon.png",
  "/icons/icon-192.png", "/icons/icon-512.png", "/icons/icon-maskable-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    await cache.addAll(SHELL_ASSETS);
    // El registro ocurre después de cargar la página: sus assets deben precachearse también.
    const html = await (await cache.match("/")).text();
    const assets = [...html.matchAll(/(?:src|href)="([^"\s]+)"/g)]
      .map((match) => new URL(match[1], self.location.origin))
      .filter((url) => url.origin === self.location.origin && url.pathname.startsWith("/_next/static/"))
      .map((url) => url.href);
    await cache.addAll([...new Set(assets)]);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keep = [SHELL_CACHE, RUNTIME_CACHE];
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((key) => key.startsWith(CACHE_PREFIX) && !keep.includes(key)).map((key) => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

const unavailable = () => new Response("Sin conexión y sin copia disponible.", {
  status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" }
});

async function matchAppCache(request) {
  const runtime = await caches.open(RUNTIME_CACHE);
  const shell = await caches.open(SHELL_CACHE);
  return (await runtime.match(request)) || shell.match(request);
}

// Al superar el máximo se elimina la entrada más antigua (primera en orden de
// inserción) para que el almacenamiento del dispositivo no crezca sin límite.
async function trimToMax(cache) {
  const keys = await cache.keys();
  const excess = keys.length - MAX_RUNTIME_ENTRIES;
  if (excess <= 0) return;
  await Promise.all(keys.slice(0, excess).map((key) => cache.delete(key)));
}

async function fetchAndCache(request) {
  const response = await fetch(request);
  if (response.ok) {
    try {
      const cache = await caches.open(RUNTIME_CACHE);
      await cache.put(request, response.clone());
      await trimToMax(cache);
    } catch {
      // Una cuota agotada no debe descartar una respuesta de red válida.
    }
  }
  return response;
}

async function navigation(request) {
  try {
    return await fetchAndCache(request);
  } catch {
    const cached = await matchAppCache(request);
    const shell = await caches.open(SHELL_CACHE);
    return cached || (await shell.match("/offline.html")) || unavailable();
  }
}

async function cacheFirst(request) {
  const cached = await matchAppCache(request);
  if (cached) return cached;
  return fetchAndCache(request).catch(unavailable);
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin ||
      url.pathname === "/api" || url.pathname.startsWith("/api/") ||
      url.pathname === "/sw.js" || request.headers.has("authorization") ||
      request.headers.has("rsc") || url.searchParams.has("_rsc")) return;

  if (request.mode === "navigate") {
    event.respondWith(navigation(request));
  } else if (url.pathname.startsWith("/_next/static/")) {
    const cached = matchAppCache(request);
    const fresh = fetchAndCache(request).catch(() => undefined);
    event.waitUntil(fresh);
    event.respondWith(cached.then(async (response) => response || (await fresh) || unavailable()));
  } else {
    event.respondWith(cacheFirst(request));
  }
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    event.waitUntil(self.skipWaiting());
  } else if (event.data?.type === "PURGE_CACHES") {
    event.waitUntil((async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX)).map((key) => caches.delete(key)));
      event.ports?.[0]?.postMessage({ type: "PURGE_CACHES_DONE" });
    })());
  }
});
