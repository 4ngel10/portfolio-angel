import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { avisarNuevaIncidencia } from "@/lib/portal/email";
import { getI18n } from "@/lib/portal/i18n";
import { isUuid, oneOf } from "@/lib/portal/validate";
import type { Perfil } from "@/lib/portal/types";

/** Un cliente abre una incidencia en uno de sus proyectos y el admin recibe un correo. */
export async function POST(request: Request) {
  const { t } = await getI18n();
  const body = await request.json().catch(() => null);
  const proyectoId = body?.proyectoId;
  const titulo = typeof body?.titulo === "string" ? body.titulo.trim().slice(0, 120) : "";
  const descripcion = typeof body?.descripcion === "string" ? body.descripcion.trim().slice(0, 4000) : "";
  const prioridad = oneOf(body?.prioridad, ["baja", "media", "alta"] as const) ?? "media";

  if (!isUuid(proyectoId)) return NextResponse.json({ error: t("api.chooseProject") }, { status: 400 });
  if (titulo.length < 3) return NextResponse.json({ error: t("api.writeTitle") }, { status: 400 });
  if (descripcion.length < 5) return NextResponse.json({ error: t("api.describe") }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: t("api.notLoggedIn") }, { status: 401 });

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("id, empresa_id, role")
    .eq("id", user.id)
    .maybeSingle<Pick<Perfil, "id" | "empresa_id" | "role">>();
  if (perfil?.role !== "cliente" || !perfil.empresa_id) {
    return NextResponse.json({ error: t("api.onlyClients") }, { status: 403 });
  }

  // RLS solo devuelve el proyecto si es de su empresa.
  const { data: proyecto } = await supabase
    .from("proyectos")
    .select("id, titulo")
    .eq("id", proyectoId)
    .maybeSingle();
  if (!proyecto) return NextResponse.json({ error: t("api.projectNotFound") }, { status: 404 });

  const { error } = await supabase.from("incidencias").insert({
    proyecto_id: proyecto.id,
    empresa_id: perfil.empresa_id,
    titulo,
    descripcion,
    prioridad,
  });
  if (error) {
    console.error("[incidencias]", error.message);
    return NextResponse.json({ error: t("api.incidentFail") }, { status: 500 });
  }

  const { data: empresa } = await supabase
    .from("empresas")
    .select("nombre")
    .eq("id", perfil.empresa_id)
    .maybeSingle();

  await avisarNuevaIncidencia({
    titulo,
    descripcion,
    prioridad,
    proyectoId: proyecto.id,
    proyectoTitulo: proyecto.titulo,
    empresaNombre: empresa?.nombre ?? "Sin empresa",
  });

  revalidatePath("/portal", "layout");
  revalidatePath("/admin", "layout");
  return NextResponse.json({ ok: true });
}
