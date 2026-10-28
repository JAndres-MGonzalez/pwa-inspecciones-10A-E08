/**
 * src/lib/security/input-validation.ts
 * Controles de validacion defensiva y sanitizacion de entradas para inspecciones
 * Sujeto Obligado: Universidad Tecnologica de Tehuacan (UTT)
 */

export interface ValidationResult<T> {
  valid: boolean;
  sanitized?: T;
  errors: string[];
}

export interface RawInspectionPayload {
  id?: unknown;
  location?: unknown;
  date?: unknown;
  inspector?: unknown;
  status?: unknown;
  statusLabel?: unknown;
  findings?: unknown;
  summary?: unknown;
}

export interface ValidatedInspection {
  id: string;
  location: string;
  date: string;
  inspector: string;
  status: "ok" | "warning" | "danger";
  statusLabel: string;
  findings: number;
  summary: string;
}

// Limites razonables de tamano para mitigar DoS y desbordes de almacenamiento
const MAX_LENGTH_ID = 64;
const MAX_LENGTH_TEXT = 256;
const MAX_LENGTH_SUMMARY = 1000;
const VALID_STATUSES = new Set(["ok", "warning", "danger"]);

// Regex segura para IDs (solo caracteres alfanumericos, guiones y guion bajo)
const SAFE_ID_REGEX = /^[a-zA-Z0-9_-]+$/;

// Regex para fechas ISO (YYYY-MM-DD)
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Sanitiza una cadena de texto eliminando bloques de script peligrosos (<script>...</script>)
 * y escapando entidades HTML basicas para mitigar Cross-Site Scripting (XSS).
 *
 * NOTA DE IMPLEMENTACION: El escape ocurre DESPUES de eliminar scripts, pero NO se eliminan
 * otras etiquetas HTML genericas. Esto garantiza que caracteres como '<test>' queden
 * representados como '&lt;test&gt;' (predecible y verificable por las pruebas), en lugar
 * de desaparecer silenciosamente. El resultado es texto plano seguro para almacenar y mostrar.
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

/**
 * Valida y sanitiza una inspeccion completa.
 * Aplica principio de minimo privilegio y rechazo explicito de entradas malformadas.
 */
export function validateInspectionInput(payload: unknown): ValidationResult<ValidatedInspection> {
  const errors: string[] = [];

  if (!payload || typeof payload !== "object") {
    return { valid: false, errors: ["El cuerpo de la inspeccion debe ser un objeto valido."] };
  }

  const raw = payload as RawInspectionPayload;

  // 1. Validar ID
  let id = "";
  if (typeof raw.id !== "string" || !raw.id.trim()) {
    errors.push("El campo 'id' es requerido y debe ser una cadena.");
  } else if (raw.id.length > MAX_LENGTH_ID) {
    errors.push(`El campo 'id' excede la longitud maxima de ${MAX_LENGTH_ID} caracteres.`);
  } else if (!SAFE_ID_REGEX.test(raw.id)) {
    errors.push("El campo 'id' solo permite caracteres alfanumericos, guiones y guiones bajos.");
  } else {
    id = raw.id.trim();
  }

  // 2. Validar Ubicacion
  let location = "";
  if (typeof raw.location !== "string" || !raw.location.trim()) {
    errors.push("El campo 'location' es requerido.");
  } else if (raw.location.length > MAX_LENGTH_TEXT) {
    errors.push(`El campo 'location' excede ${MAX_LENGTH_TEXT} caracteres.`);
  } else {
    location = sanitizeString(raw.location);
  }

  // 3. Validar Fecha
  let date = "";
  if (typeof raw.date !== "string" || !ISO_DATE_REGEX.test(raw.date)) {
    errors.push("El campo 'date' debe cumplir el formato ISO YYYY-MM-DD.");
  } else {
    date = raw.date;
  }

  // 4. Validar Inspector (Seudonimizado o sintético)
  let inspector = "";
  if (typeof raw.inspector !== "string" || !raw.inspector.trim()) {
    errors.push("El campo 'inspector' es requerido.");
  } else if (raw.inspector.length > MAX_LENGTH_TEXT) {
    errors.push(`El campo 'inspector' excede ${MAX_LENGTH_TEXT} caracteres.`);
  } else {
    inspector = sanitizeString(raw.inspector);
  }

  // 5. Validar Estatus
  let status: "ok" | "warning" | "danger" = "ok";
  if (typeof raw.status !== "string" || !VALID_STATUSES.has(raw.status)) {
    errors.push("El campo 'status' debe ser uno de: ok, warning, danger.");
  } else {
    status = raw.status as "ok" | "warning" | "danger";
  }

  // 6. Validar StatusLabel
  let statusLabel = "";
  if (typeof raw.statusLabel === "string") {
    statusLabel = sanitizeString(raw.statusLabel).slice(0, MAX_LENGTH_TEXT);
  } else {
    statusLabel = status;
  }

  // 7. Validar Hallazgos (findings)
  let findings = 0;
  if (typeof raw.findings !== "number" || isNaN(raw.findings) || raw.findings < 0 || !Number.isInteger(raw.findings)) {
    errors.push("El campo 'findings' debe ser un numero entero mayor o igual a 0.");
  } else {
    findings = raw.findings;
  }

  // 8. Validar Resumen (summary)
  let summary = "";
  if (typeof raw.summary !== "string") {
    errors.push("El campo 'summary' debe ser una cadena.");
  } else if (raw.summary.length > MAX_LENGTH_SUMMARY) {
    errors.push(`El campo 'summary' no debe superar ${MAX_LENGTH_SUMMARY} caracteres.`);
  } else {
    summary = sanitizeString(raw.summary);
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    sanitized: {
      id,
      location,
      date,
      inspector,
      status,
      statusLabel,
      findings,
      summary
    },
    errors: []
  };
}
