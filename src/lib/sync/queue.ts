/* src/lib/sync/queue.ts
 * Cola de sincronización idempotente: reintentos con backoff, recuperación tras
 * cierre de pestaña y descarte de respuestas fuera de orden.
 *
 * OJO: el tsconfig tiene target "es5". Aquí NO se usan campos #privados ni
 * spread sobre iteradores ([...map.values()]); se usa `private` y Array.from.
 */
import {
  idempotencyKey,
  type Inspection,
  type InspectionStore,
  type QueueEntry,
  type SyncEnvelope
} from "../storage/schema";

export const MAX_ATTEMPTS = 5;
export const BASE_DELAY_MS = 1000;
export const MAX_DELAY_MS = 30000;

export interface TransportResult {
  ok: boolean;
  version: number; // versión que el servidor considera vigente
  body?: unknown;
  error?: string;
}

/** Única cosa que la cola toca para hablar con el servidor (punto de prueba). */
export interface Transport {
  send(envelope: SyncEnvelope): Promise<TransportResult>;
}

export interface DrainReport {
  sent: number;
  failed: number;
  /** Entradas que no se enviaron: ya superadas por una versión más nueva o esperando su backoff. */
  skipped: number;
  pending: number;
}

export interface QueueOptions {
  now?: () => number;
  baseDelayMs?: number;
  maxAttempts?: number;
  /** Fuente del jitter. Por defecto fija (0.5) para que las pruebas sean deterministas. */
  random?: () => number;
}

/**
 * Retardo exponencial: base * 2^intentos, acotado a MAX_DELAY_MS.
 * Es una función pura: el jitter se aplica aparte, en la cola.
 */
export function backoffDelay(attempts: number, base: number = BASE_DELAY_MS): number {
  return Math.min(base * Math.pow(2, Math.max(0, attempts)), MAX_DELAY_MS);
}

/** Generador pseudoaleatorio con semilla (LCG): misma semilla, misma secuencia. */
export function seededRandom(seed: number): () => number {
  let state = Math.floor(seed) % 4294967296;
  if (state < 0) state += 4294967296;
  return function () {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function cloneEntry(entry: QueueEntry): QueueEntry {
  return {
    ...entry,
    envelope: { ...entry.envelope, data: { ...entry.envelope.data } }
  };
}

export class SyncQueue {
  private entries = new Map<string, QueueEntry>();
  /** inspección (id) -> última versión confirmada por el servidor */
  private applied = new Map<string, number>();
  /** inspección (id) -> versión más nueva encolada (para no pisar el dato local con una vieja) */
  private newest = new Map<string, number>();
  private writes: Promise<void> = Promise.resolve();
  private store: InspectionStore;
  private transport: Transport;
  private opts: Required<QueueOptions>;

  /** Último error al persistir, para diagnosticar sin abrir el código. */
  lastPersistError: string | undefined;

  constructor(store: InspectionStore, transport: Transport, options: QueueOptions = {}) {
    this.store = store;
    this.transport = transport;
    this.opts = {
      now: options.now ?? (() => Date.now()),
      baseDelayMs: options.baseDelayMs ?? BASE_DELAY_MS,
      maxAttempts: options.maxAttempts ?? MAX_ATTEMPTS,
      random: options.random ?? (() => 0.5)
    };
  }

  /** Calcula la clave y registra la operación. Si la clave ya existe, NO duplica. */
  enqueue(inspection: Inspection, version: number, updatedAt: number = this.opts.now()): QueueEntry {
    const key = idempotencyKey(inspection, version);
    const existing = this.entries.get(key);
    if (existing) return existing; // <- idempotencia

    const entry: QueueEntry = {
      key,
      attempts: 0,
      state: "pending",
      envelope: { key, data: { ...inspection }, version, updatedAt }
    };
    this.entries.set(key, entry);

    // El dato local solo se guarda si esta versión no es más vieja que otra ya encolada.
    const id = inspection.id;
    if (version >= (this.newest.get(id) ?? 0)) {
      this.newest.set(id, version);
      this.write(() => this.store.put(entry.envelope.data));
    }
    this.persistQueue();
    return entry;
  }

  /** Rehidratación: lee la cola persistida al reabrir la pestaña. */
  async rehydrate(): Promise<QueueEntry[]> {
    await this.writes;
    const saved = await this.store.loadQueue();
    for (const stored of saved) {
      if (this.entries.has(stored.key)) continue; // lo que ya está en memoria manda
      const entry = cloneEntry(stored);
      // Una entrada que quedó en "syncing" nunca terminó: no sabemos si llegó al servidor.
      // Vuelve a "pending": reenviar es inofensivo (idempotencia), perder el cambio no.
      if (entry.state === "syncing") entry.state = "pending";
      this.entries.set(entry.key, entry);

      const id = entry.envelope.data.id;
      const version = entry.envelope.version;
      if (version > (this.newest.get(id) ?? 0)) this.newest.set(id, version);
      if (entry.state === "synced" && version > (this.applied.get(id) ?? 0)) this.applied.set(id, version);
    }
    await this.persistQueue();
    return this.all();
  }

  /** Todas las entradas, en cualquier estado. */
  all(): QueueEntry[] {
    return Array.from(this.entries.values());
  }

  /** Entradas esperando envío o reintento. */
  pending(): QueueEntry[] {
    return this.all().filter((e) => e.state === "pending");
  }

  /** Entradas que agotaron sus reintentos (no se reintentan solas). */
  failed(): QueueEntry[] {
    return this.all().filter((e) => e.state === "failed");
  }

  /** Última versión confirmada por el servidor para una inspección (0 si ninguna). */
  lastApplied(id: string): number {
    return this.applied.get(id) ?? 0;
  }

  /** Espera a que terminen las escrituras pendientes al almacenamiento. */
  flush(): Promise<void> {
    return this.writes;
  }

  /**
   * Procesa la cola. Reglas:
   *  - si ya hay una versión igual o mayor aplicada para esa inspección, la entrada se descarta
   *  - si todavía no toca su reintento (nextAttemptAt), se salta
   *  - si attempts >= maxAttempts, la entrada queda "failed" y se deja de reintentar
   *  - una respuesta con versión menor a la ya aplicada se IGNORA (respuesta fuera de orden)
   */
  async drain(): Promise<DrainReport> {
    const report: DrainReport = { sent: 0, failed: 0, skipped: 0, pending: 0 };

    for (const entry of this.pending()) {
      if (entry.state !== "pending") continue; // otro drain pudo tomarla mientras esperábamos
      const id = entry.envelope.data.id;

      // Ya superada por una versión más nueva aplicada: no se envía.
      if (entry.envelope.version < (this.applied.get(id) ?? 0)) {
        entry.state = "synced";
        report.skipped += 1;
        await this.persistQueue();
        continue;
      }
      // Backoff: todavía no toca reintentar.
      if (entry.nextAttemptAt !== undefined && entry.nextAttemptAt > this.opts.now()) {
        report.skipped += 1;
        continue;
      }
      // Agotada por configuración (p. ej. maxAttempts más bajo que al guardarla).
      if (entry.attempts >= this.opts.maxAttempts) {
        entry.state = "failed";
        report.failed += 1;
        await this.persistQueue();
        continue;
      }

      entry.state = "syncing";
      await this.persistQueue();

      let result: TransportResult;
      try {
        result = await this.transport.send(entry.envelope);
      } catch (error) {
        result = { ok: false, version: entry.envelope.version, error: String(error) };
      }

      // Se relee: pudo cambiar mientras esperábamos la respuesta.
      const current = this.applied.get(id) ?? 0;
      if (result.ok && result.version < current) {
        // Respuesta fuera de orden: la v3 ya se aplicó, la respuesta de la v2 no la pisa.
        entry.state = "synced";
        delete entry.lastError;
        delete entry.nextAttemptAt;
        report.skipped += 1;
      } else if (result.ok) {
        this.applied.set(id, Math.max(current, result.version));
        entry.state = "synced";
        delete entry.lastError;
        delete entry.nextAttemptAt;
        report.sent += 1;
      } else {
        entry.attempts += 1;
        entry.lastError = result.error ?? "rechazo del servidor";
        if (entry.attempts >= this.opts.maxAttempts) {
          entry.state = "failed";
          delete entry.nextAttemptAt;
        } else {
          entry.state = "pending";
          entry.nextAttemptAt = this.opts.now() + this.retryDelay(entry.attempts);
        }
        report.failed += 1;
      }
      await this.persistQueue();
    }

    report.pending = this.pending().length;
    return report;
  }

  /** Backoff exponencial + jitter (hasta 10 %) con fuente aleatoria inyectable. */
  private retryDelay(attempts: number): number {
    const base = backoffDelay(attempts - 1, this.opts.baseDelayMs);
    const jitter = Math.floor(this.opts.random() * base * 0.1);
    return Math.min(base + jitter, MAX_DELAY_MS);
  }

  /** Encadena escrituras para que lleguen en orden y un fallo no rompa la cola. */
  private write(action: () => unknown): Promise<void> {
    this.writes = this.writes
      .then(function () {
        return action();
      })
      .then(
        () => undefined,
        (error) => {
          this.lastPersistError = String(error);
        }
      );
    return this.writes;
  }

  private persistQueue(): Promise<void> {
    const snapshot = this.all().map(cloneEntry);
    return this.write(() => this.store.saveQueue(snapshot));
  }
}