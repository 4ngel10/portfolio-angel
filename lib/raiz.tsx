import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/lib/theme";
import { MotionProvider } from "@/lib/motion";
import { SkipLink } from "@/components/skip-link";
import { SpeedInsightsPublico } from "@/components/speed-insights";
import { SITE_URL } from "@/lib/site";
import { THEME_SCRIPT } from "@/lib/theme-script";
import { HOME_DESCRIPTIONS, HOME_OG_IMAGE, HOME_TITLES, OG_LOCALE, SITE_NAME } from "@/lib/seo";
import { otroIdioma, type Lang } from "@/lib/rutas";

/**
 * Lo común a los dos root layouts: `app/(web)/[lang]/layout.tsx` (web pública, ES y EN) y
 * `app/(privado)/layout.tsx` (portal, admin y accesos, siempre `lang="es"` con el idioma por cookie).
 */

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

/** Metadata por defecto de la web pública en cada idioma; cada página la completa o sustituye. */
export function metadataFor(lang: Lang): Metadata {
  const title = HOME_TITLES[lang];
  const description = HOME_DESCRIPTIONS[lang];
  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    robots: {
      index: true,
      follow: true,
      googleBot: { "max-image-preview": "large", "max-snippet": -1 },
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: OG_LOCALE[lang],
      alternateLocale: OG_LOCALE[otroIdioma(lang)],
      siteName: SITE_NAME,
      images: [{ url: HOME_OG_IMAGE, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [HOME_OG_IMAGE],
    },
  };
}

/** Metadata de la zona privada (español, sin alternate). */
export const metadataBase: Metadata = metadataFor("es");

/** `proveedor` envuelve el contenido con el provider de idioma que toque (público por props, privado por cookie). */
export function RaizHtml({
  lang,
  proveedor,
  children,
}: {
  lang: string;
  proveedor: (hijos: React.ReactNode) => React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      {/* Es un root layout: aquí el <head> propio es lo correcto (la regla es para pages/). */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        {/* Tema antes de pintar + color de la barra de estado del móvil (meta theme-color).
            La meta la crea el script y no React: React 19 gestiona los <meta> y, al ver el
            color cambiado, duplicaba la etiqueta. lib/theme.tsx la actualiza al cambiar tema. */}
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_SCRIPT,
          }}
        />
        {/* Sin JS, los bloques con entrada al hacer scroll (components/reveal.tsx) se quedarían
            con la opacidad 0 del render del servidor. */}
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
        </noscript>
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          {proveedor(
            <>
              <SkipLink />
              <MotionProvider>{children}</MotionProvider>
              {/* Solo en producción (no en local ni en previews) y solo en rutas públicas. */}
              {process.env.VERCEL_ENV === "production" && <SpeedInsightsPublico />}
            </>,
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
