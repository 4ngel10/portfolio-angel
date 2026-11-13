import { NextResponse } from "next/server";
import { cvLink } from "@/lib/site";

/**
 * Descarga del CV con recuento sin cookies. Cada GET deja una línea `[cv-download] es|en` en los
 * logs de Vercel (sin IP, sin user agent, sin base de datos) y redirige al PDF de `public/cv/`.
 * HEAD no cuenta (lo usan bots y comprobaciones). 302 y no-store para que cada clic llegue aquí.
 */
export const dynamic = "force-dynamic";

const IDIOMAS = ["es", "en"] as const;
type Idioma = (typeof IDIOMAS)[number];

function destino(lang: string, request: Request) {
  if (!IDIOMAS.includes(lang as Idioma)) return null;
  const cv = cvLink(lang as Idioma);
  if (!cv) return null;
  const res = NextResponse.redirect(new URL(cv.href, request.url), 302);
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function GET(request: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const res = destino(lang, request);
  if (!res) return new NextResponse("Not found", { status: 404 });
  console.log("[cv-download]", lang);
  return res;
}

export async function HEAD(request: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return destino(lang, request) ?? new NextResponse(null, { status: 404 });
}
