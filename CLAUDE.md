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
  api/contact/     POST handler del formulario
components/
  nav / hero / about / services / portfolio / contact / footer
  tilt-card.tsx    wrapper framer-motion
lib/
  theme.tsx i18n.tsx
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
- **Tilt 3D**: gateado por `useReducedMotion` + `(hover: hover) and (pointer: fine)`. En touch no se activa.
- **Icon system**: inline SVG stroke 2px, 24x24 viewBox. No instales lucide ni heroicons sin consultar.

## i18n

Añadir una clave: edita **los dos** JSON (`messages/es.json` y `messages/en.json`) y úsala con `t("ruta.anidada")`. El `t()` cae a la ruta si falta la clave.

Añadir un idioma: nuevo JSON + extiende el type `Locale` en `lib/i18n.tsx`.

## Trabajo con el formulario

`POST /api/contact` acepta `multipart/form-data` con `name`, `email`, `message`. Por defecto hace `console.log`. Para email real: setea `RESEND_API_KEY` + `CONTACT_TO` en Vercel. Alternativa HAOS: redirige `send()` a un webhook self-hosted (n8n, Home Assistant).

## Qué NO hacer sin consultar

- Añadir dependencias pesadas (shadcn, radix, lucide). Explica por qué antes.
- Cambiar la paleta o fuentes.
- Añadir animaciones que no respeten `prefers-reduced-motion`.
- Añadir eyebrows (`.eyebrow`) a secciones.
- Introducir em dashes en texto.
- Crear un `tailwind.config.ts` — todo va en `@theme` en `globals.css`.

## Deploy

Vercel conectado al repo de GitHub. Push a `main` = deploy producción. PRs = preview deploys automáticos.

Variables en Vercel:
- `RESEND_API_KEY` (opcional, para email real)
- `CONTACT_TO=angelfernandezgarriga@gmail.com`
