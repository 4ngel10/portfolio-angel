import "server-only";
import { revalidatePath } from "next/cache";
import { getI18n } from "./i18n";
import type { FormState } from "./validate";

/**
 * Ayudas comunes de las Server Actions. Viven aparte porque un archivo "use server" solo
 * puede exportar funciones asíncronas.
 */

/** Las dos zonas leen de las mismas tablas: tras cualquier cambio se refrescan ambas. */
export function refrescar() {
  revalidatePath("/admin", "layout");
  revalidatePath("/portal", "layout");
}

/** Error de formulario en el idioma de la persona (cookie "locale"). */
export async function fallo(clave: string): Promise<FormState> {
  const { t } = await getI18n();
  return { error: t(`err.${clave}`) };
}
