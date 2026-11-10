import "server-only";
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Autenticación y límites de la API del blog (app/api/blog), que usa la rutina semanal de Claude
 * para crear borradores. La clave va en `Authorization: Bearer blg_...`; en la base de datos solo
 * está su sha256. La API nunca publica, y la clave de servicio solo sale de aquí hacia las rutas
 * una vez validado el token.
 */

export const PREFIJO_CLAVE = "blg_";
export const LIMITE_ARTICULOS_HORA = 20;
export const LIMITE_IMAGENES_HORA = 60;
export const MAX_BYTES_JSON = 400_000;
/** Lo máximo que se llega a leer de un cuerpo para poder contestar con un 413 limpio. */
const MAX_BYTES_LECTURA = 5_000_000;
/** Días que se conserva blog_api_uso. */
export const DIAS_DE_REGISTRO = 7;

export type TokenApi = { id: string; nombre: string };
export type SesionApi = { token: TokenApi; admin: SupabaseClient };

export const sha256 = (texto: string) => createHash("sha256").update(texto).digest("hex");

/** Todas las respuestas son JSON y nunca se cachean. */
export function respuestaJson(
  cuerpo: unknown,
  status = 200,
  cabeceras: Record<string, string> = {},
) {
  return NextResponse.json(cuerpo, {
    status,
    headers: { "Cache-Control": "no-store", ...cabeceras },
  });
}

const noAutorizado = () => respuestaJson({ error: "unauthorized" }, 401);

/**
 * Valida la clave del encabezado Authorization. Devuelve la sesión (token y cliente con service
 * role) o la respuesta 401 sin detalles. Anota `last_used_at`.
 */
export async function autenticarApi(request: Request): Promise<SesionApi | NextResponse> {
  const cabecera = request.headers.get("authorization") ?? "";
  if (!cabecera.startsWith("Bearer ")) return noAutorizado();
  const clave = cabecera.slice(7).trim();
  if (!clave.startsWith(PREFIJO_CLAVE) || clave.length > 200) return noAutorizado();

  // Hace falta la clave de servicio para leer blog_api_tokens (no tiene política para nadie más).
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("blog_api_tokens")
    .select("id, nombre")
    .eq("token_hash", sha256(clave))
    .is("revoked_at", null)
    .maybeSingle();
  if (error) {
    console.error("[blog-api] no se pudo comprobar la clave", error.message);
    return respuestaJson({ error: "unavailable" }, 503);
  }
  if (!data) return noAutorizado();

  await admin
    .from("blog_api_tokens")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id);
  return { token: { id: data.id as string, nombre: data.nombre as string }, admin };
}

/** Respuesta 429 si el token ya llegó al máximo de la última hora, 503 si no se puede contar, o null. */
export async function comprobarLimite(
  sesion: SesionApi,
  tipo: "articulo" | "imagen",
): Promise<NextResponse | null> {
  const maximo = tipo === "articulo" ? LIMITE_ARTICULOS_HORA : LIMITE_IMAGENES_HORA;
  const desde = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error } = await sesion.admin
    .from("blog_api_uso")
    .select("id", { count: "exact", head: true })
    .eq("token_id", sesion.token.id)
    .eq("tipo", tipo)
    .gte("created_at", desde);
  // Si no se puede contar, se cierra: una API de escritura sin límite no debe quedar abierta.
  if (error || count === null) {
    console.error("[blog-api] no se pudo contar el uso", error?.message);
    return respuestaJson({ error: "unavailable" }, 503);
  }
  if (count >= maximo) {
    return respuestaJson({ error: "rate_limited", limite: maximo, por: "hora" }, 429, {
      "Retry-After": "3600",
    });
  }
  return null;
}

export async function anotarUso(sesion: SesionApi, tipo: "articulo" | "imagen") {
  const { error } = await sesion.admin
    .from("blog_api_uso")
    .insert({ token_id: sesion.token.id, tipo });
  if (error) console.error("[blog-api] no se pudo anotar el uso", error.message);

  // El registro solo hace falta para contar la última hora: se borra lo de más de 7 días.
  const corte = new Date(Date.now() - DIAS_DE_REGISTRO * 24 * 60 * 60 * 1000).toISOString();
  const { error: errorLimpieza } = await sesion.admin
    .from("blog_api_uso")
    .delete()
    .lt("created_at", corte);
  if (errorLimpieza) console.error("[blog-api] no se pudo limpiar el uso", errorLimpieza.message);
}

/** Cuerpo JSON de hasta 400 KB: 413 si se pasa, 400 si no es JSON. */
export async function leerJson(
  request: Request,
): Promise<{ cuerpo: unknown } | { respuesta: NextResponse }> {
  // Solo se corta de antemano lo absurdo (más de 5 MB, el tope de la plataforma). Lo demás se lee
  // entero antes de contestar 413: si se responde sin consumir el cuerpo, el servidor cierra la
  // conexión a medias y el cliente ve un error de red en lugar del 413.
  const largo = Number(request.headers.get("content-length") ?? "0");
  if (largo > MAX_BYTES_LECTURA) return { respuesta: respuestaJson({ error: "too_large" }, 413) };
  const texto = await request.text();
  if (texto.length > MAX_BYTES_JSON) {
    return { respuesta: respuestaJson({ error: "too_large" }, 413) };
  }
  try {
    return { cuerpo: JSON.parse(texto) as unknown };
  } catch {
    return { respuesta: respuestaJson({ error: "invalid_json" }, 400) };
  }
}
