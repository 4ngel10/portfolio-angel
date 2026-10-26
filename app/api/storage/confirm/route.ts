import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { avisarAdmin } from "@/lib/portal/email";
import { getI18n } from "@/lib/portal/i18n";
import { isUuid } from "@/lib/portal/validate";

/** Paso 2 de la subida: el archivo ya está en Storage, se registra en la tabla `archivos`. */
export async function POST(request: Request) {
  const { t } = await getI18n();
  const body = await request.json().catch(() => null);
  const path = typeof body?.path === "string" ? body.path : "";
  const fileName = typeof body?.fileName === "string" ? body.fileName.slice(0, 200) : "";
  const contentType = typeof body?.contentType === "string" ? body.contentType : "";
  const proyectoId = body?.proyectoId;

  if (!path || !fileName || !isUuid(proyectoId)) {
    return NextResponse.json({ error: t("api.invalidData") }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: t("api.notLoggedIn") }, { status: 401 });

  const { data: proyecto } = await supabase
    .from("proyectos")
    .select("id, empresa_id")
    .eq("id", proyectoId)
    .maybeSingle();
  if (!proyecto) return NextResponse.json({ error: t("api.projectNotFound") }, { status: 404 });

  // La ruta tiene que ser la que se firmó para este proyecto.
  const carpeta = `${proyecto.empresa_id}/${proyecto.id}/`;
  if (!path.startsWith(carpeta) || path.includes("..")) {
    return NextResponse.json({ error: t("api.invalidPath") }, { status: 400 });
  }

  // El tamaño real lo da Storage, no el cliente.
  const nombreEnStorage = path.slice(carpeta.length);
  const { data: objetos } = await createAdminClient().storage.from("archivos").list(carpeta.slice(0, -1), {
    search: nombreEnStorage,
    limit: 1,
  });
  const objeto = objetos?.find((o) => o.name === nombreEnStorage);
  if (!objeto) return NextResponse.json({ error: t("api.neverUploaded") }, { status: 409 });

  const { error } = await supabase.from("archivos").insert({
    proyecto_id: proyecto.id,
    empresa_id: proyecto.empresa_id,
    nombre: fileName,
    tipo_mime: contentType || "application/octet-stream",
    tamanio_bytes: Number(objeto.metadata?.size ?? 0),
    storage_path: path,
    subido_por: user.id,
  });
  if (error) {
    console.error("[confirm]", error.message);
    return NextResponse.json({ error: t("api.registerFail") }, { status: 500 });
  }

  // Solo avisa si sube un cliente; los archivos que sube el propio admin no necesitan correo.
  const { data: perfil } = await supabase.from("usuarios").select("role, nombre").eq("id", user.id).maybeSingle();
  if (perfil?.role === "cliente") {
    const { data: info } = await supabase
      .from("proyectos")
      .select("titulo, empresas(nombre)")
      .eq("id", proyecto.id)
      .maybeSingle();
    const empresa = (Array.isArray(info?.empresas) ? info.empresas[0] : info?.empresas)?.nombre;
    await avisarAdmin({
      asunto: `[Archivo subido] ${fileName} · ${empresa ?? perfil.nombre}`,
      datos: [`Empresa: ${empresa ?? "Sin empresa"}`, `Proyecto: ${info?.titulo ?? ""}`, `De: ${perfil.nombre}`],
      ruta: `/admin/proyectos/${proyecto.id}`,
      etiqueta: "Abrir el proyecto",
    });
  }

  revalidatePath("/portal", "layout");
  revalidatePath("/admin", "layout");
  return NextResponse.json({ ok: true });
}
