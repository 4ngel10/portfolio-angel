import "server-only";
import { createClient } from "@/lib/supabase/server";
import { MES } from "./validate";
import type {
  BolsaHoras,
  BolsaMovimiento,
  BolsaMes,
  Empresa,
  Hito,
  Incidencia,
  MensajeIncidencia,
  Presupuesto,
  PresupuestoLinea,
  Proyecto,
} from "./types";

/**
 * Todas las lecturas usan el cliente del usuario: RLS ya limita qué filas llegan,
 * así que un cliente solo ve su empresa y el admin ve todo.
 */

export async function listarProyectos(): Promise<Proyecto[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("proyectos")
    .select("*")
    .order("created_at", { ascending: false });
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

/**
 * Empresas activas (listas, selectores, Resumen). Con `todas` también las archivadas: hace
 * falta para poner nombre a los cobros, presupuestos y proyectos que conservan.
 */
export async function listarEmpresas(opciones?: { todas?: boolean }): Promise<Empresa[]> {
  const supabase = await createClient();
  let q = supabase.from("empresas").select("*").order("nombre");
  if (!opciones?.todas) q = q.is("archivada_at", null);
  const { data } = await q;
  return (data ?? []) as Empresa[];
}

export async function listarBolsas(): Promise<BolsaHoras[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("bolsa_horas").select("*");
  return (data ?? []) as BolsaHoras[];
}

/**
 * Apuntes de horas, los más recientes primero. RLS deja al cliente solo los de su empresa.
 * `mes` es "AAAA-MM".
 */
export async function listarMovimientos(f?: {
  empresaId?: string;
  limit?: number;
  mes?: string;
}): Promise<BolsaMovimiento[]> {
  const supabase = await createClient();
  let q = supabase
    .from("bolsa_movimientos")
    .select("*")
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false });
  if (f?.empresaId) q = q.eq("empresa_id", f.empresaId);
  if (f?.mes && MES.test(f.mes)) {
    const [y, m] = f.mes.split("-").map(Number);
    const fin = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
    q = q.gte("fecha", `${f.mes}-01`).lte("fecha", fin);
  }
  if (f?.limit) q = q.limit(f.limit);
  const { data } = await q;
  return (data ?? []) as BolsaMovimiento[];
}

/** Meses cerrados de todas las bolsas. Solo el admin los lee: RLS no deja pasar a los clientes. */
export async function listarHistorialBolsas(): Promise<BolsaMes[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bolsa_historial")
    .select("empresa_id, periodo_inicio, precio");
  return (data ?? []) as BolsaMes[];
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
    ? (((
        await supabase
          .from("mensajes_incidencia")
          .select("*")
          .in("incidencia_id", ids)
          .order("created_at")
      ).data ?? []) as MensajeIncidencia[])
    : [];

  const autorIds = [...new Set(mensajes.map((m) => m.autor_id).filter((x): x is string => !!x))];
  const autores: Record<string, string> = {};
  if (autorIds.length) {
    const { data } = await supabase.from("usuarios").select("id, nombre").in("id", autorIds);
    for (const u of data ?? []) autores[u.id] = u.nombre;
  }

  return { incidencias, mensajes, autores };
}

/**
 * Incidencias abiertas a las que el admin no ha contestado: la espera cuenta desde el primer
 * mensaje del cliente posterior a la última respuesta del admin (o desde que se abrió).
 */
export async function incidenciasSinRespuesta(): Promise<
  { incidencia: Incidencia; desde: string }[]
> {
  const { incidencias, mensajes } = await cargarIncidencias({ soloAbiertas: true });
  if (incidencias.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("usuarios").select("id").eq("role", "admin");
  const admins = new Set((data ?? []).map((u) => u.id as string));

  const pendientes: { incidencia: Incidencia; desde: string }[] = [];
  for (const incidencia of incidencias) {
    const suyos = mensajes.filter((m) => m.incidencia_id === incidencia.id);
    const ultimaAdmin = suyos
      .filter((m) => m.autor_id && admins.has(m.autor_id))
      .reduce((max, m) => (m.created_at > max ? m.created_at : max), "");
    const esperando = [
      incidencia.created_at,
      ...suyos.filter((m) => !m.autor_id || !admins.has(m.autor_id)).map((m) => m.created_at),
    ].filter((c) => c > ultimaAdmin);
    if (esperando.length === 0) continue;
    pendientes.push({ incidencia, desde: esperando.reduce((min, c) => (c < min ? c : min)) });
  }
  return pendientes;
}

/**
 * Presupuestos enviados o aceptados que aún no tienen proyecto (solo admin). Con `incluir` se añade ese
 * presupuesto aunque ya esté enlazado, para que el selector de la ficha del proyecto lo muestre.
 */
export async function presupuestosSinProyecto(incluir?: string | null): Promise<Presupuesto[]> {
  const supabase = await createClient();
  const [{ data: aceptados }, { data: enlazados }] = await Promise.all([
    supabase
      .from("presupuestos")
      .select("*")
      .in("estado", ["aceptado", "enviado"])
      .order("fecha_emision", { ascending: false }),
    supabase.from("proyectos").select("presupuesto_id").not("presupuesto_id", "is", null),
  ]);
  const usados = new Set((enlazados ?? []).map((p) => p.presupuesto_id as string));
  return ((aceptados ?? []) as Presupuesto[]).filter((p) => !usados.has(p.id) || p.id === incluir);
}

export const mapaTitulos = (proyectos: Proyecto[]) =>
  Object.fromEntries(proyectos.map((p) => [p.id, p.titulo])) as Record<string, string>;

/** Hitos completados y totales de un proyecto. */
export function progreso(hitos: Hito[], proyectoId: string) {
  const suyos = hitos.filter((h) => h.proyecto_id === proyectoId);
  return { hechos: suyos.filter((h) => h.completado).length, total: suyos.length };
}

/** Presupuestos (más recientes primero). El cliente solo recibe los enviados de su empresa. */
export async function listarPresupuestos(): Promise<Presupuesto[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("presupuestos")
    .select("*")
    .order("fecha_emision", { ascending: false })
    .order("numero", { ascending: false });
  return (data ?? []) as Presupuesto[];
}

export async function listarLineasPresupuesto(
  presupuestoIds?: string[],
): Promise<PresupuestoLinea[]> {
  if (presupuestoIds && presupuestoIds.length === 0) return [];
  const supabase = await createClient();
  let q = supabase.from("presupuesto_lineas").select("*").order("orden");
  if (presupuestoIds) q = q.in("presupuesto_id", presupuestoIds);
  const { data } = await q;
  return (data ?? []) as PresupuestoLinea[];
}

/** Lo que se borraría al eliminar una empresa (para el aviso de confirmación) y si tiene pagos. */
export async function contarDatosEmpresa(empresaId: string) {
  const supabase = await createClient();
  const contar = async (tabla: string) => {
    const { count } = await supabase
      .from(tabla)
      .select("id", { count: "exact", head: true })
      .eq("empresa_id", empresaId);
    return count ?? 0;
  };
  const [
    proyectos,
    incidencias,
    presupuestos,
    movimientos,
    cobros,
    archivos,
    documentos,
    personas,
  ] = await Promise.all([
    contar("proyectos"),
    contar("incidencias"),
    contar("presupuestos"),
    contar("bolsa_movimientos"),
    contar("cobros"),
    contar("archivos"),
    contar("documentos"),
    supabase
      .from("usuarios")
      .select("id", { count: "exact", head: true })
      .eq("empresa_id", empresaId)
      .eq("role", "cliente")
      .then((r) => r.count ?? 0),
  ]);

  let conPagos = false;
  if (cobros > 0) {
    const { data } = await supabase.from("cobros").select("id").eq("empresa_id", empresaId);
    const ids = (data ?? []).map((c) => c.id as string);
    const { count } = await supabase
      .from("pagos")
      .select("id", { count: "exact", head: true })
      .in("cobro_id", ids);
    conPagos = (count ?? 0) > 0;
  }
  return {
    proyectos,
    incidencias,
    presupuestos,
    movimientos,
    cobros,
    personas,
    ficheros: archivos + documentos,
    conPagos,
  };
}
