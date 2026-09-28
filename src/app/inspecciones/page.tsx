/* src/app/inspecciones/page.tsx */
"use client";

import { useCallback, useEffect, useState } from "react";
import { loadInspections } from "../../lib/data/inspection-loader";
import type { Inspection } from "../../lib/data/inspections";
import { LoadingState } from "@/components/loading-state";
import { InspeccionesError, InspeccionesEmpty, InspeccionesGrid } from "@/components/inspecciones-view";

type InspeccionesState =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "ready"; items: Inspection[] };

export default function InspeccionesPage() {
  const [state, setState] = useState<InspeccionesState>({ phase: "loading" });
  const [loadMs, setLoadMs] = useState<number | null>(null);

  const load = useCallback(async () => {
    setState({ phase: "loading" });
    const started = typeof performance !== "undefined" ? performance.now() : 0;
    try {
      const items = await loadInspections();
      if (typeof performance !== "undefined") {
        setLoadMs(Math.round(performance.now() - started));
      }
      setState({ phase: "ready", items });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudieron cargar las inspecciones.";
      setState({ phase: "error", message });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="page-shell">
      <header className="hero">
        <p className="eyebrow">Interacción cliente · Semana 4</p>
        <h1>Inspecciones</h1>
        <p className="lead">
          Listado cargado en el cliente (CSR). Los datos mostrados son sintéticos.
        </p>
        <span className="status">CSR · estados de carga, error y vacío</span>
      </header>

      <section className="content-section" aria-labelledby="todas-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Datos de demostración</p>
            <h2 id="todas-heading">Todas las inspecciones</h2>
          </div>
          {state.phase === "ready" && (
            <span className="count">{state.items.length} registros</span>
          )}
        </div>

        {state.phase === "loading" && <LoadingState label="Cargando listado…" />}

        {state.phase === "error" && (
          <InspeccionesError message={state.message} onRetry={load} />
        )}

        {state.phase === "ready" &&
          (state.items.length === 0 ? (
            <InspeccionesEmpty />
          ) : (
            <InspeccionesGrid items={state.items} />
          ))}

        {loadMs !== null && (
          <p className="muted metric-note">Datos cargados en {loadMs} ms (cliente)</p>
        )}
      </section>
    </div>
  );
}