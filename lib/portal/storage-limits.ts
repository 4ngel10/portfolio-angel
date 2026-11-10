/** Tipos admitidos en el bucket "archivos". Todo lo demás se rechaza: el archivo lo abrirá otra persona. */
export const TIPOS_PERMITIDOS = new Set([
  "application/pdf",
  "application/zip",
  "application/json",
  "text/plain",
  "text/csv",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "image/tiff",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

/** Límite por archivo del plan gratuito de Supabase. */
export const MAX_BYTES_ARCHIVO = 50 * 1024 * 1024;

/** Tope por empresa (suma de todos sus archivos). */
export const MAX_BYTES_EMPRESA = 500 * 1024 * 1024;
export const MAX_ARCHIVOS_EMPRESA = 200;

/** Límites de uso por hora desde una cuenta de cliente. */
export const LIMITE_INCIDENCIAS_HORA = 10;
export const LIMITE_MENSAJES_HORA = 30;
export const LIMITE_SUBIDAS_HORA = 30;
