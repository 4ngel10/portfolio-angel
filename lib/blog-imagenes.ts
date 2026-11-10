import "server-only";
import sharp from "sharp";
import type { SupabaseClient } from "@supabase/supabase-js";
import { slugify } from "@/lib/portal/validate";
import { BUCKET_BLOG } from "./blog-save";
import { densidadSvg, motivoSvgInseguro } from "./blog-svg";

/**
 * Conversión y subida de imágenes del blog. La usan el panel (app/api/admin/blog/imagen) y la
 * API de la rutina (app/api/blog/imagenes), así que las reglas son las mismas.
 *
 * Todo se convierte a WebP de 2200 px de ancho como máximo, también el SVG (que antes se revisa
 * y se rasteriza a unos 1600 px). En el bucket no se guarda nunca un SVG.
 */

export const ANCHO_MAXIMO = 2200;
/** El bucket "blog" rechaza archivos de más de 5 MB. */
export const MAX_BYTES_SALIDA = 5 * 1024 * 1024;
const MAX_PIXELES = 80_000_000;

/** Todo lo que se guarda es WebP: el SVG también se convierte, nunca se guarda tal cual. */
export type ImagenProcesada = {
  data: Buffer;
  width: number;
  height: number;
  extension: "webp";
  contentType: "image/webp";
};
export type ErrorImagen = { error: string; status: number };

const RASTER = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

/**
 * Valida y convierte una imagen a WebP de 2200 px de ancho como máximo. Un SVG pasa antes por
 * motivoSvgInseguro (scripts, manejadores, recursos externos, raya larga) y se rasteriza con una
 * densidad que lo deja en unos 1600 px de ancho.
 */
export async function procesarImagen(
  bytes: Buffer,
  tipo: string,
): Promise<ImagenProcesada | ErrorImagen> {
  try {
    let origen: ReturnType<typeof sharp>;
    if (tipo === "image/svg+xml") {
      const motivo = motivoSvgInseguro(bytes.toString("utf8"));
      if (motivo) return { error: motivo, status: 422 };
      const meta = await sharp(bytes).metadata();
      if (!meta.width || !meta.height) return { error: "No se pudo leer el SVG.", status: 422 };
      origen = sharp(bytes, { density: densidadSvg(meta.width), limitInputPixels: MAX_PIXELES });
    } else if (RASTER.has(tipo)) {
      origen = sharp(bytes, { limitInputPixels: MAX_PIXELES }).rotate();
    } else {
      return { error: "Tipo de imagen no admitido.", status: 415 };
    }
    const r = await origen
      .resize({ width: ANCHO_MAXIMO, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
    return {
      data: r.data,
      width: r.info.width,
      height: r.info.height,
      extension: "webp",
      contentType: "image/webp",
    };
  } catch {
    return { error: "No se pudo leer la imagen.", status: 422 };
  }
}

export function esErrorImagen<T extends object>(x: T | ErrorImagen): x is ErrorImagen {
  return "error" in x;
}

/** Nombre de archivo limpio (sin extensión) a partir de lo que llegue. */
export function nombreImagen(origen: string): string {
  const sinExtension = origen.includes(".") ? origen.slice(0, origen.lastIndexOf(".")) : origen;
  return slugify(sinExtension) || "imagen";
}

/**
 * Sube la imagen a <slug>/<nombre>.<ext> del bucket "blog". `admin` es el cliente con service role,
 * que el llamador ya ha autorizado. Sin `sobrescribir`, un nombre que existe da 409.
 */
export async function subirImagen(
  admin: SupabaseClient,
  slug: string,
  nombre: string,
  img: ImagenProcesada,
  sobrescribir = false,
): Promise<{ ruta: string } | ErrorImagen> {
  if (img.data.length > MAX_BYTES_SALIDA) {
    return { error: "La imagen convertida pesa más de 5 MB.", status: 413 };
  }
  const archivo = `${nombre}.${img.extension}`;
  const { error } = await admin.storage.from(BUCKET_BLOG).upload(`${slug}/${archivo}`, img.data, {
    contentType: img.contentType,
    cacheControl: "31536000",
    upsert: sobrescribir,
  });
  if (error) {
    const existe = (error as { statusCode?: string }).statusCode === "409";
    return existe
      ? { error: "Ya hay una imagen con ese nombre. Usa otro.", status: 409 }
      : { error: "No se pudo guardar la imagen.", status: 500 };
  }
  return { ruta: `/blog-img/${slug}/${archivo}` };
}
