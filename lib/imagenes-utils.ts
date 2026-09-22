export type ImagenItem = {
  public_id: string;
  secure_url: string;
  enUso: boolean;
  folder: string;
  bytes?: number;
  format?: string;
  width?: number;
  height?: number;
  created_at?: string;
};

/**
 * Extrae el public_id de Cloudinary a partir de una URL completa almacenada en la base de datos.
 * Maneja carpetas (ej. mi-sitio-web/hero/xxx), versiones (/v1234567890/) y extensiones de archivo (.png, .webp, etc.).
 */
export function extractPublicIdFromUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Si ya es un public_id que empieza con el prefijo esperado (no es una URL con protocolo)
  if (trimmed.startsWith("mi-sitio-web/") && !trimmed.includes("http")) {
    return trimmed.replace(/\.[^/.]+$/, "");
  }

  // Buscar el segmento estándar /upload/ de Cloudinary
  const uploadIndex = trimmed.indexOf("/upload/");
  if (uploadIndex === -1) {
    // Si contiene 'mi-sitio-web/' en cualquier parte de la ruta
    const prefixIndex = trimmed.indexOf("mi-sitio-web/");
    if (prefixIndex !== -1) {
      const pathWithExt = trimmed.slice(prefixIndex);
      return pathWithExt.replace(/\.[^/.]+$/, "").split("?")[0];
    }
    return null;
  }

  // Obtener todo después de /upload/
  const afterUpload = trimmed.substring(uploadIndex + "/upload/".length);
  const segments = afterUpload.split("/");

  // Buscar el segmento donde inicia nuestro prefijo 'mi-sitio-web'
  const miSitioIndex = segments.findIndex((s) => s === "mi-sitio-web");
  if (miSitioIndex !== -1) {
    const publicIdWithExt = segments.slice(miSitioIndex).join("/");
    return publicIdWithExt.replace(/\.[^/.]+$/, "").split("?")[0];
  }

  // Si no tiene 'mi-sitio-web', omitir posibles transformaciones y versión (v12345678)
  let startIndex = 0;
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (/^v\d+$/.test(seg)) {
      startIndex = i + 1;
      break;
    }
  }

  const remaining = segments.slice(startIndex).join("/");
  return remaining ? remaining.replace(/\.[^/.]+$/, "").split("?")[0] : null;
}

/**
 * Formatea bytes en un texto legible (KB, MB).
 */
export function formatearBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
