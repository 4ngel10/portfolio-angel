/** Rutas con sesión o formularios de acceso: dinámicas, con nonce (las sirve proxy.ts). Sin imports de Node: la usan también componentes de cliente. */
export const RUTAS_PRIVADAS = ["admin", "portal", "login", "mfa", "contrasena", "auth"] as const;

/** ¿Es una ruta privada (o de API)? Para no medir ni cargar nada de terceros ahí. */
export function esRutaPrivada(pathname: string): boolean {
  const primero = pathname.split("/")[1] ?? "";
  return primero === "api" || (RUTAS_PRIVADAS as readonly string[]).includes(primero);
}
