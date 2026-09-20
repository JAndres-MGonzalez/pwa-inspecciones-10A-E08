const VERSION = 'v1';
const SHELL_CACHE = `shell-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;
const SHELL_ASSETS = ['/'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keep = [SHELL_CACHE, RUNTIME_CACHE];
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((k) => !keep.includes(k)).map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});
