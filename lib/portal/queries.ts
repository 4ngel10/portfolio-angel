import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { BolsaHoras, Empresa, Hito, Incidencia, MensajeIncidencia, Proyecto } from "./types";

/**
 * Todas las lecturas usan el cliente del usuario: RLS ya limita qué filas llegan,
 * así que un cliente solo ve su empresa y el admin ve todo.
 */

export async function listarProyectos(): Promise<Proyecto[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("proyectos").select("*").order("created_at", { ascending: false });
  return (data ?? []) as Proyecto[];
}

export async function listarHitos(proyectoIds?: string[]): Promise<Hito[]> {
  if (proyectoIds && proyectoIds.length === 0) return [];
  const supabase = await createClient();
  let q = supabase.from("hitos").select("*").order("orden", { ascending: true });
  if (proyectoIds) q = q.in("proyecto_id", proyectoIds);
  const { data } = await q;
  return (data ?? []) as Hito[];
}

export async function listarEmpresas(): Promise<Empresa[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("empresas").select("*").order("nombre");
  return (data ?? []) as Empresa[];
}

export async function listarBolsas(): Promise<BolsaHoras[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("bolsa_horas").select("*");
  return (data ?? []) as BolsaHoras[];
}

/** Incidencias (más recientes primero) con sus mensajes y los nombres de quienes escriben. */
export async function cargarIncidencias(filtro?: { proyectoId?: string; soloAbiertas?: boolean }) {
  const supabase = await createClient();
  let q = supabase.from("incidencias").select("*").order("created_at", { ascending: false });
  if (filtro?.proyectoId) q = q.eq("proyecto_id", filtro.proyectoId);
  if (filtro?.soloAbiertas) q = q.neq("estado", "resuelta");
  const incidencias = ((await q).data ?? []) as Incidencia[];

  const ids = incidencias.map((i) => i.id);
  const mensajes = ids.length
    ? (((await supabase.from("mensajes_incidencia").select("*").in("incidencia_id", ids).order("created_at")).data ??
        []) as MensajeIncidencia[])
    : [];

  const autorIds = [...new Set(mensajes.map((m) => m.autor_id).filter((x): x is string => !!x))];
  const autores: Record<string, string> = {};
  if (autorIds.length) {
    const { data } = await supabase.from("usuarios").select("id, nombre").in("id", autorIds);
    for (const u of data ?? []) autores[u.id] = u.nombre;
  }

  return { incidencias, mensajes, autores };
}

export const mapaTitulos = (proyectos: Proyecto[]) =>
  Object.fromEntries(proyectos.map((p) => [p.id, p.titulo])) as Record<string, string>;

/** Hitos completados y totales de un proyecto. */
export function progreso(hitos: Hito[], proyectoId: string) {
  const suyos = hitos.filter((h) => h.proyecto_id === proyectoId);
  return { hechos: suyos.filter((h) => h.completado).length, total: suyos.length };
}
