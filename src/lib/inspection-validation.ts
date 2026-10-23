import type { Inspection } from "./data/inspections";

export function validateInspection(value: unknown, today: string): string[] {
  const row = value as Partial<Inspection> | null;
  if (!row || typeof row !== "object") return ["La inspección no es válida."];
  const errors: string[] = [];
  if (typeof row.id !== "string" || !/^[a-z0-9-]{1,80}$/.test(row.id)) errors.push("Identificador inválido.");
  if (typeof row.location !== "string" || !/^Laboratorio de (Redes|Electrónica|Software)$/.test(row.location)) {
    errors.push("Selecciona un laboratorio.");
  }
  const date = typeof row.date === "string" ? row.date : "";
  const time = Date.parse(date + "T00:00:00Z");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(time)
    || new Date(time).toISOString().slice(0, 10) !== date || date > today) errors.push("La fecha no es válida.");
  if (!Number.isInteger(row.findings) || Number(row.findings) < 0 || Number(row.findings) > 999) {
    errors.push("Los hallazgos deben ser un entero entre 0 y 999.");
  }
  if (row.status !== (Number(row.findings) > 0 ? "attention" : "ok")) errors.push("El estado no coincide con los hallazgos.");
  if (typeof row.summary !== "string" || row.summary.trim().length < 3 || row.summary.length > 500) {
    errors.push("Escribe un resumen de 3 a 500 caracteres.");
  }
  if (typeof row.inspector !== "string" || !/^Técnic[oa] [A-Z]$/.test(row.inspector)) errors.push("Usa un alias sintético.");
  if (typeof row.statusLabel !== "string" || !row.statusLabel.trim()) errors.push("Falta la descripción del estado.");
  return errors;
}
