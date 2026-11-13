"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { isUuid } from "@/lib/portal/validate";
import { partesMadrid } from "./blog-db";
import { madridLocalAUtc } from "./blog-types";
import { comunesDe, estadoDe, paraValidar, versionDe, type FilaProyecto } from "./proyectos-admin";
import { contenidoDeEditor, esEditorProyecto, type EditorProyecto } from "./proyectos-editor";
import { revalidarPortfolio } from "./proyectos-revalidate";
import {
  canonico,
  guardarVersionCon,
  imagenesConocidasDe,
  resolverTamanos,
  rutaValida,
} from "./proyectos-save";
import type { ProyectoContent, ProyectoServicio } from "./proyectos-types";
import { validarProyecto, type Fallo } from "./proyectos-validate";

/**
 * Acciones del panel /admin/portfolio. Todas empiezan con requireAdmin() y validan en el servidor,
 * sin fiarse de lo que valide el navegador. Leen y escriben con la sesión del admin (política
 * admin_all); solo la lectura del tamaño de las imágenes usa el service role, después de
 * requireAdmin(). Tras cualquier cambio llaman a revalidarPortfolio(slug).
 */

export type ResultadoProyecto = {
  ok: boolean;
  error?: string;
  id?: string;
  slug?: string;
  errores?: Fallo[];
  avisos?: Fallo[];
  /** Publicar: la fecha elegida es futura, queda programado. */
  programado?: boolean;
  publicadoEn?: string;
};

const MAX_BYTES_ENTRADA = 400_000;
const PASO_ORDEN = 10;

async function cargarFila(id: string): Promise<FilaProyecto | null> {
  if (!isUuid(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("portfolio_projects").select("*").eq("id", id).maybeSingle();
  return (data as FilaProyecto | null) ?? null;
}

/** Siguiente `orden` libre: el último más un paso, así un proyecto nuevo sale al final. */
async function ordenNuevo(): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("portfolio_projects")
    .select("orden")
    .order("orden", { ascending: false })
    .limit(1);
  return ((data?.[0]?.orden as number | undefined) ?? 0) + PASO_ORDEN;
}

/** Copia del estado actual en el historial, con la sesión del admin. */
async function guardarVersion(fila: FilaProyecto) {
  await guardarVersionCon(await createClient(), fila.id, versionDe(fila));
}

async function recargar(id: string): Promise<FilaProyecto | null> {
  return cargarFila(id);
}

const servicios = (lista: string[]): ProyectoServicio[] => {
  const unicos: ProyectoServicio[] = [];
  for (const s of lista) {
    if ((s === "web" || s === "sistemas") && !unicos.includes(s)) unicos.push(s);
  }
  return unicos;
};

/** Crea o actualiza un proyecto (siempre como lo envía el editor; no cambia su estado). */
export async function guardarProyecto(entrada: EditorProyecto): Promise<ResultadoProyecto> {
  const perfil = await requireAdmin();
  const { t } = await getI18n();

  if (!esEditorProyecto(entrada) || JSON.stringify(entrada).length > MAX_BYTES_ENTRADA) {
    return { ok: false, error: t("portfolio.err.invalid") };
  }
  const url = entrada.url.trim();
  const imagenes = [entrada.image.trim(), entrada.imageDark.trim(), entrada.ogImage.trim()];
  if (!imagenes.every(rutaValida)) return { ok: false, error: t("portfolio.err.imageInvalid") };

  const previa = entrada.id ? await cargarFila(entrada.id) : null;
  if (entrada.id && !previa) return { ok: false, error: t("portfolio.err.notFound") };
  if (previa && previa.status === "publicado" && previa.slug !== entrada.slug) {
    return { ok: false, error: t("portfolio.err.slugLocked") };
  }

  const contenido: ProyectoContent = contenidoDeEditor(
    entrada,
    previa ? imagenesConocidasDe(previa.content) : undefined,
  );
  await resolverTamanos(contenido);

  const campos = {
    slug: entrada.slug,
    service: entrada.service as ProyectoServicio,
    tech: entrada.tech.map((x) => x.trim()).filter((x) => x !== ""),
    cover: entrada.cover.trim(),
    tint: entrada.tint,
    url: url || null,
    image: imagenes[0] || null,
    image_dark: imagenes[1] || null,
    og_image: imagenes[2] || null,
    cover_position: (entrada.coverPosition || null) as "top" | "center" | null,
    en_servicios: servicios(entrada.enServicios),
    ejemplo: entrada.ejemplo,
    datos_provisionales: entrada.datosProvisionales,
    content: contenido,
  };

  const validacion = validarProyecto(paraValidar(campos), { publicar: false });
  if (validacion.errores.length > 0) {
    return {
      ok: false,
      error: t("portfolio.err.fixErrors"),
      errores: validacion.errores,
      avisos: validacion.avisos,
    };
  }

  const supabase = await createClient();
  let id: string;

  if (!previa) {
    const { data, error } = await supabase
      .from("portfolio_projects")
      .insert({
        ...campos,
        status: "borrador",
        orden: await ordenNuevo(),
        created_by: perfil.email || perfil.id,
      })
      .select("id")
      .single();
    if (error || !data) {
      return {
        ok: false,
        error:
          error?.code === "23505" ? t("portfolio.err.slugTaken") : t("portfolio.err.saveFailed"),
      };
    }
    id = data.id as string;
    const nueva = await recargar(id);
    if (nueva) await guardarVersion(nueva);
  } else {
    id = previa.id;
    const cambio =
      canonico(versionDe(previa)) !==
      canonico({
        slug: campos.slug,
        service: campos.service,
        tech: campos.tech,
        cover: campos.cover,
        tint: campos.tint,
        url: campos.url,
        image: campos.image,
        imageDark: campos.image_dark,
        ogImage: campos.og_image,
        coverPosition: campos.cover_position,
        enServicios: campos.en_servicios,
        ejemplo: campos.ejemplo,
        datosProvisionales: campos.datos_provisionales,
        content: campos.content,
      });
    const { error } = await supabase
      .from("portfolio_projects")
      .update({
        ...campos,
        // updated_at es la fecha que ven buscadores y sitemap: solo se toca si algo cambió.
        ...(cambio ? { updated_at: new Date().toISOString() } : {}),
      })
      .eq("id", id);
    if (error) {
      return {
        ok: false,
        error:
          error.code === "23505" ? t("portfolio.err.slugTaken") : t("portfolio.err.saveFailed"),
      };
    }
    if (cambio) {
      const nueva = await recargar(id);
      if (nueva) await guardarVersion(nueva);
    }
  }

  revalidarPortfolio(entrada.slug);
  if (previa && previa.slug !== entrada.slug) revalidarPortfolio(previa.slug);
  return {
    ok: true,
    id,
    slug: entrada.slug,
    errores: validacion.errores,
    avisos: validacion.avisos,
  };
}

/**
 * Publica un proyecto ya guardado. `cuando` es "AAAA-MM-DDTHH:mm" en hora de Madrid; vacío es
 * ahora. Con una fecha futura queda programado: la web lo enseña cuando llega esa hora.
 */
export async function publicarProyecto(
  id: string,
  cuando?: string | null,
): Promise<ResultadoProyecto> {
  await requireAdmin();
  const { t } = await getI18n();

  const fila = await cargarFila(id);
  if (!fila) return { ok: false, error: t("portfolio.err.notFound") };

  let fecha = new Date();
  if (cuando && cuando.trim() !== "") {
    const elegida = madridLocalAUtc(cuando.trim());
    if (!elegida) return { ok: false, error: t("portfolio.err.badDate") };
    fecha = elegida;
  }

  const validacion = validarProyecto(paraValidar(fila, partesMadrid(fecha).dia), {
    publicar: true,
  });
  if (validacion.errores.length > 0) {
    return {
      ok: false,
      error: t("portfolio.err.fixErrors"),
      errores: validacion.errores,
      avisos: validacion.avisos,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("portfolio_projects")
    .update({ status: "publicado", published_at: fecha.toISOString() })
    .eq("id", fila.id);
  if (error) return { ok: false, error: t("portfolio.err.saveFailed") };

  revalidarPortfolio(fila.slug);
  return {
    ok: true,
    id: fila.id,
    slug: fila.slug,
    avisos: validacion.avisos,
    programado:
      estadoDe({ status: "publicado", published_at: fecha.toISOString() }) === "programado",
    publicadoEn: fecha.toISOString(),
  };
}

export async function despublicarProyecto(id: string): Promise<ResultadoProyecto> {
  await requireAdmin();
  const { t } = await getI18n();
  const fila = await cargarFila(id);
  if (!fila) return { ok: false, error: t("portfolio.err.notFound") };

  const supabase = await createClient();
  const { error } = await supabase
    .from("portfolio_projects")
    .update({ status: "borrador" })
    .eq("id", fila.id);
  if (error) return { ok: false, error: t("portfolio.err.saveFailed") };

  revalidarPortfolio(fila.slug);
  return { ok: true, id: fila.id, slug: fila.slug };
}

/** Copia un proyecto como borrador nuevo, al final de la lista y con un slug libre (slug-copia...). */
export async function duplicarProyecto(id: string): Promise<ResultadoProyecto> {
  const perfil = await requireAdmin();
  const { t } = await getI18n();
  const fila = await cargarFila(id);
  if (!fila) return { ok: false, error: t("portfolio.err.notFound") };

  const supabase = await createClient();
  const base = `${fila.slug}-copia`.slice(0, 70);
  const { data: existentes } = await supabase
    .from("portfolio_projects")
    .select("slug")
    .like("slug", `${base}%`);
  const ocupados = new Set((existentes ?? []).map((e) => e.slug as string));
  let slug = base;
  for (let n = 2; ocupados.has(slug); n++) slug = `${base}-${n}`;

  const { data, error } = await supabase
    .from("portfolio_projects")
    .insert({
      slug,
      status: "borrador",
      orden: await ordenNuevo(),
      service: fila.service,
      tech: fila.tech,
      cover: fila.cover,
      tint: fila.tint,
      url: fila.url,
      image: fila.image,
      image_dark: fila.image_dark,
      og_image: fila.og_image,
      cover_position: fila.cover_position,
      en_servicios: fila.en_servicios,
      ejemplo: fila.ejemplo,
      datos_provisionales: fila.datos_provisionales,
      content: fila.content,
      created_by: perfil.email || perfil.id,
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: t("portfolio.err.saveFailed") };

  const nueva = await recargar(data.id as string);
  if (nueva) await guardarVersion(nueva);
  revalidarPortfolio(slug);
  return { ok: true, id: data.id as string, slug };
}

/** Borra un proyecto. Un borrador se borra sin más; uno publicado exige escribir su slug. */
export async function borrarProyecto(
  id: string,
  confirmacion?: string,
): Promise<ResultadoProyecto> {
  await requireAdmin();
  const { t } = await getI18n();
  const fila = await cargarFila(id);
  if (!fila) return { ok: false, error: t("portfolio.err.notFound") };
  if (fila.status === "publicado" && confirmacion !== fila.slug) {
    return { ok: false, error: t("portfolio.err.confirmSlug") };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("portfolio_projects").delete().eq("id", fila.id);
  if (error) return { ok: false, error: t("portfolio.err.saveFailed") };

  revalidarPortfolio(fila.slug);
  return { ok: true, slug: fila.slug };
}

/** Vuelve a una versión anterior. El slug, el estado y la posición no cambian. */
export async function restaurarVersion(
  projectId: string,
  versionId: string,
): Promise<ResultadoProyecto> {
  await requireAdmin();
  const { t } = await getI18n();
  if (!isUuid(versionId)) return { ok: false, error: t("portfolio.err.notFound") };

  const fila = await cargarFila(projectId);
  if (!fila) return { ok: false, error: t("portfolio.err.notFound") };

  const supabase = await createClient();
  const { data: version } = await supabase
    .from("portfolio_project_versions")
    .select("content")
    .eq("id", versionId)
    .eq("project_id", fila.id)
    .maybeSingle();
  const v = version?.content as Partial<ReturnType<typeof comunesDe>> & {
    content?: ProyectoContent;
  };
  if (!v || typeof v.content !== "object" || v.content === null) {
    return { ok: false, error: t("portfolio.err.notFound") };
  }

  const imagenes = [v.image ?? "", v.imageDark ?? "", v.ogImage ?? ""];
  if (!imagenes.every(rutaValida)) return { ok: false, error: t("portfolio.err.imageInvalid") };

  const { error } = await supabase
    .from("portfolio_projects")
    .update({
      service: v.service ?? fila.service,
      tech: v.tech ?? fila.tech,
      cover: v.cover ?? fila.cover,
      tint: v.tint ?? fila.tint,
      url: v.url ?? null,
      image: v.image ?? null,
      image_dark: v.imageDark ?? null,
      og_image: v.ogImage ?? null,
      cover_position: v.coverPosition ?? null,
      en_servicios: v.enServicios ?? fila.en_servicios,
      ejemplo: v.ejemplo ?? fila.ejemplo,
      datos_provisionales: v.datosProvisionales ?? fila.datos_provisionales,
      content: v.content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", fila.id);
  if (error) return { ok: false, error: t("portfolio.err.saveFailed") };

  const nueva = await recargar(fila.id);
  if (nueva) await guardarVersion(nueva);
  revalidarPortfolio(fila.slug);
  return { ok: true, id: fila.id, slug: fila.slug };
}

/**
 * Sube o baja un proyecto en la home. La función de Postgres `mover_proyecto` (db/rls.sql) lo hace
 * en una sola operación: renumera todos con los dos vecinos intercambiados.
 */
export async function moverProyecto(
  id: string,
  direccion: "arriba" | "abajo",
): Promise<ResultadoProyecto> {
  await requireAdmin();
  const { t } = await getI18n();
  if (direccion !== "arriba" && direccion !== "abajo") {
    return { ok: false, error: t("portfolio.err.invalid") };
  }
  const fila = await cargarFila(id);
  if (!fila) return { ok: false, error: t("portfolio.err.notFound") };

  const supabase = await createClient();
  const { error } = await supabase.rpc("mover_proyecto", { p_id: fila.id, p_dir: direccion });
  if (error) {
    // PGRST202 / 42883: la función no existe todavía en la BD (falta lanzar db/rls.sql).
    const falta =
      error.code === "PGRST202" ||
      error.code === "42883" ||
      (error.message ?? "").includes("mover_proyecto");
    return { ok: false, error: falta ? t("portfolio.err.moveMissing") : t("portfolio.err.moveFailed") };
  }

  revalidarPortfolio(fila.slug);
  return { ok: true, id: fila.id, slug: fila.slug };
}

/** Quita el aviso de cifras provisionales: Ángel confirma que son reales. */
export async function marcarCifrasValidadas(id: string): Promise<ResultadoProyecto> {
  await requireAdmin();
  const { t } = await getI18n();
  const fila = await cargarFila(id);
  if (!fila) return { ok: false, error: t("portfolio.err.notFound") };

  const supabase = await createClient();
  const { error } = await supabase
    .from("portfolio_projects")
    .update({ datos_provisionales: false, updated_at: new Date().toISOString() })
    .eq("id", fila.id);
  if (error) return { ok: false, error: t("portfolio.err.saveFailed") };

  const nueva = await recargar(fila.id);
  if (nueva) await guardarVersion(nueva);
  revalidarPortfolio(fila.slug);
  return { ok: true, id: fila.id, slug: fila.slug };
}
