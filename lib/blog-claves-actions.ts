"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { isUuid } from "@/lib/portal/validate";
import { PREFIJO_CLAVE, sha256 } from "./blog-api-auth";

/**
 * Claves de la API del blog. Se crean y se revocan solo desde el panel (requireAdmin). La clave
 * en claro se devuelve una única vez al crearla; en la base de datos queda solo su sha256.
 */

const MAX_CLAVES_ACTIVAS = 10;

export type ResultadoClave = { ok: boolean; error?: string; clave?: string; nombre?: string };

/** Nombre legible. Va dentro de created_by ("api:<nombre>"), así que se limita a letras, números, espacio, guion y guion bajo. */
function nombreValido(nombre: string): boolean {
  if (nombre.length < 1 || nombre.length > 60) return false;
  for (const c of nombre) {
    const letra = c.toLowerCase() !== c.toUpperCase();
    const numero = c >= "0" && c <= "9";
    if (!letra && !numero && c !== " " && c !== "-" && c !== "_") return false;
  }
  return true;
}

export async function crearClave(nombreBruto: string): Promise<ResultadoClave> {
  await requireAdmin();
  const { t } = await getI18n();
  const nombre = typeof nombreBruto === "string" ? nombreBruto.trim() : "";
  if (!nombreValido(nombre)) return { ok: false, error: t("blog.keys.errName") };

  const supabase = await createClient();
  const { count } = await supabase
    .from("blog_api_tokens")
    .select("id", { count: "exact", head: true })
    .is("revoked_at", null);
  if ((count ?? 0) >= MAX_CLAVES_ACTIVAS) return { ok: false, error: t("blog.keys.errMax") };

  const clave = `${PREFIJO_CLAVE}${randomBytes(32).toString("base64url")}`;
  const { error } = await supabase
    .from("blog_api_tokens")
    .insert({ nombre, token_hash: sha256(clave), scope: "borrador" });
  if (error) return { ok: false, error: t("blog.keys.errSave") };

  revalidatePath("/admin/blog/claves");
  return { ok: true, clave, nombre };
}

export async function revocarClave(id: string): Promise<ResultadoClave> {
  await requireAdmin();
  const { t } = await getI18n();
  if (!isUuid(id)) return { ok: false, error: t("blog.keys.errSave") };

  const supabase = await createClient();
  const { error } = await supabase
    .from("blog_api_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id)
    .is("revoked_at", null);
  if (error) return { ok: false, error: t("blog.keys.errSave") };

  revalidatePath("/admin/blog/claves");
  return { ok: true };
}
