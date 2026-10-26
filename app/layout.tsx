import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";
import { I18nProvider } from "@/lib/i18n";
import { MotionProvider } from "@/lib/motion";
import { SkipLink } from "@/components/skip-link";
import { SITE_URL } from "@/lib/site";
import { HOME_DESCRIPTION, HOME_OG_IMAGE, HOME_TITLE } from "@/lib/seo";

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

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    type: "website",
    locale: "es_ES",
    images: [{ url: HOME_OG_IMAGE, width: 1200, height: 630, alt: HOME_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [HOME_OG_IMAGE],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/* Tema antes de pintar + color de la barra de estado del móvil (meta theme-color).
            La meta la crea el script y no React: React 19 gestiona los <meta> y, al ver el
            color cambiado, duplicaba la etiqueta. lib/theme.tsx la actualiza al cambiar tema. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var d=document.documentElement,dark=true;try{dark=localStorage.getItem('theme')!=='light';}catch(e){}if(dark)d.classList.add('dark');var m=document.createElement('meta');m.name='theme-color';m.content=dark?'#0a0f1c':'#fbfaf7';document.head.appendChild(m);})();`,
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
          <I18nProvider>
            <SkipLink />
            <MotionProvider>{children}</MotionProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
