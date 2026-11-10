import { NextResponse } from "next/server";
import { comprobarAdmin } from "@/lib/portal/auth";
import { createClient } from "@/lib/supabase/server";

/** Copia de seguridad del blog: todos los artículos y sus versiones en un JSON. Solo el admin. */
export async function GET() {
  const auth = await comprobarAdmin();
  if (!auth.ok) return NextResponse.json({ error: "No autorizado" }, { status: auth.status });

  const supabase = await createClient();
  const [posts, versiones] = await Promise.all([
    supabase
      .from("blog_posts")
      .select("*")
      .order("published_at", { ascending: false, nullsFirst: true }),
    supabase.from("blog_post_versions").select("*").order("created_at", { ascending: false }),
  ]);
  if (posts.error || versiones.error) {
    return NextResponse.json({ error: "No se pudo leer el blog." }, { status: 500 });
  }

  const dia = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" });
  return new NextResponse(
    JSON.stringify(
      { exportado: new Date().toISOString(), posts: posts.data, versiones: versiones.data },
      null,
      2,
    ),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="blog-${dia}.json"`,
        "Cache-Control": "no-store",
      },
    },
  );
}
