import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { BLOG_TAG } from "./blog-db";

/**
 * Hay que llamarla tras crear, editar, publicar, despublicar o borrar un artículo, desde una
 * server action o una ruta de API. Invalida la caché de datos del blog y las páginas que lo
 * enseñan, para que el cambio se vea sin desplegar.
 *
 * `{ expire: 0 }`: no se sirve contenido viejo mientras se refresca, la siguiente visita espera
 * a los datos nuevos. Con "max" una visita vería todavía la versión anterior.
 */
export function revalidarBlog(slug?: string) {
  revalidateTag(BLOG_TAG, { expire: 0 });
  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
}
