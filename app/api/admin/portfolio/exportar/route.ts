import { NextResponse } from "next/server";
import { comprobarAdmin } from "@/lib/portal/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * Copia de seguridad del portfolio: todos los proyectos y sus versiones en un JSON. Solo el admin.
 * Para restaurar, ver docs/proyectos.md.
 */
export async function GET() {
  const auth = await comprobarAdmin();
  if (!auth.ok) return NextResponse.json({ error: "No autorizado" }, { status: auth.status });

  const supabase = await createClient();
  const [proyectos, versiones] = await Promise.all([
    supabase.from("portfolio_projects").select("*").order("orden", { ascending: true }),
    supabase.from("portfolio_project_versions").select("*").order("created_at", { ascending: false }),
  ]);
  if (proyectos.error || versiones.error) {
    return NextResponse.json({ error: "No se pudo leer el portfolio." }, { status: 500 });
  }

  const dia = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" });
  return new NextResponse(
    JSON.stringify(
      { exportado: new Date().toISOString(), proyectos: proyectos.data, versiones: versiones.data },
      null,
      2,
    ),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="portfolio-${dia}.json"`,
        "Cache-Control": "no-store",
      },
    },
  );
}
