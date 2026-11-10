import { NextResponse, type NextRequest } from "next/server";
import { cspPrivada } from "@/lib/csp";
import { updateSession } from "@/lib/supabase/proxy";

// Next 16 renombró middleware.ts a proxy.ts.

/** Solo estas rutas exigen sesión. /login, /mfa, /contrasena y /auth son accesibles sin ella. */
const CON_SESION = /^\/(portal|admin)(\/|$)/;

export async function proxy(request: NextRequest) {
  // CSP con nonce por petición. Next lee el nonce de la cabecera de la PETICIÓN
  // "content-security-policy" y, si esa existe pero sin nonce (en Vercel llega la de frame-ancestors
  // de next.config.ts), ignora la Report-Only y no pone nonce en ningún script. Por eso la política
  // completa va en la petición con ese nombre (el navegador no la ve) y en la respuesta solo la
  // Report-Only. Pasar a enforce: ver docs/csp.md.
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = cspPrivada(nonce);
  const NOMBRE_RESPUESTA = "Content-Security-Policy-Report-Only";
  const extra = { "x-nonce": nonce, "Content-Security-Policy": csp };

  let response: NextResponse;
  if (CON_SESION.test(request.nextUrl.pathname)) {
    response = await updateSession(request, extra);
  } else {
    const headers = new Headers(request.headers);
    for (const [k, v] of Object.entries(extra)) headers.set(k, v);
    response = NextResponse.next({ request: { headers } });
  }
  response.headers.set(NOMBRE_RESPUESTA, csp);
  // OJO: no poner aquí un "Content-Security-Policy" en la respuesta. Next (y Vercel) copian las
  // cabeceras de respuesta del proxy a la petición y pisarían la política con nonce. Contra los
  // iframes en estas rutas vale X-Frame-Options: DENY (next.config.ts).
  return response;
}

export const config = {
  matcher: [
    "/portal/:path*",
    "/admin/:path*",
    "/login/:path*",
    "/mfa/:path*",
    "/contrasena/:path*",
    "/auth/:path*",
  ],
};
