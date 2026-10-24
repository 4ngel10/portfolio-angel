/** Traducción de la zona privada. Código puro: se usa en servidor y en cliente. */

export type PortalLocale = "es" | "en";
export type Vars = Record<string, string | number>;
export type PortalT = (path: string, vars?: Vars) => string;

export const isLocale = (v: unknown): v is PortalLocale => v === "es" || v === "en";

/** Busca "grupo.clave" en el diccionario y sustituye {variables}. Si falta, devuelve la ruta. */
export function translate(dict: unknown, path: string, vars?: Vars): string {
  let cursor: unknown = dict;
  for (const part of path.split(".")) {
    if (cursor && typeof cursor === "object" && part in (cursor as Record<string, unknown>)) {
      cursor = (cursor as Record<string, unknown>)[part];
    } else {
      return path;
    }
  }
  if (typeof cursor !== "string") return path;
  return vars ? cursor.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : cursor;
}

export function formatDate(iso: string | null | undefined, locale: PortalLocale): string {
  if (!iso) return "";
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  return d.toLocaleDateString(locale === "es" ? "es-ES" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Fecha y hora en horario de España: el servidor corre en UTC y sin zona saldría desfasada. */
export function formatDateTime(iso: string | null | undefined, locale: PortalLocale): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString(locale === "es" ? "es-ES" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Madrid",
  });
}

export function formatEuros(n: number, locale: PortalLocale): string {
  return n.toLocaleString(locale === "es" ? "es-ES" : "en-GB", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
  });
}
