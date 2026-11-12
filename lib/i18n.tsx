"use client";

import React, { createContext, useContext, useCallback } from "react";
import { localizedHref, type Lang } from "./rutas";

export type Locale = Lang;

/**
 * Textos de la web pública. El servidor elige el idioma por la URL (`/` es español, `/en` inglés),
 * lee `messages/<lang>.json` y se lo pasa al provider por props: así el HTML ya sale en el idioma
 * correcto y al navegador solo llega un idioma. El portal y el admin usan `lib/i18n-privado.tsx`
 * (idioma por cookie) y la vista previa del blog `lib/i18n-fijo.tsx`; ninguno entra en el bundle público.
 */
export type Messages = Record<string, unknown>;

export type I18nContextValue = {
  locale: Locale;
  /** Solo el idioma por cookie de la zona privada lo cambia; en la web pública se cambia de URL. */
  setLocale: (l: Locale) => void;
  t: (path: string) => string;
  /** Ruta interna de la web pública en el idioma actual (`l("/blog")` es `/en/blog` en inglés). */
  l: (ruta: string) => string;
};

export const I18nContext = createContext<I18nContextValue | null>(null);

/** Busca una ruta con puntos (`hero.title1Pre`) en los mensajes; si falta devuelve la propia ruta. */
export function traducir(messages: Messages, path: string): string {
  let cursor: unknown = messages;
  for (const p of path.split(".")) {
    if (cursor && typeof cursor === "object" && p in (cursor as Record<string, unknown>)) {
      cursor = (cursor as Record<string, unknown>)[p];
    } else {
      return path;
    }
  }
  return typeof cursor === "string" ? cursor : path;
}

/**
 * La zona privada (portal y admin) pinta en el servidor y lee el idioma de esta cookie. La web
 * pública la escribe al cambiar de idioma con el selector, para que el portal y los correos sigan
 * el mismo idioma.
 */
export function guardarIdioma(l: Locale) {
  try {
    document.cookie = `locale=${l}; path=/; max-age=31536000; samesite=lax`;
  } catch {}
}

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: React.ReactNode;
}) {
  const t = useCallback((path: string) => traducir(messages, path), [messages]);
  const l = useCallback((ruta: string) => localizedHref(locale, ruta), [locale]);
  const setLocale = useCallback((nuevo: Locale) => guardarIdioma(nuevo), []);
  return (
    <I18nContext.Provider value={{ locale, setLocale, t, l }}>{children}</I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
