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

      if (perfil?.role === "admin") {
        // El admin entra solo con contraseña + TOTP: el enlace mágico no basta.
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/login?error=sin-acceso`);
      }
      if (perfil?.role === "cliente") {
        // Primera vez (aún sin contraseña) o enlace de "contraseña olvidada": a elegirla.
        const sinPassword = !user?.user_metadata?.password_set;
        const ruta =
          sinPassword || searchParams.get("contrasena") === "1" ? "/contrasena" : "/portal";
        return NextResponse.redirect(`${origin}${ruta}`);
      }

      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/login?error=sin-acceso`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=enlace`);
}
