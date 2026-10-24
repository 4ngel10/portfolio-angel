"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPerfil, requireAdmin } from "./auth";
import { getI18n } from "./i18n";
import { SECTORES } from "./sectores";
import { isEmail, isUuid, oneOf, slugify, text, type FormState } from "./validate";

/** Las dos zonas leen de las mismas tablas: tras cualquier cambio se refrescan ambas. */
function refrescar() {
  revalidatePath("/admin", "layout");
  revalidatePath("/portal", "layout");
}

/** Error de formulario en el idioma de la persona (cookie "locale"). */
async function fallo(clave: string): Promise<FormState> {
  const { t } = await getI18n();
  return { error: t(`err.${clave}`) };
}

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

export async function invitarCliente(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const email = text(fd, "email", 254).toLowerCase();
  const nombre = text(fd, "nombre", 80);
  const empresaId = text(fd, "empresa_id", 40);
  if (!isEmail(email)) return await fallo("emailInvalid");
  if (nombre.length < 2) return await fallo("personName");
  if (!isUuid(empresaId)) return await fallo("chooseCompany");

  // Se crea el usuario en Supabase Auth (sin enviar nada) y su perfil. La persona
  // entra después pidiendo su enlace en /login.
  const admin = createAdminClient();
  const { data: creado, error: errAuth } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
  });
  if (errAuth || !creado.user) {
    console.error("[invitarCliente]", errAuth?.message);
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
    console.error("[invitarCliente]", errPerfil.message);
    await admin.auth.admin.deleteUser(creado.user.id); // no dejar un usuario a medias
    return await fallo("profileFail");
  }
  refrescar();
  return { ok: true, message: (await getI18n()).t("ok.personCreated", { name: nombre, email }) };
}

/* ------------------------------------------------------------------ */
/* Admin: proyectos e hitos                                            */
/* ------------------------------------------------------------------ */

export async function crearProyecto(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const empresaId = text(fd, "empresa_id", 40);
  const titulo = text(fd, "titulo", 120);
  const descripcion = text(fd, "descripcion", 2000);
  if (!isUuid(empresaId)) return await fallo("chooseCompany");
  if (titulo.length < 3) return await fallo("projectTitle");

  const supabase = await createClient();
  const { error } = await supabase
    .from("proyectos")
    .insert({ empresa_id: empresaId, titulo, descripcion: descripcion || null });
  if (error) {
    console.error("[crearProyecto]", error.message);
    return await fallo("projectFail");
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
  if (fecha && !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return await fallo("invalidDate");

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
  const { error } = await supabase
    .from("mensajes_incidencia")
    .insert({ incidencia_id: incidenciaId, autor_id: perfil.id, contenido });
  if (error) {
    console.error("[enviarMensaje]", error.message);
    return await fallo("messageFail");
  }
  refrescar();
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Admin: bolsa de horas                                               */
/* ------------------------------------------------------------------ */

function mesActual() {
  const hoy = new Date();
  const inicio = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), 1));
  const fin = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth() + 1, 0));
  return { inicio: inicio.toISOString().slice(0, 10), fin: fin.toISOString().slice(0, 10) };
}

/** Fija las horas contratadas de una empresa (la crea si no tenía bolsa). */
export async function guardarBolsa(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const empresaId = text(fd, "empresa_id", 40);
  const horas = Number(text(fd, "horas_contratadas", 6));
  if (!isUuid(empresaId)) return await fallo("chooseCompany");
  if (!Number.isInteger(horas) || horas < 0 || horas > 10000) return await fallo("hoursInteger");
  // Precio de la bolsa en euros; vacío = sin precio todavía. Acepta coma decimal.
  const precioTexto = text(fd, "precio", 12).replace(",", ".");
  const precio = precioTexto === "" ? null : Number(precioTexto);
  if (precio !== null && (!Number.isFinite(precio) || precio < 0 || precio > 1000000)) {
    return await fallo("priceInvalid");
  }

  const supabase = await createClient();
  const { data: actual } = await supabase
    .from("bolsa_horas")
    .select("id")
    .eq("empresa_id", empresaId)
    .maybeSingle();
  const { inicio, fin } = mesActual();
  const { error } = actual
    ? await supabase
        .from("bolsa_horas")
        .update({ horas_contratadas: horas, precio })
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

/** Suma (o resta, si es negativo) horas consumidas. Nunca baja de cero. */
export async function registrarHoras(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const empresaId = text(fd, "empresa_id", 40);
  const horas = Number(text(fd, "horas", 6));
  if (!isUuid(empresaId)) return await fallo("invalidCompany");
  if (!Number.isInteger(horas) || horas === 0 || Math.abs(horas) > 1000) {
    return await fallo("hoursNeedInt");
  }

  const supabase = await createClient();
  const { data: bolsa } = await supabase
    .from("bolsa_horas")
    .select("id, horas_consumidas")
    .eq("empresa_id", empresaId)
    .maybeSingle();
  if (!bolsa) return await fallo("noBank");

  const { error } = await supabase
    .from("bolsa_horas")
    .update({ horas_consumidas: Math.max(0, bolsa.horas_consumidas + horas) })
    .eq("id", bolsa.id);
  if (error) {
    console.error("[registrarHoras]", error.message);
    return await fallo("hoursFail");
  }
  refrescar();
  return { ok: true, message: (await getI18n()).t("ok.hoursRecorded") };
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
  if (password && (password.length < 8 || password.length > 72))
    return await fallo("passwordShort");

  const admin = createAdminClient();
  const { error: errAuth } = await admin.auth.admin.updateUserById(id, {
    email,
    email_confirm: true,
    // Contraseña provisional: el portal obliga a la persona a elegir la suya al entrar.
    ...(password
      ? { password, user_metadata: { password_set: false, password_temporary: true } }
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
