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
  page.tsx              home: hero, services, stack, portfolio, about, blog-teaser, contact
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
  angel-portrait.webp   foto del hero (800x1000, 4:5, desde lg); no recortar ni reconvertir
  angel-square.webp     foto de Sobre mí en móvil y tablet (640x640) y `image` del Person en JSON-LD
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
- **Foto de Ángel**: hero en escritorio (`lg:`) y Sobre mí en móvil y tablet (`lg:hidden`), nunca las dos a la vez. El hero usa `angel-cutout.webp` (520x920, recortada sin fondo, de la cabeza a la cintura y fundida a transparente abajo), sin card, borde ni `rounded-2xl`, sobre un brillo radial estático del acento (`color-mix` al 22 %, `inset: 8% -10% 0 -10%`) detrás de la imagen (decisión de Ángel del 2026-11-09). Solo se permite ese brillo: nada de rejilla de puntos ni parallax, y no recortes ni reconviertas la imagen. Solo hace un zoom discreto al pasar el ratón sobre la foto (`scale-[1.03]`, 500 ms), también con reduced motion (clase `.hero-photo` excluida de la regla global); sin tilt ni sombra de color. La foto de Sobre mí (`angel-square.webp`) sigue con `rounded-2xl` y borde `var(--rule)`. `angel-portrait.webp` ya no se usa en el código.
- **Tilt 3D** (solo cards sin imagen: servicios y blog): gateado por `useReducedMotion`. Con ratón sigue al cursor; en táctil se inclina hacia el punto tocado y vuelve al soltar (decisión de Ángel: mismo efecto en móvil que en PC).
- **Hover en móvil**: `@variant hover (&:hover)` en `globals.css` hace que `hover:` también se active al tocar (Tailwind v4 lo limita a `(hover: hover)` por defecto). No lo quites: Ángel quiere los mismos efectos en móvil que en PC.
- **Enlaces externos**: siempre `target="_blank" rel="noopener noreferrer"`. LinkedIn con `www.` para que en móvil abra la app.
- **Icon system**: inline SVG stroke 2px, 24x24 viewBox. No instales lucide ni heroicons sin consultar.
- **`.btn-primary` pisa a `hidden`/`md:hidden`**: su `display` gana a esas utilidades. Para ocultar un botón según el tamaño, envuélvelo en un `<span>` o `<div>` con la clase `hidden md:inline-flex` (o `md:hidden`).
- **Fondos de la home alternos**: orden hero, services (alt), banda de tecnologías (sin fondo, con bordes), portfolio, about (alt), blog, contact (alt). Una sección nueva mantiene la alternancia. Las secciones con `id` llevan `scroll-mt-[72px]` para no quedar bajo la nav fija.
- **Accesibilidad**: skip link "Ir al contenido principal" en el layout; cada página tiene `<main id="main">`. Los enlaces internos mueven el foco a su destino (`lib/smooth-scroll.ts`). SVG decorativos con `aria-hidden`. Las portadas llevan `coverAlt` describiendo la imagen. Los campos de formulario usan `.border-field` (token `--field`), con contraste 3:1 sobre el fondo; `--rule` es solo para separadores y cards.
- **Hero sin esperar al JS**: la entrada del H1, el subtítulo y el texto va en CSS (`.hero-rise`, `.hero-fade` en `globals.css`), no con `initial` de Framer Motion, para no retrasar el LCP. Los `Reveal` llevan `data-reveal` y un `<noscript>` del layout los muestra si no hay JS. El indicador "Desliza" solo se ve en escritorio, centrado al pie del hero.
- **Reduced motion**: Framer Motion lo gestiona globalmente con `<MotionConfig reducedMotion="user">` (`lib/motion.tsx`). No ramifiques `initial`/`animate` con `useReducedMotion`: en SSR vale `null` y provoca hydration mismatch (dentro de un `useEffect` sí se puede, como la palabra rotatoria del hero, que no rota con reduced motion). **Excepciones aprobadas por Ángel** (se mueven siempre, también con reduced motion): el carrusel de la banda de habilidades (`.carousel-group`, `components/carousel.tsx`), sin pausa al hacer hover. La banda "Disponible" del footer es fija (titular con punto de estado, plazo de respuesta y botón "Contactar"), para no repetir el carrusel arriba y abajo. Son lentos y lineales. También el scroll suave de los enlaces internos (`lib/smooth-scroll.ts`) y el cursor `.caret` de la línea de terminal del hero (`~/angel $ sistemas + web`), que parpadea siempre (`.caret` ya no está en el bloque `prefers-reduced-motion` de `globals.css`), y el contador de cifras de "Sobre mí" (`components/count-up.tsx`), que sube de 0 a su valor (1,4 s) también con reduced motion.

## Páginas de proyecto

Cada card de "Proyectos recientes" abre `/proyectos/[slug]` (`app/proyectos/[slug]/page.tsx`), una página estática por proyecto. Los datos y el texto del artículo (ES y EN) viven en `lib/projects.ts`. Título, etiqueta y descripción corta salen de `messages/*.json` (`portfolio.p1Title`...), compartidos con la card. Añadir un proyecto: entrada nueva en `PROJECTS` + sus claves en los dos JSON. Todas las páginas (home, proyectos, servicios, blog) usan la misma `Nav` y el mismo `Footer`: fuera de la home sus anclas apuntan a la home (`/#about`) y la nav marca el apartado de la página (Servicios, Portfolio o Blog).

**Cada proyecto nuevo sigue la misma estructura que los actuales** (petición de Ángel):

- **Etiqueta (`pXTag`)**: una sola palabra con el área del proyecto, no su estado. Las actuales son "Automatización", "Desarrollo web" e "Infraestructura" (EN: Automation, Web development, Infrastructure; "Desarrollo web" son dos palabras por petición de Ángel). Reutiliza una si encaja; si no, otra palabra igual de corta. Nada de "En producción" o "En curso".
- **Card**: título corto (`pXTitle`), descripción de una o dos frases (`pXDesc`) y 3-4 tecnologías en `tech`.
- **Artículo** (`post` en `lib/projects.ts`, ES y EN): `title` largo, `intro` (primer párrafo, va de entradilla), secciones con H2 y, si hace falta, `{ h3 }`, `{ list }` y `{ ol }`. `date` en AAAA-MM-DD. Si Ángel pasa el texto, se respeta tal cual, solo con correcciones mínimas, y se traduce al inglés.
- **Ficha rápida (`facts`)**: 3 datos `{ label, value }` por idioma (Tipo, Qué hice o Alcance, Estado o Resultado), que se pintan en la cabecera entre la entradilla y la fecha. Obligatoria en cada proyecto nuevo.
- **Servicio (`service`)**: `"web"` o `"sistemas"`. Al final del artículo, antes de "Siguiente proyecto", sale la card de llamada al servicio (textos en `project.cta.*` de los JSON) con botón a `/servicios/[service]` y enlace "Pedir presupuesto". La card es `components/service-cta.tsx`, compartida con el blog. Los H2 del artículo van sin número ni letra capital, igual que el blog y las páginas legales (`SectionHeading` con `n` opcional, ya nadie lo pasa).
- **Portada**: la foto que suba Ángel se convierte a WebP (máx. 2200 px de ancho) en `public/projects/`, más una imagen para redes de 1200x630 en JPG (`ogImage`). Los originales pesados no se dejan en `public/`. Un SVG se puede usar tal cual (revisar que no tenga scripts, em dashes ni animaciones sin `prefers-reduced-motion`).
- **Orden**: el proyecto nuevo se añade a `PROJECTS`; la card, la página, el "Siguiente proyecto" y el sitemap salen solos.

## Páginas legales

`/aviso-legal`, `/privacidad` y `/cookies` (`components/legal-page.tsx`). El texto en ES y EN vive en `lib/legal.ts`; los datos del titular salen de `LEGAL` en `lib/site.ts`. Si un campo queda vacío no se muestra. No hay banner de cookies porque solo hay cookies técnicas (idioma, tema, sesión de Supabase): si se añade analítica u otro servicio con cookies no esenciales, hace falta banner con "Rechazar" y actualizar `/cookies` y `/privacidad`. El formulario de contacto enlaza a la política de privacidad. Los enlaces legales van en el footer.

## Páginas de servicio

Cada card de Servicios abre su propia página: `/servicios/sistemas` y `/servicios/web` (`app/servicios/[id]/page.tsx`, `components/services-page.tsx`). El contenido (ES y EN) vive en `lib/services.ts` y solo recoge lo que ya figura en la web (stack, áreas, proyectos). Los 4 puntos de la card de Sistemas en la home (`services.s1b1` a `s1b4`) siguen el orden y los nombres de las cards de la página y enlazan a sus anclas (`BULLET_ANCHORS` en `components/services.tsx`). Los `id` de los grupos son anclas: no los cambies sin revisar los enlaces.

Estructura de la página: cabecera (icono, H1, intro de 2 párrafos a 65 caracteres, botón "Pedir presupuesto" a `/#contact` y nota de la llamada gratuita), cards de grupos (título, `lead` opcional, 3 puntos y tecnologías como texto en mono separadas por " · "), y las secciones **opcionales por servicio**: proyectos reales (`projects`, solo `web`), "Cómo podemos trabajar" (`modes`, 6 cards sin números ni iconos) y preguntas frecuentes (`faq`, `<details>` nativos). Después "Cómo trabajo" (`components/process.tsx`, textos en `process.*` de los JSON), "Otro servicio" y el cierre. Los fondos alternan solos según el orden en que se pintan (función `bg()` en `services-page.tsx`). Sin números fantasma ni precios.

Proyectos reales (`components/real-projects.tsx`): tres cards en fila con el diseño de las de la home (portada con zoom discreto, sin tilt). `projects` es una lista de slugs de `PROJECTS`, y `"self"` pinta la card de esta misma web (portada `public/projects/this-site.webp` y `this-site-dark.webp`, captura del hero que habrá que rehacer si cambia el hero; enlaza a `/`; su texto va en `servicesPage.thisSite*`). Título, descripción y etiqueta salen de `portfolio.*`, no se copian. `modes` y `faq` los usan las dos páginas. La portada `this-site.webp` es una captura del hero antiguo (con la foto en rectángulo) y habrá que rehacerla.

Los "casos reales" (ransomware y sistema saturado) se quitaron de Sobre mí y de `/servicios/sistemas` a propósito, junto con `real-cases.tsx` y las claves `about.case*`: no los vuelvas a poner sin consultar. El JSON-LD de las páginas con `faq` añade un nodo `FAQPage` (`serviceJsonLd` en `lib/seo.ts`). `process.tsx` es un esquema visual de 6 pasos, de la primera llamada a la entrega: línea de tiempo horizontal desde `lg` (la de acento se dibuja con `scaleX` al entrar, los bordes de los nodos se encienden a su paso) y vertical por debajo (tramos con `scaleY`). Es un `<ol>` (`RevealGroup as="ol"`), usa `data-reveal` para verse completo sin JS y deja el reduced motion a `MotionConfig`. Debajo lleva el bloque del área de clientes con una maqueta en HTML y CSS de una tarjeta del portal (`aria-hidden`, con "Vista de ejemplo" y datos de muestra, nunca de un cliente real; el texto alternativo va en un `sr-only`) y el enlace a `/login`.

## Blog

Listado en `/blog` y artículos en `/blog/[slug]`. El contenido (ES y EN) vive en `lib/blog.ts`, con los mismos bloques que los proyectos. Cada artículo lleva su imagen para redes de 1200x630 en `public/blog/`. La home tiene una mención corta (`components/blog-teaser.tsx`, ancla `#blog`) con los dos más recientes.

**Anchos de las páginas interiores** (blog, proyectos y legales): un solo contenedor `max-w-6xl px-6 md:px-8`, alineado a la izquierda con la nav, igual que las páginas de servicio. Dentro, el H1 llega a `max-w-5xl`, la entradilla y el cuerpo a `max-w-4xl`, y el texto de `ServiceCta` a `max-w-2xl`. No vuelvas a centrar el cuerpo en una columna más estrecha.

Listado en rejilla de 2 columnas desde `md`, con cards de la misma altura y "Leer artículo" abajo. Reglas para los próximos posts:

- Título y H2 sin dos puntos (coma en su lugar).
- Cada artículo termina con la llamada al servicio (`components/service-cta.tsx`, la misma que los proyectos), que sale sola según la categoría: `sistemas` y `automatizacion` a sistemas, `desarrollo` a web.
- Sin números en los H2 ni letra capital, igual que proyectos y páginas legales.
- La imagen para redes (1200x630, `public/blog/<slug>-og.jpg`) sigue la plantilla de las actuales. Fondo `#0a0f1c` con brillo naranja arriba a la derecha, raya y "BLOG · CATEGORÍA" en JetBrains Mono `#fb923c`, título en Space Grotesk blanco, y pie con "Ángel Fernández." y "Sistemas y desarrollo web". Sin "Palma de Mallorca".

## Portal y admin

Zona privada: `/admin` (solo yo, con TOTP) y `/portal` (clientes). Código en `app/(admin)`, `app/(portal)`, `components/portal/**` y `lib/portal/**`. Esquema en `db/schema.ts`, migraciones con drizzle-kit en `db/migrations/` y políticas RLS y funciones en `db/rls.sql` (repetible). Nunca se ejecuta SQL contra Supabase desde aquí: se da el SQL a Ángel y lo lanza él, primero la migración y después `rls.sql`. Toda acción de admin empieza con `requireAdmin()`. Los textos del portal van en el bloque `portal` de los dos JSON (`getI18n()` en servidor, `usePT()` en cliente).

- **Bolsa de horas**: `bolsa_horas` (horas con dos decimales, `numeric(7,2)`) y `bolsa_movimientos`, un registro por cada apunte (fecha, horas, proyecto opcional, concepto de 1 a 200 caracteres, negativo = corrección). La suma de movimientos cuadra con `horas_consumidas` porque los dos se escriben a la vez en la función de Postgres `registrar_horas()` (SECURITY DEFINER, exige `is_admin()`, bloquea la fila, no deja bajar de 0 ni apuntar a un proyecto de otra empresa). `registrarHoras` en `lib/portal/actions.ts` la llama por RPC. El cliente lee los movimientos de su empresa por RLS y no escribe nunca. La migración 0004 creó un movimiento "Saldo inicial" por cada bolsa con horas consumidas (se guarda en español y se traduce al mostrarlo).
- **Aviso de bolsa baja**: al dejar la bolsa en el 20 % o menos de lo contratado se envía un solo correo a las personas de la empresa (`avisarBolsaBaja` en `lib/portal/email.ts`). `bolsa_horas.ultimo_aviso_bajo` evita repetirlo; se borra al ampliar las horas contratadas o si un apunte sube la bolsa por encima del 20 %. Si el correo falla, el apunte se guarda igual. Cada correo va en el idioma de la persona: `usuarios.idioma` (`es` por defecto), que se guarda al cambiar el idioma en las preferencias del portal (`guardarIdioma` en `lib/portal/actions.ts`).
- **Presupuesto y proyecto**: `proyectos.presupuesto_id` (opcional, único, `on delete set null`) enlaza un proyecto con un presupuesto aceptado de su empresa. El Resumen avisa de los aceptados sin proyecto solo si se aceptaron en los últimos 90 días.
- **Resumen (`/admin`)**: "Pendiente de ti" junta presupuestos enviados sin firmar, aceptados sin proyecto, cobros vencidos, incidencias sin respuesta del admin (más de 2 días laborables) y bolsas al 20 % o menos. La línea "Este mes" usa `resumenCaja()` de `lib/portal/finanzas.ts`, el mismo cálculo que Finanzas.
- **Clientes**: tabla en `/admin/clientes` y alta en un paso con "Nuevo cliente" (`crearCliente`: empresa nueva o existente y primera persona). La invitación por correo (casilla marcada por defecto, también al añadir personas y con "Reenviar invitación") genera el enlace con `auth.admin.generateLink` (`magiclink`) y lo manda por Resend. El enlace apunta a `/auth/entrar?token_hash=...&type=magiclink`, una página con el botón "Entrar" que no canjea nada al abrirse (los filtros de correo no lo gastan); el botón hace POST a `/auth/callback`, que lo canjea con `verifyOtp` y manda a elegir contraseña o a `/portal`. Las personas desactivadas (`banned_until`) no reciben avisos ni invitaciones (`cuentasDesactivadas()` en `lib/portal/cuentas.ts`).
- **Vista de cliente** (`/admin/clientes/[id]/vista`): solo lectura y **sin cambiar de sesión**. Son las consultas del admin filtradas por `empresa_id`, pintadas con los componentes del portal (`IncidenciasLista` con `soloLectura`). Reutiliza los componentes de `components/portal/vistas-cliente.tsx` (los mismos que las páginas del portal, con `enlaces` desactivado), con pestañas `?seccion=` (proyectos, incidencias, horas, presupuestos) al ancho del portal (1080px). Lleva una banda fija con la empresa y el botón de volver, pegada bajo la cabecera.
- **Finanzas**: la gráfica mensual tiene escala mínima de 500 € y líneas de referencia; los meses abreviados llevan siempre 3 letras (`mes3()` en `lib/portal/translate.ts`). `--positive` es el verde del resultado positivo.
- **Cabecera** (`components/portal/shell.tsx`): dos filas en admin y portal. Fila 1, marca a la izquierda y a la derecha "Nuevo" (solo admin), "Ver la web", idioma, tema y "Salir" (en móvil, "Nuevo" y "Salir" quedan en icono). Fila 2, secciones como pestañas con borde inferior de 2px en el acento, con scroll horizontal sin barra en pantallas estrechas.
- **Presupuesto en el proyecto**: el selector ofrece los enviados ("pendiente de firma") y los aceptados de la empresa sin proyecto; los borradores no. "Pendiente de ti" solo avisa de los aceptados.
- **Regex de fecha**: `FECHA` y `MES` viven en `lib/portal/validate.ts`. Ojo con las barras invertidas (`d`, `s`) al escribir regex: sin ellas rechazan todo.
- **Navegación del admin**: botón "Nuevo" con menú (presupuesto, cliente, proyecto, cobro, gasto), enlace "Ver la web" e `/admin/incidencias` con filtros por estado, prioridad y empresa.

## i18n

Añadir una clave: edita **los dos** JSON (`messages/es.json` y `messages/en.json`) y úsala con `t("ruta.anidada")`. El `t()` cae a la ruta si falta la clave.

Añadir un idioma: nuevo JSON + extiende el type `Locale` en `lib/i18n.tsx`.

## Trabajo con el formulario

El formulario (`components/contact.tsx`) envía `name`, `email`, `service` (select obligatorio "¿Qué servicio te interesa?", valor siempre en español) y `message` a **Web3Forms** desde el navegador (`https://api.web3forms.com/submit`), que lo reenvía al Gmail de Ángel. No hay endpoint propio ni variables de entorno: el plan gratuito de Web3Forms no admite envíos desde servidor. La clave (`WEB3FORMS_KEY`) es pública por diseño y vive en `lib/site.ts`. Incluye un honeypot `botcheck` antispam. El `<form>` tiene `action`/`method="POST"` a Web3Forms con `access_key` oculto, así funciona aunque no haya cargado el JS.

**En el panel de Web3Forms, "Captcha Protection" debe estar en `None`.** Si se activa hCaptcha sin montarlo en el frontend, Web3Forms rechaza todos los envíos ("hCaptcha Token is mandatory"). El motivo de cualquier rechazo sale en la consola del navegador como `[contacto]`.

## SEO

- Meta descriptions de home, servicios y blog en `lib/seo.ts`; las de proyectos y artículos salen de su contenido. `og:description` y `twitter:description` coinciden con la meta.
- JSON-LD (`components/json-ld.tsx` + helpers de `lib/seo.ts`): home `WebSite` + `Person`; servicios `Service` + `BreadcrumbList`; proyectos `Article` + `BreadcrumbList`; blog `Blog` y `BlogPosting` + `BreadcrumbList`.
- **hreflang solo "es" y "x-default"** (`alternatesFor()` en `lib/seo.ts`, junto al canonical): el inglés se elige en el navegador sobre la misma URL, no hay URLs `/en/`. Un hreflang "en" hacia la página en español sería un error (decisión de Ángel), y por lo mismo no hay `og:locale:alternate`. Si algún día hay rutas `/en/...`, se añaden en `alternatesFor()`.
- **Favicon e imagen para redes de la home**: `app/favicon.ico`, `app/icon.png` y `app/apple-icon.png` (convención de Next); la imagen OG de la home es `public/og-home.jpg` (`HOME_OG_IMAGE`), con `twitter:card` `summary_large_image`.
- **404**: `app/not-found.tsx`, con la misma nav y footer que el resto; textos en `notFound.*` de los JSON.
- **Nada de testimonios ni datos inventados** publicados como reales. Las cifras de experiencia (3 años, ~60 hoteles, ~120 servidores, ~1.000 usuarios) las dio Ángel el 2026-11-08; si cambian, se actualizan en `about.*` y `hero.lead`.

## Dominio

`SITE_URL` en `lib/site.ts` es la URL pública que usan metadata, `sitemap.xml` y `robots.txt`. Es `https://www.angel-fernandez.es` (con `www`, que es el dominio principal en Vercel). Si cambia, se modifica solo ahí. Los correos (`RESEND_FROM`) salen de `portal@angel-fernandez.es`, así que el dominio tiene que estar verificado en Resend.

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
