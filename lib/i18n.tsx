"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import es from "@/messages/es.json";
import en from "@/messages/en.json";

export type Locale = "es" | "en";
type Messages = typeof es;

const messages: Record<Locale, Messages> = { es, en };

type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (path: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("locale") as Locale | null;
      if (saved === "es" || saved === "en") setLocaleState(saved);
      else if (typeof navigator !== "undefined" && navigator.language.startsWith("en")) {
        setLocaleState("en");
      }
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem("locale", l); } catch {}
  }, []);

  const t = useCallback((path: string) => {
    const parts = path.split(".");
    let cursor: unknown = messages[locale];
    for (const p of parts) {
      if (cursor && typeof cursor === "object" && p in (cursor as Record<string, unknown>)) {
        cursor = (cursor as Record<string, unknown>)[p];
      } else {
        return path;
      }
    }
    return typeof cursor === "string" ? cursor : path;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
