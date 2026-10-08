/**
 * Contrato de capacidades de dispositivo — Semana 6 (w06-device-push).
 *
 * Los tres modulos (camara, geolocalizacion y notificaciones) comparten estos tipos para
 * que la interfaz pueda tratarlos igual. Tres reglas que este contrato obliga a cumplir:
 *
 * 1. Ninguna funcion lanza excepciones: el fallo es un CapabilityResult con `error` y `message`.
 * 2. Ninguna funcion pide permiso al importarse el modulo: el permiso solo se pide desde un
 *    manejador de la interfaz (accion del usuario).
 * 3. Todas aceptan un DeviceEnv inyectable: en el navegador se usan los globals, en las
 *    pruebas se inyectan dobles y todo corre en Node sin navegador.
 */

/** Estado de permiso, normalizado entre APIs que responden cosas distintas. */
export type PermissionState = "default" | "granted" | "denied" | "unsupported";

/** Motivo del fallo. La interfaz decide que mostrar para cada uno. */
export type CapabilityError = "unsupported" | "denied" | "timeout" | "error";

/** Resultado comun. `ok` es "se logro"; `degraded` es "se uso (o hace falta) un respaldo". */
export interface CapabilityResult<T> {
  ok: boolean;
  value?: T;
  error?: CapabilityError;
  /** Texto apto para mostrar. No expone detalles internos, rutas ni datos personales. */
  message: string;
  /** true cuando la capacidad no esta disponible y el flujo continuo por otro camino. */
  degraded: boolean;
}

/** Coordenadas normalizadas. Nada de objetos de navegador: asi las pruebas corren en Node. */
export interface GeoCoordinates {
  lat: number;
  lon: number;
  accuracy: number;
}

/**
 * Evidencia opcional de una inspeccion.
 * Solo vive en memoria durante la sesion: este proyecto no tiene servidor y el modulo no
 * contiene ni `fetch` ni `XMLHttpRequest`. Nada sale del equipo.
 */
export interface EvidenceRecord {
  id: string;
  inspectionId: string;
  source: "camera" | "file";
  /** Epoch ms. Se toma de `env.now` para que las pruebas sean deterministas. */
  createdAt: number;
  note?: string;
  dataUrl?: string;
  /** null cuando no hay ubicacion: el registro es valido igual. */
  coords?: GeoCoordinates | null;
}

/**
 * Entorno inyectable. En el navegador no lo pasas (se resuelven los globals); en las
 * pruebas inyectas dobles y controlas cada fallo sin depender del equipo.
 */
export interface DeviceEnv {
  mediaDevices?: MediaDevices | null;
  permissions?: Permissions | null;
  geolocation?: Geolocation | null;
  notification?: typeof Notification | null;
  serviceWorker?: ServiceWorkerContainer | null;
  /** Fotograma de la camara (solo camara). Por defecto canvas; las pruebas inyectan un doble. */
  captureFrame?: (stream: MediaStream) => Promise<string>;
  now?: () => number;
}
