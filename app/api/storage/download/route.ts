import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getI18n } from "@/lib/portal/i18n";
import { isUuid } from "@/lib/portal/validate";

/** Descarga: RLS decide si el usuario ve el archivo; luego se redirige a una URL firmada de 60 s. */
export async function GET(request: NextRequest) {
  const { t } = await getI18n();
  const id = request.nextUrl.searchParams.get("id");
  if (!isUuid(id)) return NextResponse.json({ error: t("api.invalidData") }, { status: 400 });

  const supabase = await createClient();
  const { data: archivo } = await supabase
    .from("archivos")
    .select("storage_path, nombre")
    .eq("id", id)
    .maybeSingle();
  if (!archivo) return NextResponse.json({ error: t("api.fileNotFound") }, { status: 404 });

  const { data, error } = await createAdminClient()
    .storage.from("archivos")
    .createSignedUrl(archivo.storage_path, 60, { download: archivo.nombre });
  if (error || !data) {
    console.error("[download]", error?.message);
    return NextResponse.json({ error: t("api.downloadFail") }, { status: 500 });
  }
  return NextResponse.redirect(data.signedUrl);
}
