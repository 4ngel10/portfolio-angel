"use client";

import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  isLocale,
  translate,
  type PortalLocale,
  type PortalT,
  type Vars,
} from "@/lib/portal/translate";

type Ctx = { locale: PortalLocale; t: PortalT };
const PortalI18nContext = createContext<Ctx | null>(null);

/**
 * Lleva el idioma y el diccionario de la zona privada a los componentes cliente.
 * El idioma lo decide el servidor (cookie), así que no hay parpadeo de idioma al cargar.
 */
export function PortalI18nProvider({
  locale,
  messages,
  children,
}: {
  locale: PortalLocale;
  messages: unknown;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const t = useCallback<PortalT>(
    (path: string, vars?: Vars) => translate(messages, path, vars),
    [messages],
  );
  const value = useMemo(() => ({ locale, t }), [locale, t]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  // El servidor pinta con la cookie "locale", pero la web pública guarda el idioma en
  // localStorage. Si no coinciden (la cookie es antigua o falta), la página llega en un
  // idioma y el resto del sistema cree otro: se alinea la cookie y se vuelve a pedir la página.
  useEffect(() => {
    try {
      const guardado = localStorage.getItem("locale");
      if (isLocale(guardado) && guardado !== locale) {
        document.cookie = `locale=${guardado}; path=/; max-age=31536000; samesite=lax`;
        router.refresh();
      }
    } catch {}
  }, [locale, router]);

  return <PortalI18nContext.Provider value={value}>{children}</PortalI18nContext.Provider>;
}

export function usePT() {
  const ctx = useContext(PortalI18nContext);
  if (!ctx) throw new Error("usePT must be used inside PortalI18nProvider");
  return ctx;
}
