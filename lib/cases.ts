/**
 * Casos de estudio en borrador. Son esqueletos con la estructura de la plantilla de proyecto
 * (contexto, mi papel, antes y después, fragmento, cita), sin contenido hasta que Ángel lo aporte.
 *
 * Reglas:
 * - No salen en el sitemap, no se enlazan desde ninguna página y llevan noindex.
 * - En producción (VERCEL_ENV=production) dan 404; se ven en previews y en local.
 * - No son los casos de ransomware ni de sistema saturado, que se quitaron a propósito.
 */

export type CaseDraft = {
  slug: string;
  title: string;
  /** Qué se contará aquí, para que Ángel sepa qué aportar. Nada de datos inventados. */
  topic: string;
};

export const CASE_DRAFTS: CaseDraft[] = [
  {
    slug: "restauracion-de-backup",
    title: "Restauración de una copia de seguridad",
    topic: "Una restauración real desde copia y cómo se comprobó que los datos estaban bien.",
  },
];

export function getCaseDraft(slug: string) {
  return CASE_DRAFTS.find((c) => c.slug === slug);
}

/** Los borradores solo se ven fuera de producción. */
export function casesVisible() {
  return process.env.VERCEL_ENV !== "production";
}
