import "server-only";
import { headers } from "next/headers";

/**
 * IP del cliente. En Vercel `x-vercel-forwarded-for` la pone la propia plataforma y no se puede
 * falsear desde fuera; `x-real-ip` es el siguiente y `x-forwarded-for` (cuyo primer valor sí puede
 * mandarlo el cliente) solo el último recurso. Devuelve null si no hay ninguna.
 */
export async function ipDelCliente(): Promise<string | null> {
  const h = await headers();
  for (const nombre of ["x-vercel-forwarded-for", "x-real-ip", "x-forwarded-for"]) {
    const valor = h.get(nombre)?.split(",")[0].trim();
    if (valor) return valor.slice(0, 45);
  }
  return null;
}
