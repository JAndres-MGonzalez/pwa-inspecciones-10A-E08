"use client";

import { useEffect } from "react";

export default function GlobalErrorBoundary({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("No se pudo cargar el contenido");
  }, [error]);

  return (
    <div className="error-state" role="alert">
      <p className="eyebrow">Contenido de prueba</p>
      <h2>No se pudo cargar el contenido</h2>
      <p>Ocurrió un error inesperado. Inténtalo de nuevo.</p>
      <button className="error-state__cta" type="button" onClick={reset}>
        Inténtalo de nuevo
      </button>
    </div>
  );
}