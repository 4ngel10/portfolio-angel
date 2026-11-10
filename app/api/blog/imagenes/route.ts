import { anotarUso, autenticarApi, comprobarLimite, respuestaJson } from "@/lib/blog-api-auth";
import { esErrorImagen, nombreImagen, procesarImagen, subirImagen } from "@/lib/blog-imagenes";
import { slugValido } from "@/lib/blog-validate";

export const runtime = "nodejs";

const MAX_BYTES = 4 * 1024 * 1024;
const TIPOS = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);

/**
 * Sube una imagen a <slug>/<nombre>.webp. Todo se convierte a WebP (máximo 2200 px), también el
 * SVG, que antes se revisa (sin scripts ni recursos externos) y nunca se guarda tal cual. Un nombre que ya existe da 409, nunca se sobrescribe.
 */
export async function POST(request: Request) {
  const sesion = await autenticarApi(request);
  if (sesion instanceof Response) return sesion;

  // Antes de leer el cuerpo: si ya dice que es enorme, no se parsea.
  if (Number(request.headers.get("content-length") ?? "0") > MAX_BYTES + 100_000) {
    return respuestaJson({ error: "too_large" }, 413);
  }

  const form = await request.formData().catch(() => null);
  const slug = form?.get("slug");
  const archivo = form?.get("archivo");
  const nombreBruto = form?.get("nombre");
  if (typeof slug !== "string" || !slugValido(slug)) {
    return respuestaJson({ error: "invalid_slug" }, 400);
  }
  if (!(archivo instanceof File)) return respuestaJson({ error: "missing_file" }, 400);
  if (archivo.size > MAX_BYTES) return respuestaJson({ error: "too_large" }, 413);
  if (!TIPOS.has(archivo.type)) return respuestaJson({ error: "unsupported_type" }, 415);

  const limite = await comprobarLimite(sesion, "imagen");
  if (limite) return limite;

  const imagen = await procesarImagen(Buffer.from(await archivo.arrayBuffer()), archivo.type);
  if (esErrorImagen(imagen)) {
    return respuestaJson({ error: "invalid_image", mensaje: imagen.error }, imagen.status);
  }

  const nombre = nombreImagen(
    typeof nombreBruto === "string" && nombreBruto ? nombreBruto : archivo.name,
  );
  const subida = await subirImagen(sesion.admin, slug, nombre, imagen);
  if (esErrorImagen(subida)) {
    return respuestaJson({ error: "upload_failed", mensaje: subida.error }, subida.status);
  }

  await anotarUso(sesion, "imagen");
  return respuestaJson({ ruta: subida.ruta, width: imagen.width, height: imagen.height });
}
