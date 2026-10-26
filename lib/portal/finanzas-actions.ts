"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fallo, refrescar } from "./action-utils";
import { requireAdmin } from "./auth";
import {
  CATEGORIAS_GASTO,
  METODOS_PAGO,
  PERIODICIDADES,
  PLANES_COBRO,
  avanzarRenovacion,
  esFecha,
  fechaMadrid,
  hoyMadrid,
  parseImporte,
  repartir,
  resumenCobro,
} from "./finanzas";
import { getI18n } from "./i18n";
import { totales } from "./presupuestos";
import { isUuid, oneOf, text, type FormState } from "./validate";

const MAX_IMPORTE = 1_000_000;
const BUCKET = "finanzas";

/** Importe de un campo de formulario (admite coma decimal). null si no vale. */
function leerImporte(fd: FormData, clave: string, { permitirCero = false } = {}): number | null {
  const n = parseImporte(text(fd, clave, 16));
  if (n === null || n > MAX_IMPORTE || n < 0 || (n === 0 && !permitirCero)) return null;
  return n;
}

/** Fecha opcional: "" si falta, null si está mal escrita. */
function leerFecha(fd: FormData, clave: string): string | null {
  const f = text(fd, clave, 10);
  return f === "" || esFecha(f) ? f : null;
}

/** Porcentaje fiscal opcional (IVA). "" = sin dato. */
function leerPorcentaje(fd: FormData, clave: string): number | null | undefined {
  const raw = text(fd, clave, 6).replace(",", ".");
  if (raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : undefined;
}

async function fiscalActivo(): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.from("ajustes").select("config_fiscal").eq("id", 1).maybeSingle();
  return data?.config_fiscal === true;
}

/** Ids correlativos C-<año>-NNN que siguen al último del año. */
async function siguientesNumeros(anio: string, cantidad: number): Promise<string[]> {
  const supabase = await createClient();
  const prefijo = `C-${anio}-`;
  const { data: previos } = await supabase
    .from("cobros")
    .select("numero")
    .like("numero", `${prefijo}%`);
  const ultimo = Math.max(
    0,
    ...(previos ?? []).map((c) => Number(c.numero.slice(prefijo.length)) || 0),
  );
  return Array.from(
    { length: cantidad },
    (_, i) => `${prefijo}${String(ultimo + 1 + i).padStart(3, "0")}`,
  );
}

/** Cobro y lo ya cobrado de él. */
async function cobroConPagos(id: string) {
  const supabase = await createClient();
  const [{ data: cobro }, { data: pagos }] = await Promise.all([
    supabase.from("cobros").select("*").eq("id", id).maybeSingle(),
    supabase.from("pagos").select("importe").eq("cobro_id", id),
  ]);
  return { cobro, pagos: pagos ?? [] };
}

/** Crea o edita un cobro. Al crear, lleva a su página. */
export async function guardarCobro(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = text(fd, "id", 40);
  const empresaId = text(fd, "empresa_id", 40);
  const proyectoId = text(fd, "proyecto_id", 40);
  const concepto = text(fd, "concepto", 200);
  const importe = leerImporte(fd, "importe");
  const fechaEmision = leerFecha(fd, "fecha_emision") || hoyMadrid();
  const fechaVencimiento = leerFecha(fd, "fecha_vencimiento");

  if (id && !isUuid(id)) return await fallo("cobroInvalid");
  if (!isUuid(empresaId)) return await fallo("chooseCompany");
  if (proyectoId && !isUuid(proyectoId)) return await fallo("cobroInvalid");
  if (concepto.length < 3) return await fallo("cobroConcept");
  if (importe === null) return await fallo("amountInvalid");
  if (!esFecha(fechaEmision) || fechaVencimiento === null) return await fallo("invalidDate");

  const supabase = await createClient();
  if (proyectoId) {
    // El proyecto tiene que ser de ese cliente.
    const { data: proyecto } = await supabase
      .from("proyectos")
      .select("id")
      .eq("id", proyectoId)
      .eq("empresa_id", empresaId)
      .maybeSingle();
    if (!proyecto) return await fallo("cobroProject");
  }

  const datos = {
    empresa_id: empresaId,
    proyecto_id: proyectoId || null,
    concepto,
    importe,
    fecha_emision: fechaEmision,
    fecha_vencimiento: fechaVencimiento || null,
    notas: text(fd, "notas", 3000) || null,
  };

  if (id) {
    const { cobro, pagos } = await cobroConPagos(id);
    if (!cobro) return await fallo("cobroInvalid");
    // No se puede dejar el cobro por debajo de lo que ya se ha cobrado.
    if (importe < resumenCobro(cobro, pagos).pagado) return await fallo("cobroBelowPaid");
    const { error } = await supabase.from("cobros").update(datos).eq("id", id);
    if (error) {
      console.error("[guardarCobro]", error.message);
      return await fallo("cobroFail");
    }
    refrescar();
    return { ok: true, message: (await getI18n()).t("ok.cobroSaved") };
  }

  // Número correlativo por año. Si dos altas coinciden, el índice único avisa y se reintenta.
  let nuevoId: string | null = null;
  for (let intento = 0; intento < 3 && !nuevoId; intento++) {
    const [numero] = await siguientesNumeros(fechaEmision.slice(0, 4), 1);
    const { data: creado, error } = await supabase
      .from("cobros")
      .insert({ ...datos, numero, origen: "manual" })
      .select("id")
      .single();
    if (creado) nuevoId = creado.id;
    else if (error?.code !== "23505") {
      console.error("[guardarCobro]", error?.message);
      return await fallo("cobroFail");
    }
  }
  if (!nuevoId) return await fallo("cobroFail");
  refrescar();
  redirect(`/admin/finanzas/cobros/${nuevoId}`);
}

async function marcarAnulado(fd: FormData, anulado: boolean) {
  await requireAdmin();
  const id = text(fd, "id", 40);
  if (!isUuid(id)) return;
  const supabase = await createClient();
  const { error } = await supabase.from("cobros").update({ anulado }).eq("id", id);
  if (error) console.error("[anularCobro]", error.message);
  refrescar();
}

/** Un cobro con pagos se puede anular pero nunca borrar. */
export async function anularCobro(fd: FormData) {
  await marcarAnulado(fd, true);
}

export async function reactivarCobro(fd: FormData) {
  await marcarAnulado(fd, false);
}

/** Solo si no tiene pagos. */
export async function eliminarCobro(fd: FormData) {
  await requireAdmin();
  const id = text(fd, "id", 40);
  if (!isUuid(id)) return;
  const supabase = await createClient();
  const { count } = await supabase
    .from("pagos")
    .select("id", { count: "exact", head: true })
    .eq("cobro_id", id);
  if (count) return;
  const { error } = await supabase.from("cobros").delete().eq("id", id);
  if (error) {
    console.error("[eliminarCobro]", error.message);
    return;
  }
  refrescar();
  redirect("/admin/finanzas/cobros");
}

export async function registrarPago(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const cobroId = text(fd, "cobro_id", 40);
  const importe = leerImporte(fd, "importe");
  const fecha = leerFecha(fd, "fecha") || hoyMadrid();
  const metodo = oneOf(text(fd, "metodo", 20) || "transferencia", METODOS_PAGO);

  if (!isUuid(cobroId)) return await fallo("cobroInvalid");
  if (importe === null) return await fallo("amountInvalid");
  if (!esFecha(fecha)) return await fallo("invalidDate");
  if (!metodo) return await fallo("methodInvalid");

  const { cobro, pagos } = await cobroConPagos(cobroId);
  if (!cobro) return await fallo("cobroInvalid");
  if (cobro.anulado) return await fallo("payCancelled");
  const { pendiente } = resumenCobro(cobro, pagos);
  // Se compara en céntimos para que 0,1 + 0,2 no dé problemas de coma flotante.
  if (Math.round(importe * 100) > Math.round(pendiente * 100)) {
    const { euros } = await getI18n();
    return { error: (await getI18n()).t("err.payOver", { amount: euros(pendiente) }) };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("pagos").insert({
    cobro_id: cobroId,
    fecha,
    importe,
    metodo,
    referencia: text(fd, "referencia", 120) || null,
    notas: text(fd, "notas", 1000) || null,
  });
  if (error) {
    console.error("[registrarPago]", error.message);
    return await fallo("payFail");
  }
  refrescar();
  return { ok: true, message: (await getI18n()).t("ok.paySaved") };
}

/** Para corregir un error al registrar un pago. */
export async function eliminarPago(fd: FormData) {
  await requireAdmin();
  const id = text(fd, "id", 40);
  if (!isUuid(id)) return;
  const supabase = await createClient();
  const { error } = await supabase.from("pagos").delete().eq("id", id);
  if (error) console.error("[eliminarPago]", error.message);
  refrescar();
}

/** Porcentajes de un plan personalizado, escritos como "50/30/20". */
function leerPorcentajes(raw: string): number[] | null {
  const partes = raw
    .split(/[/;\s]+/)
    .filter(Boolean)
    .map((p) => Number(p.replace(",", ".")));
  if (partes.length === 0 || partes.length > 12) return null;
  if (partes.some((p) => !Number.isFinite(p) || p <= 0 || p > 100)) return null;
  return Math.abs(partes.reduce((s, p) => s + p, 0) - 100) < 0.001 ? partes : null;
}

/** Genera de una vez los cobros de un presupuesto aceptado, repartidos en plazos. */
export async function generarCobrosPresupuesto(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const presupuestoId = text(fd, "presupuesto_id", 40);
  const plan = oneOf(text(fd, "plan", 12), ["completo", "mitad", "tercios", "custom"] as const);
  if (!isUuid(presupuestoId) || !plan) return await fallo("planInvalid");

  const porcentajes =
    plan === "custom" ? leerPorcentajes(text(fd, "porcentajes", 120)) : [...PLANES_COBRO[plan]];
  if (!porcentajes) return await fallo("planPercent");

  const supabase = await createClient();
  const [{ data: presupuesto }, { data: lineas }, { count: existentes }] = await Promise.all([
    supabase.from("presupuestos").select("*").eq("id", presupuestoId).maybeSingle(),
    supabase
      .from("presupuesto_lineas")
      .select("cantidad, precio_unitario")
      .eq("presupuesto_id", presupuestoId),
    supabase
      .from("cobros")
      .select("id", { count: "exact", head: true })
      .eq("presupuesto_id", presupuestoId),
  ]);
  if (!presupuesto) return await fallo("planInvalid");
  if (presupuesto.estado !== "aceptado") return await fallo("planNotAccepted");
  if (existentes) return await fallo("planExists");

  const total = totales(
    (lineas ?? []).map((l) => ({ cantidad: l.cantidad, precio_unitario: l.precio_unitario })),
    presupuesto.descuento,
    presupuesto.iva,
  ).total;
  if (total <= 0) return await fallo("planZero");

  const hoy = hoyMadrid();
  const plazos = repartir(total, porcentajes);
  const titulo = String(presupuesto.titulo).slice(0, 180);
  const primerVencimiento = presupuesto.firma_fecha ? fechaMadrid(presupuesto.firma_fecha) : hoy;

  // Una sola inserción: o se crean todos los plazos o ninguno.
  let creados = false;
  for (let intento = 0; intento < 3 && !creados; intento++) {
    const numeros = await siguientesNumeros(hoy.slice(0, 4), plazos.length);
    const { error } = await supabase.from("cobros").insert(
      plazos.map((importe, i) => ({
        numero: numeros[i],
        empresa_id: presupuesto.empresa_id,
        presupuesto_id: presupuestoId,
        origen: "presupuesto",
        concepto: plazos.length === 1 ? titulo : `${titulo} · ${i + 1}/${plazos.length}`,
        importe,
        fecha_emision: hoy,
        fecha_vencimiento: i === 0 ? primerVencimiento : null,
      })),
    );
    if (!error) creados = true;
    else if (error.code !== "23505") {
      console.error("[generarCobrosPresupuesto]", error.message);
      return await fallo("cobroFail");
    }
  }
  if (!creados) return await fallo("cobroFail");
  refrescar();
  return { ok: true, message: (await getI18n()).t("ok.planCreated", { count: plazos.length }) };
}

/** Crea el cobro de una bolsa de horas con precio. Avisa si ya hubo otro hace poco, pero no lo impide. */
export async function generarCobroBolsa(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const bolsaId = text(fd, "bolsa_id", 40);
  if (!isUuid(bolsaId)) return await fallo("cobroInvalid");

  const supabase = await createClient();
  const { data: bolsa } = await supabase
    .from("bolsa_horas")
    .select("*")
    .eq("id", bolsaId)
    .maybeSingle();
  if (!bolsa) return await fallo("cobroInvalid");
  if (!bolsa.precio || bolsa.precio <= 0) return await fallo("bankNoPrice");

  const hoy = hoyMadrid();
  const hace30 = new Date(Date.now() - 30 * 86_400_000);
  const { count: recientes } = await supabase
    .from("cobros")
    .select("id", { count: "exact", head: true })
    .eq("empresa_id", bolsa.empresa_id)
    .eq("origen", "bolsa")
    .gte("created_at", hace30.toISOString());

  let creado = false;
  for (let intento = 0; intento < 3 && !creado; intento++) {
    const [numero] = await siguientesNumeros(hoy.slice(0, 4), 1);
    const { error } = await supabase.from("cobros").insert({
      numero,
      empresa_id: bolsa.empresa_id,
      origen: "bolsa",
      concepto: `Bolsa de horas ${bolsa.horas_contratadas} h`,
      importe: bolsa.precio,
      fecha_emision: hoy,
    });
    if (!error) creado = true;
    else if (error.code !== "23505") {
      console.error("[generarCobroBolsa]", error.message);
      return await fallo("cobroFail");
    }
  }
  if (!creado) return await fallo("cobroFail");
  refrescar();
  const { t } = await getI18n();
  return { ok: true, message: t(recientes ? "ok.bankCobroDup" : "ok.bankCobro") };
}

export async function guardarGasto(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = text(fd, "id", 40);
  const concepto = text(fd, "concepto", 200);
  const importe = leerImporte(fd, "importe");
  const fecha = leerFecha(fd, "fecha") || hoyMadrid();
  const categoria = oneOf(text(fd, "categoria", 30) || "otros", CATEGORIAS_GASTO);
  const metodoTexto = text(fd, "metodo_pago", 20);
  const metodo = metodoTexto ? oneOf(metodoTexto, METODOS_PAGO) : null;
  const proyectoId = text(fd, "proyecto_id", 40);
  const empresaId = text(fd, "empresa_id", 40);

  if (id && !isUuid(id)) return await fallo("gastoInvalid");
  if (concepto.length < 2) return await fallo("gastoConcept");
  if (importe === null) return await fallo("amountInvalid");
  if (!esFecha(fecha)) return await fallo("invalidDate");
  if (!categoria) return await fallo("categoryInvalid");
  if (metodoTexto && !metodo) return await fallo("methodInvalid");
  if ((proyectoId && !isUuid(proyectoId)) || (empresaId && !isUuid(empresaId))) {
    return await fallo("gastoInvalid");
  }

  // Los campos fiscales solo se tocan si el negocio los tiene activados.
  const fiscal: { iva_pct?: number | null; deducible?: boolean } = {};
  if (await fiscalActivo()) {
    const iva = leerPorcentaje(fd, "iva_pct");
    if (iva === undefined) return await fallo("vatInvalid");
    fiscal.iva_pct = iva;
    fiscal.deducible = fd.get("deducible") === "on";
  }

  const datos = {
    fecha,
    concepto,
    proveedor: text(fd, "proveedor", 120) || null,
    categoria,
    importe,
    metodo_pago: metodo,
    proyecto_id: proyectoId || null,
    empresa_id: empresaId || null,
    notas: text(fd, "notas", 3000) || null,
    ...fiscal,
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("gastos").update(datos).eq("id", id)
    : await supabase.from("gastos").insert(datos);
  if (error) {
    console.error("[guardarGasto]", error.message);
    return await fallo("gastoFail");
  }
  refrescar();
  return { ok: true, message: (await getI18n()).t("ok.gastoSaved") };
}

/** Borra el gasto y, si tenía, su justificante del bucket. */
export async function eliminarGasto(fd: FormData) {
  await requireAdmin();
  const id = text(fd, "id", 40);
  if (!isUuid(id)) return;
  const supabase = await createClient();
  const { data: gasto } = await supabase
    .from("gastos")
    .select("justificante_path")
    .eq("id", id)
    .maybeSingle();
  const { error } = await supabase.from("gastos").delete().eq("id", id);
  if (error) {
    console.error("[eliminarGasto]", error.message);
    return;
  }
  if (gasto?.justificante_path) {
    const { error: errStorage } = await createAdminClient()
      .storage.from(BUCKET)
      .remove([gasto.justificante_path]);
    if (errStorage) console.error("[eliminarGasto] justificante", errStorage.message);
  }
  refrescar();
}

/** Ruta que genera /api/finanzas/justificante: gastos/<año>/<gastoId>/<uuid>-<nombre>. */
function rutaJustificanteValida(gastoId: string, path: string) {
  return (
    path.length <= 300 &&
    !path.includes("..") &&
    path.startsWith("gastos/") &&
    path.split("/")[2] === gastoId
  );
}

/** Guarda el justificante ya subido desde el navegador y borra el anterior, si lo había. */
export async function confirmarJustificante(
  gastoId: string,
  path: string,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const { t } = await getI18n();
  if (!isUuid(gastoId) || typeof path !== "string" || !rutaJustificanteValida(gastoId, path)) {
    return { ok: false, error: t("err.receiptInvalid") };
  }
  const supabase = await createClient();
  const { data: gasto } = await supabase
    .from("gastos")
    .select("justificante_path")
    .eq("id", gastoId)
    .maybeSingle();
  if (!gasto) return { ok: false, error: t("err.receiptInvalid") };

  const { error } = await supabase
    .from("gastos")
    .update({ justificante_path: path })
    .eq("id", gastoId);
  if (error) {
    console.error("[confirmarJustificante]", error.message);
    return { ok: false, error: t("err.receiptFail") };
  }
  if (gasto.justificante_path && gasto.justificante_path !== path) {
    await createAdminClient().storage.from(BUCKET).remove([gasto.justificante_path]);
  }
  refrescar();
  return { ok: true };
}

/** Enlace de descarga de 60 segundos. Se genera al pulsar y no se guarda en ningún sitio. */
export async function urlJustificante(gastoId: string): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  const { t } = await getI18n();
  if (!isUuid(gastoId)) return { error: t("err.receiptInvalid") };
  const supabase = await createClient();
  const { data: gasto } = await supabase
    .from("gastos")
    .select("justificante_path")
    .eq("id", gastoId)
    .maybeSingle();
  if (!gasto?.justificante_path) return { error: t("err.receiptInvalid") };
  const { data, error } = await createAdminClient()
    .storage.from(BUCKET)
    .createSignedUrl(gasto.justificante_path, 60);
  if (error || !data) {
    console.error("[urlJustificante]", error?.message);
    return { error: t("err.receiptFail") };
  }
  return { url: data.signedUrl };
}

/** Solo http(s): el enlace se abre desde el panel y no debe poder ser javascript:. */
function leerUrl(fd: FormData, clave: string): string | null | undefined {
  const raw = text(fd, clave, 300);
  if (raw === "") return null;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

export async function guardarSuscripcion(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = text(fd, "id", 40);
  const nombre = text(fd, "nombre", 120);
  const importe = leerImporte(fd, "importe", { permitirCero: true });
  const periodicidad = oneOf(text(fd, "periodicidad", 12) || "mensual", PERIODICIDADES);
  const categoria = oneOf(text(fd, "categoria", 30) || "software", CATEGORIAS_GASTO);
  const proxima = text(fd, "proxima_renovacion", 10);
  const metodoTexto = text(fd, "metodo_pago", 20);
  const metodo = metodoTexto ? oneOf(metodoTexto, METODOS_PAGO) : null;
  const url = leerUrl(fd, "url_gestion");
  const aviso = Number(text(fd, "aviso_dias", 3) || "7");

  if (id && !isUuid(id)) return await fallo("subInvalid");
  if (nombre.length < 2) return await fallo("subName");
  if (importe === null) return await fallo("amountInvalid");
  if (!periodicidad || !categoria) return await fallo("subInvalid");
  if (!esFecha(proxima)) return await fallo("subRenewal");
  if (metodoTexto && !metodo) return await fallo("methodInvalid");
  if (url === undefined) return await fallo("urlInvalid");
  if (!Number.isInteger(aviso) || aviso < 0 || aviso > 60) return await fallo("subNotice");

  const fiscal: { iva_pct?: number | null } = {};
  if (await fiscalActivo()) {
    const iva = leerPorcentaje(fd, "iva_pct");
    if (iva === undefined) return await fallo("vatInvalid");
    fiscal.iva_pct = iva;
  }

  const datos = {
    nombre,
    proveedor: text(fd, "proveedor", 120) || null,
    categoria,
    importe,
    periodicidad,
    proxima_renovacion: proxima,
    metodo_pago: metodo,
    url_gestion: url,
    aviso_dias: aviso,
    notas: text(fd, "notas", 3000) || null,
    ...fiscal,
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("suscripciones").update(datos).eq("id", id)
    : await supabase.from("suscripciones").insert({ ...datos, fecha_alta: hoyMadrid() });
  if (error) {
    console.error("[guardarSuscripcion]", error.message);
    return await fallo("subFail");
  }
  refrescar();
  return { ok: true, message: (await getI18n()).t("ok.subSaved") };
}

/** Una suscripción con gastos no se borra: se da de baja y su historial queda. */
export async function darDeBajaSuscripcion(fd: FormData) {
  await requireAdmin();
  const id = text(fd, "id", 40);
  if (!isUuid(id)) return;
  const supabase = await createClient();
  const { error } = await supabase
    .from("suscripciones")
    .update({ activa: false, fecha_baja: hoyMadrid() })
    .eq("id", id);
  if (error) console.error("[darDeBajaSuscripcion]", error.message);
  refrescar();
}

/**
 * Reactiva una suscripción. Si su renovación quedó atrás, se adelanta hasta hoy sin crear
 * gastos: el cron no debe inventar los cobros de los meses que estuvo de baja.
 */
export async function reactivarSuscripcion(fd: FormData) {
  await requireAdmin();
  const id = text(fd, "id", 40);
  if (!isUuid(id)) return;
  const supabase = await createClient();
  const { data: sub } = await supabase
    .from("suscripciones")
    .select("proxima_renovacion, periodicidad")
    .eq("id", id)
    .maybeSingle();
  if (!sub) return;
  const hoy = hoyMadrid();
  let proxima = sub.proxima_renovacion as string;
  while (proxima < hoy) proxima = avanzarRenovacion(proxima, sub.periodicidad);
  const { error } = await supabase
    .from("suscripciones")
    .update({ activa: true, fecha_baja: null, proxima_renovacion: proxima })
    .eq("id", id);
  if (error) console.error("[reactivarSuscripcion]", error.message);
  refrescar();
}

export async function guardarAjustes(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("ajustes").upsert({
    id: 1,
    config_fiscal: fd.get("config_fiscal") === "on",
    nombre_comercial: text(fd, "nombre_comercial", 120) || null,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    console.error("[guardarAjustes]", error.message);
    return await fallo("settingsFail");
  }
  refrescar();
  return { ok: true, message: (await getI18n()).t("ok.settingsSaved") };
}
