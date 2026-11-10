import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { comprobarAdmin } from "@/lib/portal/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugValido } from "@/lib/blog-validate";
import { esErrorImagen, nombreImagen, procesarImagen, subirImagen } from "@/lib/blog-imagenes";

/**
 * Subida de imágenes del editor del blog. Solo el admin (comprobarAdmin). Convierte a WebP
 * (máximo 2200 px de ancho), la guarda en el bucket público "blog" como <slug>/<nombre>.webp y
 * devuelve la ruta por la que se sirve (/blog-img/<slug>/<nombre>.webp) con su tamaño.
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

  // Un sufijo aleatorio para que dos subidas con el mismo nombre no se pisen.
  const nombre = `${nombreImagen(archivo.name)}-${randomBytes(3).toString("hex")}`;
  const subida = await subirImagen(createAdminClient(), slug, nombre, imagen);
  if (esErrorImagen(subida)) {
    return NextResponse.json({ error: subida.error }, { status: subida.status });
  }
  return NextResponse.json({ path: subida.ruta, width: imagen.width, height: imagen.height });
}
