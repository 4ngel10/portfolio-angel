import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { PORTFOLIO_TAG } from "./proyectos-db";

/**
 * Hay que llamarla tras crear, editar, publicar, despublicar, mover o borrar un proyecto, desde una
 * server action. Invalida la caché de datos del portfolio y las páginas que lo enseñan, para que el
 * cambio se vea sin desplegar.
 *
 * `{ expire: 0 }`: no se sirve contenido viejo mientras se refresca (como en lib/blog-revalidate.ts).
 */
export function revalidarPortfolio(slug?: string) {
  revalidateTag(PORTFOLIO_TAG, { expire: 0 });
  for (const ruta of ["/", "/servicios/web", "/servicios/sistemas"]) {
    revalidatePath(ruta);
    revalidatePath(ruta === "/" ? "/en" : `/en${ruta}`);
  }
  if (slug) {
    revalidatePath(`/proyectos/${slug}`);
    revalidatePath(`/en/proyectos/${slug}`);
    // La imagen para redes (app/(web)/[lang]/(sitio)/proyectos/[slug]/opengraph-image.tsx).
    revalidatePath(`/proyectos/${slug}/opengraph-image`);
    revalidatePath(`/en/proyectos/${slug}/opengraph-image`);
  }
  revalidatePath("/sitemap.xml");
}
