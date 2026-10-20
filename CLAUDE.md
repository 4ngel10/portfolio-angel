# Portfolio Ángel — notas para Claude Code

Este archivo lo lee Claude Code automáticamente al abrir el proyecto. Mantén aquí lo que necesita saber para trabajar sin romper nada.

## Qué es

Portfolio personal single-page de Ángel Fernández Garriga (técnico de sistemas + dev web). Bilingüe ES/EN, dark mode, hosted en Vercel.

## Stack

- **Next.js 16** App Router (Turbopack), Server Components por defecto. Componentes interactivos marcados con `"use client"`.
- **React 19**, **TypeScript strict**.
- **Tailwind CSS v4** (4.0.0-beta.8): configuración en `app/globals.css` con `@theme`. No hay `tailwind.config.ts`. Las variantes propias van con `@variant` (esta beta no admite `@custom-variant`).
- **Framer Motion 11** para el tilt 3D y entradas de hero.
- **next/font** (Space Grotesk + JetBrains Mono) self-hosted.
- i18n cliente propio en `lib/i18n.tsx` (Context + JSON).
- Theme toggle en `lib/theme.tsx`. Clase `.dark` en `<html>`, script bloqueante en `<head>` para prevenir flash.

## Comandos

```bash
npm run dev        # arranca en http://localhost:3000
npm run build      # build producción
npx eslint app components lib   # lint (`npm run lint` usa `next lint`, que ya no existe en Next 16)
npm run typecheck  # tsc --noEmit
npm run format     # prettier --write .
```

Antes de subir: `npm run typecheck`, `npx eslint app components lib` y `npm run build`.

## Estructura

```
app/
  layout.tsx            providers + fuentes + metadata + skip link
  page.tsx              home: hero, stack, about, services, portfolio, blog-teaser, contact
  proyectos/[slug]/     página de cada proyecto
  servicios/[id]/       /servicios/sistemas y /servicios/web
  blog/ y blog/[slug]/  listado y artículos
  globals.css           tokens @theme + utilidades
  sitemap.ts robots.ts  SEO (salen solos de PROJECTS, SERVICES y BLOG_POSTS)
components/
  nav / footer          comunes a todas las páginas
  hero / about / stack-band / services / portfolio / blog-teaser / contact   secciones de la home
  project-article / services-page / blog-index / blog-article                páginas interiores
  carousel / tilt-card / reveal / project-cover / json-ld / skip-link / mobile-contact-cta / back-to-top
lib/
  projects.ts services.ts blog.ts   contenido (ES y EN)
  seo.ts                            meta descriptions y JSON-LD
  theme.tsx i18n.tsx motion.tsx smooth-scroll.ts site.ts
messages/
  es.json en.json
public/
  projects/ blog/       portadas WebP e imágenes para redes (1200x630)
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
- **Imágenes (portadas de proyecto)**: al pasar el ratón solo hacen un zoom discreto (`scale-[1.03]`, 500 ms, en `project-cover.tsx`). Sin tilt ni elevación en las cards con portada (home, cabecera del proyecto y "Siguiente proyecto"); decisión de Ángel.
- **Tilt 3D** (solo cards sin imagen: servicios y blog): gateado por `useReducedMotion`. Con ratón sigue al cursor; en táctil se inclina hacia el punto tocado y vuelve al soltar (decisión de Ángel: mismo efecto en móvil que en PC).
- **Hover en móvil**: `@variant hover (&:hover)` en `globals.css` hace que `hover:` también se active al tocar (Tailwind v4 lo limita a `(hover: hover)` por defecto). No lo quites: Ángel quiere los mismos efectos en móvil que en PC.
- **Enlaces externos**: siempre `target="_blank" rel="noopener noreferrer"`. LinkedIn con `www.` para que en móvil abra la app.
- **Icon system**: inline SVG stroke 2px, 24x24 viewBox. No instales lucide ni heroicons sin consultar.
- **`.btn-primary` pisa a `hidden`/`md:hidden`**: su `display` gana a esas utilidades. Para ocultar un botón según el tamaño, envuélvelo en un `<span>` o `<div>` con la clase `hidden md:inline-flex` (o `md:hidden`).
- **Fondos de la home alternos**: about (alt), services, portfolio (alt), blog, contact (alt). Una sección nueva mantiene la alternancia. Las secciones con `id` llevan `scroll-mt-[72px]` para no quedar bajo la nav fija.
- **Accesibilidad**: skip link "Ir al contenido principal" en el layout; cada página tiene `<main id="main">`. Los enlaces internos mueven el foco a su destino (`lib/smooth-scroll.ts`). SVG decorativos con `aria-hidden`. Las portadas llevan `coverAlt` describiendo la imagen.
- **Reduced motion**: Framer Motion lo gestiona globalmente con `<MotionConfig reducedMotion="user">` (`lib/motion.tsx`). No ramifiques `initial`/`animate` con `useReducedMotion`: en SSR vale `null` y provoca hydration mismatch. **Excepciones aprobadas por Ángel** (se mueven siempre, también con reduced motion): los carruseles (`.carousel-group`, `components/carousel.tsx`: banda de habilidades y banda "Disponible" del footer), sin pausa al hacer hover. Son lentos y lineales. También el scroll suave de los enlaces internos (`lib/smooth-scroll.ts`).

## Páginas de proyecto

Cada card de "Proyectos recientes" abre `/proyectos/[slug]` (`app/proyectos/[slug]/page.tsx`), una página estática por proyecto. Los datos y el texto del artículo (ES y EN) viven en `lib/projects.ts`. Título, etiqueta y descripción corta salen de `messages/*.json` (`portfolio.p1Title`...), compartidos con la card. Añadir un proyecto: entrada nueva en `PROJECTS` + sus claves en los dos JSON. Todas las páginas (home, proyectos, servicios, blog) usan la misma `Nav` y el mismo `Footer`: fuera de la home sus anclas apuntan a la home (`/#about`) y la nav marca el apartado de la página (Servicios, Portfolio o Blog).

**Cada proyecto nuevo sigue la misma estructura que los actuales** (petición de Ángel):

- **Etiqueta (`pXTag`)**: una sola palabra con el área del proyecto, no su estado. Las actuales son "Automatización", "Desarrollo" e "Infraestructura" (EN: Automation, Development, Infrastructure). Reutiliza una si encaja; si no, otra palabra igual de corta. Nada de "En producción" o "En curso".
- **Card**: título corto (`pXTitle`), descripción de una o dos frases (`pXDesc`) y 3-4 tecnologías en `tech`.
- **Artículo** (`post` en `lib/projects.ts`, ES y EN): `title` largo, `intro` (primer párrafo, va de entradilla), secciones con H2 y, si hace falta, `{ h3 }`, `{ list }` y `{ ol }`. `date` en AAAA-MM-DD. Si Ángel pasa el texto, se respeta tal cual, solo con correcciones mínimas, y se traduce al inglés.
- **Portada**: la foto que suba Ángel se convierte a WebP (máx. 2200 px de ancho) en `public/projects/`, más una imagen para redes de 1200x630 en JPG (`ogImage`). Los originales pesados no se dejan en `public/`. Un SVG se puede usar tal cual (revisar que no tenga scripts, em dashes ni animaciones sin `prefers-reduced-motion`).
- **Orden**: el proyecto nuevo se añade a `PROJECTS`; la card, la página, el "Siguiente proyecto" y el sitemap salen solos.

## Páginas de servicio

Cada card de Servicios abre su propia página: `/servicios/sistemas` y `/servicios/web` (`app/servicios/[id]/page.tsx`, `components/services-page.tsx`). El detalle de cada servicio (grupos, herramientas, principios) vive en `lib/services.ts`, en ES y EN, y solo recoge lo que ya figura en la web (stack, áreas, proyectos).

## Blog

Listado en `/blog` y artículos en `/blog/[slug]`. El contenido (ES y EN) vive en `lib/blog.ts`, con los mismos bloques que los proyectos. Cada artículo lleva su imagen para redes de 1200x630 en `public/blog/`. La home tiene una mención corta (`components/blog-teaser.tsx`, ancla `#blog`) con los dos más recientes.

## i18n

Añadir una clave: edita **los dos** JSON (`messages/es.json` y `messages/en.json`) y úsala con `t("ruta.anidada")`. El `t()` cae a la ruta si falta la clave.

Añadir un idioma: nuevo JSON + extiende el type `Locale` en `lib/i18n.tsx`.

## Trabajo con el formulario

El formulario (`components/contact.tsx`) envía `name`, `email`, `service` (select obligatorio "¿Qué servicio te interesa?", valor siempre en español) y `message` a **Web3Forms** desde el navegador (`https://api.web3forms.com/submit`), que lo reenvía al Gmail de Ángel. No hay endpoint propio ni variables de entorno: el plan gratuito de Web3Forms no admite envíos desde servidor. La clave (`WEB3FORMS_KEY`) es pública por diseño y vive en `lib/site.ts`. Incluye un honeypot `botcheck` antispam. El `<form>` tiene `action`/`method="POST"` a Web3Forms con `access_key` oculto, así funciona aunque no haya cargado el JS.

**En el panel de Web3Forms, "Captcha Protection" debe estar en `None`.** Si se activa hCaptcha sin montarlo en el frontend, Web3Forms rechaza todos los envíos ("hCaptcha Token is mandatory"). El motivo de cualquier rechazo sale en la consola del navegador como `[contacto]`.

## SEO

- Meta descriptions de home, servicios y blog en `lib/seo.ts`; las de proyectos y artículos salen de su contenido. `og:description` y `twitter:description` coinciden con la meta.
- JSON-LD (`components/json-ld.tsx` + helpers de `lib/seo.ts`): home `WebSite` + `Person`; servicios `Service` + `BreadcrumbList`; proyectos `Article` + `BreadcrumbList`; blog `Blog` y `BlogPosting` + `BreadcrumbList`.
- **Sin hreflang, a propósito** (decisión de Ángel): el inglés se elige en el navegador sobre la misma URL, no hay URLs `/en/`. Un hreflang "en" hacia la página en español sería un error. Si algún día hay rutas `/en/...`, se añade con `alternates.languages`.
- **Nada de testimonios ni datos inventados** publicados como reales (Ángel aún no tiene clientes freelance). Los textos que hablen de experiencia se basan en lo que figura en la web: sector hotelero, homelab, proyectos.

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

Ángel prefiere que, al terminar y verificar cada tarea, se haga commit y push a `main` sin preguntar. Los cambios grandes (rediseños) se enseñan antes.

No hacen falta variables de entorno en Vercel.
