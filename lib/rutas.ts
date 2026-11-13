import { RUTAS_PRIVADAS } from "./rutas-privadas";

/**
 * Rutas de la web pública por idioma. El español no lleva prefijo (`/servicios/web`) y el inglés va
 * bajo `/en` (`/en/servicios/web`). Es la ÚNICA fuente de verdad para construir enlaces internos:
 * en un componente público no se escribe un `href` interno a pelo, se pasa por `localizedHref`
 * (o por `l()` de `useI18n()`, que lo llama con el idioma de la página).
 * Sin imports de Node: la usan también componentes de cliente.
 */
export const LOCALES = ["es", "en"] as const;
export type Lang = (typeof LOCALES)[number];

/** Primer segmento de una ruta (`/blog/x#a` da `blog`), sin expresiones regulares. */
function primerSegmento(ruta: string): string {
  const sinBarra = ruta.slice(1);
  let fin = sinBarra.length;
  for (const marca of ["/", "?", "#"]) {
    const i = sinBarra.indexOf(marca);
    if (i !== -1 && i < fin) fin = i;
  }
  return sinBarra.slice(0, fin);
}

/** Las rutas privadas y la API no tienen versión en inglés: sus enlaces no se tocan. */
function esFueraDeIdioma(ruta: string): boolean {
  const primero = primerSegmento(ruta);
  return primero === "api" || (RUTAS_PRIVADAS as readonly string[]).includes(primero);
}

/** Ruta interna con el prefijo del idioma. Anclas sueltas, enlaces externos y rutas privadas pasan igual. */
export function localizedHref(locale: Lang, ruta: string): string {
  if (locale === "es") return ruta;
  if (!ruta.startsWith("/") || ruta.startsWith("//")) return ruta;
  if (esFueraDeIdioma(ruta)) return ruta;
  if (ruta === "/") return "/en";
  if (ruta.startsWith("/#") || ruta.startsWith("/?")) return `/en${ruta.slice(1)}`;
  return `/en${ruta}`;
}

/** Quita el prefijo de idioma de una ruta: `/en/blog` pasa a `/blog` y `/en` a `/`. */
export function stripLocale(pathname: string): string {
  for (const l of LOCALES) {
    if (pathname === `/${l}`) return "/";
    if (pathname.startsWith(`/${l}/`)) return pathname.slice(l.length + 1);
  }
  return pathname;
}

export function otroIdioma(locale: Lang): Lang {
  return locale === "es" ? "en" : "es";
}

/** La misma página en el otro idioma (para el selector de la nav). */
export function otherLocalePath(pathname: string, locale: Lang): string {
  return localizedHref(otroIdioma(locale), stripLocale(pathname));
}

/** Idioma de un parámetro de ruta: cualquier cosa que no sea "en" cuenta como español. */
export function parseLang(valor: string | undefined): Lang {
  return valor === "en" ? "en" : "es";
}
