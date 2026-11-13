import "./globals.css";
import Link from "next/link";
import { I18nProvider } from "@/lib/i18n";
import { RaizHtml, metadataBase } from "@/lib/raiz";
import es from "@/messages/es.json";

// 404 de cualquier URL que no exista. La web pública y la privada tienen cada una su root layout,
// así que Next necesita un 404 global con su propio <html>. Va deliberadamente ligera, sin la nav
// ni el footer (que son componentes de cliente y, al colgar del root, engordaban el JS de TODAS las
// rutas unos 30 KB). Sin ruta no hay idioma: sale en español con una línea en inglés.
export const metadata = {
  ...metadataBase,
  title: "Página no encontrada · Ángel Fernández",
};

const ENLACES = [
  { href: "/", es: "Inicio", en: "Home" },
  { href: "/servicios/sistemas", es: "Soporte informático", en: "IT support" },
  { href: "/servicios/web", es: "Diseño web", en: "Web design" },
  { href: "/blog", es: "Blog", en: "Blog" },
];

export default function GlobalNotFound() {
  return (
    <RaizHtml
      lang="es"
      proveedor={(hijos) => (
        <I18nProvider locale="es" messages={es}>
          {hijos}
        </I18nProvider>
      )}
    >
      <header className="mx-auto flex h-[72px] max-w-6xl items-center px-6 md:px-8">
        <Link href="/" className="text-[15px] font-semibold tracking-tight">
          Ángel Fernández<span style={{ color: "var(--accent)" }}>.</span>
        </Link>
      </header>
      <main id="main" className="mx-auto max-w-6xl px-6 pt-16 pb-28 md:px-8 md:pt-24">
        <h1 className="max-w-3xl text-[clamp(2rem,5vw,3.75rem)] leading-[1.05] font-semibold tracking-[-0.035em]">
          Esta página no existe
        </h1>
        <p className="text-muted mt-6 max-w-2xl text-[19px] leading-relaxed">
          Puede que el enlace esté roto o que la página se haya movido. This page could not be
          found.
        </p>
        <ul className="mt-10 flex flex-wrap gap-3">
          {ENLACES.map((e) => (
            <li key={e.href}>
              <Link href={e.href} className="btn-secondary">
                {e.es} <span className="text-muted">/ {e.en}</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </RaizHtml>
  );
}
