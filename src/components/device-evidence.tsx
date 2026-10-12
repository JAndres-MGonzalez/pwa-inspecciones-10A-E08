/* src/components/device-evidence.tsx */
"use client";

import { useRef, useState } from "react";
import {
  captureEvidence,
  evidenceFromFile,
  getCameraPermission
} from "@/lib/device/camera";
import { notifyChange, requestPermission } from "@/lib/notifications/client";
import { getCurrentPosition } from "@/lib/device/geolocation";
import type { EvidenceRecord, GeoCoordinates } from "@/lib/device/types";

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
  const [aviso, setAviso] = useState("");
  const [avisando, setAvisando] = useState(false);
  const [permisoAviso, setPermisoAviso] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [localizando, setLocalizando] = useState(false);
  const coordenadas = useRef<GeoCoordinates | null>(null);
  const archivo = useRef<HTMLInputElement>(null);

  // Todos los permisos se piden DENTRO de estos manejadores: cada uno nace de un clic.
  async function tomarFoto() {
    const permiso = await getCameraPermission();
    const res = await captureEvidence({ inspectionId, note: "Foto de evidencia" });
    if (res.ok && res.value) setEvidencia({ ...res.value, coords: coordenadas.current });
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
    } catch {
      setEstado({ tone: "warn", text: "No fue posible leer el archivo. Intenta con otro archivo." });
      return;
    }
    if (!dataUrl) {
      setEstado({ tone: "warn", text: "El archivo no contiene una imagen utilizable." });
      return;
    }
    const res = evidenceFromFile(
      { name: file.name, size: file.size, type: file.type, dataUrl },
      { inspectionId }
    );
    if (res.ok && res.value) setEvidencia({ ...res.value, coords: coordenadas.current });
    setEstado({ tone: res.ok ? "ok" : "warn", text: res.message });
  }

  async function avisarCambio() {
    setAvisando(true);
    try {
      const result = await notifyChange({
        title: "Cambio en la inspección",
        body: evidencia
          ? `Evidencia opcional adjuntada a ${inspectionId}.`
          : `Aviso de cambio de prueba para ${inspectionId}.`
      });
      setAviso(result.message);
    } finally {
      setAvisando(false);
    }
  }

  async function permitirNotificaciones() {
    const permission = await requestPermission();
    setPermisoAviso(permission === "granted"
      ? "Notificaciones permitidas. Puedes enviar el aviso al sistema."
      : "El aviso seguirá disponible en pantalla.");
  }

  async function pedirUbicacion() {
    setLocalizando(true);
    try {
      const result = await getCurrentPosition({ timeoutMs: 5000 });
      const value = result.ok && result.value ? result.value : null;
      coordenadas.current = value;
      setEvidencia(previous => previous ? { ...previous, coords: value } : previous);
      setUbicacion(value
        ? `${value.lat.toFixed(4)}, ${value.lon.toFixed(4)} (±${Math.round(value.accuracy)} m)`
        : result.message);
    } finally {
      setLocalizando(false);
    }
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
        Puedes adjuntar una foto o un archivo. La cámara se usa solo cuando presionas el botón.
      </p>

      <div className="detail-actions" style={{ flexWrap: "wrap" }}>
        <button type="button" onClick={tomarFoto}>
          Adjuntar foto
        </button>
        <button type="button" onClick={() => archivo.current?.click()}>
          Adjuntar archivo
        </button>
        <button type="button" onClick={avisarCambio} disabled={avisando}>
          {avisando ? "Enviando aviso…" : "Avisar cambio"}
        </button>
        <button type="button" onClick={permitirNotificaciones}>
          Permitir notificaciones
        </button>
        <button type="button" onClick={pedirUbicacion} disabled={localizando}>
          {localizando ? "Solicitando ubicación…" : "Adjuntar ubicación"}
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
      <p role="status" aria-live="polite">{aviso}</p>
      <p role="status" aria-live="polite">{permisoAviso}</p>
      <p role="status" aria-live="polite">{ubicacion}</p>
    </section>
  );
}
