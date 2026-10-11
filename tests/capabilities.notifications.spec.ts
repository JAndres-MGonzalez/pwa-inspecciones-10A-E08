import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadSource } from "./source-loader.cjs";
import type { DeviceEnv } from "../src/lib/device/types";

export async function runChecks() {
  const checks: Array<{ id: string; status: string; detail?: string }> = [];
  async function check(id: string, action: () => unknown) {
    try { await action(); checks.push({ id, status: "pass" }); }
    catch (error) { checks.push({ id, status: "fail", detail: String(error) }); }
  }
  const { isNotificationSupported, requestPermission, notifyChange } = loadSource("src/lib/notifications/client.ts");
  const input = { title: "Inspección actualizada", body: "Cambio sintético registrado." };

  function double(behavior: {
    permission?: string; requestTo?: string; throwRequest?: boolean; withServiceWorker?: boolean;
    failShow?: boolean; failLookup?: boolean; missingRegistration?: boolean; failPermission?: boolean;
  } = {}) {
    const calls = { request: 0, lookup: 0, show: 0, create: 0, title: "", body: "" };
    const notification = function (title: string, options: { body: string }) {
      calls.create += 1;
      if (behavior.failShow) throw new Error("Fallo sintético de ventana");
      calls.title = title;
      calls.body = options.body;
    };
    Object.defineProperty(notification, "permission", {
      get: () => {
        if (behavior.failPermission) throw new Error("Lectura no disponible");
        return behavior.permission ?? "default";
      }
    });
    notification.requestPermission = async () => {
      calls.request += 1;
      if (behavior.throwRequest) throw new Error("Permiso no disponible");
      return behavior.requestTo ?? "default";
    };
    const serviceWorker = behavior.withServiceWorker ? {
      getRegistration: async () => {
        calls.lookup += 1;
        if (behavior.failLookup) throw new Error("Registro no disponible");
        return behavior.missingRegistration ? undefined : {
          showNotification: async (title: string, options: { body: string }) => {
            calls.show += 1;
            if (behavior.failShow) throw new Error("Fallo sintético del sistema");
            calls.title = title;
            calls.body = options.body;
          }
        };
      }
    } : null;
    const env = { notification, serviceWorker } as unknown as DeviceEnv;
    return { env, calls };
  }

  await check("contract-exports", () => {
    for (const fn of [isNotificationSupported, requestPermission, notifyChange]) assert.equal(typeof fn, "function");
  });
  await check("unsupported-still-notifies-in-app", async () => {
    const env = { notification: null, serviceWorker: null };
    assert.equal(isNotificationSupported(env), false);
    assert.equal(await requestPermission(env), "unsupported");
    const result = await notifyChange(input, env);
    assert.equal(result.ok, true);
    assert.equal(result.value?.via, "in-app");
    assert.equal(result.degraded, true);
    assert.ok(result.message.includes(input.title) && result.message.includes(input.body));
  });
  await check("request-permission-maps-states", async () => {
    for (const state of ["granted", "denied", "default", "prompt"]) {
      const { env, calls } = double({ requestTo: state });
      assert.equal(await requestPermission(env), state === "prompt" ? "default" : state);
      assert.equal(calls.request, 1);
    }
    assert.equal(await requestPermission(double({ throwRequest: true }).env), "default");
  });
  await check("notify-never-prompts", async () => {
    for (const permission of ["default", "denied", "granted"]) {
      const { env, calls } = double({ permission, withServiceWorker: true });
      const result = await notifyChange(input, env);
      assert.equal(calls.request, 0, permission);
      assert.equal(result.ok, true);
      assert.equal(result.value?.via, permission === "granted" ? "notification" : "in-app");
    }
  });
  await check("granted-sends-via-service-worker", async () => {
    const { env, calls } = double({ permission: "granted", withServiceWorker: true });
    const result = await notifyChange(input, env);
    assert.equal(result.ok, true);
    assert.equal(result.degraded, false);
    assert.equal(result.value?.via, "notification");
    assert.equal(calls.lookup, 1);
    assert.equal(calls.show, 1);
    assert.equal(calls.create, 0);
    assert.equal(calls.title, input.title);
    assert.equal(calls.body, input.body);
  });
  await check("system-failure-falls-back-to-in-app", async () => {
    for (const behavior of [{ failShow: true, withServiceWorker: true }, { failShow: true }, { failLookup: true, withServiceWorker: true }]) {
      const result = await notifyChange(input, double({ permission: "granted", ...behavior }).env);
      assert.equal(result.ok, true);
      assert.equal(result.value?.via, "in-app");
      assert.equal(result.degraded, true);
      assert.ok(result.message.includes(input.title) && result.message.includes(input.body));
      assert.ok(!result.message.includes("sintético del sistema"));
    }
  });
  await check("denied-notifies-in-app", async () => {
    const { env, calls } = double({ permission: "denied", withServiceWorker: true });
    const result = await notifyChange(input, env);
    assert.equal(result.ok, true);
    assert.equal(result.value?.via, "in-app");
    assert.equal(result.degraded, true);
    assert.equal(calls.lookup + calls.show + calls.create + calls.request, 0);
    assert.match(result.message, /pantalla/i);
  });
  await check("node-without-browser-safe", async () => {
    assert.equal(isNotificationSupported(), false);
    assert.equal(await requestPermission(), "unsupported");
    const result = await notifyChange(input);
    assert.equal(result.ok, true);
    assert.equal(result.value?.via, "in-app");
  });
  await check("constructor-without-registration", async () => {
    for (const withServiceWorker of [false, true]) {
      const { env, calls } = double({ permission: "granted", withServiceWorker, missingRegistration: true });
      assert.equal(isNotificationSupported(env), true);
      assert.equal((await notifyChange(input, env)).value?.via, "notification");
      assert.equal(calls.create, 1);
      assert.equal(calls.show, 0);
      assert.equal(calls.request, 0);
    }
  });
  await check("existing-permission-is-not-requested", async () => {
    for (const permission of ["granted", "denied"]) {
      const { env, calls } = double({ permission });
      assert.equal(await requestPermission(env), permission);
      assert.equal(calls.request, 0);
    }
  });
  await check("unknown-permission-keeps-fallback", async () => {
    const { env, calls } = double({ failPermission: true, withServiceWorker: true });
    assert.equal((await notifyChange(input, env)).value?.via, "in-app");
    assert.equal(calls.lookup + calls.show + calls.create + calls.request, 0);
    const swOnly = { notification: null, serviceWorker: env.serviceWorker };
    assert.equal(isNotificationSupported(swOnly), true);
    assert.equal(await requestPermission(swOnly), "unsupported");
    assert.equal((await notifyChange(input, swOnly)).value?.via, "in-app");
    assert.equal(calls.show, 0);
  });
  await check("never-prompts-on-import", () => {
    let calls = 0;
    const notification = function () { calls += 1; };
    notification.requestPermission = () => { calls += 1; };
    const previous = Object.getOwnPropertyDescriptor(globalThis, "Notification");
    Object.defineProperty(globalThis, "Notification", { value: notification, configurable: true });
    try { loadSource("src/lib/notifications/client.ts", {}, new Map()); }
    finally {
      if (previous) Object.defineProperty(globalThis, "Notification", previous);
      else delete (globalThis as { Notification?: unknown }).Notification;
    }
    assert.equal(calls, 0);
  });
  await check("device-first-render-does-not-use-browser", () => {
    let browserCalls = 0;
    let supported = false;
    const called = () => { browserCalls += 1; };
    const { DeviceEvidence } = loadSource("src/components/device-evidence.tsx", {
      "src/lib/device/camera.ts": {
        captureEvidence: called, evidenceFromFile: called, getCameraPermission: called,
        isCameraSupported: () => { browserCalls += 1; return supported; }
      },
      "src/lib/notifications/client.ts": { requestPermission: called, notifyChange: called }
    });
    const server = renderToStaticMarkup(createElement(DeviceEvidence, { inspectionId: "inspection-synthetic" }));
    supported = true;
    const clientFirst = renderToStaticMarkup(createElement(DeviceEvidence, { inspectionId: "inspection-synthetic" }));
    assert.equal(clientFirst, server);
    assert.equal(browserCalls, 0);
    for (const label of ["Adjuntar foto", "Adjuntar archivo", "Avisar cambio", "Permitir notificaciones"]) assert.ok(server.includes(label));
    assert.match(server, /aria-live="polite"/);
  });
  return checks;
}
