"use client";

import { useEffect, useRef, useState } from "react";
import { DeviceEvidence } from "./device-evidence";
import type { Inspection } from "@/lib/data/inspections";
import { validateInspection } from "@/lib/inspection-validation";
import { LocalInspectionStore } from "@/lib/storage/local-store";
import { SyncQueue } from "@/lib/sync/queue";
import type { QueueEntry } from "@/lib/storage/schema";

export function InspectionCapture() {
  const [location, setLocation] = useState("Laboratorio de Redes");
  const [date, setDate] = useState("2026-10-20");
  const [summary, setSummary] = useState("");
  const [findings, setFindings] = useState("0");
  const [items, setItems] = useState<Inspection[]>([]);
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  const [online, setOnline] = useState(true);
  const [busy, setBusy] = useState(false);
  const store = useRef<LocalInspectionStore | null>(null);
  const queue = useRef<SyncQueue | null>(null);
  const draftId = useRef<string | null>(null);

  async function refresh() {
    setItems(await store.current!.getAll());
    setEntries(queue.current!.all().map(entry => ({ ...entry })));
  }

  useEffect(() => {
    let active = true;
    const connection = () => setOnline(navigator.onLine);
    connection();
    window.addEventListener("online", connection);
    window.addEventListener("offline", connection);
    const local = new LocalInspectionStore(localStorage);
    const sync = new SyncQueue(local, {
      async send(envelope) {
        const response = await fetch("/api/inspecciones", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(envelope), signal: AbortSignal.timeout(5000)
        });
        if (!response.ok) return { ok: false, version: envelope.version, error: "No fue posible sincronizar." };
        return response.json();
      }
    });
    store.current = local;
    queue.current = sync;
    (async () => {
      await sync.rehydrate();
      if (sync.lastPersistError) throw new Error("Almacenamiento no disponible.");
      const saved = await local.getAll();
      if (active) { setItems(saved); setEntries(sync.all()); setReady(true); }
    })().catch(() => {
      if (active) setMessage("No fue posible recuperar el almacenamiento de este navegador.");
    });
    return () => {
      active = false;
      window.removeEventListener("online", connection);
      window.removeEventListener("offline", connection);
    };
  }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (busy || !ready) return;
    draftId.current ??= `inspection-${crypto.randomUUID()}`;
    const count = findings.trim() ? Number(findings) : NaN;
    const inspection: Inspection = {
      id: draftId.current, location, date, inspector: "Técnica A", findings: count,
      status: count > 0 ? "attention" : "ok",
      statusLabel: count > 0 ? "Requiere atención" : "Sin incidencias", summary: summary.trim()
    };
    const errors = validateInspection(inspection, new Date().toISOString().slice(0, 10));
    if (errors.length) { setMessage(errors.join(" ")); return; }
    setBusy(true);
    try {
      queue.current!.enqueue(inspection, 1);
      await queue.current!.flush();
      if (queue.current!.lastPersistError) throw new Error("No se completó el guardado.");
      await refresh();
      setMessage("Inspección guardada en este navegador. Pendiente de sincronización.");
      draftId.current = null;
      setSummary("");
      setFindings("0");
    } catch {
      setMessage("No se pudo completar el guardado local. Revisa el espacio disponible y recarga antes de reintentar.");
    } finally { setBusy(false); }
  }

  async function synchronize() {
    if (busy || !ready || !navigator.onLine) return;
    setBusy(true);
    try {
      const result = await queue.current!.drain();
      await queue.current!.flush();
      if (queue.current!.lastPersistError) throw new Error("No se conservó el estado.");
      await refresh();
      setMessage(result.failed ? "No se completó la sincronización. La inspección sigue guardada."
        : "Sincronización completada.");
    } catch { setMessage("La inspección sigue guardada. Intenta sincronizar después."); }
    finally { setBusy(false); }
  }

  return (
    <div className="page-shell">
      <header className="hero">
        <h1>Nueva inspección</h1>
        <p>Usa solo datos sintéticos. El guardado queda en este navegador; la sincronización es una demostración.</p>
      </header>
      <section className="content-section">
        <p role="status" data-connection={online ? "online" : "offline"}>{online ? "Con conexión" : "Sin conexión"}</p>
        <form onSubmit={save} noValidate>
          <fieldset disabled={!ready || busy} className="capture-fields">
            <legend>Datos de prueba</legend>
            <label>Laboratorio<select name="location" value={location} onChange={e => setLocation(e.target.value)}>
              {["Redes", "Electrónica", "Software"].map(name => <option key={name}>Laboratorio de {name}</option>)}
            </select></label>
            <label>Fecha<input name="date" type="date" value={date} onChange={e => setDate(e.target.value)} /></label>
            <label>Hallazgos<input name="findings" type="number" min="0" max="999" value={findings} onChange={e => setFindings(e.target.value)} /></label>
            <label>Resumen<textarea name="summary" value={summary} onChange={e => setSummary(e.target.value)} maxLength={500} /></label>
            <button type="submit">Guardar inspección</button>
          </fieldset>
        </form>
        <p role="status" aria-live="polite" data-capture-message>{message || (ready ? "Lista para capturar." : "Preparando almacenamiento…")}</p>
        <button type="button" onClick={synchronize} disabled={!ready || busy || !online}>Sincronizar</button>
      </section>
      <DeviceEvidence inspectionId={items[items.length - 1]?.id ?? "captura-pendiente"} />
      <section className="content-section" aria-label="Inspecciones guardadas">
        <h2>Inspecciones guardadas</h2>
        <p data-local-count>{items.length} {items.length === 1 ? "registro local" : "registros locales"}</p>
        {items.map(item => {
          const entry = entries.find(value => value.envelope.data.id === item.id);
          return <article key={item.id} data-inspection-id={item.id} data-sync-state={entry?.state} className="inspection-card">
            <h3>{item.location}</h3><p>{item.summary}</p>
            <p>{entry?.state === "synced" ? "Sincronizada" : "Pendiente"}</p>
          </article>;
        })}
      </section>
    </div>
  );
}
