import assert from "node:assert/strict";
import { loadSource } from "./source-loader.cjs";
import type { Inspection, SyncEnvelope } from "../src/lib/storage/schema";

export async function runChecks() {
  const checks: Array<{ id: string; status: string; detail?: string }> = [];
  async function check(id: string, action: () => unknown) {
    try { await action(); checks.push({ id, status: "pass" }); }
    catch (error) { checks.push({ id, status: "fail", detail: String(error) }); }
  }
  const { idempotencyKey } = loadSource("src/lib/storage/schema.ts");
  const policy = loadSource("src/lib/sync/conflict-policy.ts");
  const strategies = ["last-write-wins", "field-level-merge", "manual-review"] as const;
  const base: Inspection = {
    id: "inspection-synthetic", location: "Laboratorio de prueba", date: "2026-10-01",
    inspector: "Técnica de prueba", status: "ok", statusLabel: "Sin incidencias",
    findings: 0, summary: "Revisión sintética"
  };
  const context = { localVersion: 2, localUpdatedAt: 200, base };
  const envelope = (data: Inspection, version = 2, updatedAt = 300): SyncEnvelope => ({
    key: idempotencyKey(data, version), data, version, updatedAt
  });
  const now = 400;

  await check("strategy-is-declared", () => {
    assert.ok(strategies.includes(policy.DEFAULT_STRATEGY));
    assert.equal(policy.DEFAULT_STRATEGY, "field-level-merge");
    assert.equal(policy.resolve(base, envelope(base), undefined, now, context).strategy, "field-level-merge");
  });

  await check("no-conflict-when-identical", () => {
    assert.equal(policy.detectConflict(base, envelope({ ...base })), false);
    for (const strategy of strategies) {
      const result = policy.resolve(base, envelope({ ...base }), strategy, now, context);
      assert.deepEqual(result.inspection, base);
      assert.notEqual(result.inspection, base);
      assert.deepEqual(result.conflicts, []);
    }
  });

  await check("lww-picks-newer", () => {
    const local = { ...base, summary: "Revisión local" };
    const remote = { ...base, location: "Laboratorio remoto" };
    assert.deepEqual(policy.resolve(local, envelope(remote), "last-write-wins", now, context).inspection, remote);
    assert.deepEqual(policy.resolve(local, envelope(remote, 2, 100), "last-write-wins", now, context).inspection, local);
    assert.deepEqual(policy.resolve(local, envelope(remote, 2, 200), "last-write-wins", now, context).inspection, local);
  });

  await check("merge-keeps-both-edits", () => {
    const local = { ...base, summary: "Cable revisado" };
    const remote = { ...base, location: "Laboratorio B" };
    for (const updatedAt of [100, 200, 300]) {
      const result = policy.resolve(local, envelope(remote, 2, updatedAt), undefined, now, context);
      assert.deepEqual(result.inspection, { ...base, summary: local.summary, location: remote.location });
    }
  });

  await check("merge-records-per-field", () => {
    const local = { ...base, summary: "Revisión local", findings: 1 };
    const remote = { ...base, summary: "Revisión remota", findings: 2 };
    const result = policy.resolve(local, envelope(remote), "field-level-merge", now, context);
    assert.deepEqual(result.inspection, remote);
    assert.deepEqual(result.conflicts, ["findings", "summary"].map((field) => ({
      key: idempotencyKey(local, 2), field, local: local[field], remote: remote[field],
      strategy: "field-level-merge", resolvedAt: now
    })));
    for (const updatedAt of [100, 200]) {
      assert.deepEqual(policy.resolve(local, envelope(remote, 2, updatedAt), "field-level-merge", now, context).inspection, local);
    }
  });

  await check("manual-review-keeps-local", () => {
    const remote = { ...base, summary: "Requiere una segunda revisión" };
    const result = policy.resolve(base, envelope(remote), "manual-review", now, context);
    assert.deepEqual(result.inspection, base);
    assert.equal(result.strategy, "manual-review");
    assert.equal(result.conflicts.length, 1);
    assert.equal(result.conflicts[0].strategy, "manual-review");
  });

  await check("stale-remote-ignored", () => {
    assert.equal(policy.isStale(3, 2), true);
    assert.equal(policy.isStale(2, 2), false);
    assert.equal(policy.isStale(2, 3), false);
    const old = envelope({ ...base, summary: "Respuesta vieja" }, 1, 999);
    for (const strategy of strategies) {
      const result = policy.resolve(base, old, strategy, now, context);
      assert.deepEqual(result.inspection, base, strategy);
      assert.deepEqual(result.conflicts, []);
    }
  });

  await check("conflicts-are-observable", () => {
    const remote = {
      ...base, location: "Otro laboratorio", date: "2026-10-02", inspector: "Técnico de prueba",
      status: "attention" as const, statusLabel: "Requiere atención", findings: 2, summary: "Equipo revisado"
    };
    assert.equal(policy.detectConflict(base, envelope(remote)), true);
    for (const strategy of strategies) {
      const result = policy.resolve(base, envelope(remote), strategy, now, context);
      assert.equal(result.conflicts.length, 7);
      assert.equal(new Set(result.conflicts.map((record) => record.field)).size, 7);
      for (const record of result.conflicts) {
        assert.equal(record.key, idempotencyKey(base, 2));
        assert.equal(record.local, base[record.field]);
        assert.equal(record.remote, remote[record.field]);
        assert.equal(record.strategy, strategy);
        assert.equal(record.resolvedAt, now);
      }
    }
  });

  await check("id-never-resolved", () => {
    const other = envelope({ ...base, id: "inspection-other", summary: "Otra ficha" });
    assert.equal(policy.detectConflict(base, other), false);
    for (const strategy of strategies) {
      assert.throws(() => policy.resolve(base, other, strategy, now, context), /misma inspección/);
      const result = policy.resolve(base, envelope({ ...base, summary: "Cambio" }), strategy, now, context);
      assert.equal(result.inspection.id, base.id);
      assert.ok(result.conflicts.every((record) => record.field !== "id"));
    }
    assert.throws(() => policy.resolve(base, envelope(base), undefined, now, {
      ...context, base: { ...base, id: "inspection-other" }
    }), /misma inspección/);
  });

  await check("deterministic", () => {
    const remote = envelope({ ...base, summary: "Cambio remoto" });
    for (const strategy of strategies) {
      assert.deepEqual(policy.resolve(base, remote, strategy, now, context), policy.resolve(base, remote, strategy, now, context));
    }
  });

  await check("missing-context-requires-review", () => {
    const remote = envelope({ ...base, summary: "Cambio remoto" });
    for (const strategy of strategies) {
      const result = policy.resolve(base, remote, strategy, now);
      assert.deepEqual(result.inspection, base);
      assert.equal(result.strategy, "manual-review");
      assert.equal(result.conflicts[0].strategy, "manual-review");
    }
    const result = policy.resolve(base, remote, "field-level-merge", now, { localVersion: 2, localUpdatedAt: 200 });
    assert.deepEqual(result.inspection, base);
    assert.equal(result.strategy, "manual-review");
    assert.equal(result.conflicts[0].remote, remote.data.summary);
  });

  await check("zero-date-does-not-replace-local", () => {
    const remote = envelope({ ...base, summary: "Sin fecha remota" }, 2, 0);
    assert.equal(policy.detectConflict(base, remote), false);
    const result = policy.resolve(base, remote, "last-write-wins", now, context);
    assert.deepEqual(result.inspection, base);
    assert.deepEqual(result.conflicts, []);
  });

  await check("inputs-remain-unchanged", () => {
    const local = Object.freeze({ ...base, summary: "Cambio local" });
    const remote = Object.freeze(envelope(Object.freeze({ ...base, findings: 1 })));
    const frozenContext = Object.freeze({ ...context, base: Object.freeze({ ...base }) });
    for (const strategy of strategies) {
      const result = policy.resolve(local, remote, strategy, now, frozenContext);
      result.inspection.summary = "Cambio del resultado";
      result.conflicts[0].local = "Cambio del registro";
      assert.equal(local.summary, "Cambio local");
      assert.equal(remote.data.summary, base.summary);
      assert.equal(frozenContext.base.findings, 0);
    }
  });

  await check("invalid-envelope-rejected", () => {
    const remote = envelope({ ...base, summary: "Cambio remoto" });
    assert.throws(() => policy.resolve(base, { ...remote, key: "incorrecta" }, undefined, now, context), /clave/);
    for (const version of [-1, 1.5, NaN, Infinity]) {
      assert.throws(() => policy.resolve(base, { ...remote, version }, undefined, now, context), /números válidos/);
      assert.throws(() => policy.resolve(base, remote, undefined, now, { ...context, localVersion: version }), /números válidos/);
    }
    for (const updatedAt of [-1, NaN, Infinity]) {
      assert.throws(() => policy.resolve(base, { ...remote, updatedAt }, undefined, now, context), /números válidos/);
      assert.throws(() => policy.resolve(base, remote, undefined, now, { ...context, localUpdatedAt: updatedAt }), /números válidos/);
      assert.throws(() => policy.resolve(base, remote, undefined, updatedAt, context), /números válidos/);
    }
    assert.throws(() => policy.resolve(base, remote, "unknown", now, context), /Estrategia/);
  });

  return checks;
}
