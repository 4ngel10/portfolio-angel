import { NextResponse, type NextRequest } from "next/server";
import { cspPrivada } from "@/lib/csp";
import { updateSession } from "@/lib/supabase/proxy";

// Next 16 renombró middleware.ts a proxy.ts.

/** Solo estas rutas exigen sesión. /login, /mfa, /contrasena y /auth son accesibles sin ella. */
const CON_SESION = /^\/(portal|admin)(\/|$)/;

export async function proxy(request: NextRequest) {
  // CSP con nonce por petición. Next lo lee de la cabecera de la petición y lo pone en sus scripts.
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = cspPrivada(nonce);
  // Modo prueba: solo informa en la consola. Pasar a enforce cambiando el nombre de la cabecera (docs/csp.md).
  const NOMBRE = "Content-Security-Policy-Report-Only";
  const extra = { "x-nonce": nonce, [NOMBRE]: csp };

  let response: NextResponse;
  if (CON_SESION.test(request.nextUrl.pathname)) {
    response = await updateSession(request, extra);
  } else {
    const headers = new Headers(request.headers);
    for (const [k, v] of Object.entries(extra)) headers.set(k, v);
    response = NextResponse.next({ request: { headers } });
  }
  response.headers.set(NOMBRE, csp);
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
