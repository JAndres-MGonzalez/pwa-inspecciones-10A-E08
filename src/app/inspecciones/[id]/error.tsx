/* src/app/inspecciones/[id]/error.tsx */
"use client";

import { useEffect } from "react";

export default function InspectionDetailErrorBoundary({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("No se pudo cargar el detalle");
  }, [error]);

  return (
    <div className="error-state" role="alert">
      <p className="eyebrow">Contenido de prueba</p>
      <h2>No se pudo cargar el detalle</h2>
      <p>El detalle no está disponible por el momento. Inténtalo de nuevo.</p>
      <button className="error-state__cta" type="button" onClick={reset}>
        Inténtalo de nuevo
      </button>
    </div>
  );
}