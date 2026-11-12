# Cookies y almacenamiento

Revisado el 2026-11-11 (LSSI art. 22.2 y guía de la AEPD sobre cookies).

## Conclusión

La web pública **no necesita banner de consentimiento**. Lo que guarda en el navegador es técnico o de preferencia y solo se escribe cuando el visitante actúa:

- Cookie propia `locale` (1 año) y `localStorage` `locale` y `theme`. Solo se escriben cuando el visitante pulsa el selector de idioma o el de tema. La detección automática por `navigator.language` no guarda nada.
- Cookies de sesión de Supabase: solo en `/login`, `/portal` y `/admin`, y solo si hay sesión. `proxy.ts` solo llama a `updateSession` en `/portal` y `/admin`; en las rutas públicas no crea ninguna cookie.
- Terceros: solo Resend (en el servidor), y únicamente al enviar el formulario de contacto (no instala cookies en el navegador). Vercel Speed Insights (métricas de rendimiento anónimas, solo en producción y en rutas públicas; está descrito en `/privacidad` y `/cookies`). Sin analítica de visitas, sin Vercel Analytics, sin fuentes externas (next/font self-hosted), sin iframes ni píxeles.
- `/cookies` informa de todo esto (`lib/legal.ts`) y `/privacidad` enlaza a ella.

Lo que exige la ley es informar, y eso está hecho. Un banner sin cookies no esenciales sería innecesario, empeoraría el rendimiento y confundiría al visitante.

## Guardia contra regresiones

`scripts/probar-cookies.ts` (corre con `npm test`) falla si aparece en `package.json`, `app/layout.tsx` o `components/` alguno de: `@vercel/analytics`, `googletagmanager`, `gtag(`, `fbq(`, `hotjar`, `clarity.ms`, `plausible`, `youtube.com/embed` o `<iframe`. Si falla, hace falta el plan B de abajo antes de añadirlo. No se desactiva el test para salir del paso.

## Plan B: si se añade analítica u otro servicio con cookies no esenciales

Conforme a la guía de la AEPD (2023):

1. **Banner de primera capa** con "Aceptar", "Rechazar" y "Configurar" con el mismo peso visual (mismo tamaño, color y prominencia). Sin muros de cookies, sin casillas premarcadas y sin tratar el scroll como consentimiento.
2. **Bloqueo previo**: ningún script ni cookie no esencial antes de aceptar. El script se carga solo tras el consentimiento, con un cargador condicional, no con `next/script` en el layout.
3. **Panel de configuración por finalidad** (analítica, etc.), con enlace a `/cookies`. El visitante puede cambiar o retirar el consentimiento en cualquier momento con un enlace fijo en el footer ("Configurar cookies").
4. **Guardar la elección** en una cookie técnica propia (de 6 a 12 meses; la AEPD recomienda no volver a preguntar antes de 24 meses si rechaza) y registrar la versión de la política.
5. **Rendimiento y accesibilidad**:
   - Componente de cliente cargado con `next/dynamic` y `ssr: false`, solo cuando no hay elección guardada.
   - No debe retrasar el LCP ni mover el layout: `position: fixed` abajo, y el banner nunca es el elemento LCP.
   - Respetar `prefers-reduced-motion`.
   - Textos en `messages/es.json` y `messages/en.json`.
   - Contraste y foco accesibles.
6. **CSP**: actualizar `lib/csp.ts` con el dominio del servicio.
7. **Documentación legal**: actualizar `/cookies` y `/privacidad` con el servicio, su proveedor, la finalidad y la duración, y la fecha de revisión (`UPDATED` en `lib/legal.ts`).
