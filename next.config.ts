import type { NextConfig } from "next";
import { cspPublica, RUTAS_PRIVADAS } from "./lib/csp";

/** Cabeceras de seguridad para todo el sitio (web pública, portal y admin). */
const securityHeaders = [
  // Nadie puede incrustar la web en un iframe (clickjacking sobre /admin y /portal).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=(), usb=()",
  },
  // Solo HTTPS durante dos años. Sin preload a propósito.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // Destino del report-to de la CSP (ver lib/csp.ts y app/api/csp-report).
  { key: "Reporting-Endpoints", value: 'csp-endpoint="/api/csp-report"' },
];

/** Primer segmento que la reescritura al español NO toca. */
const SIN_REESCRIBIR = [
  "en",
  "es",
  "api",
  "_next",
  ...RUTAS_PRIVADAS,
  "blog-img",
  "cv",
  "sitemap\\.xml",
  "robots\\.txt",
  "favicon\\.ico",
  "icon\\.png",
  "apple-icon\\.png",
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // CSS crítico dentro del HTML: quita la petición bloqueante de la hoja de estilos.
  experimental: { inlineCss: true, globalNotFound: true },
  images: {
    // AVIF primero (pesa menos que WebP con la misma calidad); WebP para navegadores sin AVIF.
    formats: ["image/avif", "image/webp"],
    // Un año: las portadas tienen nombre fijo (si una cambia, cambia el nombre), así que lo
    // optimizado no hace falta regenerarlo.
    minimumCacheTTL: 31536000,
  },
  // Las imágenes del blog viven en el bucket público "blog" de Supabase y se sirven por este
  // dominio: /blog-img/<slug>/<archivo>. Así el navegador solo ve 'self' (img-src de la CSP no
  // cambia) y las URLs no dependen de Supabase. El Cache-Control lo pone Supabase (un día, el
  // que se fija al subir); una regla de headers() no surte efecto sobre una respuesta proxificada.
  async rewrites() {
    const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // Tras los archivos de public/ y las rutas fijas (sitemap, robots, iconos): así no se pisan.
    const afterFiles = [
      // Español sin prefijo: la web pública vive en app/(web)/[lang] y "/x" se sirve como "/es/x".
      // Quedan fuera el inglés (/en), las rutas privadas, la API y los archivos que sirve Next.
      { source: "/", destination: "/es" },
      { source: `/:path((?!(?:${SIN_REESCRIBIR.join("|")})(?:/|$)).+)`, destination: "/es/:path" },
    ];
    if (supabase) {
      // Las imágenes del blog viven en el bucket público "blog" de Supabase y se sirven por este
      // dominio: /blog-img/<slug>/<archivo>. Así el navegador solo ve 'self' (img-src de la CSP no
      // cambia) y las URLs no dependen de Supabase. El Cache-Control lo pone Supabase (un día, el
      // que se fija al subir); una regla de headers() no surte efecto sobre una respuesta proxificada.
      afterFiles.unshift({
        source: "/blog-img/:slug/:archivo",
        destination: `${supabase}/storage/v1/object/public/blog/:slug/:archivo`,
      });
    }
    return { afterFiles };
  },
  // Una sola URL por contenido: /es/... no existe como dirección pública.
  async redirects() {
    return [
      { source: "/es", destination: "/", permanent: true },
      // Salvo la imagen para redes de los artículos: Next pone en el og:image la ruta con /es y debe responder 200.
      { source: "/es/:path((?!.*opengraph-image).*)", destination: "/:path", permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // El CV en PDF no se indexa ni se guarda en caché de buscadores (lleva datos personales). Va
      // como cabecera y no con Disallow en robots.ts: con Disallow Google no llegaría a ver el noindex.
      { source: "/cv/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, noarchive" }] },
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
