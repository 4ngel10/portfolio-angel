import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // AVIF primero (pesa menos que WebP con la misma calidad); WebP para navegadores sin AVIF.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
