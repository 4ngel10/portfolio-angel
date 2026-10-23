import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getI18n } from "@/lib/portal/i18n";
import { isUuid } from "@/lib/portal/validate";

const MAX_BYTES = 50 * 1024 * 1024; // límite por archivo del plan gratuito de Supabase

/** Tipos admitidos. Todo lo demás se rechaza: el archivo lo abrirá otra persona. */
const TIPOS_PERMITIDOS = new Set([
  "application/pdf",
  "application/zip",
  "application/json",
  "text/plain",
  "text/csv",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "video/mp4",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

const limpiarNombre = (n: string) =>
  n
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
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
  if (!Number.isFinite(size) || size <= 0 || size > MAX_BYTES) {
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

  const path = `${proyecto.empresa_id}/${proyecto.id}/${randomUUID()}-${limpiarNombre(fileName)}`;
  const { data, error } = await createAdminClient().storage.from("archivos").createSignedUploadUrl(path);
  if (error || !data) {
    console.error("[presign]", error?.message);
    return NextResponse.json({ error: t("api.prepFail") }, { status: 500 });
  }

  return NextResponse.json({ path: data.path, token: data.token, signedUrl: data.signedUrl });
}
