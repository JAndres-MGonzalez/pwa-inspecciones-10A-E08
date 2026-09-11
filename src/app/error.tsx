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
    console.error("Error al cargar la página:", error);
  }, [error]);

  return (
    <div className="error-state" role="alert">
      <p className="eyebrow">Contenido de prueba</p>
      <h2>No se pudo cargar el contenido</h2>
      <p>{error.message}</p>
      <button className="error-state__cta" type="button" onClick={reset}>
        Inténtalo de nuevo
      </button>
    </div>
  );
}