import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cronAutorizado } from "@/lib/portal/cron";
import { avisarAdmin } from "@/lib/portal/email";
import {
  avanzarRenovacion,
  diasEntre,
  hoyMadrid,
  resumenCobro,
  sumarDias,
} from "@/lib/portal/finanzas";
import { formatDate, formatEuros } from "@/lib/portal/translate";
import type { Cobro, Pago, Suscripcion } from "@/lib/portal/types";

// Cada renovación pendiente genera un gasto; con un tope por si una fecha quedó muy atrás.
const MAX_RENOVACIONES_POR_SUSCRIPCION = 60;

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

/**
 * Cron diario (06:00 UTC). Convierte cada renovación de suscripción en un gasto y avisa al
 * admin, solo si hay algo que contar, de cobros recién vencidos, renovaciones próximas y
 * gastos generados. Se puede ejecutar dos veces seguidas: `unique (suscripcion_id, fecha)`
 * impide duplicar un gasto.
 */
export async function GET(request: Request) {
  if (!cronAutorizado(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const hoy = hoyMadrid();

  // 1. Renovaciones vencidas: un gasto por cada una, recuperando los días perdidos.
  const { data: activas, error: errSubs } = await supabase
    .from("suscripciones")
    .select("*")
    .eq("activa", true);
  if (errSubs) {
    console.error("[cron finanzas] suscripciones", errSubs.message);
    return NextResponse.json({ error: "No se pudieron leer las suscripciones" }, { status: 500 });
  }
  const suscripciones = (activas ?? []) as Suscripcion[];

  const generados: { concepto: string; fecha: string; importe: number }[] = [];
  for (const s of suscripciones.filter((x) => x.proxima_renovacion <= hoy)) {
    let proxima = s.proxima_renovacion;
    for (let i = 0; i < MAX_RENOVACIONES_POR_SUSCRIPCION && proxima <= hoy; i++) {
      // Una suscripción gratuita avanza de fecha pero no genera gasto (importe > 0 en gastos).
      if (s.importe > 0) {
        const { error } = await supabase.from("gastos").insert({
          fecha: proxima,
          concepto: s.nombre,
          proveedor: s.proveedor,
          categoria: s.categoria,
          importe: s.importe,
          metodo_pago: s.metodo_pago,
          suscripcion_id: s.id,
        });
        if (!error) generados.push({ concepto: s.nombre, fecha: proxima, importe: s.importe });
        // Un duplicado (23505) significa que ese gasto ya existe: se salta sin más.
        else if (error.code !== "23505") {
          console.error("[cron finanzas] gasto", s.nombre, error.message);
          // La fecha se queda en esta renovación y se reintenta mañana.
          break;
        }
      }
      proxima = avanzarRenovacion(proxima, s.periodicidad);
    }
    if (proxima !== s.proxima_renovacion) {
      const { error } = await supabase
        .from("suscripciones")
        .update({ proxima_renovacion: proxima })
        .eq("id", s.id);
      if (error) console.error("[cron finanzas] renovación", s.nombre, error.message);
    }
  }

  // 2. Aviso diario, solo si hay algo.
  const ayer = sumarDias(hoy, -1);
  const [{ data: cobrosData }, { data: pagosData }, { data: empresasData }] = await Promise.all([
    supabase.from("cobros").select("*").eq("anulado", false).eq("fecha_vencimiento", ayer),
    supabase.from("pagos").select("cobro_id, importe"),
    supabase.from("empresas").select("id, nombre"),
  ]);
  const nombre = new Map(
    (empresasData ?? []).map((e: { id: string; nombre: string }) => [e.id, e.nombre]),
  );
  const pagosPorCobro = new Map<string, Pick<Pago, "importe">[]>();
  for (const p of (pagosData ?? []) as Pick<Pago, "cobro_id" | "importe">[]) {
    pagosPorCobro.set(p.cobro_id, [...(pagosPorCobro.get(p.cobro_id) ?? []), p]);
  }

  // Cobros que han pasado a vencidos hoy (su fecha era ayer) y siguen sin pagarse del todo.
  const vencidos = ((cobrosData ?? []) as Cobro[])
    .map((c) => ({ cobro: c, ...resumenCobro(c, pagosPorCobro.get(c.id) ?? [], hoy) }))
    .filter((c) => c.estado === "vencido");

  // Renovaciones a las que les faltan exactamente `aviso_dias` días (ya con la fecha puesta al día).
  const { data: tras } = await supabase.from("suscripciones").select("*").eq("activa", true);
  const proximas = ((tras ?? []) as Suscripcion[]).filter(
    (s) => diasEntre(hoy, s.proxima_renovacion) === s.aviso_dias,
  );

  const resumen = {
    renovadas: generados.length,
    vencidos: vencidos.length,
    avisos: proximas.length,
  };

  if (vencidos.length + proximas.length + generados.length > 0) {
    const partes = [
      vencidos.length ? plural(vencidos.length, "cobro vencido", "cobros vencidos") : "",
      proximas.length ? plural(proximas.length, "renovación próxima", "renovaciones próximas") : "",
      generados.length ? plural(generados.length, "gasto generado", "gastos generados") : "",
    ].filter(Boolean);

    const datos = [
      ...vencidos.map(
        ({ cobro, pendiente }) =>
          `Vencido: ${cobro.numero} · ${nombre.get(cobro.empresa_id) ?? "Cliente"} · ${cobro.concepto} · ${formatEuros(pendiente, "es")} pendientes`,
      ),
      ...proximas.map(
        (s) =>
          `Renovación: ${s.nombre} · ${formatDate(s.proxima_renovacion, "es")} · ${formatEuros(s.importe, "es")}`,
      ),
      ...generados.map(
        (g) =>
          `Gasto generado: ${g.concepto} · ${formatDate(g.fecha, "es")} · ${formatEuros(g.importe, "es")}`,
      ),
    ];

    await avisarAdmin({
      asunto: `[Finanzas] ${partes.join(" · ")}`,
      datos,
      ruta: "/admin/finanzas",
      etiqueta: "Abrir Finanzas",
    });
  }

  console.info("[cron finanzas]", JSON.stringify(resumen));
  return NextResponse.json(resumen);
}
