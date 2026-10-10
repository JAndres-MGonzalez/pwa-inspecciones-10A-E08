/* src/components/device-evidence.tsx */
"use client";

import { useRef, useState } from "react";
import {
  captureEvidence,
  evidenceFromFile,
  getCameraPermission,
  isCameraSupported
} from "@/lib/device/camera";
import type { EvidenceRecord } from "@/lib/device/types";

interface Estado {
  tone: "ok" | "warn";
  text: string;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function DeviceEvidence({ inspectionId }: { inspectionId: string }) {
  const [estado, setEstado] = useState<Estado | null>(null);
  const [evidencia, setEvidencia] = useState<EvidenceRecord | null>(null);
  const archivo = useRef<HTMLInputElement>(null);

  // Todos los permisos se piden DENTRO de estos manejadores: cada uno nace de un clic.
  async function tomarFoto() {
    const permiso = await getCameraPermission();
    const res = await captureEvidence({ inspectionId, note: "Foto de evidencia" });
    setEvidencia(res.ok && res.value ? res.value : null);
    setEstado({
      tone: res.ok ? "ok" : "warn",
      text: res.ok
        ? `${res.message} (permiso previo: ${permiso})`
        : res.message
    });
  }

  async function elegirArchivo(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    let dataUrl = "";
    try {
      dataUrl = await readAsDataUrl(file);
    } catch (error) {
      dataUrl = "";
    }
    const res = evidenceFromFile(
      { name: file.name, size: file.size, type: file.type, dataUrl },
      { inspectionId }
    );
    setEvidencia(res.ok && res.value ? res.value : null);
    setEstado({ tone: res.ok ? "ok" : "warn", text: res.message });
  }

  return (
    <section className="content-section" aria-labelledby="evidencia-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Capacidades del dispositivo</p>
          <h2 id="evidencia-heading">Evidencia opcional</h2>
        </div>
      </div>

      <p>
        {isCameraSupported()
          ? "La cámara se usa solo cuando presionas el botón."
          : "Este navegador no ofrece cámara: usa el respaldo de archivo."}
      </p>

      <div className="detail-actions">
        <button type="button" onClick={tomarFoto}>
          Adjuntar foto
        </button>
        <button type="button" onClick={() => archivo.current?.click()}>
          Adjuntar archivo
        </button>
        <input
          ref={archivo}
          type="file"
          accept="image/*"
          onChange={elegirArchivo}
          aria-label="Archivo de evidencia"
          style={{ display: "none" }}
        />
      </div>

      {evidencia ? (
        <p>
          Evidencia registrada: <strong>{evidencia.source}</strong> · {evidencia.id}
        </p>
      ) : null}

      {/* Región viva: el resultado del fallback se anuncia sin mover el foco. */}
      <p role="status" aria-live="polite">
        {estado?.text ?? ""}
      </p>
    </section>
  );
}
