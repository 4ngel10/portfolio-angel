# Portfolio Ángel — notas para Claude Code

Este archivo lo lee Claude Code automáticamente al abrir el proyecto. Mantén aquí lo que necesita saber para trabajar sin romper nada.

## Qué es

Portfolio personal single-page de Ángel Fernández Garriga (técnico de sistemas + dev web). Bilingüe ES/EN, dark mode, hosted en Vercel.

## Stack

- **Next.js 16** App Router (Turbopack), Server Components por defecto. Componentes interactivos marcados con `"use client"`.
- **React 19**, **TypeScript strict**.
- **Tailwind CSS v4** (4.0.0-beta.8): configuración en `app/globals.css` con `@theme`. No hay `tailwind.config.ts`. Las variantes propias van con `@variant` (esta beta no admite `@custom-variant`).
- **Framer Motion 11** para el tilt 3D y entradas de hero, con `LazyMotion` (`lib/motion.tsx`, funciones `domAnimation` en `lib/motion-features.ts`, que se descargan aparte tras hidratar). Con `strict`: usa siempre `m.div`, `m.span`... (de `framer-motion`), **nunca `motion.*`**, o falla. Si algo necesita drag o layout habría que pasar a `domMax`.
- **next/font** (Space Grotesk + JetBrains Mono) self-hosted.
- i18n cliente propio en `lib/i18n.tsx` (Context + JSON).
- Theme toggle en `lib/theme.tsx`. Clase `.dark` en `<html>`, script bloqueante en `<head>` para prevenir flash.

## Comandos

```bash
npm run dev        # arranca en http://localhost:3000
npm run build      # build producción
npx eslint app components lib   # lint (`npm run lint` usa `next lint`, que ya no existe en Next 16)
npm run typecheck  # tsc --noEmit
npm test           # pruebas del validador y el conversor del blog (scripts/probar-blog.ts)
npm run format     # prettier --write .
```

Antes de subir: `npm run typecheck`, `npm test`, `npx eslint app components lib scripts`, `npm run build` y `npm run audit` (`npm audit` de producción, nivel moderado o superior; debe salir con 0 vulnerabilidades).

## Estructura

```
app/
  layout.tsx            providers + fuentes + metadata + skip link
  page.tsx              home: hero, services, stack, portfolio, about, blog-teaser, contact
  proyectos/[slug]/     página de cada proyecto
  servicios/[id]/       /servicios/sistemas y /servicios/web
  blog/ y blog/[slug]/  listado y artículos (con su opengraph-image)
  (admin)/admin/blog/   panel del blog y claves de la API
  api/blog/ api/admin/blog/   API de la rutina (borradores) y subida y exportación del panel
  globals.css           tokens @theme + utilidades
  sitemap.ts robots.ts  SEO (salen solos de PROJECTS, SERVICES y los artículos publicados en Supabase)
components/
  nav / footer          comunes a todas las páginas
  hero / about / stack-band / services / portfolio / blog-teaser / contact   secciones de la home
  project-article / services-page / blog-index / blog-article                páginas interiores
  carousel / tilt-card / reveal / project-cover / json-ld / skip-link / mobile-contact-cta / back-to-top
lib/
  projects.ts services.ts           contenido (ES y EN)
  blog-*.ts                         blog en Supabase (db, types, validate, markup, actions, save, imagenes, svg, og, api-auth, claves-actions, revalidate; ver sección Blog)
  seo.ts                            meta descriptions y JSON-LD
  theme.tsx i18n.tsx motion.tsx smooth-scroll.ts site.ts
messages/
  es.json en.json
public/
  projects/             portadas WebP e imágenes para redes (1200x630)
  blog/                 solo los 5 <slug>-og.jpg antiguos (enlaces ya compartidos); las imágenes de los artículos están en el bucket `blog`
assets/fonts/           .ttf y licencias OFL para la imagen social generada (next/og)
  angel-cutout.webp     foto del hero (520x920, sin fondo, en todas las pantallas); no recortar ni reconvertir
  angel-square.webp     solo el `image` del Person en JSON-LD (640x640)
```

## Convenciones de diseño

Las decisiones de estilo son deliberadas, no las deshagas:

- **Tokens de color**: en `@theme`, `--color-ink`, `--color-paper`, `--color-accent`... apuntan a las variables del tema (`--fg`, `--bg`, `--accent`...), que cambian con `.dark`; los valores fijos del modo claro son `--color-*-light` y los del oscuro `--color-*-dark`. Así `hover:`, `focus:`, `group-hover:` y las opacidades siguen al tema. No redefinas a mano `.text-ink` y similares ni uses un `--color-*-light` en una clase.
- **Fuentes**: Space Grotesk + JetBrains Mono. **No usar Inter**.
- **Acento**: `#c2410c` light / `#fb923c` dark. Un solo acento en toda la página.
- **Fondos**: paper `#fbfaf7` + alt `#f3f1ec` (light). Dark: `#0a0f1c` + `#0f1629`.
- **Em dashes (—)**: cero. Usa comas o puntos.
- **Dos puntos y guiones como puntuación**: cero en los textos visibles de la home (preferencia de Ángel). Se mantienen los guiones que forman parte de una palabra (Hyper-V, "15 minutos") y el separador " · " de los resultados de los casos. Para rangos: "24 a 48 horas", no "24-48".
- **Cards de servicios**: el icono y el título no llevan `translateZ`. Con la perspectiva del tilt se ensanchaban y quedaban unos 6px a la izquierda del lead y los bullets (medido). Si se añade profundidad, que sea a todos los hijos por igual.
- **Eyebrows**: cero. Las secciones se abren con su H2.
- **Radios**: tope en 16px para cards. Nada de 24px+.
- **Botones**: `.btn-primary` y `.btn-secondary` en `globals.css`. Siempre `scale(0.97)` en `:active`.
- **Imágenes (portadas de proyecto)**: al pasar el ratón solo hacen un zoom discreto (`scale-[1.03]`, 500 ms, en `project-cover.tsx`). Sin tilt ni elevación en las cards con portada (home, cabecera del proyecto y "Siguiente proyecto"); decisión de Ángel.
- **Foto de Ángel**: solo en el hero, en todas las pantallas: en móvil y tablet entre el título y el párrafo (bloque `lg:hidden`, 220 px de alto, 260 desde `sm`, brillo al 30 % (el de escritorio al 22 %), con `angel-cutout-sm.webp` (300x531, 14 KB, `unoptimized`, `fetchPriority="low"`; solo la móvil, `angel-cutout.webp` no se toca), sin `priority` para no competir con el LCP, que es el párrafo `hero.lead`) y en `lg:` a la derecha. Sobre mí ya no lleva foto. El hero usa `angel-cutout.webp` (520x920, recortada sin fondo, de la cabeza a la cintura y fundida a transparente abajo), sin card, borde ni `rounded-2xl`, sobre un brillo radial estático del acento (`color-mix` al 22 %, `inset: 8% -10% 0 -10%`) detrás de la imagen (decisión de Ángel del 2026-11-09). Solo se permite ese brillo: nada de rejilla de puntos ni parallax, y no recortes ni reconviertas la imagen. Solo hace un zoom discreto al pasar el ratón sobre la foto (`scale-[1.03]`, 500 ms), también con reduced motion (clase `.hero-photo` excluida de la regla global); sin tilt ni sombra de color. `angel-square.webp` ya no se pinta en ninguna página. `angel-portrait.webp` se borró (ya no se usaba).
- **Tilt 3D** (solo cards sin imagen: servicios y blog): gateado por `useReducedMotion`. Con ratón sigue al cursor; en táctil se inclina hacia el punto tocado y vuelve al soltar (decisión de Ángel: mismo efecto en móvil que en PC).
- **Hover en móvil**: `@variant hover (&:hover)` en `globals.css` hace que `hover:` también se active al tocar (Tailwind v4 lo limita a `(hover: hover)` por defecto). No lo quites: Ángel quiere los mismos efectos en móvil que en PC.
- **Enlaces externos**: siempre `target="_blank" rel="noopener noreferrer"`. LinkedIn con `www.` para que en móvil abra la app.
- **Icon system**: inline SVG stroke 2px, 24x24 viewBox. No instales lucide ni heroicons sin consultar.
- **`.btn-primary` pisa a `hidden`/`md:hidden`**: su `display` gana a esas utilidades. Para ocultar un botón según el tamaño, envuélvelo en un `<span>` o `<div>` con la clase `hidden md:inline-flex` (o `md:hidden`).
- **Fondos de la home alternos**: orden hero, services (alt), banda de tecnologías (sin fondo, con bordes), portfolio, about (alt), blog, contact (alt). Una sección nueva mantiene la alternancia. Las secciones con `id` llevan `scroll-mt-[72px]` para no quedar bajo la nav fija.
- **Accesibilidad**: skip link "Ir al contenido principal" en el layout; cada página tiene `<main id="main">`. Los enlaces internos mueven el foco a su destino (`lib/smooth-scroll.ts`). SVG decorativos con `aria-hidden`. Las portadas llevan `coverAlt` describiendo la imagen. Los campos de formulario usan `.border-field` (token `--field`), con contraste 3:1 sobre el fondo; `--rule` es solo para separadores y cards.
- **Hero sin esperar al JS**: la entrada del H1, el subtítulo y las fotos va en CSS (`.hero-rise`, `.hero-fade` en `globals.css`), no con `initial` de Framer Motion, para no retrasar el LCP. El párrafo `hero.lead` y los botones no llevan animación: se pintan con el primer render porque el párrafo es el LCP. Los `Reveal` llevan `data-reveal` y un `<noscript>` del layout los muestra si no hay JS. El indicador "Desliza" y la línea de terminal se quitaron (Fase 2).
- **Reduced motion**: Framer Motion lo gestiona globalmente con `<MotionConfig reducedMotion="user">` (`lib/motion.tsx`). No ramifiques `initial`/`animate` con `useReducedMotion`: en SSR vale `null` y provoca hydration mismatch (dentro de un `useEffect` sí se puede, como la palabra rotatoria del hero, que no rota con reduced motion). **Excepciones aprobadas por Ángel** (se mueven siempre, también con reduced motion): el carrusel de la banda de habilidades (`.carousel-group`, `components/carousel.tsx`), sin pausa al hacer hover. La banda "Disponible" del footer es fija (titular con punto de estado, plazo de respuesta y botón "Contactar"), para no repetir el carrusel arriba y abajo. Son lentos y lineales. También el scroll suave de los enlaces internos (`lib/smooth-scroll.ts`) y el cursor `.caret` de la página 404, que parpadea siempre (`.caret` no está en el bloque `prefers-reduced-motion` de `globals.css`). El contador de cifras (`count-up.tsx`) se eliminó: las cifras van estáticas en el hero.

## Páginas de proyecto

Cada card de "Proyectos recientes" abre `/proyectos/[slug]` (`app/proyectos/[slug]/page.tsx`), una página estática por proyecto. Los datos y el texto del artículo (ES y EN) viven en `lib/projects.ts`. Título, etiqueta y descripción corta salen de `messages/*.json` (`portfolio.p1Title`...), compartidos con la card. Añadir un proyecto: entrada nueva en `PROJECTS` + sus claves en los dos JSON. Todas las páginas (home, proyectos, servicios, blog) usan la misma `Nav` y el mismo `Footer`: fuera de la home sus anclas apuntan a la home (`/#about`) y la nav marca el apartado de la página (Servicios, Portfolio o Blog).

**Cada proyecto nuevo sigue la misma estructura que los actuales** (petición de Ángel):

- **Etiqueta (`pXTag`)**: una sola palabra con el área del proyecto, no su estado. Las actuales son "Automatización", "Desarrollo web" e "Infraestructura" (EN: Automation, Web development, Infrastructure; "Desarrollo web" son dos palabras por petición de Ángel). Reutiliza una si encaja; si no, otra palabra igual de corta. Nada de "En producción" o "En curso".
- **Card**: título corto (`pXTitle`), descripción de una o dos frases (`pXDesc`) y 3-4 tecnologías en `tech`.
- **Artículo** (`post` en `lib/projects.ts`, ES y EN): `title` largo, `intro` (primer párrafo, va de entradilla), secciones con H2 y, si hace falta, `{ h3 }`, `{ list }` y `{ ol }`. `date` en AAAA-MM-DD. Si Ángel pasa el texto, se respeta tal cual, solo con correcciones mínimas, y se traduce al inglés.
- **Ficha rápida (`facts`)**: 3 datos `{ label, value }` por idioma (Tipo, Qué hice o Alcance, Estado o Resultado), que se pintan en la cabecera entre la entradilla y la fecha. Obligatoria en cada proyecto nuevo.
- **Servicio (`service`)**: `"web"` o `"sistemas"`. Al final del artículo, antes de "Siguiente proyecto", sale la card de llamada al servicio (textos en `project.cta.*` de los JSON) con botón a `/servicios/[service]` y enlace "Pedir presupuesto". La card es `components/service-cta.tsx`, compartida con el blog. Los H2 del artículo van sin número ni letra capital, igual que el blog y las páginas legales (`SectionHeading` con `n` opcional, ya nadie lo pasa).
- **Portada**: la foto que suba Ángel se convierte a WebP (máx. 2200 px de ancho) en `public/projects/`, más una imagen para redes de 1200x630 en JPG (`ogImage`). Los originales pesados no se dejan en `public/`. Un SVG se puede usar tal cual (revisar que no tenga scripts, em dashes ni animaciones sin `prefers-reduced-motion`).
- **Orden**: el proyecto nuevo se añade a `PROJECTS`; la card, la página, el "Siguiente proyecto" y el sitemap salen solos. El orden del array es el de la home: trabajo para clientes y producto propio primero, el homelab el último. En móvil (menos de `sm`) las cards van apiladas; desde `sm` siguen en la fila deslizable.
- **Resumen del caso (`caseStudy`)**: campo opcional por proyecto y por idioma con `context`, `role`, `results` (antes y después), `snippet` y `quote`. Se pinta al inicio del artículo y solo lo que tenga contenido. Cifras y cita tienen que ser reales (la cita, con permiso del cliente) y el fragmento va saneado. En RDS solo están `context` y `role`, sacados del texto del artículo.
- **Portadas**: `coverPosition: "top"` para capturas de pantalla (FlexGrip, Prompt Vault) y el centro por defecto para fotos; todas llevan el mismo borde interior. Las portadas siguen siendo de tipos distintos (ilustración, capturas, foto): unificarlas del todo pide imágenes nuevas.

**Testimonios, CV y casos en borrador**: `lib/testimonials.ts` (vacío: la sección `components/testimonials.tsx` no se pinta; solo salen los que tengan `permission: true`; entre Proyectos y Sobre mí, sin fondo y con borde superior, así no rompe la alternancia). `CV` en `lib/site.ts` (ruta del PDF por idioma; vacío, no hay enlace en Sobre mí ni en el footer). `lib/cases.ts` y `app/casos/[slug]`: esqueletos de "Migración y refuerzo de Microsoft 365" y "Restauración de una copia de seguridad", con noindex, fuera del sitemap, sin enlazar y con 404 en producción (`VERCEL_ENV=production`); se ven en previews y en local. No son los casos de ransomware ni de sistema saturado, que siguen fuera.

## Páginas legales

`/aviso-legal`, `/privacidad` y `/cookies` (`components/legal-page.tsx`). El texto en ES y EN vive en `lib/legal.ts`; los datos del titular salen de `LEGAL` en `lib/site.ts`. Si un campo queda vacío no se muestra. No hay banner de cookies porque solo hay cookies técnicas (idioma, tema, sesión de Supabase). Única excepción aprobada: Vercel Speed Insights (métricas de rendimiento anónimas, `components/speed-insights.tsx`, solo con `VERCEL_ENV=production` y solo en rutas públicas; descrito en `/privacidad` y `/cookies`; `probar-cookies.ts` lo permite a propósito). Para cualquier otra analítica: si se añade analítica u otro servicio con cookies no esenciales, hace falta banner con "Rechazar" y actualizar `/cookies` y `/privacidad` (plan en `docs/cookies.md`; `scripts/probar-cookies.ts`, dentro de `npm test`, falla si aparece analítica, píxeles o iframes en `package.json`, `app/layout.tsx` o `components/`). El formulario de contacto enlaza a la política de privacidad. Los enlaces legales van en el footer.

## Páginas de servicio

Cada card de Servicios abre su propia página: `/servicios/sistemas` y `/servicios/web` (`app/servicios/[id]/page.tsx`, `components/services-page.tsx`). El contenido (ES y EN) vive en `lib/services.ts` y solo recoge lo que ya figura en la web (stack, áreas, proyectos). Los 4 puntos de la card de Sistemas en la home (`services.s1b1` a `s1b4`) siguen el orden y los nombres de las cards de la página y enlazan a sus anclas (`BULLET_ANCHORS` en `components/services.tsx`). Los `id` de los grupos son anclas: no los cambies sin revisar los enlaces.

Estructura de la página: cabecera (icono, H1, intro de 2 o 3 párrafos a 65 caracteres, botón "Pedir presupuesto" a `/#contact` y nota de la llamada gratuita), cards de grupos (título, `lead` opcional, 3 puntos y tecnologías como texto en mono separadas por " · "), y las secciones **opcionales por servicio**: proyectos reales (`projects`, solo `web`), "Cómo podemos trabajar" (`modes`, 6 cards sin números ni iconos) y preguntas frecuentes (`faq`, `<details>` nativos). Después "Cómo trabajo" (`components/process.tsx`, textos en `process.*` de los JSON), "Otro servicio" y el cierre. Los fondos alternan solos según el orden en que se pintan (función `bg()` en `services-page.tsx`). Sin números fantasma ni precios.

Proyectos reales (`components/real-projects.tsx`): tres cards en fila con el diseño de las de la home (portada con zoom discreto, sin tilt). `projects` es una lista de slugs de `PROJECTS`, y `"self"` pinta la card de esta misma web (portada `public/projects/this-site.webp` y `this-site-dark.webp`, captura del hero que habrá que rehacer si cambia el hero; enlaza a `/`; su texto va en `servicesPage.thisSite*`). Título, descripción y etiqueta salen de `portfolio.*`, no se copian. `modes` y `faq` los usan las dos páginas. La portada `this-site.webp` es una captura del hero antiguo (con la foto en rectángulo) y habrá que rehacerla.

Los "casos reales" (ransomware y sistema saturado) se quitaron de Sobre mí y de `/servicios/sistemas` a propósito, junto con `real-cases.tsx` y las claves `about.case*`: no los vuelvas a poner sin consultar. El JSON-LD de las páginas con `faq` añade un nodo `FAQPage` (`serviceJsonLd` en `lib/seo.ts`). `process.tsx` es un esquema visual de 6 pasos, de la primera llamada a la entrega: línea de tiempo horizontal desde `lg` (la de acento se dibuja con `scaleX` al entrar, los bordes de los nodos se encienden a su paso) y vertical por debajo (tramos con `scaleY`). Es un `<ol>` (`RevealGroup as="ol"`), usa `data-reveal` para verse completo sin JS y deja el reduced motion a `MotionConfig`. Debajo lleva el bloque del área de clientes con una maqueta en HTML y CSS de una tarjeta del portal (`aria-hidden`, con "Vista de ejemplo" y datos de muestra, nunca de un cliente real; el texto alternativo va en un `sr-only`) y el enlace a `/login`.

## Blog

Listado en `/blog` y artículos en `/blog/[slug]`. **El contenido vive en Supabase** (`blog_posts`, ES y EN en la columna `content` con los mismos bloques que los proyectos) y se edita desde `/admin/blog` (editor con marcas de texto, comprobador, versiones, programar y exportar). `lib/blog.ts` y los scripts de migración ya no existen (quedan en el historial de git). Las imágenes están en el bucket público `blog` y se sirven por `/blog-img/<slug>/<archivo>` (rewrite en `next.config.ts`, así la CSP no cambia). Cada artículo lleva su imagen para redes de 1200x630, propia o generada. Guía de uso en `docs/blog.md`.

- **Lectura pública** (`lib/blog-db.ts`): cliente anon sin cookies, columnas por nombre (anon no puede leer `created_by`, nunca `select("*")`), `unstable_cache` con etiqueta `blog` y `revalidate` de 3600. Si Supabase falla lanza una excepción, no devuelve `[]`. Las páginas siguen estáticas. Un artículo programado (`publicado` con fecha futura) aparece en la primera regeneración tras su hora.
- **Tras cualquier cambio** llama a `revalidarBlog(slug)` (`lib/blog-revalidate.ts`).
- **Panel** (`/admin/blog`, `components/portal/blog-editor.tsx`, `lib/blog-actions.ts`): lee y escribe con la sesión del admin (política `admin_all`), no con service role; solo la subida de imágenes y la lectura de su tamaño usan `createAdminClient()` tras `requireAdmin()` o `comprobarAdmin()`. Estado programado = publicado con `published_at` futuro. El slug de un publicado no se cambia. Se guardan las últimas 20 versiones y `updated_at` solo cambia si cambia el contenido. `created_by` es el email del admin, `migracion` para los 5 originales y `api:<nombre de la clave>` para los borradores de la API (salen en "Pendiente de ti").
- **Validador** (`lib/blog-validate.ts`, compartido por panel, actions y API): sin regex con barras invertidas. Errores bloquean publicar, avisos no. El límite de 60 caracteres del título solo es error en ES, y el mínimo de 2 imágenes solo en artículos no migrados. Los mensajes van en español, fuera de los JSON. **Si cambias una regla, añade o ajusta su prueba en `scripts/probar-blog.ts`.**
- **Texto con marcas** (`lib/blog-markup.ts`): `##` H2, `###` H3, `- ` lista, `1. ` ordenada, `![alt](ruta "pie")`, línea en blanco entre bloques. Ida y vuelta sin pérdidas (probado con un artículo de ejemplo y, con `BLOG_EXPORT=<json exportado> npm test`, con los reales). width y height de las imágenes se leen del archivo al guardar.
- **Vista previa** (`/admin/blog/[id]/vista`): usa `BlogArticle` con `comoDiv` (el Shell ya tiene `<main>`) y `FixedLocale` de `lib/i18n.tsx` para ver ES o EN sin tocar la cookie.
- **API para la rutina de Claude** (`app/api/blog/**`, `lib/blog-api-auth.ts`): solo crea y actualiza **borradores**, nunca publica ni borra. `GET /api/blog/posts`, `PUT /api/blog/posts/[slug]` y `POST /api/blog/imagenes`. Clave en `Authorization: Bearer blg_...`, creada y revocada en `/admin/blog/claves` (se enseña una sola vez, en BD solo el sha256 en `blog_api_tokens`). El PUT pasa el mismo comprobador que Publicar, 409 si el artículo ya está publicado o programado, y `created_by = api:<nombre>`. Límites por token y hora (20 artículos, 60 imágenes) contados en `blog_api_uso`, que se purga a los 7 días y, si no se puede contar, la API responde 503. JSON máximo de 400 KB. Respuestas siempre JSON con `no-store`. `scripts/probar-api-blog.ts` la prueba contra localhost (BD de producción, crea y borra sus propios datos): `npx tsx --env-file=.env.local scripts/probar-api-blog.ts`.
- **Imágenes del blog** (`lib/blog-imagenes.ts`, `lib/blog-svg.ts`): panel y API comparten la conversión. Todo se guarda como **WebP** de 2200 px como máximo; un SVG se revisa antes (sin scripts, manejadores `on*`, `foreignObject`, recursos externos ni raya larga) y se rasteriza a unos 1600 px. En el bucket no hay nunca un SVG, y `allowed_mime_types` es solo webp, jpeg y png. Un nombre que ya existe da 409, no se sobrescribe.
- **Imagen para redes** (`app/blog/[slug]/opengraph-image.tsx`, plantilla en `lib/blog-og-imagen.tsx`, ajuste del título en `lib/blog-og.ts`): Next da prioridad a este archivo sobre `generateMetadata`, así que es el único `og:image` de los artículos. Si el artículo tiene `og_image` (los 5 migrados la tienen, en `/blog-img/<slug>/og.jpg`) la ruta sirve esa imagen tal cual; si no, genera una de 1200x630 con `next/og`. Las fuentes son `.ttf` locales en `assets/fonts/` (Space Grotesk Medium y JetBrains Mono SemiBold, licencia OFL junto a ellas), porque `next/og` no lee woff2; no las cargues desde una URL. Se genera una vez por artículo (`generateStaticParams`, `revalidate` 3600) y `revalidarBlog` la invalida. En el panel, sin `og_image` el editor enseña la miniatura de la generada y con ella un botón para volver a la generada.
- La home tiene una mención corta (`components/blog-teaser.tsx`, ancla `#blog`) con los dos más recientes.

**Anchos de las páginas interiores** (blog, proyectos y legales): un solo contenedor `max-w-6xl px-6 md:px-8`, alineado a la izquierda con la nav, igual que las páginas de servicio. Dentro, el H1 llega a `max-w-5xl`, la entradilla y el cuerpo a `max-w-4xl`, y el texto de `ServiceCta` a `max-w-2xl`. No vuelvas a centrar el cuerpo en una columna más estrecha.

Listado en rejilla de 2 columnas desde `md`, con cards de la misma altura y "Leer artículo" abajo. Reglas para los próximos posts:

- Título y H2 sin dos puntos (coma en su lugar).
- Cada artículo termina con la llamada al servicio (`components/service-cta.tsx`, la misma que los proyectos), que sale sola según la categoría: `sistemas` y `automatizacion` a sistemas, `desarrollo` a web.
- Sin números en los H2 ni letra capital, igual que proyectos y páginas legales.
- La imagen para redes sale por código salvo que el artículo traiga `og_image`. Plantilla (`lib/blog-og-imagen.tsx`): fondo `#0a0f1c` con brillo naranja arriba a la derecha, raya y "BLOG · CATEGORÍA" en JetBrains Mono `#fb923c`, título (`seoTitle` o `title` en español) en Space Grotesk blanco a un tamaño que nunca pasa de 3 líneas, y pie con "Ángel Fernández." y "Sistemas y desarrollo web". Sin "Palma de Mallorca". Los `public/blog/<slug>-og.jpg` de los 5 originales se conservan para los enlaces ya compartidos; no se borran.

## Portal y admin

Zona privada: `/admin` (solo yo, con TOTP) y `/portal` (clientes). Código en `app/(admin)`, `app/(portal)`, `components/portal/**` y `lib/portal/**`. Esquema en `db/schema.ts`, migraciones con drizzle-kit en `db/migrations/` y políticas RLS y funciones en `db/rls.sql` (repetible). Nunca se ejecuta SQL contra Supabase desde aquí: se da el SQL a Ángel y lo lanza él, primero la migración y después `rls.sql`. Toda acción de admin empieza con `requireAdmin()`. Los textos del portal van en `messages/portal.es.json` y `portal.en.json` (`getI18n()` en servidor, `usePT()` en cliente).

- **Bolsa de horas**: `bolsa_horas` (horas con dos decimales, `numeric(7,2)`) y `bolsa_movimientos`, un registro por cada apunte (fecha, horas, proyecto opcional, concepto de 1 a 200 caracteres, negativo = corrección). La suma de movimientos cuadra con `horas_consumidas` porque los dos se escriben a la vez en la función de Postgres `registrar_horas()` (SECURITY DEFINER, exige `is_admin()`, bloquea la fila, no deja bajar de 0 ni apuntar a un proyecto de otra empresa). `registrarHoras` en `lib/portal/actions.ts` la llama por RPC. El cliente lee los movimientos de su empresa por RLS y no escribe nunca. La migración 0004 creó un movimiento "Saldo inicial" por cada bolsa con horas consumidas (se guarda en español y se traduce al mostrarlo).
- **Aviso de bolsa baja**: al dejar la bolsa en el 20 % o menos de lo contratado se envía un solo correo a las personas de la empresa (`avisarBolsaBaja` en `lib/portal/email.ts`). `bolsa_horas.ultimo_aviso_bajo` evita repetirlo; se borra al ampliar las horas contratadas o si un apunte sube la bolsa por encima del 20 %. Si el correo falla, el apunte se guarda igual. Cada correo va en el idioma de la persona: `usuarios.idioma` (`es` por defecto), que se guarda al cambiar el idioma en las preferencias del portal (`guardarIdioma` en `lib/portal/actions.ts`).
- **Presupuesto y proyecto**: `proyectos.presupuesto_id` (opcional, único, `on delete set null`) enlaza un proyecto con un presupuesto aceptado de su empresa. El Resumen avisa de los aceptados sin proyecto solo si se aceptaron en los últimos 90 días.
- **Resumen (`/admin`)**: "Pendiente de ti" junta presupuestos enviados sin firmar, aceptados sin proyecto, cobros vencidos, incidencias sin respuesta del admin (más de 2 días laborables) y bolsas al 20 % o menos. La línea "Este mes" usa `resumenCaja()` de `lib/portal/finanzas.ts`, el mismo cálculo que Finanzas.
- **Clientes**: tabla en `/admin/clientes` y alta en un paso con "Nuevo cliente" (`crearCliente`: empresa nueva o existente y primera persona). La invitación por correo (casilla marcada por defecto, también al añadir personas y con "Reenviar invitación") genera el enlace con `auth.admin.generateLink` (`magiclink`) y lo manda por Resend. El enlace apunta a `/auth/entrar?token_hash=...&type=magiclink`, una página con el botón "Entrar" que no canjea nada al abrirse (los filtros de correo no lo gastan); el botón hace POST a `/auth/callback`, que lo canjea con `verifyOtp` y manda a elegir contraseña o a `/portal`. Las personas desactivadas (`banned_until`) no reciben avisos ni invitaciones (`cuentasDesactivadas()` en `lib/portal/cuentas.ts`).
- **Ficha del cliente** (`/admin/clientes/[id]`): cabecera con el nombre y, en su línea, "Ver como cliente" y "Añadir persona"; fila de 3 cifras (horas restantes, proyectos activos y pendiente de cobro) que enlazan a sus paneles (`#horas`, `#proyectos`, `#cobros`); desde `lg` cifras y paneles comparten una rejilla de 3 columnas iguales con `gap-6`, y las pilas son independientes (la principal ocupa 2 columnas con `lg:col-span-2` y la lateral 1, así la tercera cifra queda sobre la lateral) (principal: Proyectos, Movimientos, Cobros; lateral: Bolsa de horas, Personas, Datos de la empresa). Por debajo de `lg` una columna con `order-*` (Bolsa, Proyectos, Movimientos, Cobros, Personas, Datos): los contenedores de las pilas son `contents` hasta `lg`. La columna lateral es sticky desde `lg` (`components/portal/columna-fija.tsx`) y deja de serlo si es más alta que la ventana. Los datos de la empresa están en lectura y el botón de la cabecera abre el formulario en el mismo panel (`components/portal/empresa-datos.tsx`).
- **Archivar y eliminar clientes** (`lib/portal/clientes-actions.ts`, `components/portal/archivo-cliente.tsx`): `empresas.archivada_at` (nulo = activo) y `archivo_desactivadas` (ids de las personas que se desactivaron al archivar). Archivar guarda la fecha y desactiva (`banned_until`) solo a quien estaba activo; restaurar reactiva solo esas. `listarEmpresas()` devuelve solo las activas (listas, selectores, Resumen, Pendiente de ti); `listarEmpresas({ todas: true })` incluye las archivadas y se usa para poner nombre a lo que se conserva (cobros, presupuestos, proyectos, exportar). Finanzas sigue contando los cobros y pagos de un cliente archivado. Eliminar definitivamente solo se ofrece en un cliente archivado, exige escribir el nombre de la empresa, se niega si hay pagos registrados y borra por este orden los ficheros del bucket `archivos`, las cuentas de Auth y la fila de la empresa (la cascada se lleva el resto; los gastos solo pierden la empresa).
- **Vista de cliente** (`/admin/clientes/[id]/vista`): solo lectura y **sin cambiar de sesión**. Son las consultas del admin filtradas por `empresa_id`, pintadas con los componentes del portal (`IncidenciasLista` con `soloLectura`). Reutiliza los componentes de `components/portal/vistas-cliente.tsx` (los mismos que las páginas del portal, con `enlaces` desactivado), con pestañas `?seccion=` (proyectos, incidencias, horas, presupuestos) al ancho del portal (1080px). Lleva una banda fija con la empresa y el botón de volver, pegada bajo la cabecera.
- **Finanzas**: la gráfica mensual tiene escala mínima de 500 € y líneas de referencia; los meses abreviados llevan siempre 3 letras (`mes3()` en `lib/portal/translate.ts`). `--positive` es el verde del resultado positivo.
- **Cabecera** (`components/portal/shell.tsx`): dos filas en admin y portal. Fila 1, marca a la izquierda y a la derecha "Nuevo" (solo admin), "Ver la web", idioma, tema y "Salir" (en móvil, "Nuevo" y "Salir" quedan en icono). Fila 2, secciones como pestañas con borde inferior de 2px en el acento, con scroll horizontal sin barra en pantallas estrechas.
- **Presupuesto en el proyecto**: el selector ofrece los enviados ("pendiente de firma") y los aceptados de la empresa sin proyecto; los borradores no. "Pendiente de ti" solo avisa de los aceptados.
- **Regex de fecha**: `FECHA` y `MES` viven en `lib/portal/validate.ts`. Ojo con las barras invertidas (`d`, `s`) al escribir regex: sin ellas rechazan todo.
- **Blog en el admin**: `/admin/blog` (pestaña "Blog" y entrada "Artículo" del menú "Nuevo"). Los borradores que crea la API (`created_by` con prefijo `api:`) salen en "Pendiente de ti" hasta que los publiques.
- **Navegación del admin**: botón "Nuevo" con menú (presupuesto, cliente, proyecto, cobro, gasto, artículo), enlace "Ver la web" e `/admin/incidencias` con filtros por estado, prioridad y empresa.

## i18n

Añadir una clave: edita **los dos** JSON (`messages/es.json` y `messages/en.json`) y úsala con `t("ruta.anidada")`. El `t()` cae a la ruta si falta la clave. **Los textos del portal y del admin van aparte, en `messages/portal.es.json` y `messages/portal.en.json`** (los lee `lib/portal/i18n.ts`): son el 80 % del peso y la web pública no debe cargarlos. No pongas en la web pública (`t()` de `lib/i18n.tsx`) una clave `portal.*`; si un componente público necesita un texto, ponlo en `es.json` y `en.json`.

**Rendimiento (JS que llega al navegador)**: el botón flotante del móvil y el de volver arriba (`components/flotantes.tsx`) se descargan con la primera interacción, no con la hidratación; las páginas usan `<Flotantes />` y no los dos componentes sueltos. La lista de rutas privadas está en `lib/rutas-privadas.ts` (sin imports de Node, la usan también componentes de cliente). los componentes de cliente no importan datos grandes (`lib/projects.ts`, `lib/services.ts`, `lib/legal.ts`); las páginas (servidor) leen esos datos y pasan por props solo lo que se pinta (`projectCards()` y `ProjectCard` en `lib/projects.ts`, el proyecto o servicio de la propia página). No vuelvas a importar `PROJECTS`, `SERVICES` o `LEGAL_PAGES` desde un componente con `"use client"`. Medir con `npx next experimental-analyze -o` (Turbopack; escribe `.next/diagnostics/route-bundle-stats.json` con el "First Load JS" por ruta).

Añadir un idioma: nuevo JSON + extiende el type `Locale` en `lib/i18n.tsx`.

## Trabajo con el formulario

**Vías de contacto opcionales** (`CONTACT` en `lib/site.ts`): `bookingUrl`, `whatsapp`, `phone` y `availability` (es y en). Vacíos, no se muestra nada y el botón principal del hero es "Pedir presupuesto". Con `bookingUrl` el principal pasa a "Reservar llamada de 15 min" (enlace externo) y "Pedir presupuesto" queda como secundario; con `whatsapp` o `phone` salen en Contacto y como botón redondo junto al "Contactar" flotante del móvil. El campo "servicio" del formulario es opcional.

El formulario (`components/contact.tsx`) usa una **server action** (`lib/contact-action.ts`) que envía el mensaje por **Resend** a Ángel, con reply-to al correo del visitante. Campos: `name`, `email`, `service` (select opcional, valor siempre en español), `message`. Validación y límite en `lib/contact-validate.ts` (probados en `scripts/probar-contacto.ts`): honeypot `web` (campo fuera de pantalla), tiempo mínimo de 3 s si el navegador manda la hora de apertura (`t`; sin JS no existe y no se exige) y límite por IP en memoria (3 cada 10 minutos, 8 por hora; mejor esfuerzo porque cada instancia serverless tiene el suyo; `lib/portal/rate-limit.ts` cuenta filas de tablas y no sirve para anónimos). A un bot se le contesta "enviado" sin mandar nada. Funciona sin JS (el `<form action>` es la acción) y no registra el mensaje ni el correo en los logs. Variables de entorno en Vercel: `RESEND_API_KEY`, `CONTACT_FROM` (remitente de un dominio verificado en Resend, p. ej. del subdominio `send.angel-fernandez.es`; si falta se usa `RESEND_FROM`) y, opcional, `CONTACT_TO` (por defecto `LEGAL.email`). Sin remitente verificado el envío falla y el visitante ve el mensaje de error.

## SEO

- Meta descriptions de home, servicios y blog en `lib/seo.ts`; las de proyectos y artículos salen de su contenido. `og:description` y `twitter:description` coinciden con la meta.
- **Título de la home** (`HOME_TITLE`): máximo 60 caracteres, sin marca; la marca va en `SITE_NAME` (`og:site_name` y `name` del `WebSite`, que no debe colgar del título). `npm test` lo vigila (`scripts/probar-seo.ts`). El `og:title` en inglés no aplica mientras no haya rutas `/en/`: el HTML servido es siempre el español.
- **Páginas locales**: ninguna por ahora. La de Microsoft 365 solo cuando haya un caso real. El SEO local va en las páginas de servicio: títulos con Palma y Mallorca (`SERVICE_TITLES` y `SERVICE_DESCRIPTIONS` en `lib/seo.ts`), ancla `#mantenimiento` (card de modalidades de sistemas) y párrafo y FAQ locales en web.
- **Certificaciones** en un solo sitio, `lib/certifications.ts` (nombre y emisor): las usan la tira del hero y el `hasCredential` del `Person`. Sin fechas ni enlaces hasta que Ángel los dé.
- JSON-LD (`components/json-ld.tsx` + helpers de `lib/seo.ts`): home `WebSite` + `ProfessionalService` + `Person`; servicios `Service` + `BreadcrumbList`; proyectos `Article` + `BreadcrumbList`; blog `Blog` y `BlogPosting` + `BreadcrumbList`.
- **hreflang solo "es" y "x-default"** (`alternatesFor()` en `lib/seo.ts`, junto al canonical): el inglés se elige en el navegador sobre la misma URL, no hay URLs `/en/`. Un hreflang "en" hacia la página en español sería un error (decisión de Ángel), y por lo mismo no hay `og:locale:alternate`. Si algún día hay rutas `/en/...`, se añaden en `alternatesFor()`.
- **Favicon e imagen para redes de la home**: `app/favicon.ico`, `app/icon.png` y `app/apple-icon.png` (convención de Next); la imagen OG de la home es `public/og-home.jpg` (`HOME_OG_IMAGE`), con `twitter:card` `summary_large_image`.
- **404**: `app/not-found.tsx`, con la misma nav y footer que el resto; textos en `notFound.*` de los JSON.
- **Nada de testimonios ni datos inventados** publicados como reales. Las cifras de experiencia (3 años, ~60 hoteles, ~120 servidores, ~1.000 usuarios) las dio Ángel el 2026-11-08; si cambian, se actualizan en `hero.stat*` y `hero.lead`. Van en la tira de pruebas del hero (`components/proof-strip.tsx`, sin contador) con la nota "Cifras del equipo de sistemas en el que trabajo." y las certificaciones (Omada OCNA Wireless, Hornetsecurity Certified Engineering Training, 3CX Basic Certified Engineer V20, sin fechas ni enlaces hasta que Ángel los dé). Sobre mí ya no lleva cifras.

## Dominio

`SITE_URL` en `lib/site.ts` es la URL pública que usan metadata, `sitemap.xml` y `robots.txt`. Es `https://www.angel-fernandez.es` (con `www`, que es el dominio principal en Vercel). Si cambia, se modifica solo ahí. Los correos (`RESEND_FROM`) salen de `portal@angel-fernandez.es`, así que el dominio tiene que estar verificado en Resend.

## Seguridad

- **HSTS sin preload (decisión de Ángel, 2026-11-11):** la cabecera es `max-age=63072000; includeSubDomains` y no se toca. Preload descartado porque el apex `angel-fernandez.es` redirige a `www` con el redireccionamiento de Vercel (responde `max-age` sin `includeSubDomains` ni `preload`, y esa cabecera no la controla `next.config.ts`) y porque `autodiscover.angel-fernandez.es` (IONOS, correo) no sirve HTTPS. El DNS está en IONOS, no en Vercel.
- **Informes de la CSP:** `app/api/csp-report` recibe `report-uri` y `report-to` (cabecera `Reporting-Endpoints` en `next.config.ts`), limita tamaño (8 KB) y frecuencia y escribe en los logs de Vercel (`[csp-report]`), sin base de datos ni IP. La CSP sigue en Report-Only.

- Toda server action y toda página del admin empieza con `requireAdmin()` (las rutas de API, con `comprobarAdmin()`).
- El cliente con service role (`createAdminClient`) solo se usa en código con `server-only`, y siempre después de comprobar permisos. Nunca en componentes de cliente.
- Ninguna tabla nueva sin RLS. Tras cada migración, lanzar `db/verificar-rls.sql` (y `docs/pruebas-rls.md` si cambian políticas o rutas de Storage).
- `user_metadata` nunca decide acceso: lo edita el propio usuario. Las marcas (`password_set`, `password_temporary`) van en `app_metadata`, escritas solo desde el servidor, y se leen con `marcasContrasena()` en `lib/portal/auth.ts`. Solo sirven para redirigir.
- Los endpoints que envían correo o crean datos desde una cuenta de cliente llevan límite de uso (ver `lib/portal/rate-limit.ts` y `lib/portal/storage-limits.ts`).
- La CSP de las rutas privadas (`/admin`, `/portal`, `/login`, `/mfa`, `/contrasena`, `/auth`) lleva nonce y sale de `proxy.ts`. Nunca poner `Content-Security-Policy` en `next.config.ts` para esas rutas ni en la respuesta del proxy: en Vercel las cabeceras de `next.config.ts` llegan también a la petición y pisan la del proxy, y Next deja de poner el nonce en sus scripts (causa y pruebas en `docs/csp.md`).
- Las cabeceras de las rutas privadas se ponen desde `proxy.ts`, no desde `next.config.ts`, por la misma razón.
- Las IP de firma se leen con `ipDelCliente()` (`lib/portal/ip.ts`), no de `x-forwarded-for` a pelo.
- Mínimo de 12 caracteres para cualquier contraseña (clientes y admin).
- **API del blog** (`/api/blog`): solo crea y actualiza borradores, nunca publica ni borra; **publicar exige sesión de admin con TOTP** (`requireAdmin()`). Las claves (`blg_...`) se guardan solo como hash sha256 y se revocan desde `/admin/blog/claves`; la clave en claro se enseña una vez. Hay límite por clave y hora y el cuerpo máximo es de 400 KB.
- **Imágenes del blog**: los SVG nunca se guardan tal cual, se revisan y se convierten a WebP; el bucket `blog` solo admite webp, jpeg y png.
- **Lectura pública del blog**: clave anon sin cookies y columnas pedidas por nombre; `anon` no ve `created_by` (ni ninguna tabla del blog salvo las columnas permitidas de `blog_posts`).

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

Variables de entorno en Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (la web lee el blog con ella) y `SUPABASE_SERVICE_ROLE_KEY` (subida de imágenes del blog y portal). El formulario de contacto no necesita ninguna.
