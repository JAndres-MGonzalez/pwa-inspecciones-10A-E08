import { NextResponse } from "next/server";
import { idempotencyKey, type SyncEnvelope } from "@/lib/storage/schema";
import { validateInspection } from "@/lib/inspection-validation";

export const dynamic = "force-dynamic";
// Servicio de demostración con datos sintéticos. Se reinicia al detener el servidor.
const records = new Map<string, SyncEnvelope>();
const operations = new Map<string, string>();
const reply = (body: unknown, status = 200) => NextResponse.json(body, {
  status, headers: { "Cache-Control": "no-store" }
});

export async function POST(request: Request) {
  let envelope: SyncEnvelope;
  try { envelope = await request.json(); }
  catch { return reply({ ok: false, message: "JSON inválido." }, 400); }
  if (!envelope || !Number.isInteger(envelope.version) || envelope.version < 1
    || !Number.isFinite(envelope.updatedAt)
    || validateInspection(envelope.data, new Date().toISOString().slice(0, 10)).length
    || envelope.key !== idempotencyKey(envelope.data, envelope.version)) {
    return reply({ ok: false, message: "La operación no es válida." }, 400);
  }
  const body = JSON.stringify(envelope.data);
  const previous = operations.get(envelope.key);
  if (previous !== undefined && previous !== body) {
    return reply({ ok: false, message: "La operación ya tiene otro contenido." }, 409);
  }
  if (previous === undefined) {
    const current = records.get(envelope.data.id);
    if (!current || envelope.version > current.version) records.set(envelope.data.id, envelope);
    operations.set(envelope.key, body);
  }
  return reply({ ok: true, version: envelope.version, duplicate: previous !== undefined });
}

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return reply({ message: "Indica una inspección." }, 400);
  const record = records.get(id);
  return reply({ records: record ? [record.data] : [], count: record ? 1 : 0 });
}
