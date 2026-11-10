import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { comprobarAdmin } from "@/lib/portal/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugValido } from "@/lib/blog-validate";
import { slugify } from "@/lib/portal/validate";

/**
 * Subida de imágenes del editor del blog. Solo el admin (comprobarAdmin). Convierte a WebP
 * (máximo 2200 px de ancho), la guarda en el bucket público "blog" como <slug>/<nombre>.webp y
 * devuelve la ruta por la que se sirve (/blog-img/<slug>/<nombre>.webp) con su tamaño.
 */

export const runtime = "nodejs";

const MAX_BYTES_ENTRADA = 15 * 1024 * 1024;
const MAX_BYTES_SALIDA = 5 * 1024 * 1024; // el límite del bucket
const ANCHO_MAXIMO = 2200;
const TIPOS = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  const auth = await comprobarAdmin();
  if (!auth.ok) return NextResponse.json({ error: "No autorizado" }, { status: auth.status });

  const form = await request.formData().catch(() => null);
  const archivo = form?.get("archivo");
  const slug = form?.get("slug");
  if (!(archivo instanceof File) || typeof slug !== "string" || !slugValido(slug)) {
    return NextResponse.json({ error: "Faltan el archivo o un slug válido." }, { status: 400 });
  }
  if (!TIPOS.has(archivo.type)) {
    return NextResponse.json({ error: "Solo se admiten JPG, PNG, WebP o GIF." }, { status: 415 });
  }
  if (archivo.size > MAX_BYTES_ENTRADA) {
    return NextResponse.json({ error: "La imagen pesa más de 15 MB." }, { status: 413 });
  }

  let salida: Buffer;
  let ancho: number;
  let alto: number;
  try {
    const resultado = await sharp(Buffer.from(await archivo.arrayBuffer()))
      .rotate()
      .resize({ width: ANCHO_MAXIMO, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
    salida = resultado.data;
    ancho = resultado.info.width;
    alto = resultado.info.height;
  } catch {
    return NextResponse.json({ error: "No se pudo leer la imagen." }, { status: 422 });
  }
  if (salida.length > MAX_BYTES_SALIDA) {
    return NextResponse.json({ error: "La imagen convertida pesa más de 5 MB." }, { status: 413 });
  }

  // Nombre sin extensión original, y un sufijo para que dos subidas no se pisen.
  const origen = archivo.name.includes(".") ? archivo.name.slice(0, archivo.name.lastIndexOf(".")) : archivo.name;
  const nombre = `${slugify(origen) || "imagen"}-${randomBytes(3).toString("hex")}.webp`;

  const { error } = await createAdminClient()
    .storage.from("blog")
    .upload(`${slug}/${nombre}`, salida, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: false,
    });
  if (error) return NextResponse.json({ error: "No se pudo guardar la imagen." }, { status: 500 });

  return NextResponse.json({ path: `/blog-img/${slug}/${nombre}`, width: ancho, height: alto });
}
