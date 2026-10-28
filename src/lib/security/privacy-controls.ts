/**
 * src/lib/security/privacy-controls.ts
 * Controles de privacidad y sanitizacion de datos de dispositivo (LGPDPPSO)
 * Sujeto Obligado: Universidad Tecnologica de Tehuacan (UTT)
 */

export interface GeoLocationPrivacy {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
}

export interface SanitizedGeoLocation {
  latitude: number;
  longitude: number;
  precisionLevel: "campus" | "building";
}

/**
 * Trunca las coordenadas geograficas a un numero especifico de decimales.
 * 3 decimales proporcionan una precision aproximada de ~110 metros, ideal
 * para verificar presencia en el campus de la UTT sin rastrear la posicion exacta.
 */
export function truncateCoordinatesForPrivacy(
  lat: number,
  lng: number,
  decimals: number = 3
): SanitizedGeoLocation {
  if (typeof lat !== "number" || typeof lng !== "number" || isNaN(lat) || isNaN(lng)) {
    throw new Error("Coordenadas invalidas para procesamiento de privacidad.");
  }

  const factor = Math.pow(10, decimals);
  const truncatedLat = Math.trunc(lat * factor) / factor;
  const truncatedLng = Math.trunc(lng * factor) / factor;

  return {
    latitude: truncatedLat,
    longitude: truncatedLng,
    precisionLevel: decimals <= 3 ? "campus" : "building"
  };
}

/**
 * Detecta y enmascara potenciales patrones de datos personales sensibles (correos electronicos
 * y telefonos de 10 digitos) para prevenir fugas accidentales en notas o reportes.
 */
export function maskSensitiveData(text: string): string {
  if (typeof text !== "string") return "";

  // Enmascarar correos electronicos
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  let result = text.replace(emailRegex, "[CORREO_INSTITUCIONAL_PROTEGIDO]");

  // Enmascarar telefonos de 10 digitos comunes
  const phoneRegex = /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  result = result.replace(phoneRegex, "[TELEFONO_PROTEGIDO]");

  return result;
}

/**
 * Valida el formato de imagen en base64 antes de guardarse en el almacenamiento local.
 *
 * ALCANCE Y LIMITACION: Esta funcion previene la inyeccion de imagenes vectoriales SVG
 * (que pueden contener scripts y causar XSS) y verifica que el dataUrl sea una imagen
 * valida. NO elimina metadatos EXIF del buffer binario: eso requeriria un parser de bytes
 * completo incompatible con la restriccion de "sin librerias externas". El control
 * complementario es documentar la limitacion y no capturar imagenes con rostros o PII.
 * Esta limitacion queda registrada en evidence/week-09/ismael.md (seccion Limitaciones).
 */
export function sanitizeImageEvidence(dataUrl: string): { safe: boolean; sanitizedUrl: string } {
  if (typeof dataUrl !== "string") {
    return { safe: false, sanitizedUrl: "" };
  }

  const normalized = dataUrl.trim().toLowerCase();

  if (!normalized.startsWith("data:image/")) {
    return { safe: false, sanitizedUrl: "" };
  }

  // Rechazamos SVG para prevenir XSS embebido en imagenes vectoriales
  if (normalized.includes("image/svg")) {
    return { safe: false, sanitizedUrl: "" };
  }

  return {
    safe: true,
    sanitizedUrl: dataUrl.trim()
  };
}