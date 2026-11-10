import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Cuenta filas creadas en la última hora. Se usa el cliente normal, así que RLS ya limita
 * lo que se ve. `filtro` acota por persona (autor_id, subido_por) o por empresa.
 * Si la consulta falla devuelve 0: un fallo de lectura no debe bloquear a un cliente.
 */
export async function filasEnLaUltimaHora(
  supabase: SupabaseClient,
  tabla: "incidencias" | "mensajes_incidencia" | "archivos",
  filtro: { columna: string; valor: string },
): Promise<number> {
  const desde = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from(tabla)
    .select("id", { count: "exact", head: true })
    .eq(filtro.columna, filtro.valor)
    .gte("created_at", desde);
  if (error) {
    console.error("[rate-limit]", tabla, error.message);
    return 0;
  }
  return count ?? 0;
}
