import "server-only";
import { cookies, headers } from "next/headers";
// Los textos del portal y del admin van en sus propios archivos (messages/portal.*.json) para que
// no viajen en el JS de la web pública, que solo usa es.json y en.json.
import esPortal from "@/messages/portal.es.json";
import enPortal from "@/messages/portal.en.json";
import {
  formatDate,
  formatDateTime,
  formatEuros,
  formatHoras,
  formatMes,
  formatNumero,
  isLocale,
  translate,
  type PortalLocale,
  type PortalT,
  type Vars,
} from "./translate";

const dictionaries = { es: esPortal, en: enPortal };

/**
 * Idioma de la zona privada: la cookie "locale" (la escribe el botón ES / EN y también
 * el de la web pública) y, si aún no existe, el idioma del navegador.
 */
export async function getLocale(): Promise<PortalLocale> {
  const saved = (await cookies()).get("locale")?.value;
  if (isLocale(saved)) return saved;
  const accept = (await headers()).get("accept-language") ?? "";
  return accept.toLowerCase().startsWith("en") ? "en" : "es";
}

export function portalMessages(locale: PortalLocale) {
  return dictionaries[locale];
}

/** Traductor para componentes de servidor, Server Actions y rutas de API. */
export async function getI18n() {
  const locale = await getLocale();
  const dict = dictionaries[locale];
  const t: PortalT = (path: string, vars?: Vars) => translate(dict, path, vars);
  const fecha = (iso: string | null | undefined) => formatDate(iso, locale);
  const fechaHora = (iso: string | null | undefined) => formatDateTime(iso, locale);
  const euros = (n: number) => formatEuros(n, locale);
  const num = (n: number) => formatNumero(n, locale);
  const horas = (n: number) => formatHoras(n, locale);
  const mes = (m: string) => formatMes(m, locale);
  return { locale, t, fecha, fechaHora, euros, num, horas, mes };
}
