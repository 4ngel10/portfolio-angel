import "@/app/globals.css";
import { I18nProvider } from "@/lib/i18n";
import { RaizHtml, metadataFor } from "@/lib/raiz";
import { LOCALES, type Lang } from "@/lib/rutas";
import es from "@/messages/es.json";
import en from "@/messages/en.json";

// Web pública. El español se sirve sin prefijo (next.config.ts lo reescribe a /es/...) y el inglés en /en/...
const MENSAJES = { es, en };

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return metadataFor(lang_(await params));
}

function lang_(p: { lang: string }): Lang {
  return p.lang === "en" ? "en" : "es";
}

export default async function WebLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  // Sin notFound() aquí: al pintar un 404 Next puede llamar al layout sin `lang`. Cualquier valor
  // que no sea "en" se pinta en español.
  const lang = lang_(await params);
  return (
    <RaizHtml
      lang={lang}
      proveedor={(hijos) => (
        <I18nProvider locale={lang} messages={MENSAJES[lang]}>
          {hijos}
        </I18nProvider>
      )}
    >
      {children}
    </RaizHtml>
  );
}
