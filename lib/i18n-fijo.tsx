"use client";

import React, { useCallback, useContext } from "react";
import es from "@/messages/es.json";
import en from "@/messages/en.json";
import { I18nContext, traducir, type Locale, type Messages } from "./i18n";
import { localizedHref } from "./rutas";

const messages: Record<Locale, Messages> = { es, en };

/**
 * Pinta a sus hijos en un idioma fijo, sin tocar la cookie ni el idioma del resto de la página.
 * La vista previa del panel del blog lo usa para enseñar un artículo en español o en inglés. Vive
 * aparte para que los dos JSON no entren en el bundle de la web pública.
 */
export function FixedLocale({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const parent = useContext(I18nContext);
  const t = useCallback((path: string) => traducir(messages[locale], path), [locale]);
  const l = useCallback((ruta: string) => localizedHref(locale, ruta), [locale]);
  const setLocale = parent?.setLocale ?? (() => {});
  return (
    <I18nContext.Provider value={{ locale, setLocale, t, l }}>{children}</I18nContext.Provider>
  );
}
