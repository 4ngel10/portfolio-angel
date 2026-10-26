import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { comprobarAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { isUuid } from "@/lib/portal/validate";

const MAX_BYTES = 10 * 1024 * 1024; // el bucket "finanzas" corta a 10 MB

/** Un justificante es una factura o un ticket: PDF o foto. */
const TIPOS_PERMITIDOS = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

const limpiarNombre = (n: string) =>
  n
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^[._]+/, "")
    .slice(-100) || "archivo";

/**
 * Paso 1 de la subida de un justificante. Solo el admin con segundo factor. Devuelve una URL
 * firmada: el navegador sube el archivo directamente a Supabase Storage, sin pasar por Vercel.
 * El paso 2 es la Server Action `confirmarJustificante`.
 */
export async function POST(request: Request) {
  const { t } = await getI18n();
  const acceso = await comprobarAdmin();
  if (!acceso.ok) {
    return NextResponse.json({ error: t("api.notLoggedIn") }, { status: acceso.status });
  }

  const body = await request.json().catch(() => null);
  const fileName = typeof body?.fileName === "string" ? body.fileName : "";
  const contentType = typeof body?.contentType === "string" ? body.contentType : "";
  const size = Number(body?.size);
  const gastoId = body?.gastoId;

  if (!fileName || fileName.length > 120 || !isUuid(gastoId)) {
    return NextResponse.json({ error: t("api.invalidData") }, { status: 400 });
  }
  if (!TIPOS_PERMITIDOS.has(contentType)) {
    return NextResponse.json({ error: t("api.typeNotAllowed") }, { status: 415 });
  }
  if (Number.isFinite(size) && (size <= 0 || size > MAX_BYTES)) {
    return NextResponse.json({ error: t("api.receiptTooLarge") }, { status: 413 });
  }

  const supabase = await createClient();
  const { data: gasto } = await supabase
    .from("gastos")
    .select("id, fecha")
    .eq("id", gastoId)
    .maybeSingle();
  if (!gasto) return NextResponse.json({ error: t("api.invalidData") }, { status: 404 });

  const path = `gastos/${String(gasto.fecha).slice(0, 4)}/${gasto.id}/${randomUUID()}-${limpiarNombre(fileName)}`;
  const { data, error } = await createAdminClient()
    .storage.from("finanzas")
    .createSignedUploadUrl(path);
  if (error || !data) {
    console.error("[finanzas/justificante]", error?.message);
    return NextResponse.json({ error: t("api.prepFail") }, { status: 500 });
  }

  return NextResponse.json({ path: data.path, token: data.token, signedUrl: data.signedUrl });
}
