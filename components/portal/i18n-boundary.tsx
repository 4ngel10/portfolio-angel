import { getLocale, portalMessages } from "@/lib/portal/i18n";
import { PortalI18nProvider } from "./i18n-provider";

/** Envuelve una página o layout de la zona privada con el idioma elegido en el servidor. */
export async function I18nBoundary({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <PortalI18nProvider locale={locale} messages={portalMessages(locale)}>
      {children}
    </PortalI18nProvider>
  );
}
