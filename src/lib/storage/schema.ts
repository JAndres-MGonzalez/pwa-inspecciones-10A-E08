/* src/lib/storage/schema.ts */
import type { Inspection } from "../data/inspections";

export type { Inspection };

/**
 * Identificador de la actividad.
 *
 * Fuente unica de verdad para el harness: `tests/starter.spec.mjs` y `scripts/verify.mjs`
 * leen este valor en lugar de escribirlo a mano. Sustituye a los ocho hardcodeos que
 * hubo que editar a mano en la transicion de w03 a w04, y que habria que volver a editar
 * en w05, w06 y siguientes.
 */
export const ASSIGNMENT_ID = "w06-device-push";

/**
 * Version del esquema local. Sube cuando cambie la forma de un registro persistido.
 *
 * La clave de idempotencia NO incluye la version del esquema: identifica una operacion de
 * sincronizacion, no la forma del almacenamiento.
 */
export const SCHEMA_VERSION = 1;

export type SyncState = "pending" | "syncing" | "synced" | "failed" | "conflict";

/** Sobre que viaja un registro hacia el servidor. */
export interface SyncEnvelope<T = Inspection> {
  key: string;
  data: T;
  /** Entero monotono. Sirve para descartar respuestas que llegan fuera de orden. */
  version: number;
  /** epoch ms */
  updatedAt: number;
}

/** Una operacion pendiente en la cola de sincronizacion. */
export interface QueueEntry {
  /** = idempotencyKey(envelope.data, envelope.version) */
  key: string;
  /** Intentos fallidos acumulados. Al alcanzar maxAttempts la entrada queda "failed". */
  attempts: number;
  state: SyncState;
  envelope: SyncEnvelope;
  lastError?: string;
  /** epoch ms; instante en que la entrada vuelve a ser elegible tras un fallo. */
  nextAttemptAt?: number;
}

/** Constancia de un conflicto ya resuelto. Un conflicto nunca se borra en silencio. */
export interface ConflictRecord {
  key: string;
  field: string;
  local: unknown;
  remote: unknown;
  strategy: string;
  resolvedAt: number;
}

/**
 * Almacenamiento local de inspecciones y de la cola.
 *
 * La cola se persiste a proposito en la misma interfaz: reabrir la pestana debe poder
 * recuperar tanto los datos como las operaciones pendientes. Sin `saveQueue`/`loadQueue`
 * no hay resistencia al cierre de pestana.
 */
export interface InspectionStore {
  put(inspection: Inspection): Promise<void>;
  get(key: string): Promise<Inspection | null>;
  getAll(): Promise<Inspection[]>;
  remove(key: string): Promise<void>;
  saveQueue(entries: QueueEntry[]): Promise<void>;
  loadQueue(): Promise<QueueEntry[]>;
}

/**
 * Clave de idempotencia: identifica una OPERACION de sincronizacion, no una inspeccion.
 *
 * Misma inspeccion + misma version = misma clave. Por eso un reintento nunca duplica.
 * La version es lo que hace que esto sea util: con la clave `id` sola, reintentar una
 * actualizacion que el servidor ya aplico se veria como la misma operacion y el cambio se
 * perderia en silencio.
 *
 * Determinista: no usa Math.random() ni Date.now(), porque las pruebas deben ser
 * reproducibles.
 */
export function idempotencyKey(inspection: Inspection, version: number): string {
  return `${inspection.id}::v${version}`;
}

/**
 * Migra un registro persistido entre versiones de esquema.
 *
 * from === to devuelve el registro sin tocarlo. La migracion descendente lanza error en
 * vez de adivinar: perder un registro silenciosamente es peor que refusing a arrancar.
 */
export function migrate<T extends Record<string, unknown>>(
  record: T,
  from: number,
  to: number
): T {
  if (from === to) return record;
  if (from > to) {
    throw new Error(`Migracion descendente no soportada: v${from} -> v${to}`);
  }
  if (from > SCHEMA_VERSION || to > SCHEMA_VERSION) {
    throw new Error(`Version de esquema desconocida: v${from} -> v${to} (maxima v${SCHEMA_VERSION})`);
  }
  let current: Record<string, unknown> = { ...record };
  for (let v = from; v < to; v += 1) {
    if (v === 0) {
      // v0 -> v1: "summary" paso de opcional a obligatorio y se fijo la version.
      current = { ...current, summary: current.summary ?? "", version: 1 };
    }
  }
  return current as T;
}

/**
 * Adapter en memoria.
 *
 * Permite probar la cola y la politica de conflictos sin navegador y sin IndexedDB real,
 * igual que `tests/sw-harness.cjs` simula el Service Worker. Las pruebas del repo deben
 * ser deterministas y no depender de servicios privados.
 *
 * Usa `private` de TypeScript y no identificadores privados `#`, y `Array.from` en vez de
 * spread sobre iteradores, porque el `tsconfig.json` del repo declara `target: "es5"`
 * (el default del starter de Next). Los identificadores privados exigen ES2015 y el
 * spread sobre un iterador exige `downlevelIteration`.
 */
export class MemoryInspectionStore implements InspectionStore {
  private inspections: Map<string, Inspection> = new Map();
  private queue: QueueEntry[] = [];

  async put(inspection: Inspection): Promise<void> {
    this.inspections.set(inspection.id, { ...inspection });
  }

  async get(key: string): Promise<Inspection | null> {
    const found = this.inspections.get(key);
    return found ? { ...found } : null;
  }

  async getAll(): Promise<Inspection[]> {
    return Array.from(this.inspections.values());
  }

  async remove(key: string): Promise<void> {
    this.inspections.delete(key);
  }

  async saveQueue(entries: QueueEntry[]): Promise<void> {
    this.queue = entries.map((entry) => ({ ...entry }));
  }

  async loadQueue(): Promise<QueueEntry[]> {
    return this.queue.map((entry) => ({ ...entry }));
  }
}
