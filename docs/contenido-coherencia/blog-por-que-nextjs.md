# por-que-nextjs, texto completo revisado

Sin cambios en slug, título, título SEO, description ni excerpt. Se aplica en `/admin/blog` (artículo publicado).

Cambios pedidos: fuera "nada de actualizaciones" y "no hay actualizaciones del núcleo que rompan el tema" (ahora hay menos piezas que mantener, pero framework, Node y dependencias también se actualizan), el sitemap "se genera desde el código" (ya no "solo"), "sin base de datos expuesta" solo para webs estáticas, "casi siempre" suavizado, y dos imágenes nuevas.

**Pendiente de ti, el caso con cifras de PageSpeed.** No he podido citar PageSpeed Insights de esta web. La API pública respondió "cuota diaria superada" y una pasada local de Lighthouse no es PSI, así que no he puesto ninguna cifra. Cuando tengas el resultado (o me pases una clave de la API de PageSpeed), añado un párrafo al final de "Rendimiento" con las cifras de móvil y escritorio y la fecha de la prueba. No he dejado ningún hueco en el texto.

Imágenes nuevas (WebP de 1600x800, en `imagenes/`), a subir desde el panel:
- `servir-pagina-es.webp` y `servir-pagina-en.webp`, "cómo se sirve una página" (WordPress frente a web estática).
- `piezas-mantener-es.webp` y `piezas-mantener-en.webp`, "qué piezas hay que mantener".

## ES

Cuando me encargan una web, lo primero que decido es con qué la construyo. En la mayoría de los casos elijo Next.js. No es por moda: me da webs más rápidas y más fáciles de mantener que un WordPress con plantilla, y con menos piezas de terceros que vigilar.

## Qué es Next.js, en corto

Next.js es un framework para construir webs con React. Lo mantiene Vercel y lo usan desde proyectos personales hasta empresas muy grandes.

La idea clave es sencilla. En lugar de montar la página en el navegador del visitante, Next.js la prepara antes, al publicar la web o en el servidor. El visitante recibe una página ya hecha, que se pinta al momento.

Con WordPress, cada visita suele pasar por PHP y una base de datos para construir la página. Con caché mejora, pero es una capa más que configurar y mantener.

![Comparativa de cómo se sirve una página. En WordPress, la visita pasa por el servidor, PHP y la base de datos antes de recibir la página, con una caché opcional. En una web estática con Next.js, la página se genera al publicar y se sirve ya hecha desde una red de servidores.](/blog-img/por-que-nextjs/servir-pagina-es.webp "Cómo llega una página al visitante en cada caso.")

## Rendimiento, la web ya está hecha cuando llega la visita

Una web corporativa cambia poco. Las páginas de servicios, de equipo o de contacto son iguales para todo el mundo. Next.js las genera una vez y las sirve como archivos estáticos desde una red de servidores repartida por todo el mundo.

A eso se suma la optimización de imágenes. Next.js convierte cada foto a formatos modernos como AVIF o WebP y la sirve al tamaño justo para cada pantalla. Las fuentes se cargan desde el propio dominio, sin depender de servicios externos.

Este mismo portfolio funciona así. Las páginas se generan al publicar y las imágenes salen en AVIF o WebP. No usa plugins que carguen scripts que nadie ha pedido.

## SEO desde el código

Google tiene en cuenta la velocidad y la experiencia en móvil. Una web rápida parte con ventaja.

Pero el SEO técnico va más allá. En Next.js, cada página define en el propio código su título, su descripción y su imagen para redes. El sitemap se genera desde el código con las rutas de la web, y los datos estructurados que ayudan a Google a entender quién eres se añaden sin plugins.

En WordPress todo esto es posible, pero suele depender de un plugin de SEO, otro de caché y otro de imágenes. Cada uno con sus ajustes, sus actualizaciones y sus conflictos.

## Seguridad, menos piezas, menos puertas

La gran mayoría de los fallos de seguridad de WordPress vienen de plugins y temas. Una web con quince plugins tiene quince piezas de terceros que mantener al día, y basta con que una falle.

Una web estática hecha con Next.js no tiene panel de administración público ni base de datos expuesta. No hay un /wp-admin que los bots puedan atacar probando contraseñas, y la superficie de ataque es mucho más pequeña. Si la web necesita base de datos o zona privada, esa parte hay que protegerla como en cualquier otra tecnología.

## Mantenimiento y despliegue sin sustos

El código vive en un repositorio con control de versiones. Cada cambio queda registrado, qué se tocó, cuándo y por qué.

Cuando subo un cambio, Vercel construye la web y la publica en un par de minutos. Antes puedo revisar una vista previa en una dirección aparte. Y si algo sale mal, volver a la versión anterior es un clic.

Hay menos piezas que mantener que en un WordPress con plugins, pero no hay ninguna que se mantenga sola. El framework, Node y las dependencias también se actualizan, y eso entra en el mantenimiento de la web. La diferencia es que los cambios pasan por una vista previa antes de publicarse, así que una actualización que rompa algo se ve antes de que llegue al visitante.

![Comparativa de qué piezas hay que mantener. En WordPress, el núcleo, el tema, los plugins, PHP y la base de datos. En una web con Next.js, el framework, Node y las dependencias, con vista previa antes de publicar.](/blog-img/por-que-nextjs/piezas-mantener-es.webp "Qué se actualiza en cada caso.")

## Cuándo no lo recomiendo

Next.js no es para todo. Si quieres editar cada día textos, imágenes y páginas por tu cuenta, con un editor visual, WordPress te da más autonomía desde el primer día. Y para una aplicación con usuarios y base de datos, como [Prompt Vault](/proyectos/prompt-vault), que construí con React y Vite, el planteamiento es distinto.

Para una landing estática de un solo producto, como [FlexGrip](/proyectos/flexgrip), prefiero Astro, porque envía muy poco JavaScript al navegador. Next.js lo reservo para webs con más páginas o con parte de aplicación.

Lo mismo con un blog grande con varias personas publicando. Ahí la solución suele ser un punto intermedio, Next.js para la web y un gestor de contenidos aparte (un CMS headless) para que el equipo escriba sin tocar código.

Para una web corporativa, un portfolio o una landing page que cambian de vez en cuando, Next.js gana en la mayoría de los puntos. Qué debe llevar esa web para conseguir clientes lo cuento en [la web de una pyme que consigue clientes](/blog/web-pyme-que-vende).

## Lo que ganas tú

- Una web que carga rápido, también en el móvil y con mala cobertura.
- SEO técnico resuelto desde el principio.
- Menos piezas de terceros y, con ellas, menos riesgos de seguridad.
- Cambios publicados en minutos, con vuelta atrás inmediata.
- Un diseño propio, no una plantilla que comparten miles de webs.

Si estás pensando en crear o renovar la web de tu empresa, echa un vistazo a cómo trabajo en [desarrollo web](/servicios/web) o [escríbeme](/#contact) y lo hablamos.

## EN

When I take on a website, the first decision is what to build it with. In most cases I pick Next.js. It is not about trends: it gives me websites that are faster and easier to maintain than a WordPress theme, with fewer third party parts to watch.

## What Next.js is, in short

Next.js is a framework for building websites with React. It is maintained by Vercel and used by everything from personal projects to very large companies.

The key idea is simple. Instead of building the page in the visitor's browser, Next.js prepares it beforehand, when the site is published or on the server. The visitor gets a ready-made page that shows up instantly.

With WordPress, each visit usually goes through PHP and a database to build the page. Caching helps, but it is one more layer to configure and maintain.

![Comparison of how a page is served. With WordPress, the visit goes through the server, PHP and the database before receiving the page, with an optional cache. With a static Next.js site, the page is generated at publish time and served ready-made from a network of servers.](/blog-img/por-que-nextjs/servir-pagina-en.webp "How a page reaches the visitor in each case.")

## Performance, the page is ready before the visitor arrives

A company website does not change much. The services, team and contact pages are the same for everyone. Next.js generates them once and serves them as static files from a network of servers spread around the world.

Add image optimization to that. Next.js converts every photo to modern formats like AVIF or WebP and serves it at the right size for each screen. Fonts load from your own domain, with no external services involved.

This portfolio works exactly like that. Pages are generated at publish time and images are served as AVIF or WebP. It uses no plugins loading scripts nobody asked for.

## SEO built into the code

Google takes speed and the mobile experience into account. A fast website starts ahead.

But technical SEO goes further. In Next.js, each page defines its title, description and social image in the code itself. The sitemap is generated from the code with the routes of the site, and the structured data that helps Google understand who you are is added without plugins.

All of this is possible in WordPress, but it usually relies on one plugin for SEO, another for caching and another for images. Each with its own settings, updates and conflicts.

## Security, fewer parts, fewer doors

The vast majority of WordPress security issues come from plugins and themes. A site with fifteen plugins has fifteen third-party parts to keep up to date, and it only takes one to fail.

A static website built with Next.js has no public admin panel and no exposed database. There is no /wp-admin for bots to attack by guessing passwords, and the attack surface is much smaller. If the site needs a database or a private area, that part has to be protected as in any other technology.

## Maintenance and deployment without surprises

The code lives in a version-controlled repository. Every change is recorded, what was touched, when and why.

When I push a change, Vercel builds the site and publishes it in a couple of minutes. Before that I can check a preview at a separate address. And if something goes wrong, rolling back is one click.

There are fewer parts to maintain than in a WordPress site with plugins, but none of them maintains itself. The framework, Node and the dependencies also get updated, and that is part of maintaining the site. The difference is that changes go through a preview before they are published, so an update that breaks something is seen before it reaches the visitor.

![Comparison of what has to be maintained. With WordPress, the core, the theme, the plugins, PHP and the database. With a Next.js site, the framework, Node and the dependencies, with a preview before publishing.](/blog-img/por-que-nextjs/piezas-mantener-en.webp "What gets updated in each case.")

## When I do not recommend it

Next.js is not for everything. If you want to edit text, images and pages yourself every day with a visual editor, WordPress gives you more independence from day one. And for an application with users and a database, like [Prompt Vault](/proyectos/prompt-vault), which I built with React and Vite, the approach is different.

For a static single product landing page, like [FlexGrip](/proyectos/flexgrip), I prefer Astro, because it sends very little JavaScript to the browser. I keep Next.js for websites with more pages or an application side.

The same goes for a large blog with several people publishing. There the answer is usually a middle ground, Next.js for the website and a separate content manager (a headless CMS) so the team can write without touching code.

For a company website, a portfolio or a landing page that changes now and then, Next.js wins on most points. What that site needs to win customers is covered in [the small business website that wins customers](/blog/web-pyme-que-vende).

## What you get

- A website that loads fast, even on mobile with poor coverage.
- Technical SEO sorted from the start.
- Fewer third party parts and, with them, fewer security risks.
- Changes published in minutes, with instant rollback.
- A design of your own, not a template shared by thousands of sites.

If you are thinking about building or redesigning your company website, take a look at how I work in [web development](/servicios/web) or [get in touch](/#contact) and we will talk it through.
