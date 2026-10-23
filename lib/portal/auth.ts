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
