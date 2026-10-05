import { idempotencyKey, type ConflictRecord, type Inspection, type SyncEnvelope } from "../storage/schema";

export type ConflictStrategy = "last-write-wins" | "field-level-merge" | "manual-review";
export const DEFAULT_STRATEGY: ConflictStrategy = "field-level-merge";

export interface Resolution {
  inspection: Inspection;
  strategy: ConflictStrategy;
  conflicts: ConflictRecord[];
}

/** Metadatos del sobre local y copia común anterior a las dos ediciones. */
export interface ResolutionContext {
  localVersion: number;
  localUpdatedAt: number;
  base?: Inspection;
}

const MERGEABLE_FIELDS = ["location", "date", "inspector", "status", "statusLabel", "findings", "summary"] as const;

export function isStale(localVersion: number, remoteVersion: number): boolean {
  return remoteVersion < localVersion;
}

export function detectConflict(local: Inspection, remote: SyncEnvelope): boolean {
  return local.id === remote.data.id && remote.updatedAt !== 0 &&
    MERGEABLE_FIELDS.some((field) => local[field] !== remote.data[field]);
}

/** Función pura: devuelve la copia elegida y los registros que debe conservar el llamador. */
export function resolve(
  local: Inspection,
  remote: SyncEnvelope,
  strategy: ConflictStrategy = DEFAULT_STRATEGY,
  now: number = 0,
  context?: ResolutionContext
): Resolution {
  if (local.id !== remote.data.id || (context?.base && context.base.id !== local.id)) {
    throw new Error("Las copias deben pertenecer a la misma inspección");
  }
  if (!["last-write-wins", "field-level-merge", "manual-review"].includes(strategy)) {
    throw new Error("Estrategia de conflicto desconocida");
  }
  if (!Number.isInteger(remote.version) || remote.version < 0 ||
      !Number.isFinite(remote.updatedAt) || remote.updatedAt < 0 ||
      !Number.isFinite(now) || now < 0 ||
      (context && (!Number.isInteger(context.localVersion) || context.localVersion < 0 ||
        !Number.isFinite(context.localUpdatedAt) || context.localUpdatedAt < 0))) {
    throw new Error("Versiones y fechas deben ser números válidos no negativos");
  }
  const key = idempotencyKey(local, remote.version);
  if (remote.key !== key) throw new Error("La clave no corresponde a la inspección y versión remotas");

  // La versión se compara antes que las fechas o la estrategia solicitada.
  if ((context && isStale(context.localVersion, remote.version)) || !detectConflict(local, remote)) {
    return { inspection: { ...local }, strategy, conflicts: [] };
  }

  // Sin metadatos o sin base común no se puede deducir qué editó cada lado.
  const selected: ConflictStrategy = !context || (strategy === "field-level-merge" && !context.base)
    ? "manual-review" : strategy;
  const fields = MERGEABLE_FIELDS.filter((field) => local[field] !== remote.data[field]);
  const conflicts = fields.map((field): ConflictRecord => ({
    key, field, local: local[field], remote: remote.data[field], strategy: selected, resolvedAt: now
  }));
  let inspection = { ...local };
  const remoteIsNewer = context !== undefined && remote.updatedAt > context.localUpdatedAt;

  if (selected === "last-write-wins" && remoteIsNewer) {
    inspection = { ...remote.data };
  } else if (selected === "field-level-merge" && context?.base) {
    const base = context.base;
    for (const field of fields) {
      const localChanged = local[field] !== base[field];
      const remoteChanged = remote.data[field] !== base[field];
      if (remoteChanged && (!localChanged || remoteIsNewer)) {
        inspection = { ...inspection, [field]: remote.data[field] };
      }
    }
  }

  return { inspection, strategy: selected, conflicts };
}
