import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cronAutorizado } from "@/lib/portal/cron";

export const dynamic = "force-dynamic";

/**
 * Día 1 de cada mes: archiva el mes que acaba de cerrar de cada bolsa (para el gasto
 * acumulado que ve el admin), pone a cero las horas consumidas y las lleva al mes en
 * curso. Las horas sin gastar no se acumulan.
 */
export async function GET(request: Request) {
  if (!cronAutorizado(request))
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const hoy = new Date();
  const inicio = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), 1))
    .toISOString()
    .slice(0, 10);
  const fin = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth() + 1, 0))
    .toISOString()
    .slice(0, 10);

  const admin = createAdminClient();

  // Solo las bolsas que aún apuntan a un mes anterior: si el cron se repite no duplica nada.
  const { data: cerradas } = await admin
    .from("bolsa_horas")
    .select("*")
    .lt("periodo_inicio", inicio);
  if (cerradas?.length) {
    const { error: errHistorial } = await admin.from("bolsa_historial").upsert(
      cerradas.map((b) => ({
        empresa_id: b.empresa_id,
        periodo_inicio: b.periodo_inicio,
        periodo_fin: b.periodo_fin,
        horas_contratadas: b.horas_contratadas,
        horas_consumidas: b.horas_consumidas,
        precio: b.precio,
      })),
      { onConflict: "empresa_id,periodo_inicio", ignoreDuplicates: true },
    );
    if (errHistorial) {
      // Sin archivar no se reinicia: se perdería el gasto del mes.
      console.error("[cron reset-horas] historial", errHistorial.message);
      return NextResponse.json({ error: "No se pudo archivar el mes." }, { status: 500 });
    }
  }

  const { data, error } = await admin
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
