import { NextResponse } from "next/server";
import { comprobarAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import {
  cargarAjustes,
  cobrosConEstado,
  listarGastos,
  listarPagos,
} from "@/lib/portal/finanzas-queries";
import { aCsv, esFecha, type ColumnaCsv } from "@/lib/portal/finanzas";
import { listarEmpresas, listarProyectos } from "@/lib/portal/queries";
import { oneOf } from "@/lib/portal/validate";

/** 2026-10-26 pasa a 26/10/2026, el formato que Excel en español reconoce como fecha. */
const diaMes = (iso: string | null) => (iso ? iso.split("-").reverse().join("/") : "");

/**
 * Exporta pagos, cobros o gastos de un periodo en CSV para el gestor. Solo admin con segundo
 * factor: sin sesión válida responde 401 en lugar de redirigir.
 */
export async function GET(request: Request) {
  const acceso = await comprobarAdmin();
  if (!acceso.ok) {
    return NextResponse.json({ error: "No autorizado" }, { status: acceso.status });
  }

  const params = new URL(request.url).searchParams;
  const tipo = oneOf(params.get("tipo"), ["pagos", "cobros", "gastos"] as const);
  const desdeParam = params.get("desde") ?? "";
  const hastaParam = params.get("hasta") ?? "";
  if (!tipo || (desdeParam && !esFecha(desdeParam)) || (hastaParam && !esFecha(hastaParam))) {
    return NextResponse.json({ error: "Parámetros no válidos" }, { status: 400 });
  }
  const rango = { desde: desdeParam || undefined, hasta: hastaParam || undefined };

  const { t } = await getI18n();
  const [empresas, proyectos] = await Promise.all([listarEmpresas(), listarProyectos()]);
  const cliente = Object.fromEntries(empresas.map((e) => [e.id, e.nombre]));
  const proyecto = Object.fromEntries(proyectos.map((p) => [p.id, p.titulo]));
  const col = (clave: string, titulo: string): ColumnaCsv => ({ clave, titulo });

  let csv: string;
  if (tipo === "pagos") {
    const [pagos, cobros] = await Promise.all([listarPagos(rango), cobrosConEstado()]);
    const cobroDe = new Map(cobros.map((c) => [c.cobro.id, c.cobro]));
    csv = aCsv(
      pagos.map((p) => {
        const cobro = cobroDe.get(p.cobro_id);
        return {
          fecha: diaMes(p.fecha),
          numero: cobro?.numero ?? "",
          cliente: cobro ? (cliente[cobro.empresa_id] ?? "") : "",
          concepto: cobro?.concepto ?? "",
          metodo: t(`finance.method.${p.metodo}`),
          referencia: p.referencia,
          importe: p.importe,
        };
      }),
      [
        col("fecha", t("finance.cols.date")),
        col("numero", t("finance.cols.number")),
        col("cliente", t("finance.cols.client")),
        col("concepto", t("finance.cols.concept")),
        col("metodo", t("finance.cols.method")),
        col("referencia", t("finance.cols.reference")),
        col("importe", t("finance.cols.amount")),
      ],
    );
  } else if (tipo === "cobros") {
    const cobros = await cobrosConEstado(rango);
    csv = aCsv(
      cobros.map(({ cobro, pagado, pendiente, estado }) => ({
        numero: cobro.numero,
        cliente: cliente[cobro.empresa_id] ?? "",
        concepto: cobro.concepto,
        proyecto: cobro.proyecto_id ? (proyecto[cobro.proyecto_id] ?? "") : "",
        emision: diaMes(cobro.fecha_emision),
        vencimiento: diaMes(cobro.fecha_vencimiento),
        importe: cobro.importe,
        cobrado: pagado,
        pendiente,
        estado: t(`finance.status.${estado}`),
      })),
      [
        col("numero", t("finance.cols.number")),
        col("cliente", t("finance.cols.client")),
        col("concepto", t("finance.cols.concept")),
        col("proyecto", t("finance.cols.project")),
        col("emision", t("finance.cols.issued")),
        col("vencimiento", t("finance.cols.due")),
        col("importe", t("finance.cols.amount")),
        col("cobrado", t("finance.cols.collected")),
        col("pendiente", t("finance.cols.pending")),
        col("estado", t("finance.cols.status")),
      ],
    );
  } else {
    const [gastos, ajustes] = await Promise.all([listarGastos(rango), cargarAjustes()]);
    const si = t("finance.export.yes");
    const no = t("finance.export.no");
    // Las columnas fiscales solo salen cuando el negocio las tiene activadas.
    const fiscal = ajustes.config_fiscal;
    csv = aCsv(
      gastos.map((g) => ({
        fecha: diaMes(g.fecha),
        concepto: g.concepto,
        proveedor: g.proveedor,
        categoria: t(`finance.category.${g.categoria}`),
        proyecto: g.proyecto_id ? (proyecto[g.proyecto_id] ?? "") : "",
        cliente: g.empresa_id ? (cliente[g.empresa_id] ?? "") : "",
        importe: g.importe,
        justificante: g.justificante_path ? si : no,
        iva: g.iva_pct === null ? "" : `${String(g.iva_pct).replace(".", ",")} %`,
        deducible: g.deducible === null ? "" : g.deducible ? si : no,
      })),
      [
        col("fecha", t("finance.cols.date")),
        col("concepto", t("finance.cols.concept")),
        col("proveedor", t("finance.cols.provider")),
        col("categoria", t("finance.cols.category")),
        col("proyecto", t("finance.cols.project")),
        col("cliente", t("finance.cols.client")),
        col("importe", t("finance.cols.amount")),
        col("justificante", t("finance.cols.receipt")),
        ...(fiscal
          ? [col("iva", t("finance.form.vatPct")), col("deducible", t("finance.form.deductible"))]
          : []),
      ],
    );
  }

  const nombre = `finanzas-${tipo}-${desdeParam || "inicio"}_${hastaParam || "hoy"}.csv`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nombre}"`,
      "Cache-Control": "no-store",
    },
  });
}
