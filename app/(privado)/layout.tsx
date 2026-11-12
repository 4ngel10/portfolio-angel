import "@/app/globals.css";
import { I18nProviderPrivado } from "@/lib/i18n-privado";
import { metadataBase, RaizHtml } from "@/lib/raiz";

// Portal, admin y accesos: sus URLs no cambian y el idioma va por cookie.
export const metadata = metadataBase;

export default function PrivadoLayout({ children }: { children: React.ReactNode }) {
  return (
    <RaizHtml lang="es" proveedor={(hijos) => <I18nProviderPrivado>{hijos}</I18nProviderPrivado>}>
      {children}
    </RaizHtml>
  );
}
