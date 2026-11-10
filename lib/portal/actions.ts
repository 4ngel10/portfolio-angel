"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fallo, refrescar } from "./action-utils";
import { getPerfil, requireAdmin } from "./auth";
import { ipDelCliente } from "./ip";
import { avisarAdmin, avisarBolsaBaja, enviarInvitacion } from "./email";
import { SITE_URL } from "@/lib/site";
import { getI18n } from "./i18n";
import { cuentasDesactivadas } from "./cuentas";
import { SECTORES } from "./sectores";
import { filasEnLaUltimaHora } from "./rate-limit";
import { LIMITE_MENSAJES_HORA } from "./storage-limits";
import { FECHA, isEmail, isUuid, oneOf, slugify, text, type FormState } from "./validate";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/* ------------------------------------------------------------------ */
/* Admin: empresas y usuarios                                          */
/* ------------------------------------------------------------------ */

export async function crearEmpresa(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const nombre = text(fd, "nombre", 80);
  if (nombre.length < 2) return await fallo("companyName");

  const supabase = await createClient();
  const { data: creada, error } = await supabase
    .from("empresas")
    .insert({ nombre, slug: slugify(nombre) })
    .select("id, nombre")
    .single();
  if (error || !creada) {
    console.error("[crearEmpresa]", error?.message);
    return await fallo(error?.code === "23505" ? "companyExists" : "companyFail");
  }
  refrescar();
  return { ok: true, message: (await getI18n()).t("ok.companyCreated"), empresa: creada };
}

/** Datos básicos de la empresa (se piden al crearla y se pueden cambiar desde su ficha). */
export async function guardarDetallesEmpresa(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = text(fd, "id", 40);
  if (!isUuid(id)) return await fallo("invalidCompany");
  const sector = oneOf(text(fd, "sector", 20), SECTORES);
  const web = text(fd, "web", 200);
  if (web && !/^https?:\/\/\S+\.\S+$/i.test(web)) return await fallo("webInvalid");

  const supabase = await createClient();
  const { error } = await supabase
    .from("empresas")
    .update({
      sector,
      actividad: text(fd, "actividad", 300) || null,
      ubicacion: text(fd, "ubicacion", 120) || null,
      telefono: text(fd, "telefono", 30) || null,
      web: web || null,
    })
    .eq("id", id);
  if (error) {
    console.error("[guardarDetallesEmpresa]", error.message);
    return await fallo("companyDetailsFail");
  }
  refrescar();
  return { ok: true, message: (await getI18n()).t("ok.companyDetailsSaved") };
}

/**
 * Enlace de acceso de un solo uso (auth.admin.generateLink) y correo de bienvenida. Nunca lanza:
 * devuelve false si falta la configuración o algo falla, y el alta se mantiene igualmente.
 */
async function enviarInvitacionCorreo(
  email: string,
  nombre: string,
  empresaId: string,
  locale: "es" | "en" = "es",
) {
  try {
    const admin = createAdminClient();
    const [{ data: enlace, error }, { data: empresa }] = await Promise.all([
      admin.auth.admin.generateLink({ type: "magiclink", email }),
      admin.from("empresas").select("nombre").eq("id", empresaId).maybeSingle(),
    ]);
    const hash = enlace?.properties?.hashed_token;
    if (error || !hash) {
      console.error("[invitacion] No se pudo generar el enlace:", error?.message);
      return false;
    }
    // /auth/entrar no canjea nada al abrirse: el hash se gasta al pulsar "Entrar" (POST a
    // /auth/callback), para que los filtros de correo que abren los enlaces no lo consuman.
    const url = `${SITE_URL}/auth/entrar?token_hash=${encodeURIComponent(hash)}&type=magiclink`;
    return await enviarInvitacion({
      to: email,
      nombre,
      empresa: empresa?.nombre ?? "",
      enlace: url,
      locale,
    });
  } catch (e) {
    console.error("[invitacion]", e);
    return false;
  }
}

/** Crea la cuenta y el perfil de una persona y, si se pide, le manda la invitación. */
async function altaPersona(
  empresaId: string,
  nombre: string,
  email: string,
  invitar: boolean,
): Promise<FormState> {
  // Se crea el usuario en Supabase Auth (sin enviar nada) y su perfil.
  const admin = createAdminClient();
  const { data: creado, error: errAuth } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
  });
  if (errAuth || !creado.user) {
    console.error("[altaPersona]", errAuth?.message);
    return await fallo(errAuth?.code === "email_exists" ? "emailExists" : "userFail");
  }

  const { error: errPerfil } = await admin.from("usuarios").insert({
    id: creado.user.id,
    empresa_id: empresaId,
    role: "cliente",
    nombre,
    email,
  });
  if (errPerfil) {
    console.error("[altaPersona]", errPerfil.message);
    await admin.auth.admin.deleteUser(creado.user.id); // no dejar un usuario a medias
    return await fallo("profileFail");
  }

  const { t } = await getI18n();
  if (!invitar) return { ok: true, message: t("ok.personCreated", { name: nombre, email }) };
  const enviada = await enviarInvitacionCorreo(email, nombre, empresaId);
  return {
    ok: true,
    message: t(enviada ? "ok.personInvited" : "ok.personInviteFailed", { name: nombre, email }),
  };
}

export async function invitarCliente(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const email = text(fd, "email", 254).toLowerCase();
  const nombre = text(fd, "nombre", 80);
  const empresaId = text(fd, "empresa_id", 40);
  if (!isEmail(email)) return await fallo("emailInvalid");
  if (nombre.length < 2) return await fallo("personName");
  if (!isUuid(empresaId)) return await fallo("chooseCompany");

  const resultado = await altaPersona(empresaId, nombre, email, fd.get("invitar") === "on");
  refrescar();
  return resultado;
}

/**
 * Alta de un cliente en un solo paso: la empresa (una que ya existe o una nueva con su nombre)
 * y su primera persona. Si la persona falla y la empresa era nueva, la empresa se deshace.
 */
export async function crearCliente(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const email = text(fd, "email", 254).toLowerCase();
  const nombre = text(fd, "nombre", 80);
  const existente = text(fd, "empresa_id", 40);
  const nombreEmpresa = text(fd, "empresa_nombre", 80);
  if (existente && !isUuid(existente)) return await fallo("chooseCompany");
  if (!existente && nombreEmpresa.length < 2) return await fallo("companyName");
  if (!isEmail(email)) return await fallo("emailInvalid");
  if (nombre.length < 2) return await fallo("personName");

  const supabase = await createClient();
  let empresaId = existente;
  if (!empresaId) {
    const { data: creada, error } = await supabase
      .from("empresas")
      .insert({ nombre: nombreEmpresa, slug: slugify(nombreEmpresa) })
      .select("id")
      .single();
    if (error || !creada) {
      console.error("[crearCliente]", error?.message);
      return await fallo(error?.code === "23505" ? "companyExists" : "companyFail");
    }
    empresaId = creada.id;
  }

  const resultado = await altaPersona(empresaId, nombre, email, fd.get("invitar") === "on");
  if (!resultado.ok && !existente) {
    await supabase.from("empresas").delete().eq("id", empresaId);
  }
  refrescar();
  return resultado;
}

/** Vuelve a enviar la invitación a una persona que ya tiene cuenta. */
export async function reenviarInvitacion(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = text(fd, "id", 40);
  if (!isUuid(id)) return await fallo("userInvalid");
  const supabase = await createClient();
  const { data: persona } = await supabase
    .from("usuarios")
    .select("nombre, email, empresa_id, role, idioma")
    .eq("id", id)
    .maybeSingle();
  if (!persona || persona.role !== "cliente" || !persona.empresa_id) {
    return await fallo("userInvalid");
  }
  // A una cuenta desactivada no se le reenvía nada (ni se puede comprobar: se trata como tal).
  if ((await cuentasDesactivadas([id])).has(id)) return await fallo("userDisabled");
  const enviada = await enviarInvitacionCorreo(
    persona.email,
    persona.nombre,
    persona.empresa_id,
    persona.idioma === "en" ? "en" : "es",
  );
  if (!enviada) return await fallo("inviteFail");
  return { ok: true, message: (await getI18n()).t("ok.inviteResent", { email: persona.email }) };
}

/* ------------------------------------------------------------------ */
/* Admin: proyectos e hitos                                            */
/* ------------------------------------------------------------------ */

/** El presupuesto existe, es de esa empresa y está enviado o aceptado (los borradores no). */
async function presupuestoElegibleDe(
  supabase: Awaited<ReturnType<typeof createClient>>,
  presupuestoId: string,
  empresaId: string,
) {
  const { data } = await supabase
    .from("presupuestos")
    .select("id")
    .eq("id", presupuestoId)
    .eq("empresa_id", empresaId)
    .in("estado", ["aceptado", "enviado"])
    .maybeSingle();
  return !!data;
}

/** Enlaza el proyecto con un presupuesto aceptado de su empresa, lo cambia o lo quita (vacío). */
export async function vincularPresupuesto(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const proyectoId = text(fd, "proyecto_id", 40);
  const presupuestoId = text(fd, "presupuesto_id", 40);
  if (!isUuid(proyectoId)) return await fallo("invalidProject");
  if (presupuestoId && !isUuid(presupuestoId)) return await fallo("quoteInvalid");

  const supabase = await createClient();
  const { data: proyecto } = await supabase
    .from("proyectos")
    .select("empresa_id, presupuesto_id")
    .eq("id", proyectoId)
    .maybeSingle();
  if (!proyecto) return await fallo("invalidProject");
  // Dejar el que ya tiene no se revalida: puede que el presupuesto haya cambiado de estado después.
  if (
    presupuestoId &&
    presupuestoId !== proyecto.presupuesto_id &&
    !(await presupuestoElegibleDe(supabase, presupuestoId, proyecto.empresa_id))
  ) {
    return await fallo("quoteInvalid");
  }

  const { error } = await supabase
    .from("proyectos")
    .update({ presupuesto_id: presupuestoId || null })
    .eq("id", proyectoId);
  if (error) {
    console.error("[vincularPresupuesto]", error.message);
    return await fallo(error.code === "23505" ? "quoteTaken" : "projectFail");
  }
  refrescar();
  return { ok: true, message: (await getI18n()).t("ok.projectQuoteSaved") };
}

export async function crearProyecto(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const empresaId = text(fd, "empresa_id", 40);
  const titulo = text(fd, "titulo", 120);
  const descripcion = text(fd, "descripcion", 2000);
  if (!isUuid(empresaId)) return await fallo("chooseCompany");
  if (titulo.length < 3) return await fallo("projectTitle");
  const presupuestoId = text(fd, "presupuesto_id", 40);
  if (presupuestoId && !isUuid(presupuestoId)) return await fallo("quoteInvalid");

  const supabase = await createClient();
  if (presupuestoId && !(await presupuestoElegibleDe(supabase, presupuestoId, empresaId))) {
    return await fallo("quoteInvalid");
  }
  const { error } = await supabase.from("proyectos").insert({
    empresa_id: empresaId,
    titulo,
    descripcion: descripcion || null,
    presupuesto_id: presupuestoId || null,
  });
  if (error) {
    console.error("[crearProyecto]", error.message);
    return await fallo(error.code === "23505" ? "quoteTaken" : "projectFail");
  }
  refrescar();
  return { ok: true, message: (await getI18n()).t("ok.projectCreated") };
}

export async function cambiarEstadoProyecto(fd: FormData) {
  await requireAdmin();
  const id = text(fd, "id", 40);
  const estado = oneOf(text(fd, "estado", 20), ["activo", "pausado", "completado"] as const);
  if (!isUuid(id) || !estado) return;
  const supabase = await createClient();
  await supabase.from("proyectos").update({ estado }).eq("id", id);
  refrescar();
}

export async function crearHito(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const proyectoId = text(fd, "proyecto_id", 40);
  const titulo = text(fd, "titulo", 120);
  const descripcion = text(fd, "descripcion", 1000);
  const pelota = oneOf(text(fd, "pelota_en", 10), ["cliente", "equipo"] as const) ?? "equipo";
  const fecha = text(fd, "fecha_objetivo", 10);
  if (!isUuid(proyectoId)) return await fallo("invalidProject");
  if (titulo.length < 2) return await fallo("milestoneTitle");
  if (fecha && !FECHA.test(fecha)) return await fallo("invalidDate");

  const supabase = await createClient();
  const { data: ultimo } = await supabase
    .from("hitos")
    .select("orden")
    .eq("proyecto_id", proyectoId)
    .order("orden", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("hitos").insert({
    proyecto_id: proyectoId,
    titulo,
    descripcion: descripcion || null,
    pelota_en: pelota,
    fecha_objetivo: fecha || null,
    orden: (ultimo?.orden ?? 0) + 1,
  });
  if (error) {
    console.error("[crearHito]", error.message);
    return await fallo("milestoneFail");
  }
  refrescar();
  return { ok: true, message: (await getI18n()).t("ok.milestoneAdded") };
}

export async function cambiarHito(fd: FormData) {
  await requireAdmin();
  const id = text(fd, "id", 40);
  if (!isUuid(id)) return;
  const cambios: Record<string, unknown> = {};
  const completado = text(fd, "completado", 5);
  if (completado) cambios.completado = completado === "true";
  const pelota = oneOf(text(fd, "pelota_en", 10), ["cliente", "equipo"] as const);
  if (pelota) cambios.pelota_en = pelota;
  if (!Object.keys(cambios).length) return;

  const supabase = await createClient();
  await supabase.from("hitos").update(cambios).eq("id", id);
  refrescar();
}

export async function eliminarHito(fd: FormData) {
  await requireAdmin();
  const id = text(fd, "id", 40);
  if (!isUuid(id)) return;
  const supabase = await createClient();
  await supabase.from("hitos").delete().eq("id", id);
  refrescar();
}

/* ------------------------------------------------------------------ */
/* Admin: archivos                                                     */
/* ------------------------------------------------------------------ */

export async function eliminarArchivo(fd: FormData) {
  await requireAdmin();
  const id = text(fd, "id", 40);
  if (!isUuid(id)) return;
  const supabase = await createClient();
  const { data } = await supabase
    .from("archivos")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();
  if (!data) return;
  await createAdminClient().storage.from("archivos").remove([data.storage_path]);
  await supabase.from("archivos").delete().eq("id", id);
  refrescar();
}

/* ------------------------------------------------------------------ */
/* Incidencias                                                         */
/* ------------------------------------------------------------------ */

export async function cambiarEstadoIncidencia(fd: FormData) {
  await requireAdmin();
  const id = text(fd, "id", 40);
  const estado = oneOf(text(fd, "estado", 20), ["abierta", "en_progreso", "resuelta"] as const);
  if (!isUuid(id) || !estado) return;
  const supabase = await createClient();
  await supabase.from("incidencias").update({ estado }).eq("id", id);
  refrescar();
}

/** Mensaje en una incidencia. Lo pueden escribir el cliente de esa empresa y el admin (RLS lo vigila). */
export async function enviarMensaje(_: FormState, fd: FormData): Promise<FormState> {
  const perfil = await getPerfil();
  if (!perfil) return await fallo("sessionExpired");
  if (perfil.role === "admin") await requireAdmin();

  const incidenciaId = text(fd, "incidencia_id", 40);
  const contenido = text(fd, "contenido", 4000);
  if (!isUuid(incidenciaId)) return await fallo("invalidIncident");
  if (!contenido) return await fallo("writeMessage");

  const supabase = await createClient();
  if (perfil.role === "cliente") {
    const recientes = await filasEnLaUltimaHora(supabase, "mensajes_incidencia", {
      columna: "autor_id",
      valor: perfil.id,
    });
    if (recientes >= LIMITE_MENSAJES_HORA) return await fallo("rateLimited");
  }
  const { error } = await supabase
    .from("mensajes_incidencia")
    .insert({ incidencia_id: incidenciaId, autor_id: perfil.id, contenido });
  if (error) {
    console.error("[enviarMensaje]", error.message);
    return await fallo("messageFail");
  }
  refrescar();

  if (perfil.role === "cliente") {
    const { data: inc } = await supabase
      .from("incidencias")
      .select("titulo, proyecto_id, proyectos(titulo), empresas(nombre)")
      .eq("id", incidenciaId)
      .maybeSingle();
    const proyecto = Array.isArray(inc?.proyectos) ? inc.proyectos[0] : inc?.proyectos;
    const empresa = Array.isArray(inc?.empresas) ? inc.empresas[0] : inc?.empresas;
    await avisarAdmin({
      asunto: `[Mensaje en incidencia] ${inc?.titulo ?? ""} · ${empresa?.nombre ?? perfil.nombre}`,
      datos: [
        `Empresa: ${empresa?.nombre ?? "Sin empresa"}`,
        `Proyecto: ${proyecto?.titulo ?? ""}`,
        `De: ${perfil.nombre}`,
      ],
      cuerpo: contenido,
      ruta: inc?.proyecto_id ? `/admin/proyectos/${inc.proyecto_id}` : "/admin",
      etiqueta: "Abrir el proyecto",
    });
  }
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Admin: bolsa de horas                                            */
/* ------------------------------------------------------------------ */

function mesActual() {
  const hoy = new Date();
  const inicio = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), 1));
  const fin = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth() + 1, 0));
  return { inicio: inicio.toISOString().slice(0, 10), fin: fin.toISOString().slice(0, 10) };
}

/** Horas con coma o punto decimal y como mucho dos decimales. NaN si no es válido. */
function leerHoras(fd: FormData, key: string): number {
  const n = Number(text(fd, key, 10).replace(",", "."));
  return Number.isFinite(n) && Math.abs(n * 100 - Math.round(n * 100)) < 1e-6 ? n : NaN;
}

/** Umbral de bolsa baja: con el 20 % o menos de lo contratado se avisa al cliente. */
const UMBRAL_BOLSA_BAJA = 0.2;

/** Fija las horas contratadas de una empresa (la crea si no tenía bolsa). */
export async function guardarBolsa(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const empresaId = text(fd, "empresa_id", 40);
  const horas = leerHoras(fd, "horas_contratadas");
  if (!isUuid(empresaId)) return await fallo("chooseCompany");
  if (Number.isNaN(horas) || horas < 0 || horas > 10000) return await fallo("hoursInteger");
  // Precio de la bolsa en euros; vacío = sin precio todavía. Acepta coma decimal.
  const precioTexto = text(fd, "precio", 12).replace(",", ".");
  const precio = precioTexto === "" ? null : Number(precioTexto);
  if (precio !== null && (!Number.isFinite(precio) || precio < 0 || precio > 1000000)) {
    return await fallo("priceInvalid");
  }

  const supabase = await createClient();
  const { data: actual } = await supabase
    .from("bolsa_horas")
    .select("id, horas_contratadas")
    .eq("empresa_id", empresaId)
    .maybeSingle();
  const { inicio, fin } = mesActual();
  const { error } = actual
    ? await supabase
        .from("bolsa_horas")
        .update({
          horas_contratadas: horas,
          precio,
          // Al ampliar las horas, el aviso de bolsa baja vuelve a quedar disponible.
          ...(horas > Number(actual.horas_contratadas) && { ultimo_aviso_bajo: null }),
        })
        .eq("id", actual.id)
    : await supabase.from("bolsa_horas").insert({
        empresa_id: empresaId,
        horas_contratadas: horas,
        precio,
        periodo_inicio: inicio,
        periodo_fin: fin,
      });
  if (error) {
    console.error("[guardarBolsa]", error.message);
    return await fallo("bankFail");
  }
  refrescar();
  return { ok: true, message: (await getI18n()).t("ok.bankSaved") };
}

/** Fecha de hoy en España (AAAA-MM-DD): el servidor corre en UTC. */
function hoyMadrid() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Madrid" }).format(new Date());
}

/**
 * Apunta horas (o una corrección, en negativo) con su fecha, proyecto opcional y concepto.
 * El movimiento y el contador se escriben juntos en registrar_horas() (db/rls.sql). Si el apunte
 * deja la bolsa al 20 % o menos, se avisa una vez al cliente; si el correo falla, el apunte
 * queda guardado igualmente.
 */
export async function registrarHoras(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const empresaId = text(fd, "empresa_id", 40);
  const horas = leerHoras(fd, "horas");
  const concepto = text(fd, "concepto", 200);
  const fecha = text(fd, "fecha", 10) || hoyMadrid();
  const proyectoId = text(fd, "proyecto_id", 40);
  if (!isUuid(empresaId)) return await fallo("invalidCompany");
  if (Number.isNaN(horas) || horas === 0 || Math.abs(horas) > 1000) {
    return await fallo("hoursNeedInt");
  }
  if (!concepto) return await fallo("conceptRequired");
  if (!FECHA.test(fecha) || Number.isNaN(Date.parse(fecha))) {
    return await fallo("invalidDate");
  }
  if (proyectoId && !isUuid(proyectoId)) return await fallo("invalidProject");

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("registrar_horas", {
    p_empresa: empresaId,
    p_fecha: fecha,
    p_horas: horas,
    p_proyecto: proyectoId || null,
    p_concepto: concepto,
  });
  if (error) {
    console.error("[registrarHoras]", error.message);
    if (error.message.includes("no_bank")) return await fallo("noBank");
    if (error.message.includes("below_zero")) return await fallo("hoursBelowZero");
    if (error.message.includes("invalid_project")) return await fallo("invalidProject");
    return await fallo("hoursFail");
  }

  await avisarSiBolsaBaja(supabase, empresaId, Array.isArray(data) ? data[0] : data);
  refrescar();
  return { ok: true, message: (await getI18n()).t("ok.hoursRecorded") };
}

type EstadoBolsa = {
  horas_contratadas: number | string;
  horas_consumidas: number | string;
  ultimo_aviso_bajo: string | null;
} | null;

/** Avisa al cliente una sola vez cuando la bolsa baja al umbral; lo rearma si vuelve a subir. */
async function avisarSiBolsaBaja(
  supabase: Awaited<ReturnType<typeof createClient>>,
  empresaId: string,
  fila: EstadoBolsa,
) {
  if (!fila) return;
  try {
    const contratadas = Number(fila.horas_contratadas);
    const restantes = Math.max(
      0,
      Math.round((contratadas - Number(fila.horas_consumidas)) * 100) / 100,
    );
    const baja = contratadas > 0 && restantes <= contratadas * UMBRAL_BOLSA_BAJA;

    if (!baja) {
      if (fila.ultimo_aviso_bajo) {
        await supabase
          .from("bolsa_horas")
          .update({ ultimo_aviso_bajo: null })
          .eq("empresa_id", empresaId);
      }
      return;
    }
    if (fila.ultimo_aviso_bajo) return;

    const [{ data: personas }, { data: empresa }] = await Promise.all([
      supabase
        .from("usuarios")
        .select("id, email, idioma")
        .eq("empresa_id", empresaId)
        .eq("role", "cliente"),
      supabase.from("empresas").select("nombre").eq("id", empresaId).maybeSingle(),
    ]);
    const desactivadas = await cuentasDesactivadas((personas ?? []).map((p) => p.id as string));
    const destinatarios = (personas ?? [])
      .filter((p) => !desactivadas.has(p.id as string))
      .map((p) => ({
        email: p.email as string,
        locale: p.idioma === "en" ? ("en" as const) : ("es" as const),
      }));
    if (destinatarios.length === 0) return;

    const enviado = await avisarBolsaBaja({
      destinatarios,
      empresa: empresa?.nombre ?? "",
      restantes,
      contratadas,
    });
    if (enviado) {
      await supabase
        .from("bolsa_horas")
        .update({ ultimo_aviso_bajo: new Date().toISOString() })
        .eq("empresa_id", empresaId);
    }
  } catch (e) {
    console.error("[avisarSiBolsaBaja]", e);
  }
}

/* ------------------------------------------------------------------ */
/* Admin: gestión de usuarios                                          */
/* ------------------------------------------------------------------ */

/** Duración del bloqueo al desactivar: en la práctica, indefinido hasta que se reactive. */
const BLOQUEO = "876000h";

/** Perfil de un cliente (nunca de un admin: las cuentas admin no se tocan desde la web). */
async function clienteObjetivo(id: string) {
  if (!isUuid(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("usuarios").select("id, role").eq("id", id).maybeSingle();
  return data && data.role === "cliente" ? data : null;
}

/**
 * El cliente acaba de elegir su contraseña (el formulario ya la cambió con su sesión): se anota en
 * app_metadata, que solo se escribe desde el servidor. La marca solo decide si el portal le pide
 * elegirla; no da acceso a nada.
 */
export async function marcarContrasenaElegida(): Promise<{ ok: boolean }> {
  const perfil = await getPerfil();
  if (!perfil || perfil.role !== "cliente") return { ok: false };
  const { error } = await createAdminClient().auth.admin.updateUserById(perfil.id, {
    app_metadata: { password_set: true, password_temporary: false },
  });
  if (error) {
    console.error("[marcarContrasenaElegida]", error.message);
    return { ok: false };
  }
  return { ok: true };
}

export async function guardarUsuario(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = text(fd, "id", 40);
  const nombre = text(fd, "nombre", 80);
  const email = text(fd, "email", 254).toLowerCase();
  const empresaId = text(fd, "empresa_id", 40);
  const password = typeof fd.get("password") === "string" ? (fd.get("password") as string) : "";

  if (!(await clienteObjetivo(id))) return await fallo("userProtected");
  if (nombre.length < 2) return await fallo("personName");
  if (!isEmail(email)) return await fallo("emailInvalid");
  if (!isUuid(empresaId)) return await fallo("chooseCompany");
  if (password && (password.length < 12 || password.length > 72))
    return await fallo("passwordShort");

  const admin = createAdminClient();
  const { error: errAuth } = await admin.auth.admin.updateUserById(id, {
    email,
    email_confirm: true,
    // Contraseña provisional: el portal obliga a la persona a elegir la suya al entrar. Las marcas
    // van en app_metadata (solo servidor); user_metadata lo puede editar el propio usuario.
    ...(password
      ? { password, app_metadata: { password_set: false, password_temporary: true } }
      : {}),
  });
  if (errAuth) {
    console.error("[guardarUsuario]", errAuth.message);
    return await fallo(errAuth.code === "email_exists" ? "emailExists" : "userUpdateFail");
  }

  const { error: errPerfil } = await admin
    .from("usuarios")
    .update({ nombre, email, empresa_id: empresaId })
    .eq("id", id);
  if (errPerfil) {
    console.error("[guardarUsuario]", errPerfil.message);
    return await fallo("userUpdateFail");
  }
  refrescar();
  return { ok: true, message: (await getI18n()).t("ok.userSaved") };
}

/** Desactiva (bloquea el acceso) o reactiva a un cliente. Sus datos no se tocan. */
export async function alternarUsuario(fd: FormData) {
  await requireAdmin();
  const id = text(fd, "id", 40);
  const desactivar = text(fd, "desactivar", 5) === "true";
  if (!(await clienteObjetivo(id))) return;
  const { error } = await createAdminClient().auth.admin.updateUserById(id, {
    ban_duration: desactivar ? BLOQUEO : "none",
  });
  if (error) console.error("[alternarUsuario]", error.message);
  refrescar();
}

/** Borra la cuenta; el perfil cae en cascada y sus mensajes quedan sin autor. */
export async function eliminarUsuario(fd: FormData) {
  await requireAdmin();
  const id = text(fd, "id", 40);
  if (!(await clienteObjetivo(id))) return;
  const { error } = await createAdminClient().auth.admin.deleteUser(id);
  if (error) console.error("[eliminarUsuario]", error.message);
  refrescar();
}

/* ------------------------------------------------------------------ */
/* Presupuestos                                                        */
/* ------------------------------------------------------------------ */

type LineaEntrada = {
  concepto: string;
  detalle: string | null;
  cantidad: number;
  precio_unitario: number;
};

/** Líneas que llegan del formulario como JSON. Devuelve null si algo no cuadra. */
function leerLineas(raw: string): LineaEntrada[] | null {
  let datos: unknown;
  try {
    datos = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(datos) || datos.length === 0 || datos.length > 60) return null;
  const lineas: LineaEntrada[] = [];
  for (const d of datos) {
    if (!d || typeof d !== "object") return null;
    const { concepto, detalle, cantidad, precio_unitario } = d as Record<string, unknown>;
    const c = typeof concepto === "string" ? concepto.trim().slice(0, 160) : "";
    const det = typeof detalle === "string" ? detalle.trim().slice(0, 500) : "";
    const cant = Number(cantidad);
    const precio = Number(precio_unitario);
    if (!c || !Number.isFinite(cant) || !Number.isFinite(precio)) return null;
    if (cant < 0 || cant > 100000 || precio < 0 || precio > 10000000) return null;
    lineas.push({
      concepto: c,
      detalle: det || null,
      cantidad: Math.round(cant * 100) / 100,
      precio_unitario: Math.round(precio * 100) / 100,
    });
  }
  return lineas;
}

/** Crea o edita un presupuesto con todas sus líneas. Al crear, lleva a su página. */
export async function guardarPresupuesto(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = text(fd, "id", 40);
  const empresaId = text(fd, "empresa_id", 40);
  const titulo = text(fd, "titulo", 140);
  const fechaEmision = text(fd, "fecha_emision", 10);
  const validoHasta = text(fd, "valido_hasta", 10);
  const iva = Number(text(fd, "iva", 6).replace(",", "."));
  const descuento = Number(text(fd, "descuento", 6).replace(",", ".") || "0");
  const lineas = leerLineas(text(fd, "lineas", 60000));

  if (id && !isUuid(id)) return await fallo("quoteInvalid");
  if (!isUuid(empresaId)) return await fallo("chooseCompany");
  if (titulo.length < 3) return await fallo("quoteTitle");
  if (!FECHA.test(fechaEmision) || (validoHasta && !FECHA.test(validoHasta))) {
    return await fallo("invalidDate");
  }
  if (!Number.isFinite(iva) || iva < 0 || iva > 100) return await fallo("quoteVat");
  if (!Number.isFinite(descuento) || descuento < 0 || descuento > 100) {
    return await fallo("quoteDiscount");
  }
  if (!lineas) return await fallo("quoteLines");

  const supabase = await createClient();
  const datos = {
    empresa_id: empresaId,
    titulo,
    fecha_emision: fechaEmision,
    valido_hasta: validoHasta || null,
    iva,
    descuento,
    notas: text(fd, "notas", 3000) || null,
  };

  let presupuestoId = id;
  if (id) {
    const { error } = await supabase.from("presupuestos").update(datos).eq("id", id);
    if (error) {
      console.error("[guardarPresupuesto]", error.message);
      return await fallo("quoteFail");
    }
  } else {
    // Número correlativo por año: P-2026-001. Si dos altas coinciden, el índice único avisa y se reintenta.
    const prefijo = `P-${fechaEmision.slice(0, 4)}-`;
    for (let intento = 0; intento < 3 && !presupuestoId; intento++) {
      const { data: previos } = await supabase
        .from("presupuestos")
        .select("numero")
        .like("numero", `${prefijo}%`);
      const ultimo = Math.max(
        0,
        ...(previos ?? []).map((p) => Number(p.numero.slice(prefijo.length)) || 0),
      );
      const { data: creado, error } = await supabase
        .from("presupuestos")
        .insert({ ...datos, numero: `${prefijo}${String(ultimo + 1).padStart(3, "0")}` })
        .select("id")
        .single();
      if (creado) presupuestoId = creado.id;
      else if (error?.code !== "23505") {
        console.error("[guardarPresupuesto]", error?.message);
        return await fallo("quoteFail");
      }
    }
    if (!presupuestoId) return await fallo("quoteFail");
  }

  // Las líneas se sustituyen enteras: es lo más simple y un presupuesto tiene pocas.
  const { error: errBorrar } = await supabase
    .from("presupuesto_lineas")
    .delete()
    .eq("presupuesto_id", presupuestoId);
  const { error: errLineas } = errBorrar
    ? { error: errBorrar }
    : await supabase
        .from("presupuesto_lineas")
        .insert(lineas.map((l, i) => ({ ...l, presupuesto_id: presupuestoId, orden: i + 1 })));
  if (errLineas) {
    console.error("[guardarPresupuesto] líneas", errLineas.message);
    return await fallo("quoteFail");
  }

  refrescar();
  if (!id) redirect(`/admin/presupuestos/${presupuestoId}`);
  return { ok: true, message: (await getI18n()).t("ok.quoteSaved") };
}

export async function cambiarEstadoPresupuesto(fd: FormData) {
  await requireAdmin();
  const id = text(fd, "id", 40);
  const estado = oneOf(text(fd, "estado", 20), [
    "borrador",
    "enviado",
    "aceptado",
    "rechazado",
  ] as const);
  if (!isUuid(id) || !estado) return;
  const supabase = await createClient();
  // Una firma solo vale para el presupuesto aceptado: al reabrirlo se descarta.
  const sinFirma =
    estado === "aceptado"
      ? {}
      : { firma_nombre: null, firma_usuario_id: null, firma_fecha: null, firma_ip: null };
  await supabase
    .from("presupuestos")
    .update({ estado, ...sinFirma })
    .eq("id", id);
  refrescar();
}

export async function eliminarPresupuesto(fd: FormData) {
  await requireAdmin();
  const id = text(fd, "id", 40);
  if (!isUuid(id)) return;
  const supabase = await createClient();
  await supabase.from("presupuestos").delete().eq("id", id);
  refrescar();
  redirect("/admin/presupuestos");
}

/** Correo al admin cuando un cliente acepta (firmando) o rechaza un presupuesto. */
async function avisarPresupuesto(
  id: string,
  resultado: "aceptado" | "rechazado",
  persona: string,
  firma?: string,
) {
  const { data } = await createAdminClient()
    .from("presupuestos")
    .select("numero, titulo, empresas(nombre)")
    .eq("id", id)
    .maybeSingle();
  if (!data) return;
  const empresa = (Array.isArray(data.empresas) ? data.empresas[0] : data.empresas)?.nombre;
  await avisarAdmin({
    asunto: `[Presupuesto ${resultado}] ${data.numero} · ${empresa ?? persona}`,
    datos: [
      `Empresa: ${empresa ?? "Sin empresa"}`,
      `Presupuesto: ${data.numero} ${data.titulo}`,
      `Cliente: ${persona}`,
      ...(firma ? [`Firmado como: ${firma}`] : []),
    ],
    ruta: `/admin/presupuestos/${id}`,
    etiqueta: "Abrir el presupuesto",
  });
}

/** Presupuesto enviado a la empresa de quien llama. RLS solo deja ver los de su empresa. */
async function presupuestoPendiente(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("presupuestos")
    .select("id")
    .eq("id", id)
    .eq("estado", "enviado")
    .maybeSingle();
  return !!data;
}

/**
 * El cliente acepta el presupuesto firmándolo: escribe su nombre completo y confirma. Se guarda
 * quién firmó, cuándo y desde qué IP. Es una firma electrónica sencilla, no una cualificada.
 */
export async function firmarPresupuesto(_: FormState, fd: FormData): Promise<FormState> {
  const perfil = await getPerfil();
  if (!perfil || perfil.role !== "cliente") return await fallo("sessionExpired");
  const id = text(fd, "id", 40);
  const nombre = text(fd, "firma", 120).replace(/\s+/g, " ");
  if (!isUuid(id)) return await fallo("quoteInvalid");
  if (nombre.length < 3 || !nombre.includes(" ")) return await fallo("signName");
  if (fd.get("acepto") !== "on") return await fallo("signConfirm");
  if (!(await presupuestoPendiente(id))) return await fallo("quoteNotPending");

  const ip = await ipDelCliente();
  const { error } = await createAdminClient()
    .from("presupuestos")
    .update({
      estado: "aceptado",
      firma_nombre: nombre,
      firma_usuario_id: perfil.id,
      firma_fecha: new Date().toISOString(),
      firma_ip: ip,
    })
    .eq("id", id)
    .eq("estado", "enviado");
  if (error) {
    console.error("[firmarPresupuesto]", error.message);
    return await fallo("quoteFail");
  }
  refrescar();
  await avisarPresupuesto(id, "aceptado", perfil.nombre, nombre);
  return { ok: true, message: (await getI18n()).t("ok.quoteSigned") };
}

export async function rechazarPresupuesto(fd: FormData) {
  const perfil = await getPerfil();
  if (!perfil || perfil.role !== "cliente") return;
  const id = text(fd, "id", 40);
  if (!isUuid(id) || !(await presupuestoPendiente(id))) return;
  await createAdminClient()
    .from("presupuestos")
    .update({ estado: "rechazado" })
    .eq("id", id)
    .eq("estado", "enviado");
  refrescar();
  await avisarPresupuesto(id, "rechazado", perfil.nombre);
}

/**
 * Guarda el idioma de la persona con sesión para que los correos le lleguen en él. Los clientes
 * no tienen política de escritura sobre `usuarios` (así nadie puede cambiarse el rol), por eso
 * se usa la clave de servicio, y solo sobre la fila de quien tiene la sesión.
 */
export async function guardarIdioma(locale: string): Promise<void> {
  if (locale !== "es" && locale !== "en") return;
  const perfil = await getPerfil();
  if (!perfil) return;
  const { error } = await createAdminClient()
    .from("usuarios")
    .update({ idioma: locale })
    .eq("id", perfil.id);
  if (error) console.error("[guardarIdioma]", error.message);
}
