/* src/app/inspecciones/[id]/page.tsx */
import { notFound } from "next/navigation";
import Link from "next/link";
import { loadInspections } from "../../../lib/data/inspection-loader";
import type { Inspection } from "../../../lib/data/inspections";

export const dynamic = "force-dynamic";

export default async function InspectionDetailPage({
  params
}: {
  params: { id: string };
}) {
  const inspections: Inspection[] = await loadInspections();
  const inspection = inspections.find((item) => item.id === params.id);

  if (!inspection) {
    notFound();
  }

  return (
    <div className="page-shell">
      <header className="hero">
        <p className="eyebrow">Datos en servidor · Semana 4</p>
        <h1>{inspection.location}</h1>
        <span className={`badge badge-${inspection.status}`}>
          {inspection.statusLabel}
        </span>
      </header>

      <section className="content-section" aria-labelledby="detalle-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Datos de demostración</p>
            <h2 id="detalle-heading">Detalle de la inspección</h2>
          </div>
        </div>

        <dl className="detail-list">
          <div>
            <dt>Fecha</dt>
            <dd>{inspection.date}</dd>
          </div>
          <div>
            <dt>Responsable</dt>
            <dd>{inspection.inspector}</dd>
          </div>
          <div>
            <dt>Hallazgos</dt>
            <dd>{inspection.findings}</dd>
          </div>
          <div>
            <dt>Resumen</dt>
            <dd>{inspection.summary}</dd>
          </div>
        </dl>

        <Link className="inspection-card__link" href="/inspecciones">
          ← Volver al listado
        </Link>
      </section>
    </div>
  );
}