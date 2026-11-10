import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { avisarAdmin } from "@/lib/portal/email";
import { getI18n } from "@/lib/portal/i18n";
import { isUuid } from "@/lib/portal/validate";
import { filasEnLaUltimaHora } from "@/lib/portal/rate-limit";
import { LIMITE_SUBIDAS_HORA, TIPOS_PERMITIDOS } from "@/lib/portal/storage-limits";

/** <uuid>-<nombre limpio>. El nombre solo tiene letras, números, punto, guion y guion bajo (limpiarNombre en presign). */
const NOMBRE_EN_STORAGE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-[A-Za-z0-9._-]+$/i;

/** Paso 2 de la subida: el archivo ya está en Storage, se registra en la tabla `archivos`. */
export async function POST(request: Request) {
  const { t } = await getI18n();
  const body = await request.json().catch(() => null);
  const path = typeof body?.path === "string" ? body.path : "";
  const fileName = typeof body?.fileName === "string" ? body.fileName.slice(0, 200) : "";
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

  // El resto de la ruta es <uuid>-<nombre>, sin subcarpetas ni ".." (lo genera /api/storage/presign).
  const nombreEnStorage = path.slice(carpeta.length);
  if (!NOMBRE_EN_STORAGE.test(nombreEnStorage) || nombreEnStorage.includes("/")) {
    return NextResponse.json({ error: t("api.invalidPath") }, { status: 400 });
  }

  // Mismo límite por hora que en presign (el admin no tiene límite).
  const { data: perfil } = await supabase
    .from("usuarios")
    .select("role, nombre")
    .eq("id", user.id)
    .maybeSingle();
  if (perfil?.role !== "admin") {
    const subidasRecientes = await filasEnLaUltimaHora(supabase, "archivos", {
      columna: "subido_por",
      valor: user.id,
    });
    if (subidasRecientes >= LIMITE_SUBIDAS_HORA) {
      return NextResponse.json({ error: t("api.rateLimited") }, { status: 429 });
    }
  }

  // El tamaño y el tipo reales los da Storage, no el cliente.
  const admin = createAdminClient();
  const { data: objetos } = await admin
    .storage.from("archivos")
    .list(carpeta.slice(0, -1), {
      search: nombreEnStorage,
      limit: 1,
    });
  const objeto = objetos?.find((o) => o.name === nombreEnStorage);
  if (!objeto) return NextResponse.json({ error: t("api.neverUploaded") }, { status: 409 });

  // El tipo que declaró el navegador no vale: se comprueba el que guardó Storage.
  const mimeReal = String(objeto.metadata?.mimetype ?? "").toLowerCase();
  if (!TIPOS_PERMITIDOS.has(mimeReal)) {
    const { error: errorBorrado } = await admin.storage.from("archivos").remove([path]);
    if (errorBorrado) console.error("[confirm] no se pudo borrar", errorBorrado.message);
    return NextResponse.json({ error: t("api.typeNotAllowed") }, { status: 415 });
  }

  const { error } = await supabase.from("archivos").insert({
    proyecto_id: proyecto.id,
    empresa_id: proyecto.empresa_id,
    nombre: fileName,
    tipo_mime: mimeReal,
    tamanio_bytes: Number(objeto.metadata?.size ?? 0),
    storage_path: path,
    subido_por: user.id,
  });
  if (error) {
    console.error("[confirm]", error.message);
    return NextResponse.json({ error: t("api.registerFail") }, { status: 500 });
  }

  // Solo avisa si sube un cliente; los archivos que sube el propio admin no necesitan correo.
  if (perfil?.role === "cliente") {
    const { data: info } = await supabase
      .from("proyectos")
      .select("titulo, empresas(nombre)")
      .eq("id", proyecto.id)
      .maybeSingle();
    const empresa = (Array.isArray(info?.empresas) ? info.empresas[0] : info?.empresas)?.nombre;
    await avisarAdmin({
      asunto: `[Archivo subido] ${fileName} · ${empresa ?? perfil.nombre}`,
      datos: [
        `Empresa: ${empresa ?? "Sin empresa"}`,
        `Proyecto: ${info?.titulo ?? ""}`,
        `De: ${perfil.nombre}`,
      ],
      ruta: `/admin/proyectos/${proyecto.id}`,
      etiqueta: "Abrir el proyecto",
    });
  }

  revalidatePath("/portal", "layout");
  revalidatePath("/admin", "layout");
  return NextResponse.json({ ok: true });
}
