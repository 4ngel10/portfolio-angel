import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Destino del enlace mágico: canjea el código por una sesión y manda a cada rol a su zona. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: perfil } = user
        ? await supabase.from("usuarios").select("role").eq("id", user.id).maybeSingle()
        : { data: null };

      if (perfil?.role === "admin") return NextResponse.redirect(`${origin}/admin`);
      if (perfil?.role === "cliente") return NextResponse.redirect(`${origin}/portal`);

      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/login?error=sin-acceso`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=enlace`);
}
