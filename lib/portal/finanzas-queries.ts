import "server-only";
import { createClient } from "@/lib/supabase/server";
import { hoyMadrid, resumenCobro } from "./finanzas";
import type {
  Ajustes,
  CategoriaGasto,
  Cobro,
  EstadoCobro,
  Gasto,
  Pago,
  Suscripcion,
} from "./types";

/**
 * Lecturas de Finanzas con el cliente del usuario: RLS solo deja pasar al admin con aal2,
 * a cualquier otra sesión le llegan cero filas.
 */

export type FiltroFinanzas = {
  empresaId?: string;
  proyectoId?: string;
  presupuestoId?: string;
  categoria?: CategoriaGasto;
  /** Rango inclusivo (AAAA-MM-DD) sobre la fecha de cada tabla. */
  desde?: string;
  hasta?: string;
};

const PAGINA = 1000;

/** PostgREST corta en 1000 filas por petición: se pide por páginas hasta agotar. */
async function leerTodo<T>(
  pedir: (desde: number, hasta: number) => PromiseLike<{ data: T[] | null }>,
): Promise<T[]> {
  const filas: T[] = [];
  for (let desde = 0; ; desde += PAGINA) {
    const { data } = await pedir(desde, desde + PAGINA - 1);
    filas.push(...(data ?? []));
    if (!data || data.length < PAGINA) return filas;
  }
}

export async function cargarAjustes(): Promise<Ajustes> {
  const supabase = await createClient();
  const { data } = await supabase.from("ajustes").select("*").eq("id", 1).maybeSingle();
  return (
    (data as Ajustes | null) ?? {
      id: 1,
      config_fiscal: false,
      nombre_comercial: null,
      updated_at: new Date(0).toISOString(),
    }
  );
}

export async function listarCobros(f: FiltroFinanzas = {}): Promise<Cobro[]> {
  const supabase = await createClient();
  return leerTodo<Cobro>((desde, hasta) => {
    let q = supabase
      .from("cobros")
      .select("*")
      .order("fecha_emision", { ascending: false })
      .order("numero", { ascending: false })
      .range(desde, hasta);
    if (f.empresaId) q = q.eq("empresa_id", f.empresaId);
    if (f.proyectoId) q = q.eq("proyecto_id", f.proyectoId);
    if (f.presupuestoId) q = q.eq("presupuesto_id", f.presupuestoId);
    if (f.desde) q = q.gte("fecha_emision", f.desde);
    if (f.hasta) q = q.lte("fecha_emision", f.hasta);
    return q as unknown as PromiseLike<{ data: Cobro[] | null }>;
  });
}

/** Pagos (más recientes primero). Los filtros de empresa, proyecto y presupuesto pasan por el cobro. */
export async function listarPagos(f: FiltroFinanzas = {}): Promise<Pago[]> {
  const supabase = await createClient();
  let cobroIds: string[] | null = null;
  if (f.empresaId || f.proyectoId || f.presupuestoId) {
    cobroIds = (
      await listarCobros(f.desde || f.hasta ? { ...f, desde: undefined, hasta: undefined } : f)
    ).map((c) => c.id);
    if (cobroIds.length === 0) return [];
  }
  return leerTodo<Pago>((desde, hasta) => {
    let q = supabase
      .from("pagos")
      .select("*")
      .order("fecha", { ascending: false })
      .order("created_at", { ascending: false })
      .range(desde, hasta);
    if (f.desde) q = q.gte("fecha", f.desde);
    if (f.hasta) q = q.lte("fecha", f.hasta);
    return (cobroIds ? q.in("cobro_id", cobroIds) : q) as unknown as PromiseLike<{
      data: Pago[] | null;
    }>;
  });
}

export async function listarGastos(f: FiltroFinanzas = {}): Promise<Gasto[]> {
  const supabase = await createClient();
  return leerTodo<Gasto>((desde, hasta) => {
    let q = supabase
      .from("gastos")
      .select("*")
      .order("fecha", { ascending: false })
      .order("created_at", { ascending: false })
      .range(desde, hasta);
    if (f.empresaId) q = q.eq("empresa_id", f.empresaId);
    if (f.proyectoId) q = q.eq("proyecto_id", f.proyectoId);
    if (f.categoria) q = q.eq("categoria", f.categoria);
    if (f.desde) q = q.gte("fecha", f.desde);
    if (f.hasta) q = q.lte("fecha", f.hasta);
    return q as unknown as PromiseLike<{ data: Gasto[] | null }>;
  });
}

export async function listarSuscripciones(): Promise<Suscripcion[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("suscripciones")
    .select("*")
    .order("proxima_renovacion", { ascending: true });
  return (data ?? []) as Suscripcion[];
}

export type CobroConEstado = {
  cobro: Cobro;
  pagado: number;
  pendiente: number;
  estado: EstadoCobro;
};

/** Cobros con lo cobrado y el estado derivado. El filtro de fecha se aplica a la emisión. */
export async function cobrosConEstado(f: FiltroFinanzas = {}): Promise<CobroConEstado[]> {
  const [cobros, pagos] = await Promise.all([listarCobros(f), listarPagos()]);
  const hoy = hoyMadrid();
  const porCobro = new Map<string, Pago[]>();
  for (const p of pagos) porCobro.set(p.cobro_id, [...(porCobro.get(p.cobro_id) ?? []), p]);
  return cobros.map((cobro) => ({
    cobro,
    ...resumenCobro(cobro, porCobro.get(cobro.id) ?? [], hoy),
  }));
}

/** Un cobro con todos sus pagos (más recientes primero), o null si no existe. */
export async function cargarCobro(id: string): Promise<{ cobro: Cobro; pagos: Pago[] } | null> {
  const supabase = await createClient();
  const [{ data: cobro }, { data: pagos }] = await Promise.all([
    supabase.from("cobros").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("pagos")
      .select("*")
      .eq("cobro_id", id)
      .order("fecha", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);
  return cobro ? { cobro: cobro as Cobro, pagos: (pagos ?? []) as Pago[] } : null;
}
