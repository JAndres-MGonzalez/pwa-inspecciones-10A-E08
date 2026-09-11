import { loadInspections } from "../lib/data/inspection-loader";
import type { Inspection } from "../lib/data/inspections";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const inspections: Inspection[] = await loadInspections();

  return (
    <main className="page-shell">
      <header className="hero">
        <p className="eyebrow">App shell · Semana 2</p>
        <h1>Inspecciones de laboratorio</h1>
        <p className="lead">
          Registro de mantenimiento para trabajar con conectividad intermitente.
          Los datos mostrados son sintéticos.
        </p>
        <span className="status">App shell · estados de carga, error y vacío</span>
      </header>

      <section aria-labelledby="inspections-heading" className="content-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Datos de demostración</p>
            <h2 id="inspections-heading">Inspecciones recientes</h2>
          </div>
          <span className="count">{inspections.length} registros</span>
        </div>

        {inspections.length === 0 ? (
          <div className="empty-state">
            <p className="eyebrow">Sin registros</p>
            <p className="empty-state__text">
              Sin inspecciones capturadas por el momento: el registro se muestra cuando
              haya datos disponibles.
            </p>
          </div>
        ) : (
          <div className="inspection-grid">
            {inspections.map((inspection) => (
              <article className="inspection-card" key={inspection.id}>
                <div className="card-topline">
                  <span className={`badge badge-${inspection.status}`}>{inspection.statusLabel}</span>
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
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="footer">
        <p>Aplicaciones Web Progresivas · Universidad Tecnológica de Tehuacán</p>
      </footer>
    </main>
  );
}