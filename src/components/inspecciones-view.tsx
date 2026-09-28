/* src/components/inspecciones-view.tsx */
import Link from "next/link";
import type { Inspection } from "../lib/data/inspections";

export function InspeccionesGrid({ items }: { items: Inspection[] }) {
  return (
    <div className="inspection-grid">
      {items.map((inspection) => (
        <article className="inspection-card" key={inspection.id}>
          <div className="card-topline">
            <span className={`badge badge-${inspection.status}`}>
              {inspection.statusLabel}
            </span>
            <span className="muted">{inspection.date}</span>
          </div>
          <h3>{inspection.location}</h3>
          <p>{inspection.summary}</p>
          <dl>
            <div>
              <dt>Responsable</dt>
              <dd>{inspection.inspector}</dd>
            </div>
            <div>
              <dt>Hallazgos</dt>
              <dd>{inspection.findings}</dd>
            </div>
          </dl>
          <Link className="inspection-card__link" href={`/inspecciones/${inspection.id}`}>
            Ver detalle
          </Link>
        </article>
      ))}
    </div>
  );
}

export function InspeccionesEmpty() {
  return (
    <div className="empty-state">
      <p className="eyebrow">Sin registros</p>
      <p className="empty-state__text">
        Sin inspecciones capturadas por el momento: el registro se muestra cuando
        haya datos disponibles.
      </p>
    </div>
  );
}

export function InspeccionesError({
  message,
  onRetry
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="error-state" role="alert">
      <p className="eyebrow">Contenido de prueba</p>
      <h2>No se pudo cargar el listado</h2>
      <p>{message}</p>
      <button className="error-state__cta" type="button" onClick={onRetry}>
        Inténtalo de nuevo
      </button>
    </div>
  );
}