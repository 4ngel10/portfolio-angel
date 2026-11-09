import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Ids de las personas con la cuenta desactivada (bloqueadas en Supabase Auth). Si no se puede
 * comprobar una cuenta, se trata como desactivada: es más seguro no escribirle que escribir a
 * alguien a quien se le ha retirado el acceso.
 */
export async function cuentasDesactivadas(ids: string[]): Promise<Set<string>> {
  const fuera = new Set<string>();
  if (ids.length === 0) return fuera;
  const admin = createAdminClient();
  const ahora = Date.now();
  await Promise.all(
    ids.map(async (id) => {
      const { data, error } = await admin.auth.admin.getUserById(id);
      const bloqueada =
        !!data?.user?.banned_until && new Date(data.user.banned_until).getTime() > ahora;
      if (error || !data?.user || bloqueada) fuera.add(id);
    }),
  );
  return fuera;
}
