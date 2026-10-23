import type { Inspection, InspectionStore, QueueEntry } from "./schema";

// El adaptador usa la misma interfaz que la cola existente; no conserva datos en memoria.
export class LocalInspectionStore implements InspectionStore {
  constructor(private storage: Pick<Storage, "getItem" | "setItem">, private prefix = "inspecciones-local-v1") {}

  private read<T>(suffix: string): T[] {
    const raw = this.storage.getItem(`${this.prefix}:${suffix}`);
    const items = raw === null ? [] : JSON.parse(raw);
    if (!Array.isArray(items)) throw new Error("El almacenamiento local no es válido.");
    return items;
  }

  private save(suffix: string, items: unknown[]): void {
    this.storage.setItem(`${this.prefix}:${suffix}`, JSON.stringify(items));
  }

  async put(inspection: Inspection): Promise<void> {
    const items = this.read<Inspection>("records").filter(item => item.id !== inspection.id);
    this.save("records", [...items, inspection]);
  }
  async get(id: string): Promise<Inspection | null> {
    return this.read<Inspection>("records").find(item => item.id === id) ?? null;
  }
  async getAll(): Promise<Inspection[]> { return this.read<Inspection>("records"); }
  async remove(id: string): Promise<void> {
    this.save("records", this.read<Inspection>("records").filter(item => item.id !== id));
  }
  async saveQueue(entries: QueueEntry[]): Promise<void> { this.save("queue", entries); }
  async loadQueue(): Promise<QueueEntry[]> { return this.read<QueueEntry>("queue"); }
}
