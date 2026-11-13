import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { comprobarAdmin } from "@/lib/portal/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugValido } from "@/lib/blog-validate";
import { esErrorImagen, nombreImagen, procesarImagen, subirImagen } from "@/lib/blog-imagenes";
import { DESTINO_PORTFOLIO } from "@/lib/blog-save";

/**
 * Subida de imágenes del editor del portfolio. Solo el admin (comprobarAdmin). Misma conversión
 * que el blog (lib/blog-imagenes.ts): WebP de 2200 px de ancho como máximo, el SVG revisado y
 * rasterizado, y nunca un SVG en el bucket. La guarda en el bucket público "portfolio" como
 * <slug>/<nombre>.webp y devuelve la ruta por la que se sirve (/portfolio-img/<slug>/<nombre>.webp)
 * con su tamaño. Un nombre que ya existe da 409: aquí siempre lleva un sufijo aleatorio.
 */

export const runtime = "nodejs";

const MAX_BYTES_ENTRADA = 15 * 1024 * 1024;

export async function POST(request: Request) {
  const auth = await comprobarAdmin();
  if (!auth.ok) return NextResponse.json({ error: "No autorizado" }, { status: auth.status });

  const form = await request.formData().catch(() => null);
  const archivo = form?.get("archivo");
  const slug = form?.get("slug");
  if (!(archivo instanceof File) || typeof slug !== "string" || !slugValido(slug)) {
    return NextResponse.json({ error: "Faltan el archivo o un slug válido." }, { status: 400 });
  }
  if (archivo.size > MAX_BYTES_ENTRADA) {
    return NextResponse.json({ error: "La imagen pesa más de 15 MB." }, { status: 413 });
  }

  const imagen = await procesarImagen(Buffer.from(await archivo.arrayBuffer()), archivo.type);
  if (esErrorImagen(imagen)) {
    return NextResponse.json({ error: imagen.error }, { status: imagen.status });
  }

  const nombre = `${nombreImagen(archivo.name)}-${randomBytes(3).toString("hex")}`;
  const subida = await subirImagen(
    createAdminClient(),
    slug,
    nombre,
    imagen,
    false,
    DESTINO_PORTFOLIO,
  );
  if (esErrorImagen(subida)) {
    return NextResponse.json({ error: subida.error }, { status: subida.status });
  }
  return NextResponse.json({ path: subida.ruta, width: imagen.width, height: imagen.height });
}
