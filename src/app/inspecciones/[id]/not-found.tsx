/* src/app/inspecciones/[id]/not-found.tsx */
import Link from "next/link";

export default function InspectionNotFound() {
  return (
    <div className="error-state">
      <p className="eyebrow">Sin resultados</p>
      <h2>Inspección no encontrada</h2>
      <p>
        No existe una inspección con ese identificador en los datos sintéticos.
      </p>
      <Link className="error-state__cta" href="/inspecciones">
        Volver al listado
      </Link>
    </div>
  );
}