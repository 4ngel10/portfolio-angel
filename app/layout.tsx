import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";
import { I18nProvider } from "@/lib/i18n";
import { MotionProvider } from "@/lib/motion";
import { SITE_URL } from "@/lib/site";

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
  title: "Ángel Fernández · Portfolio",
  description:
    "Administrador de Sistemas y Desarrollador Web en Palma de Mallorca. Infraestructura IT, seguridad, continuidad de negocio y desarrollo web profesional.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "Ángel Fernández · Portfolio",
    description: "Infraestructura IT y desarrollo web profesional en Palma de Mallorca.",
    type: "website",
    locale: "es_ES",
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
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <I18nProvider>
            <MotionProvider>{children}</MotionProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
