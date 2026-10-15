# Portfolio Ángel — notas para Claude Code

Este archivo lo lee Claude Code automáticamente al abrir el proyecto. Mantén aquí lo que necesita saber para trabajar sin romper nada.

## Qué es

Portfolio personal single-page de Ángel Fernández Garriga (técnico de sistemas + dev web). Bilingüe ES/EN, dark mode, hosted en Vercel.

## Stack

- **Next.js 15** App Router, Server Components por defecto. Componentes interactivos marcados con `"use client"`.
- **React 19**, **TypeScript strict**.
- **Tailwind CSS v4** — configuración en `app/globals.css` con `@theme`. No hay `tailwind.config.ts`.
- **Framer Motion 11** para el tilt 3D y entradas de hero.
- **next/font** (Space Grotesk + JetBrains Mono) self-hosted.
- i18n cliente propio en `lib/i18n.tsx` (Context + JSON).
- Theme toggle en `lib/theme.tsx`. Clase `.dark` en `<html>`, script bloqueante en `<head>` para prevenir flash.

## Comandos

```bash
npm run dev        # arranca en http://localhost:3000
npm run build      # build producción
npm run lint       # eslint next
npm run typecheck  # tsc --noEmit
npm run format     # prettier --write .
```

## Estructura

```
app/
  layout.tsx       providers + fuentes + metadata
  page.tsx         composición de secciones
  globals.css      tokens @theme + utilidades
  sitemap.ts       SEO
  robots.ts        SEO
components/
  nav / hero / about / services / portfolio / contact / footer
  tilt-card.tsx    wrapper framer-motion
lib/
  theme.tsx i18n.tsx motion.tsx smooth-scroll.ts site.ts
messages/
  es.json en.json
```

## Convenciones de diseño

Las decisiones de estilo son deliberadas, no las deshagas:

- **Fuentes**: Space Grotesk + JetBrains Mono. **No usar Inter**.
- **Acento**: `#c2410c` light / `#fb923c` dark. Un solo acento en toda la página.
- **Fondos**: paper `#fbfaf7` + alt `#f3f1ec` (light). Dark: `#0a0f1c` + `#0f1629`.
- **Em dashes (—)**: cero. Usa comas, puntos o dos puntos.
- **Eyebrows**: cero. Las secciones se abren con su H2.
- **Radios**: tope en 16px para cards. Nada de 24px+.
- **Botones**: `.btn-primary` y `.btn-secondary` en `globals.css`. Siempre `scale(0.97)` en `:active`.
- **Tilt 3D**: gateado por `useReducedMotion`. Con ratón sigue al cursor; en táctil se inclina hacia el punto tocado y vuelve al soltar (decisión de Ángel: mismo efecto en móvil que en PC).
- **Hover en móvil**: `@variant hover (&:hover)` en `globals.css` hace que `hover:` también se active al tocar (Tailwind v4 lo limita a `(hover: hover)` por defecto). No lo quites: Ángel quiere los mismos efectos en móvil que en PC.
- **Enlaces externos**: siempre `target="_blank" rel="noopener noreferrer"`. LinkedIn con `www.` para que en móvil abra la app.
- **Icon system**: inline SVG stroke 2px, 24x24 viewBox. No instales lucide ni heroicons sin consultar.
- **Reduced motion**: Framer Motion lo gestiona globalmente con `<MotionConfig reducedMotion="user">` (`lib/motion.tsx`). No ramifiques `initial`/`animate` con `useReducedMotion`: en SSR vale `null` y provoca hydration mismatch. **Única excepción aprobada por Ángel**: el carrusel de tecnologías (`.carousel-group`, `components/carousel.tsx`) se mueve siempre, también con reduced motion y sin pausa al hacer hover (decisión de Ángel). Es lento y lineal.

## i18n

Añadir una clave: edita **los dos** JSON (`messages/es.json` y `messages/en.json`) y úsala con `t("ruta.anidada")`. El `t()` cae a la ruta si falta la clave.

Añadir un idioma: nuevo JSON + extiende el type `Locale` en `lib/i18n.tsx`.

## Trabajo con el formulario

El formulario (`components/contact.tsx`) envía `name`, `email` y `message` a **Web3Forms** desde el navegador (`https://api.web3forms.com/submit`), que lo reenvía al Gmail de Ángel. No hay endpoint propio ni variables de entorno: el plan gratuito de Web3Forms no admite envíos desde servidor. La clave (`WEB3FORMS_KEY`) es pública por diseño y vive en `lib/site.ts`. Incluye un honeypot `botcheck` antispam.

## Dominio

`SITE_URL` en `lib/site.ts` es la URL pública que usan metadata, `sitemap.xml` y `robots.txt`. Ahora es `https://portfolio-angel-vert.vercel.app`; cuando haya dominio propio se cambia solo ahí (y se añade el dominio en Vercel).

## Qué NO hacer sin consultar

- Añadir dependencias pesadas (shadcn, radix, lucide). Explica por qué antes.
- Cambiar la paleta o fuentes.
- Añadir animaciones que no respeten `prefers-reduced-motion`.
- Añadir eyebrows (`.eyebrow`) a secciones.
- Introducir em dashes en texto.
- Crear un `tailwind.config.ts` — todo va en `@theme` en `globals.css`.

## Deploy

Vercel conectado al repo de GitHub. Push a `main` = deploy producción. PRs = preview deploys automáticos.

No hacen falta variables de entorno en Vercel.
