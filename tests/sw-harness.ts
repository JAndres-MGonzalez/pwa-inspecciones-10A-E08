import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const ORIGIN = "http://localhost:3000";
export const STATIC_CACHE = "inspecciones-static-v1";
export const RUNTIME_CACHE = "inspecciones-runtime-v1";
export const PRECACHE_URLS = [
  "/",
  "/offline.html",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
];

const root = resolve(__dirname, "..");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
type Req = string | { url: string };

export type FakeResponse = { ok: boolean; status: number; body: string; clone(): FakeResponse };
export type SwRequest = {
  url: string;
  method: string;
  mode: string;
  headers: { get(name: string): string | null };
};

export function makeResponse(body: string, ok = true): FakeResponse {
  const response: FakeResponse = { ok, status: ok ? 200 : 500, body, clone: () => response };
  return response;
}

const keyOf = (input: Req): string =>
  new URL(typeof input === "string" ? input : input.url, ORIGIN).href;

export function createCaches() {
  const stores = new Map<string, Map<string, FakeResponse>>();
  return {
    stores,
    async open(name: string) {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name) as Map<string, FakeResponse>;
      return {
        async addAll(urls: string[]) {
          for (const url of urls) store.set(keyOf(url), makeResponse(`precache:${url}`));
        },
        async put(request: Req, response: FakeResponse) {
          store.set(keyOf(request), response);
        },
        async match(request: Req) {
          return store.get(keyOf(request));
        },
      };
    },
    async keys() {
      return Array.from(stores.keys());
    },
    async delete(name: string) {
      return stores.delete(name);
    },
    async match(request: Req) {
      for (const store of Array.from(stores.values())) {
        const hit = store.get(keyOf(request));
        if (hit) return hit;
      }
      return undefined;
    },
  };
}

export function makeRequest(
  path: string,
  options: { method?: string; mode?: string; headers?: Record<string, string> } = {},
): SwRequest {
  const headers: Record<string, string> = {};
  for (const name of Object.keys(options.headers ?? {})) {
    headers[name.toLowerCase()] = (options.headers as Record<string, string>)[name];
  }
  return {
    url: new URL(path, ORIGIN).href,
    method: options.method ?? "GET",
    mode: options.mode ?? "cors",
    headers: { get: (name: string) => headers[name.toLowerCase()] ?? null },
  };
}

export function readSwSource(): string {
  return readFileSync(resolve(root, "public/sw.js"), "utf8");
}

export function createHarness() {
  const listeners: Record<string, Array<(event: Any) => void>> = {};
  const caches = createCaches();
  const counters = { skipWaiting: 0, claim: 0, networkCalls: 0 };
  const network = { online: true };

  const self = {
    location: { origin: ORIGIN },
    addEventListener(type: string, listener: (event: Any) => void) {
      listeners[type] = listeners[type] ?? [];
      listeners[type].push(listener);
    },
    skipWaiting() {
      counters.skipWaiting += 1;
      return Promise.resolve();
    },
    clients: {
      claim() {
        counters.claim += 1;
        return Promise.resolve();
      },
    },
  };

  async function fakeFetch(request: SwRequest): Promise<FakeResponse> {
    counters.networkCalls += 1;
    if (!network.online) throw new TypeError("Failed to fetch");
    return makeResponse(`network:${request.url}:${counters.networkCalls}`);
  }

  new Function("self", "caches", "fetch", readSwSource())(self, caches, fakeFetch);

  async function lifecycle(type: "install" | "activate") {
    const pending: Array<Promise<unknown>> = [];
    const event = {
      waitUntil(promise: Promise<unknown>) {
        pending.push(promise);
      },
    };
    for (const listener of listeners[type] ?? []) listener(event);
    await Promise.all(pending);
  }

  async function fetchEvent(request: SwRequest) {
    const state = { handled: false };
    let pending: Promise<Any> = Promise.resolve(undefined);
    const event = {
      request,
      respondWith(promise: Promise<Any>) {
        state.handled = true;
        pending = Promise.resolve(promise);
      },
    };
    for (const listener of listeners.fetch ?? []) listener(event);
    const response: Any = await pending;
    return { handled: state.handled, response };
  }

  async function message(data: unknown, ports: Array<{ postMessage(data: unknown): void }> = []) {
    const pending: Array<Promise<unknown>> = [];
    const event = {
      data,
      ports,
      waitUntil(promise: Promise<unknown>) {
        pending.push(promise);
      },
    };
    for (const listener of listeners.message ?? []) listener(event);
    await Promise.all(pending);
  }

  return { caches, counters, network, lifecycle, fetchEvent, message };
}
