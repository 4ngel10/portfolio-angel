import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cronAutorizado } from "@/lib/portal/cron";

export const dynamic = "force-dynamic";

/** Consulta mínima diaria para que el plan gratuito de Supabase no pause el proyecto por inactividad. */
export async function GET(request: Request) {
  if (!cronAutorizado(request)) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { error } = await createAdminClient().from("empresas").select("id").limit(1);
  if (error) {
    console.error("[cron keepalive]", error.message);
    return NextResponse.json({ error: "Supabase no responde." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
