import type { NextConfig } from "next";

/** Cabeceras de seguridad para todo el sitio (web pública, portal y admin). */
const securityHeaders = [
  // Nadie puede incrustar la web en un iframe (clickjacking sobre /admin y /portal).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // AVIF primero (pesa menos que WebP con la misma calidad); WebP para navegadores sin AVIF.
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
