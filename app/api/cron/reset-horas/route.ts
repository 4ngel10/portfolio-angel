import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cronAutorizado } from "@/lib/portal/cron";

export const dynamic = "force-dynamic";

/**
 * Día 1 de cada mes: pone a cero las horas consumidas de todas las bolsas y las
 * lleva al mes en curso. Las horas sin gastar no se acumulan.
 */
export async function GET(request: Request) {
  if (!cronAutorizado(request)) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const hoy = new Date();
  const inicio = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), 1)).toISOString().slice(0, 10);
  const fin = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth() + 1, 0)).toISOString().slice(0, 10);

  const { data, error } = await createAdminClient()
    .from("bolsa_horas")
    .update({ horas_consumidas: 0, periodo_inicio: inicio, periodo_fin: fin })
    .gte("horas_contratadas", 0) // PostgREST exige un filtro en los update; esto abarca todas las filas
    .select("id");

  if (error) {
    console.error("[cron reset-horas]", error.message);
    return NextResponse.json({ error: "No se pudo reiniciar la bolsa." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, bolsas: data?.length ?? 0, periodo: { inicio, fin } });
}
