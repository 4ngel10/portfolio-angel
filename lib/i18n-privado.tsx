"use client";

import React, { useCallback, useEffect, useState } from "react";
import es from "@/messages/es.json";
import en from "@/messages/en.json";
import { I18nContext, guardarIdioma, traducir, type Locale, type Messages } from "./i18n";
import { localizedHref } from "./rutas";

/**
 * Provider de la zona privada (portal, admin y accesos): el idioma sale de localStorage o del
 * navegador tras montar, y se guarda también en la cookie `locale` que lee el servidor. Lleva los
 * dos JSON porque aquí sí se cambia de idioma sin cambiar de URL. La web pública NO lo importa.
 */
const messages: Record<Locale, Messages> = { es, en };

export function I18nProviderPrivado({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("locale") as Locale | null;
      if (saved === "es" || saved === "en") {
        setLocaleState(saved);
        guardarIdioma(saved);
      } else if (typeof navigator !== "undefined" && navigator.language.startsWith("en")) {
        setLocaleState("en");
      }
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem("locale", l);
    } catch {}
    guardarIdioma(l);
  }, []);

  const t = useCallback((path: string) => traducir(messages[locale], path), [locale]);
  const l = useCallback((ruta: string) => localizedHref(locale, ruta), [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, l }}>{children}</I18nContext.Provider>
  );
}
