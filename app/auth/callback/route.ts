import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { marcasContrasena } from "@/lib/portal/auth";

type Supabase = Awaited<ReturnType<typeof createClient>>;

/** Con la sesión ya abierta, manda a cada rol a su zona (o fuera si no tiene acceso). */
async function destino(supabase: Supabase, origin: string, contrasena: boolean, status?: number) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: perfil } = user
    ? await supabase.from("usuarios").select("role").eq("id", user.id).maybeSingle()
    : { data: null };

  if (perfil?.role === "admin") {
    // Enlace de "contraseña olvidada": la sesión se queda en aal1, que no abre nada del
    // admin (RLS y requireAdmin piden aal2). Antes de elegir la contraseña nueva hay que
    // pasar el TOTP, así que quien solo tenga el correo no llega a cambiarla.
    if (contrasena) return NextResponse.redirect(`${origin}/mfa?siguiente=contrasena`, status);
    // Para entrar, el admin usa contraseña + TOTP: el enlace mágico no basta.
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?error=sin-acceso`, status);
  }
  if (perfil?.role === "cliente") {
    // Primera vez (aún sin contraseña) o enlace de "contraseña olvidada": a elegirla.
    const sinPassword = !marcasContrasena(user).elegida;
    const ruta = sinPassword || contrasena ? "/contrasena" : "/portal";
    return NextResponse.redirect(`${origin}${ruta}`, status);
  }

  await supabase.auth.signOut();
  return NextResponse.redirect(`${origin}/login?error=sin-acceso`, status);
}

/** Destino del enlace mágico de "contraseña olvidada": canjea el código por una sesión. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return destino(supabase, origin, searchParams.get("contrasena") === "1");
  }
  return NextResponse.redirect(`${origin}/login?error=enlace`);
}

/**
 * Invitaciones del admin: el correo enlaza a /auth/entrar, que no canjea nada al abrirse. Solo
 * al pulsar "Entrar" llega aquí por POST el hash del enlace, así los filtros de correo que
 * siguen los enlaces no lo gastan. Redirección 303 para que el navegador pase a GET.
 */
export async function POST(request: NextRequest) {
  const { origin } = new URL(request.url);
  const form = await request.formData();
  const tokenHash = form.get("token_hash");
  if (typeof tokenHash === "string" && tokenHash && form.get("type") === "magiclink") {
    const supabase = await createClient();
    // Se cierra cualquier sesión previa: si el enlace ya se usó y el canje falla, la persona
    // acaba en /login sin sesión y ve el aviso, en vez de entrar con la sesión de la primera vez.
    await supabase.auth.signOut();
    const { error } = await supabase.auth.verifyOtp({ type: "magiclink", token_hash: tokenHash });
    if (!error) return destino(supabase, origin, false, 303);
  }
  return NextResponse.redirect(`${origin}/login?error=enlace`, 303);
}
