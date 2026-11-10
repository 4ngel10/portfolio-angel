import {
  anotarUso,
  autenticarApi,
  comprobarLimite,
  leerJson,
  respuestaJson,
} from "@/lib/blog-api-auth";
import { PREFIJO_API, type FilaBlog } from "@/lib/blog-admin";
import { canonico, guardarVersionCon, ogValido, resolverTamanos } from "@/lib/blog-save";
import {
  CATEGORIAS,
  normalizarContenido,
  slugValido,
  validarPost,
  type Fallo,
} from "@/lib/blog-validate";
import type { BlogContenido } from "@/db/schema";

export const runtime = "nodejs";

type Params = Promise<{ slug: string }>;
type Previa = Pick<
  FilaBlog,
  "id" | "slug" | "category" | "status" | "content" | "og_image" | "created_by"
>;

/**
 * Crea o actualiza un BORRADOR. Nunca publica y nunca toca un artículo publicado (409). Pasa el
 * mismo comprobador que el botón Publicar, así que un borrador que entra por aquí se puede
 * publicar sin más arreglos.
 */
export async function PUT(request: Request, { params }: { params: Params }) {
  const sesion = await autenticarApi(request);
  if (sesion instanceof Response) return sesion;

  const { slug } = await params;
  if (!slugValido(slug)) {
    return respuestaJson(
      { error: "invalid_slug", errores: [{ ruta: "slug", mensaje: "Slug no válido." }] },
      400,
    );
  }

  const limite = await comprobarLimite(sesion, "articulo");
  if (limite) return limite;

  const leido = await leerJson(request);
  if ("respuesta" in leido) return leido.respuesta;
  const cuerpo = leido.cuerpo;
  if (typeof cuerpo !== "object" || cuerpo === null || Array.isArray(cuerpo)) {
    return respuestaJson({ error: "invalid_body" }, 400);
  }
  const o = cuerpo as Record<string, unknown>;

  // Forma del cuerpo.
  const errores: Fallo[] = [];
  const category = typeof o.category === "string" ? o.category : "";
  if (!(CATEGORIAS as readonly string[]).includes(category)) {
    errores.push({ ruta: "category", mensaje: "La categoría no es válida." });
  }
  const og = o.og_image === undefined || o.og_image === null ? "" : o.og_image;
  if (typeof og !== "string" || og.length > 200 || !ogValido(og.trim())) {
    errores.push({ ruta: "og_image", mensaje: "og_image debe empezar por /blog-img/ o /blog/." });
  }
  const es = normalizarContenido(o.es, "es");
  const en = normalizarContenido(o.en, "en");
  if ("errores" in es) errores.push(...es.errores);
  if ("errores" in en) errores.push(...en.errores);
  if (errores.length > 0 || "errores" in es || "errores" in en) {
    return respuestaJson({ error: "validation", errores }, 422);
  }

  // ¿Existe ya?
  const { data: leida, error: errorLectura } = await sesion.admin
    .from("blog_posts")
    .select("id, slug, category, status, content, og_image, created_by")
    .eq("slug", slug)
    .maybeSingle();
  if (errorLectura) return respuestaJson({ error: "unavailable" }, 503);
  const fila = leida as Previa | null;
  if (fila && fila.status === "publicado") {
    return respuestaJson(
      {
        error: "already_published",
        mensaje: "Los cambios en artículos publicados se hacen en el panel.",
      },
      409,
    );
  }

  const contenido: BlogContenido = { es: es.contenido, en: en.contenido };
  await resolverTamanos(contenido);
  const ogImage = typeof og === "string" && og.trim() !== "" ? og.trim() : null;
  const creadoPor = fila?.created_by ?? `${PREFIJO_API}${sesion.token.nombre}`;

  const validacion = validarPost(
    { slug, category, ogImage, creadoPor, es: contenido.es, en: contenido.en },
    { publicar: true },
  );
  if (validacion.errores.length > 0) {
    return respuestaJson(
      { error: "validation", errores: validacion.errores, avisos: validacion.avisos },
      422,
    );
  }

  let id: string;
  if (!fila) {
    const { data, error } = await sesion.admin
      .from("blog_posts")
      .insert({
        slug,
        category,
        status: "borrador",
        content: contenido,
        og_image: ogImage,
        created_by: creadoPor,
      })
      .select("id")
      .single();
    if (error || !data) {
      return error?.code === "23505"
        ? respuestaJson({ error: "slug_taken" }, 409)
        : respuestaJson({ error: "unavailable" }, 503);
    }
    id = data.id as string;
    await guardarVersionCon(sesion.admin, id, contenido);
  } else {
    id = fila.id;
    const contenidoCambia = canonico(fila.content) !== canonico(contenido);
    const cambio =
      contenidoCambia || fila.category !== category || (fila.og_image ?? null) !== ogImage;
    const { error } = await sesion.admin
      .from("blog_posts")
      .update({
        category,
        content: contenido,
        og_image: ogImage,
        ...(cambio ? { updated_at: new Date().toISOString() } : {}),
      })
      .eq("id", id);
    if (error) return respuestaJson({ error: "unavailable" }, 503);
    if (contenidoCambia) await guardarVersionCon(sesion.admin, id, contenido);
  }

  // Un borrador no se ve en la web, así que no hace falta revalidar la caché pública.
  await anotarUso(sesion, "articulo");
  return respuestaJson({
    ok: true,
    id,
    slug,
    estado: "borrador",
    creado: !fila,
    avisos: validacion.avisos,
  });
}
