import type { NextConfig } from "next";
import { cspPublica, RUTAS_PRIVADAS } from "./lib/csp";

/** Cabeceras de seguridad para todo el sitio (web pública, portal y admin). */
const securityHeaders = [
  // Nadie puede incrustar la web en un iframe (clickjacking sobre /admin y /portal).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=(), usb=()" },
  // Solo HTTPS durante dos años. Sin preload a propósito.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // AVIF primero (pesa menos que WebP con la misma calidad); WebP para navegadores sin AVIF.
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // CSP de la web pública: frame-ancestors (enforced) y la política completa en modo prueba.
      // Las rutas privadas las recibe de proxy.ts con nonce, así que se excluyen aquí. La
      // frame-ancestors NO puede ir en las cabeceras globales: en Vercel llega también a la petición
      // y pisa la del proxy, y Next ya no encuentra el nonce. Ver docs/csp.md.
      {
        source: `/((?!(?:${RUTAS_PRIVADAS.join("|")}|api)(?:/|$)).*)`,
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "Content-Security-Policy-Report-Only", value: cspPublica() },
        ],
      },
    ];
  },
};

export default nextConfig;
