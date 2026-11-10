import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getI18n } from "@/lib/portal/i18n";
import { isUuid } from "@/lib/portal/validate";
import { filasEnLaUltimaHora } from "@/lib/portal/rate-limit";
import {
  LIMITE_SUBIDAS_HORA,
  MAX_ARCHIVOS_EMPRESA,
  MAX_BYTES_ARCHIVO,
  MAX_BYTES_EMPRESA,
  TIPOS_PERMITIDOS,
} from "@/lib/portal/storage-limits";

const limpiarNombre = (n: string) =>
  n
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/\.{2,}/g, ".")
    .replace(/^[._]+/, "")
    .slice(-100) || "archivo";

/**
 * Paso 1 de la subida. Comprueba que el proyecto es del usuario (RLS) y devuelve una URL
 * firmada. El navegador sube el archivo directamente a Supabase Storage: no pasa por
 * Vercel, así que no hay límite de 4,5 MB.
 */
export async function POST(request: Request) {
  const { t } = await getI18n();
  const body = await request.json().catch(() => null);
  const fileName = typeof body?.fileName === "string" ? body.fileName : "";
  const contentType = typeof body?.contentType === "string" ? body.contentType : "";
  const size = Number(body?.size);
  const proyectoId = body?.proyectoId;

  if (!fileName || !isUuid(proyectoId)) {
    return NextResponse.json({ error: t("api.invalidData") }, { status: 400 });
  }
  if (!TIPOS_PERMITIDOS.has(contentType)) {
    return NextResponse.json({ error: t("api.typeNotAllowed") }, { status: 415 });
  }
  if (!Number.isFinite(size) || size <= 0 || size > MAX_BYTES_ARCHIVO) {
    return NextResponse.json({ error: t("api.tooLarge") }, { status: 413 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: t("api.notLoggedIn") }, { status: 401 });

  // Si el proyecto no es de su empresa, RLS no lo devuelve.
  const { data: proyecto } = await supabase
    .from("proyectos")
    .select("id, empresa_id")
    .eq("id", proyectoId)
    .maybeSingle();
  if (!proyecto) return NextResponse.json({ error: t("api.projectNotFound") }, { status: 404 });

  // El admin sube sin límite por hora ni tope de empresa.
  const { data: perfil } = await supabase
    .from("usuarios")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const esAdmin = perfil?.role === "admin";

  // Límite por persona y hora (las subidas ya registradas) y tope de la empresa.
  if (!esAdmin) {
    const subidasRecientes = await filasEnLaUltimaHora(supabase, "archivos", {
      columna: "subido_por",
      valor: user.id,
    });
    if (subidasRecientes >= LIMITE_SUBIDAS_HORA) {
      return NextResponse.json({ error: t("api.rateLimited") }, { status: 429 });
    }

    const { data: existentes, error: errorCuota } = await supabase
      .from("archivos")
      .select("tamanio_bytes")
      .eq("empresa_id", proyecto.empresa_id)
      .limit(MAX_ARCHIVOS_EMPRESA + 1);
    if (errorCuota) {
      console.error("[presign] cuota", errorCuota.message);
      return NextResponse.json({ error: t("api.prepFail") }, { status: 500 });
    }
    const usados = (existentes ?? []).reduce((acc, f) => acc + Number(f.tamanio_bytes ?? 0), 0);
    if (
      (existentes?.length ?? 0) >= MAX_ARCHIVOS_EMPRESA ||
      usados + size > MAX_BYTES_EMPRESA
    ) {
      return NextResponse.json({ error: t("api.quotaExceeded") }, { status: 413 });
    }
  }

  const path = `${proyecto.empresa_id}/${proyecto.id}/${randomUUID()}-${limpiarNombre(fileName)}`;
  const { data, error } = await createAdminClient()
    .storage.from("archivos")
    .createSignedUploadUrl(path);
  if (error || !data) {
    console.error("[presign]", error?.message);
    return NextResponse.json({ error: t("api.prepFail") }, { status: 500 });
  }

  return NextResponse.json({ path: data.path, token: data.token, signedUrl: data.signedUrl });
}
