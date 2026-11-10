import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresca la sesión de Supabase en cada petición a /portal y /admin y, si no hay
 * sesión, manda al login. El rol (cliente o admin) se comprueba en los layouts.
 * `cabecerasExtra` se añaden a la petición que verá la página (nonce y CSP, ver proxy.ts).
 */
export async function updateSession(request: NextRequest, cabecerasExtra: Record<string, string> = {}) {
  // Se construye tras cualquier cambio de cookies para que la página vea la sesión renovada.
  const siguiente = () => {
    const headers = new Headers(request.headers);
    for (const [k, v] of Object.entries(cabecerasExtra)) headers.set(k, v);
    return NextResponse.next({ request: { headers } });
  };
  let response = siguiente();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = siguiente();
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() valida el token con Supabase; no fiarse de getSession() en el servidor.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    const redirect = NextResponse.redirect(url);
    // Conserva las cookies que Supabase haya podido limpiar.
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }

  return response;
}
