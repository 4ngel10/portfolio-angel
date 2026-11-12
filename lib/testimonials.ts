/**
 * Testimonios de clientes. Vacío, la sección no se pinta. Solo se muestran los que tienen
 * `permission: true` (permiso del cliente para publicarlo con su nombre). Nada inventado.
 */

import type { Locale } from "./i18n";

export type Testimonial = {
  name: string;
  role: string;
  company: string;
  quote: Record<Locale, string>;
  /** El cliente ha dado permiso para publicar su nombre y su opinión. */
  permission: boolean;
};

export const TESTIMONIALS: Testimonial[] = [];
