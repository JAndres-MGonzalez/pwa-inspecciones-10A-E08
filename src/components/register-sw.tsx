"use client";

import { useEffect, useState } from "react";
import registerServiceWorker from "@/lib/pwa/register-service-worker";

export function RegisterSw() {
  const [applyUpdate, setApplyUpdate] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    registerServiceWorker((apply) => setApplyUpdate(() => apply));
  }, []);

  if (!applyUpdate) return null;

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        padding: "12px 16px",
        background: "#111",
        color: "#fff",
        borderRadius: 8,
        display: "flex",
        gap: 12,
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <span>Nueva versi&oacute;n disponible</span>
      <button onClick={applyUpdate}>Actualizar</button>
      <button onClick={() => setApplyUpdate(null)}>Luego</button>
    </div>
  );
}
