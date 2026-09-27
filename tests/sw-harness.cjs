"use strict";

const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const ORIGIN = "https://localhost";
const CACHE_PREFIX = "inspecciones-";
const ENTRY_CACHE = CACHE_PREFIX + "static-v2";
const RUNTIME_CACHE = CACHE_PREFIX + "runtime-v2";
const SW_SOURCE = readFileSync(resolve(__dirname, "../public/sw.js"), "utf8");
const urlOf = (input) => new URL(typeof input === "string" ? input : input.url, ORIGIN).href;

const PRECACHE = {
  "/": { body: '<html><link href="/_next/static/app.css" rel="stylesheet"><script src="/_next/static/app.js"></script></html>' },
  "/offline.html": { body: "<html><h1>Sin conexión</h1></html>" },
  "/manifest.webmanifest": { body: "{}" },
  "/icons/icon-192.png": { body: "png" },
  "/icons/icon-512.png": { body: "png" },
  "/icons/icon-maskable-512.png": { body: "png" },
  "/apple-touch-icon.png": { body: "png" },
  "/_next/static/app.css": { body: "body { color: black; }" },
  "/_next/static/app.js": { body: "/* app */" }
};

class FakeCache {
  constructor(fetchImpl) {
    this.entries = new Map();
    this.fetch = fetchImpl;
  }
  async addAll(urls) {
    const responses = await Promise.all(urls.map((url) => this.fetch(url)));
    if (responses.some((response) => !response.ok)) throw new TypeError("Precache fallido");
    await Promise.all(urls.map((url, i) => this.put(url, responses[i])));
  }
  async match(input) {
    return this.entries.get(urlOf(input))?.clone();
  }
  async put(input, response) {
    this.entries.set(urlOf(input), response.clone());
  }
  async keys() {
    return [...this.entries.keys()].map((url) => new Request(url));
  }
  async delete(input) {
    return this.entries.delete(urlOf(input));
  }
}

class FakeCacheStorage {
  constructor(fetchImpl) {
    this.map = new Map();
    this.fetch = fetchImpl;
  }
  async open(name) {
    if (!this.map.has(name)) this.map.set(name, new FakeCache(this.fetch));
    return this.map.get(name);
  }
  async keys() { return [...this.map.keys()]; }
  async delete(name) { return this.map.delete(name); }
  async match(input) {
    for (const cache of this.map.values()) {
      const response = await cache.match(input);
      if (response) return response;
    }
  }
}

function navRequest(url, init = {}) {
  const request = new Request(url, init);
  Object.defineProperty(request, "mode", { value: "navigate" });
  return request;
}

function evaluateSw(routes = {}) {
  const fetchCtl = { calls: [], routes: { ...routes } };
  const fetchImpl = async (input) => {
    const url = urlOf(input);
    fetchCtl.calls.push(url);
    const route = Object.hasOwn(fetchCtl.routes, url) ? fetchCtl.routes[url] : fetchCtl.routes[new URL(url).pathname];
    if (!route) throw new TypeError("Failed to fetch");
    if (typeof route === "function") return route(input);
    return new Response(route.body, { status: route.status ?? 200, headers: route.headers });
  };
  const state = { skipWaitingCalls: 0, claimCalls: 0 };
  const self = {
    state,
    listeners: {},
    location: { origin: ORIGIN, pathname: "/" },
    addEventListener(type, fn) { (this.listeners[type] ??= []).push(fn); },
    async skipWaiting() { state.skipWaitingCalls += 1; },
    clients: { async claim() { state.claimCalls += 1; } }
  };
  const cacheStorage = new FakeCacheStorage(fetchImpl);
  new Function("self", "caches", "fetch", "console", "URL", "Request", "Response", "Headers", "location", SW_SOURCE)(
    self, cacheStorage, fetchImpl, console, URL, Request, Response, Headers, self.location
  );
  return { self, cacheStorage, fetchCtl };
}

async function fire(self, type, event = {}) {
  const pending = [];
  let response;
  const full = {
    ...event,
    waitUntil(promise) { pending.push(Promise.resolve(promise)); },
    respondWith(promise) { response = Promise.resolve(promise); }
  };
  for (const listener of self.listeners[type] ?? []) listener(full);
  // Esperar respuesta y tareas de fondo, incluso si se añaden durante la respuesta.
  const result = await response;
  for (let i = 0; i < pending.length; i += 1) await pending[i];
  return result;
}

module.exports = { evaluateSw, fire, navRequest, CACHE_PREFIX, ENTRY_CACHE, RUNTIME_CACHE, PRECACHE };
