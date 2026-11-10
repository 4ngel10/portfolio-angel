# Content Security Policy

Estado: **solo informa (Report-Only)**. Ninguna política bloquea nada todavía. La única CSP que se aplica de verdad es `frame-ancestors 'none'` (en `next.config.ts`).

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Directivas y constructores (`cspPublica`, `cspPrivada`) | `lib/csp.ts` |
| Web pública (estática), sin nonce, `script-src 'self' 'unsafe-inline'` | cabecera `Content-Security-Policy-Report-Only` en `next.config.ts` (excluye las rutas privadas y `/api`) |
| Rutas privadas (`/admin`, `/portal`, `/login`, `/mfa`, `/contrasena`, `/auth`), con nonce por petición (política en la cabecera de petición `Content-Security-Policy` y en la respuesta como Report-Only) | `proxy.ts` |
| Sesión (redirige a `/login` solo en `/portal` y `/admin`) | `lib/supabase/proxy.ts`, llamada desde `proxy.ts` |
| Script del tema (en línea, sin nonce) | `lib/theme-script.ts`; su hash SHA-256 se calcula en `lib/csp.ts` y entra en el `script-src` privado |

El host de Supabase sale de `NEXT_PUBLIC_SUPABASE_URL` (permite API, Auth y las subidas directas a Storage). Web3Forms está en `connect-src` y `form-action`.

Las páginas públicas siguen siendo estáticas: el nonce solo existe en las privadas, que ya son dinámicas porque leen cookies.

## Incidencia: scripts sin nonce en producción (2026-11-10)

Síntoma: en producción, `/login` y `/admin` avisaban de "Executing inline script" sin nonce y de scripts bloqueados por `strict-dynamic`.

Diagnóstico (HTML de `/login` con `curl.exe -s`, scripts ejecutables, sin contar `application/ld+json`):

| Entorno | Con nonce | Sin nonce |
|---|---|---|
| Producción (www.angel-fernandez.es), antes del arreglo | 0 | 17 |
| Local (`npm run build` + `npm start`), antes del arreglo | 23 | 1 (el del tema, que entra por hash) |

La cabecera de respuesta llevaba un nonce en producción, pero ninguna etiqueta lo tenía: Next no lo recibió al renderizar.

Causa probable: Next lee el nonce de la cabecera de la **petición** `content-security-policy` y solo usa `content-security-policy-report-only` si la primera no existe (`node_modules/next/dist/server/route-modules/app-page/parse-request-headers.js`). Si la petición llega con un `Content-Security-Policy` sin nonce, Next no pone nonce en nada. Se reprodujo en local mandando `Content-Security-Policy: frame-ancestors 'none'` en la petición: 0 scripts con nonce. En Vercel, la cabecera `frame-ancestors 'none'` de `next.config.ts` es la candidata, pero **no se ha confirmado** que sea la que llega a la petición.

Arreglo (`proxy.ts`): la política completa va también en la cabecera de petición `Content-Security-Policy` (el navegador no la ve), junto con `x-nonce`. En la respuesta sigue solo `Content-Security-Policy-Report-Only`, más el `frame-ancestors 'none'` de `next.config.ts`. Con el arreglo, en local, incluso con una petición que ya trae un `Content-Security-Policy` sin nonce, salen 23 de 24 scripts con nonce (el otro es el del tema, con hash).

Scripts propios: el único script en línea ejecutable es el del tema (`app/layout.tsx`), cubierto por hash. Los demás `<script>` son `application/ld+json` y no se ejecutan. No hubo que leer `x-nonce` en ningún componente.

### Causa confirmada y arreglo definitivo

El primer arreglo (política completa en la cabecera de petición `Content-Security-Policy`) no bastó en Vercel. Un despliegue de prueba con logs (`[diag-csp]`) lo explicó: la página recibía `x-nonce` correcto, pero la cabecera de petición `content-security-policy` llegaba como `frame-ancestors 'none'`, es decir, la de `next.config.ts`. En Vercel las cabeceras de `headers()` de `next.config.ts` también llegan a la petición y pisan la que pone `proxy.ts`. Como Next lee el nonce de esa cabecera, no lo encontraba.

Descartado: las rutas privadas ya eran dinámicas (ƒ en la tabla del build) y no hay `cacheComponents`, PPR ni `"use cache"`; forzar el render dinámico no era el problema.

Arreglo:

- `next.config.ts`: `Content-Security-Policy: frame-ancestors 'none'` ya no está en las cabeceras globales. Va solo en la regla de la web pública (la que excluye `admin`, `portal`, `login`, `mfa`, `contrasena`, `auth` y `api`). Siguen en las globales `X-Frame-Options: DENY` y el resto.
- `proxy.ts`: en las rutas privadas, la política completa con nonce va en la petición y en la respuesta solo `Content-Security-Policy-Report-Only`.
- `/api` queda sin CSP (son JSON); `X-Frame-Options: DENY` sigue.

**No poner un `Content-Security-Policy` en la respuesta del proxy.** Se probó (`frame-ancestors 'none'` enforced en las rutas privadas) y rompe el nonce: Next copia las cabeceras de respuesta del proxy a la petición y vuelve a pisar la política. En local, 0 de 24 scripts con nonce con esa línea y 23 de 24 sin ella. Contra los iframes en las rutas privadas vale `X-Frame-Options: DENY`; `frame-ancestors` entra en enforce junto con el resto de la política (ver más abajo).

Resultado en local (build de producción, `/login`): 23 de 24 scripts ejecutables con nonce; el otro es el del tema, con hash. También con una petición que ya trae un `Content-Security-Policy`.

**Pendiente de comprobar tras desplegar:** repetir `curl.exe -s https://www.angel-fernandez.es/login` y contar los scripts sin nonce (debe quedar solo el del tema). `/admin` con sesión no se ha podido probar en local; usa el mismo proxy.

Ojo al probar en local: un `next start` anterior puede seguir vivo y servir una versión vieja (y dar resultados falsos). Usa un puerto nuevo en cada prueba o comprueba con `netstat` que está libre.

## Resultado de la prueba (localhost, build de producción)

Edge headless con el protocolo de depuración, sin sesión, con la consola vigilada. 0 violaciones de CSP en:

- `/` (home), `/proyectos/flexgrip`, `/blog/web-pyme-que-vende`, `/servicios/web`
- `/login` (con nonce; los scripts de Next llevan `nonce`)
- `/mfa` y `/portal` (sin sesión redirigen a `/login`, que es lo esperado)

Único aviso: `upgrade-insecure-requests` se ignora en Report-Only. Se quitó de la política de prueba y hay que añadirlo al pasar a enforce.

### Sin probar todavía (hacerlo a mano antes de enforce)

Hace falta una sesión real y acciones con efectos, así que no se ejecutó:

1. Enviar el formulario de contacto (Web3Forms, `connect-src` y `form-action`).
2. `/mfa` con sesión de admin: el QR del TOTP es una data URL (`img-src data:`).
3. `/admin` y `/portal` con sesión: navegar por las secciones, subir un archivo (subida directa a Supabase, `connect-src`), descargar uno y exportar CSV.
4. Cambiar de tema y de idioma en la web pública y en el portal.
5. Entrar desde un enlace de invitación (`/auth/entrar`) y recuperar contraseña (`/contrasena`).

Para cada una, abre la consola del navegador y busca mensajes que empiecen por `[Report Only] Refused to ...`.

## Cómo pasar a enforce

1. Haz la lista de pruebas de arriba con la consola abierta, también en el despliegue de Vercel (una preview), no solo en local. No debe salir ninguna violación `[Report Only]`.
2. Si sale alguna, añade el origen a la directiva que se indica en el mensaje (`lib/csp.ts`) y repite.
3. Añade `"upgrade-insecure-requests"` a la lista de `directivas()` en `lib/csp.ts`.
4. Cambia el nombre de la cabecera:
   - `proxy.ts`: la constante `NOMBRE_RESPUESTA` pasa a `"Content-Security-Policy"`.
   - `next.config.ts`: la clave `Content-Security-Policy-Report-Only` de la segunda entrada pasa a `Content-Security-Policy`. Ojo: ya existe `Content-Security-Policy: frame-ancestors 'none'` en las cabeceras globales. Varias CSP se suman (se aplica la más estricta de cada directiva), así que puede quedarse, pero conviene comprobarlo en la respuesta.
5. Despliega en una preview, repite las pruebas y solo entonces sube a producción. Si algo se rompe, vuelve a poner el nombre Report-Only (es un cambio de una línea en cada archivo).

## Cosas a tener en cuenta

- Un script nuevo en línea en `app/layout.tsx` necesita su hash en `cspPrivada` o, en las rutas privadas, un nonce. En la web pública entra por `'unsafe-inline'`.
- `style-src` lleva `'unsafe-inline'` a propósito (Framer Motion y estilos en línea de React). No se endurece.
- En desarrollo (`next dev`) `script-src` añade `'unsafe-eval'`, que React necesita ahí. En producción no.
- Cabeceras añadidas con esto: `Strict-Transport-Security` (sin preload), `Cross-Origin-Opener-Policy: same-origin` y `payment=()`, `usb=()` en `Permissions-Policy`.
