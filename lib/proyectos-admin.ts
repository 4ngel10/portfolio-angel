import "server-only";
import type { CamposComunes, VersionProyecto } from "./proyectos-editor";
import type { ProyectoContent, ProyectoServicio } from "./proyectos-types";
import type { ProyectoParaValidar } from "./proyectos-validate";

/**
 * Tipos y ayudas del panel /admin/portfolio. La fila se lee con la sesión del admin (rol
 * authenticated y la política admin_all), así que incluye borradores y programados. Nada de
 * service role. Quien las use debe haber pasado antes por requireAdmin().
 */

export type EstadoProyecto = "borrador" | "programado" | "publicado";

export type FilaProyecto = {
  id: string;
  slug: string;
  status: "borrador" | "publicado";
  published_at: string | null;
  orden: number;
  service: ProyectoServicio;
  tech: string[];
  cover: string;
  tint: number;
  url: string | null;
  image: string | null;
  image_dark: string | null;
  og_image: string | null;
  cover_position: "top" | "center" | null;
  en_servicios: ProyectoServicio[];
  ejemplo: boolean;
  datos_provisionales: boolean;
  content: ProyectoContent;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export function estadoDe(
  fila: Pick<FilaProyecto, "status" | "published_at">,
  ahora = Date.now(),
): EstadoProyecto {
  if (fila.status !== "publicado") return "borrador";
  return fila.published_at && new Date(fila.published_at).getTime() > ahora
    ? "programado"
    : "publicado";
}

/** Campos comunes de una fila, como los guarda una versión. */
export function comunesDe(fila: FilaProyecto): CamposComunes {
  return {
    slug: fila.slug,
    service: fila.service,
    tech: fila.tech,
    cover: fila.cover,
    tint: fila.tint,
    url: fila.url,
    image: fila.image,
    imageDark: fila.image_dark,
    ogImage: fila.og_image,
    coverPosition: fila.cover_position,
    enServicios: fila.en_servicios,
    ejemplo: fila.ejemplo,
    datosProvisionales: fila.datos_provisionales,
  };
}

export function versionDe(fila: FilaProyecto): VersionProyecto {
  return { ...comunesDe(fila), content: fila.content };
}

/** Fila a lo que entiende el comprobador. `date` es el día de publicación (AAAA-MM-DD). */
export function paraValidar(
  fila: Pick<
    FilaProyecto,
    | "slug"
    | "service"
    | "tech"
    | "en_servicios"
    | "image"
    | "image_dark"
    | "og_image"
    | "ejemplo"
    | "datos_provisionales"
    | "content"
  >,
  date?: string,
): ProyectoParaValidar {
  return {
    slug: fila.slug,
    service: fila.service,
    date,
    tech: fila.tech,
    enServicios: fila.en_servicios,
    image: fila.image,
    imageDark: fila.image_dark,
    ogImage: fila.og_image,
    ejemplo: fila.ejemplo,
    datosProvisionales: fila.datos_provisionales,
    es: fila.content.es,
    en: fila.content.en,
  };
}
