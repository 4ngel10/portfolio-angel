import "server-only";
import { cookies, headers } from "next/headers";
import es from "@/messages/es.json";
import en from "@/messages/en.json";
import {
  formatDate,
  formatDateTime,
  formatEuros,
  isLocale,
  translate,
  type PortalLocale,
  type PortalT,
  type Vars,
} from "./translate";

const dictionaries = { es: es.portal, en: en.portal };

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
  return { locale, t, fecha, fechaHora, euros };
}
