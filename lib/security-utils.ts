/**
 * Constantes y utilidades de seguridad para validación, sanitización y prevención de abusos.
 */

export const MAX_NAME_LENGTH = 100;
export const MAX_EMAIL_LENGTH = 254;
export const MAX_MESSAGE_LENGTH = 5000;
export const MAX_BODY_BYTES = 10 * 1024; // 10 KB límite de payload
export const HONEYPOT_FIELD_NAME = "sitio_web";

/**
 * Escapa caracteres especiales en strings para prevenir inyección de código HTML.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Valida si un string cumple el formato de correo electrónico según RFC 5322 simplificado.
 */
export function isValidEmail(email: string): boolean {
  if (!email || email.length > MAX_EMAIL_LENGTH) {
    return false;
  }

  // Regex estándar que cubre la estructura nombre@dominio.tld
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(email)) {
    return false;
  }

  // Verificación adicional de longitud de parte local y etiquetas de dominio
  const [localPart, domainPart] = email.split("@");
  if (!localPart || localPart.length > 64) {
    return false;
  }
  if (!domainPart || domainPart.length > 255) {
    return false;
  }

  return true;
}

export type ValidatedContactData = {
  nombre: string;
  email: string;
  mensaje: string;
};

export type ValidationResult =
  | { success: true; isSpam: false; data: ValidatedContactData }
  | { success: true; isSpam: true }
  | { success: false; error: string; statusCode: number };

/**
 * Valida el cuerpo de la solicitud para el endpoint de contacto.
 */
export function validateContactPayload(body: unknown): ValidationResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      success: false,
      error: "El cuerpo de la solicitud debe ser un objeto JSON válido.",
      statusCode: 400,
    };
  }

  const record = body as Record<string, unknown>;

  // 1. Verificación de Honeypot anti-spam
  const honeypotVal = record[HONEYPOT_FIELD_NAME];
  if (typeof honeypotVal === "string" && honeypotVal.trim() !== "") {
    // Si el honeypot fue completado, es un bot automatizado
    return { success: true, isSpam: true };
  }

  // 2. Validación de 'nombre'
  if (typeof record.nombre !== "string") {
    return {
      success: false,
      error: "El nombre es obligatorio y debe ser un texto.",
      statusCode: 400,
    };
  }
  const nombre = record.nombre.trim().replace(/\s+/g, " ");
  if (nombre.length === 0) {
    return {
      success: false,
      error: "Por favor, ingresa tu nombre.",
      statusCode: 400,
    };
  }
  if (nombre.length > MAX_NAME_LENGTH) {
    return {
      success: false,
      error: `El nombre no puede exceder los ${MAX_NAME_LENGTH} caracteres.`,
      statusCode: 400,
    };
  }

  // 3. Validación de 'email'
  if (typeof record.email !== "string") {
    return {
      success: false,
      error: "El correo electrónico es obligatorio y debe ser un texto.",
      statusCode: 400,
    };
  }
  const email = record.email.trim().toLowerCase();
  if (email.length === 0 || !isValidEmail(email)) {
    return {
      success: false,
      error: "Por favor, ingresa un correo electrónico válido.",
      statusCode: 400,
    };
  }

  // 4. Validación de 'mensaje' (o 'contenido')
  const rawMensaje =
    typeof record.mensaje === "string"
      ? record.mensaje
      : typeof record.contenido === "string"
      ? record.contenido
      : null;

  if (rawMensaje === null) {
    return {
      success: false,
      error: "El mensaje es obligatorio y debe ser un texto.",
      statusCode: 400,
    };
  }

  const mensaje = rawMensaje.trim();
  if (mensaje.length === 0) {
    return {
      success: false,
      error: "Por favor, escribe un mensaje.",
      statusCode: 400,
    };
  }
  if (mensaje.length > MAX_MESSAGE_LENGTH) {
    return {
      success: false,
      error: `El mensaje no puede exceder los ${MAX_MESSAGE_LENGTH} caracteres.`,
      statusCode: 400,
    };
  }

  return {
    success: true,
    isSpam: false,
    data: {
      nombre,
      email,
      mensaje,
    },
  };
}

/**
 * Valida si el origen (Origin / Referer) de la solicitud coincide con el Host permitido.
 * Previene solicitudes cross-site arbitrarias de terceros.
 */
export function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host");

  if (!host) {
    return true; // En entornos donde no se expone host, no bloquear
  }

  const normalizedHost = host.toLowerCase().trim();

  // Si hay cabecera Origin, comprobar coincidencia con el host
  if (origin) {
    try {
      const originUrl = new URL(origin);
      return originUrl.host.toLowerCase() === normalizedHost;
    } catch {
      return false;
    }
  }

  // Si no hay Origin pero hay Referer, comprobar coincidencia
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      return refererUrl.host.toLowerCase() === normalizedHost;
    } catch {
      return false;
    }
  }

  // Si ninguna cabecera de origen está presente (por ejemplo, clientes sin navegador o tests),
  // se permite para no romper compatibilidad legítima.
  return true;
}
