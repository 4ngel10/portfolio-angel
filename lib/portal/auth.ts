import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Perfil } from "./types";

/** Perfil (tabla usuarios) del usuario con sesión, o null. RLS deja leer la fila propia. */
export const getPerfil = cache(async (): Promise<Perfil | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("usuarios")
    .select("id, empresa_id, role, nombre, email")
    .eq("id", user.id)
    .maybeSingle();

  return (data as Perfil | null) ?? null;
});

/** Zona de clientes: exige sesión y rol "cliente" con empresa asignada. */
export async function requireCliente(): Promise<Perfil & { empresa_id: string }> {
  const perfil = await getPerfil();
  if (!perfil || perfil.role !== "cliente" || !perfil.empresa_id) redirect("/login");
  return perfil as Perfil & { empresa_id: string };
}

type CuentaConMarcas = {
  app_metadata?: Record<string, unknown> | null;
  user_metadata?: Record<string, unknown> | null;
};

/**
 * Marcas de contraseña de una cuenta (`password_set`, `password_temporary`). Solo sirven para
 * decidir a qué pantalla se manda a la persona, NUNCA para dar acceso: `user_metadata` lo puede
 * editar el propio usuario. Se escriben en `app_metadata` (solo servidor, cliente admin). Durante
 * la transición, si `app_metadata` no la trae, se usa `user_metadata` para no echar a los clientes
 * que ya tenían la marca.
 */
export function marcasContrasena(user: CuentaConMarcas | null | undefined) {
  const app = user?.app_metadata ?? {};
  const meta = user?.user_metadata ?? {};
  return {
    elegida: (app.password_set ?? meta.password_set) === true,
    temporal: (app.password_temporary ?? meta.password_temporary) === true,
  };
}

/** Si el cliente aún no ha elegido contraseña (`password_set`, ver `marcasContrasena`). Solo redirige. */
export const sinContrasena = cache(async (): Promise<boolean> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return !marcasContrasena(user).elegida;
});

/**
 * Zona de admin: exige sesión, rol "admin" y segundo factor (TOTP) verificado.
 * Sin factor enrolado o sin verificar en esta sesión, manda a /mfa.
 */
export async function requireAdmin(): Promise<Perfil> {
  const perfil = await getPerfil();
  if (!perfil || perfil.role !== "admin") redirect("/login");

  const supabase = await createClient();
  const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (data?.currentLevel !== "aal2") redirect("/mfa");

  return perfil;
}

/**
 * Misma comprobación que `requireAdmin`, pero para rutas de API: en lugar de redirigir,
 * devuelve el código HTTP (401 sin sesión o sin segundo factor, 403 si no es admin).
 */
export async function comprobarAdmin(): Promise<
  { ok: true; perfil: Perfil } | { ok: false; status: 401 | 403 }
> {
  const perfil = await getPerfil();
  if (!perfil) return { ok: false, status: 401 };
  if (perfil.role !== "admin") return { ok: false, status: 403 };

  const supabase = await createClient();
  const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (data?.currentLevel !== "aal2") return { ok: false, status: 401 };
  return { ok: true, perfil };
}
