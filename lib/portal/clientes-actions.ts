"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fallo, refrescar } from "./action-utils";
import { requireAdmin } from "./auth";
import { getI18n } from "./i18n";
import { isUuid, text, type FormState } from "./validate";

/** Mismo bloqueo indefinido que "Desactivar" en la ficha de cada persona (ver actions.ts). */
const BLOQUEO = "876000h";
const BUCKET_ARCHIVOS = "archivos";

type Supabase = Awaited<ReturnType<typeof createClient>>;

/** Personas con acceso al portal de una empresa (nunca admins). */
async function personasDe(supabase: Supabase, empresaId: string): Promise<string[]> {
  const { data } = await supabase
    .from("usuarios")
    .select("id")
    .eq("empresa_id", empresaId)
    .eq("role", "cliente");
  return (data ?? []).map((u) => u.id as string);
}

/**
 * Archiva un cliente: guarda la fecha y desactiva a sus personas. Solo desactiva a quien estaba
 * activo y apunta a quién fue, para que "Restaurar" no reactive a quien ya estaba desactivado
 * antes. Si algo falla, deshace lo hecho y no archiva.
 */
export async function archivarCliente(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = text(fd, "id", 40);
  if (!isUuid(id)) return await fallo("clientInvalid");

  const supabase = await createClient();
  const { data: empresa } = await supabase
    .from("empresas")
    .select("id, archivada_at")
    .eq("id", id)
    .maybeSingle();
  if (!empresa) return await fallo("clientInvalid");
  if (empresa.archivada_at) return { ok: true, message: (await getI18n()).t("ok.clientArchived") };

  const admin = createAdminClient();
  const ahora = Date.now();
  const aDesactivar: string[] = [];
  for (const personaId of await personasDe(supabase, id)) {
    const { data, error } = await admin.auth.admin.getUserById(personaId);
    if (error || !data.user) {
      console.error("[archivarCliente] no se pudo leer la cuenta", personaId, error?.message);
      return await fallo("archiveFail");
    }
    const bloqueada =
      !!data.user.banned_until && new Date(data.user.banned_until).getTime() > ahora;
    if (!bloqueada) aDesactivar.push(personaId);
  }

  const hechas: string[] = [];
  const deshacer = async () => {
    for (const personaId of hechas) {
      await admin.auth.admin.updateUserById(personaId, { ban_duration: "none" });
    }
  };
  for (const personaId of aDesactivar) {
    const { error } = await admin.auth.admin.updateUserById(personaId, { ban_duration: BLOQUEO });
    if (error) {
      console.error("[archivarCliente] no se pudo desactivar", personaId, error.message);
      await deshacer();
      return await fallo("archiveFail");
    }
    hechas.push(personaId);
  }

  const { error } = await supabase
    .from("empresas")
    .update({ archivada_at: new Date().toISOString(), archivo_desactivadas: aDesactivar })
    .eq("id", id);
  if (error) {
    console.error("[archivarCliente]", error.message);
    await deshacer();
    return await fallo("archiveFail");
  }

  refrescar();
  return { ok: true, message: (await getI18n()).t("ok.clientArchived") };
}

/** Restaura un cliente archivado y reactiva solo a las personas que se desactivaron al archivar. */
export async function restaurarCliente(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = text(fd, "id", 40);
  if (!isUuid(id)) return await fallo("clientInvalid");

  const supabase = await createClient();
  const { data: empresa } = await supabase
    .from("empresas")
    .select("id, archivada_at, archivo_desactivadas")
    .eq("id", id)
    .maybeSingle();
  if (!empresa) return await fallo("clientInvalid");
  if (!empresa.archivada_at) return { ok: true, message: (await getI18n()).t("ok.clientRestored") };

  // Solo las que siguen siendo de esta empresa (alguna pudo borrarse o cambiar de empresa).
  const actuales = new Set(await personasDe(supabase, id));
  const admin = createAdminClient();
  let fallos = 0;
  for (const personaId of (empresa.archivo_desactivadas as string[] | null) ?? []) {
    if (!actuales.has(personaId)) continue;
    const { error } = await admin.auth.admin.updateUserById(personaId, { ban_duration: "none" });
    if (error) {
      fallos++;
      console.error("[restaurarCliente]", personaId, error.message);
    }
  }
  if (fallos > 0) return await fallo("restoreFail");

  const { error } = await supabase
    .from("empresas")
    .update({ archivada_at: null, archivo_desactivadas: null })
    .eq("id", id);
  if (error) {
    console.error("[restaurarCliente]", error.message);
    return await fallo("restoreFail");
  }

  refrescar();
  return { ok: true, message: (await getI18n()).t("ok.clientRestored") };
}

/** Rutas de todos los ficheros de una empresa en el bucket: las de la base de datos y las que cuelgan de su carpeta. */
async function rutasDeFicheros(supabase: Supabase, empresaId: string): Promise<string[]> {
  const rutas = new Set<string>();
  const [{ data: archivos }, { data: documentos }] = await Promise.all([
    supabase.from("archivos").select("storage_path").eq("empresa_id", empresaId),
    supabase.from("documentos").select("storage_path").eq("empresa_id", empresaId),
  ]);
  for (const f of [...(archivos ?? []), ...(documentos ?? [])]) {
    if (f.storage_path) rutas.add(f.storage_path as string);
  }

  // Barrido de la carpeta de la empresa (empresa/proyecto/fichero) por si quedara algo sin fila.
  const almacen = createAdminClient().storage.from(BUCKET_ARCHIVOS);
  const { data: carpetas } = await almacen.list(empresaId, { limit: 1000 });
  for (const carpeta of carpetas ?? []) {
    if (carpeta.id) {
      rutas.add(`${empresaId}/${carpeta.name}`);
      continue;
    }
    const { data: ficheros } = await almacen.list(`${empresaId}/${carpeta.name}`, { limit: 1000 });
    for (const fichero of ficheros ?? []) rutas.add(`${empresaId}/${carpeta.name}/${fichero.name}`);
  }
  return [...rutas];
}

/**
 * Elimina un cliente archivado para siempre. Pide el nombre exacto de la empresa y se niega si
 * tiene pagos registrados. Orden: ficheros de Storage, cuentas de Auth y, al final, la fila de la
 * empresa (la cascada se lleva el resto). Los gastos no se tocan: solo pierden la empresa.
 */
export async function eliminarCliente(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = text(fd, "id", 40);
  const confirmar = text(fd, "confirmar", 120);
  if (!isUuid(id)) return await fallo("clientInvalid");

  const supabase = await createClient();
  const { data: empresa } = await supabase
    .from("empresas")
    .select("id, nombre, archivada_at")
    .eq("id", id)
    .maybeSingle();
  if (!empresa) return await fallo("clientInvalid");
  if (!empresa.archivada_at) return await fallo("deleteNotArchived");
  if (confirmar !== empresa.nombre) return await fallo("deleteNameMismatch");

  // Con pagos registrados no se borra: se perderían datos de Finanzas.
  const { data: cobros } = await supabase.from("cobros").select("id").eq("empresa_id", id);
  const cobroIds = (cobros ?? []).map((c) => c.id as string);
  if (cobroIds.length > 0) {
    const { count } = await supabase
      .from("pagos")
      .select("id", { count: "exact", head: true })
      .in("cobro_id", cobroIds);
    if (count && count > 0) return await fallo("deleteHasPayments");
  }

  // 1. Storage. Si un lote falla se sigue y se deja constancia en el log.
  try {
    const rutas = await rutasDeFicheros(supabase, id);
    const almacen = createAdminClient().storage.from(BUCKET_ARCHIVOS);
    for (let i = 0; i < rutas.length; i += 100) {
      const { error } = await almacen.remove(rutas.slice(i, i + 100));
      if (error) console.error("[eliminarCliente] storage", error.message);
    }
  } catch (e) {
    console.error("[eliminarCliente] storage", e);
  }

  // 2. Cuentas de Auth. Si una falla se para: así se puede reintentar sin dejar cuentas sueltas.
  const admin = createAdminClient();
  for (const personaId of await personasDe(supabase, id)) {
    const { error } = await admin.auth.admin.deleteUser(personaId);
    if (error && error.status !== 404) {
      console.error("[eliminarCliente] auth", personaId, error.message);
      return await fallo("deleteFail");
    }
  }

  // 3. La empresa; la cascada borra proyectos, incidencias, presupuestos, bolsa, cobros...
  const { error } = await supabase.from("empresas").delete().eq("id", id);
  if (error) {
    console.error("[eliminarCliente]", error.message);
    return await fallo("deleteFail");
  }

  refrescar();
  redirect("/admin/clientes?eliminado=1");
}
