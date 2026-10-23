import "server-only";
import { timingSafeEqual } from "node:crypto";

/**
 * Los crons de Vercel llaman con `Authorization: Bearer <CRON_SECRET>` (Vercel lo añade
 * solo cuando la variable existe). Sin secreto configurado se rechaza todo.
 */
export function cronAutorizado(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const recibido = Buffer.from(request.headers.get("authorization") ?? "");
  const esperado = Buffer.from(`Bearer ${secret}`);
  return recibido.length === esperado.length && timingSafeEqual(recibido, esperado);
}
