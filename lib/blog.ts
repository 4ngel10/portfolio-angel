/**
 * Artículos del blog: listado en /blog (app/blog/page.tsx) y cada uno en /blog/[slug].
 *
 * Igual que los proyectos (lib/projects.ts), el texto va aquí en los dos idiomas y usa
 * los mismos bloques: un string es un párrafo, `{ h3 }`, `{ list }`, `{ ol }` e `{ img }`.
 * Dentro del texto: **negrita** y [enlace](/ruta). Sin em dashes.
 *
 * - `excerpt`: el resumen corto del listado.
 * - `description`: la meta description (buscadores y redes).
 * - `category`: clave de la etiqueta en messages/*.json (blog.cat.<category>).
 * - `ogImage`: imagen para redes, 1200x630, en public/blog/.
 *
 * Añadir un artículo: entrada nueva en BLOG_POSTS. El listado, la página, el sitemap
 * y los datos estructurados salen solos. Los más recientes, primero.
 */

import type { Locale } from "./i18n";
import type { PostSection } from "./projects";

export type BlogCategory = "sistemas" | "desarrollo" | "automatizacion";

export type BlogPostContent = {
  title: string;
  /** Título corto para <title> (≤ 42 caracteres + sufijo). Opcional. */
  seoTitle?: string;
  excerpt: string;
  description: string;
  intro: string;
  sections: PostSection[];
};

export type BlogPost = {
  slug: string;
  category: BlogCategory;
  /** AAAA-MM-DD */
  date: string;
  ogImage: string;
  post: Record<Locale, BlogPostContent>;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "web-pyme-que-vende",
    category: "desarrollo",
    date: "2026-10-26",
    ogImage: "/blog/web-pyme-que-vende-og.jpg",
    post: {
      es: {
        title: "Qué debe tener la web de una pyme para conseguir clientes (y qué sobra)",
        seoTitle: "La web de una pyme que consigue clientes",
        excerpt:
          "Una web de pyme no necesita más páginas, sino menos fricción: qué haces, cómo contactar y pruebas reales. Te cuento qué incluyo y qué dejo fuera.",
        description:
          "Qué debe tener la web de una pyme para conseguir clientes: mensaje claro, contacto visible, velocidad en móvil y SEO local. Y qué elementos sobran en una web de empresa.",
        intro:
          "Una web de pyme no consigue clientes por tener más páginas, más animaciones o más texto. Los consigue cuando alguien que busca lo que haces entiende en pocos segundos qué ofreces, si estás cerca y cómo contactar contigo. Todo lo demás es secundario, y buena parte sobra.",
        sections: [
          {
            heading: "Lo que el visitante busca en cinco segundos",
            blocks: [
              "Quien llega desde Google o desde el móvil no va a leer la web entera. Mira la primera pantalla y decide si se queda. Por eso lo primero que reviso en cualquier web es si esa primera pantalla responde a tres preguntas: qué hace este negocio, dónde trabaja y cómo le contacto.",
              {
                img: "/blog/web-pyme-que-vende/estructura-es.webp",
                alt: "Esquema con los cuatro bloques de la página de una pyme, de arriba abajo: qué haces y dónde, botón de contacto visible, pruebas reales, servicios y formulario corto. Los dos primeros se ven sin hacer scroll.",
                width: 1600,
                height: 800,
                caption: "Orden de los bloques en la página de una pyme.",
              },
              "El botón de contacto tiene que estar a la vista, no escondido en el menú. Llamar, escribir por WhatsApp o pedir presupuesto: da igual cuál, pero que se vea sin buscarlo.",
            ],
          },
          {
            heading: "Velocidad y móvil: la mayoría llega desde el teléfono",
            blocks: [
              "Hoy casi todas las búsquedas locales se hacen desde el móvil, a menudo con prisa y con poca cobertura. Una web que tarda en cargar o que obliga a hacer zoom para leer se abandona antes de ver nada.",
              "Mi regla es sencilla: se diseña primero para el móvil y luego se adapta al ordenador, no al revés. Además, evito lo que más pesa sin aportar: vídeos de fondo, carruseles enormes, imágenes sin optimizar y librerías que se cargan para una sola animación.",
              "Por eso trabajo con Next.js, que genera páginas estáticas muy ligeras. Te explico los motivos en [Por qué elijo Next.js para webs de clientes](/blog/por-que-nextjs).",
            ],
          },
          {
            heading: "Contacto y confianza, sin inventar nada",
            blocks: [
              "La confianza se construye con cosas verificables. Lo que suma:",
              {
                list: [
                  "**Fotos propias** de tu local, tu equipo o tus trabajos, mejor que imágenes de banco.",
                  "**Trabajos reales** descritos con claridad: qué se hizo y cómo. Si todavía no tienes muchos, enseña los que sí tienes.",
                  "**Datos de contacto completos**: teléfono, correo y zona en la que trabajas.",
                  "**Un formulario corto**: nombre, forma de contacto y mensaje. Cada campo extra hace que alguien lo deje a medias.",
                ],
              },
              "Lo que resta: testimonios inventados, cifras sin respaldo o sellos que nadie ha concedido. Si algo no es verdad, no se publica.",
              {
                img: "/blog/web-pyme-que-vende/camino-contacto-es.webp",
                alt: "Comparativa de dos webs. La recargada necesita cinco pasos hasta el contacto: inicio, menú, servicios, contacto y formulario largo. La directa llega al botón o formulario desde el inicio en uno o dos pasos.",
                width: 1600,
                height: 800,
                caption: "Cuantos menos pasos hasta contactar, mejor.",
              },
            ],
          },
          {
            heading: "SEO local básico",
            blocks: [
              "Si tu cliente está en tu zona, tu web tiene que decir dónde estás. Lo esencial es poco y se hace una vez:",
              {
                ol: [
                  "**Un título y una descripción por página** que incluyan lo que haces y la ciudad, por ejemplo: «Reformas en Palma de Mallorca».",
                  "**Una página por servicio importante**, con texto propio y no copiado de otras webs.",
                  "**Datos estructurados y sitemap**, que ayudan a Google a entender de qué va la web. Esto se genera de forma automática y es lo que hago en las webs que construyo.",
                  "**Ficha de Google Business Profile** con los mismos datos que la web: nombre, dirección y teléfono idénticos.",
                ],
              },
              "No hay trucos mágicos. Es una base ordenada, constante y honesta, y suele funcionar mejor que cualquier atajo.",
            ],
          },
          {
            heading: "Lo que sobra",
            blocks: [
              {
                list: [
                  "Menús con muchas páginas que casi nadie visita.",
                  "Animaciones y efectos que retrasan la carga y no ayudan a contactar.",
                  "Textos largos que dicen mucho y no explican nada.",
                  "Un blog abandonado con una sola entrada de hace dos años.",
                ],
              },
              "Una web pequeña y clara, bien mantenida, rinde más que una grande y confusa.",
              "Si quieres que revise la web de tu negocio o crear una desde cero, puedes ver cómo trabajo en [desarrollo web](/servicios/web) o [contarme tu caso](/#contact). Un ejemplo de tienda online sencilla y directa es [FlexGrip](/proyectos/flexgrip).",
            ],
          },
        ],
      },
      en: {
        title: "What a small business website needs to win customers (and what it can do without)",
        excerpt:
          "A small business website does not need more pages, it needs less friction: what you do, how to get in touch and real proof. Here is what I include and what I leave out.",
        description:
          "What a small business website needs to win customers: a clear message, visible contact, mobile speed and local SEO. And which elements a company site can do without.",
        intro:
          "A small business website does not win customers by having more pages, more animations or more text. It wins them when someone searching for what you do understands within seconds what you offer, whether you are nearby and how to contact you. Everything else is secondary, and a good part of it is unnecessary.",
        sections: [
          {
            heading: "What visitors look for in five seconds",
            blocks: [
              "Someone arriving from Google or from their phone will not read the whole site. They look at the first screen and decide whether to stay. That is why the first thing I check on any site is whether that first screen answers three questions: what this business does, where it works and how to contact it.",
              {
                img: "/blog/web-pyme-que-vende/estructura-en.webp",
                alt: "Diagram with the four blocks of a small business page, from top to bottom: what you do and where, visible contact button, real proof, services and short form. The first two are visible without scrolling.",
                width: 1600,
                height: 800,
                caption: "Order of the blocks on a small business page.",
              },
              "The contact button must be in plain sight, not hidden in the menu. Call, WhatsApp or ask for a quote: which one does not matter, as long as it is visible without searching.",
            ],
          },
          {
            heading: "Speed and mobile: most people arrive from a phone",
            blocks: [
              "Today almost all local searches happen on a phone, often in a hurry and with poor coverage. A site that loads slowly or forces you to zoom in to read gets abandoned before anyone sees anything.",
              "My rule is simple: design for mobile first, then adapt to desktop, not the other way round. I also avoid what weighs the most without adding value: background videos, huge carousels, unoptimised images and libraries loaded for a single animation.",
              "That is why I work with Next.js, which generates very light static pages. I explain my reasons in [Why I choose Next.js for client websites](/blog/por-que-nextjs).",
            ],
          },
          {
            heading: "Contact and trust, without making anything up",
            blocks: [
              "Trust is built with things that can be verified. What helps:",
              {
                list: [
                  "**Your own photos** of your premises, your team or your work, better than stock images.",
                  "**Real work** described clearly: what was done and how. If you do not have many yet, show the ones you do have.",
                  "**Complete contact details**: phone, email and the area you work in.",
                  "**A short form**: name, way to contact and message. Every extra field makes someone give up halfway.",
                ],
              },
              "What hurts: invented testimonials, unsupported figures or badges nobody awarded. If something is not true, it does not get published.",
              {
                img: "/blog/web-pyme-que-vende/camino-contacto-en.webp",
                alt: "Comparison of two sites. The cluttered one takes five steps to reach contact: home, menu, services, contact and long form. The direct one gets from home to the button or form in one or two steps.",
                width: 1600,
                height: 800,
                caption: "The fewer steps to get in touch, the better.",
              },
            ],
          },
          {
            heading: "Basic local SEO",
            blocks: [
              "If your customers are in your area, your site has to say where you are. The essentials are few and done once:",
              {
                ol: [
                  "**A title and a description per page** that include what you do and the city, for example: \"Renovations in Palma de Mallorca\".",
                  "**One page per main service**, with its own text and not copied from other sites.",
                  "**Structured data and a sitemap**, which help Google understand what the site is about. These are generated automatically, and it is what I do on the sites I build.",
                  "**A Google Business Profile listing** with the same details as the site: identical name, address and phone.",
                ],
              },
              "There are no magic tricks. It is an orderly, consistent and honest base, and it usually works better than any shortcut.",
            ],
          },
          {
            heading: "What you can do without",
            blocks: [
              {
                list: [
                  "Menus with many pages that almost nobody visits.",
                  "Animations and effects that slow the load and do not help people get in touch.",
                  "Long texts that say a lot and explain nothing.",
                  "An abandoned blog with a single post from two years ago.",
                ],
              },
              "A small, clear, well-maintained site performs better than a big, confusing one.",
              "If you want me to review your business website or build one from scratch, you can see how I work in [web development](/servicios/web) or [tell me about your case](/#contact). A simple, direct online shop example is [FlexGrip](/proyectos/flexgrip).",
            ],
          },
        ],
      },
    },
  },
  {
    slug: "backup-3-2-1",
    category: "sistemas",
    date: "2026-10-18",
    ogImage: "/blog/backup-3-2-1-og.jpg",
    post: {
      es: {
        title: "Backup 3-2-1: qué es y cómo lo aplico en empresas",
        seoTitle: "Backup 3-2-1: qué es y cómo aplicarlo",
        excerpt:
          "Tres copias, dos soportes y una fuera de la oficina. Te explico la regla 3-2-1 y cómo la monto con Nakivo y Acronis.",
        description:
          "Qué es la regla de backup 3-2-1 y cómo aplicarla en tu empresa con Nakivo, Veeam y Acronis. Una estrategia de backup sencilla para no perder datos ni días de trabajo.",
        intro:
          "La regla 3-2-1 cabe en una línea: tres copias de tus datos, en dos soportes distintos y una de ellas fuera de la oficina. Es la base de cualquier estrategia de backup en una empresa. Cuando una copia falla el día que hace falta, casi siempre es porque se saltó uno de esos tres números.",
        sections: [
          {
            heading: "Qué significa cada número",
            blocks: [
              {
                list: [
                  "**3 copias.** El dato original y dos copias más. Si solo tienes una copia y falla justo cuando la necesitas, no tienes nada.",
                  "**2 soportes distintos.** Por ejemplo, el disco del servidor y un NAS, o un NAS y la nube. Cada soporte falla por motivos distintos, así que es difícil que fallen los dos a la vez.",
                  "**1 copia fuera.** Un incendio, una inundación o un robo se llevan por delante todo lo que hay en la oficina, copias incluidas. La copia externa es la que te salva en ese caso.",
                ],
              },
              "Parece mucho, pero se monta una vez y después funciona solo.",
            ],
          },
          {
            heading: "Por qué importa en una empresa pequeña",
            blocks: [
              "El riesgo no es solo que un disco se rompa. El peligro más serio hoy es el ransomware: cifra los archivos y pide un rescate. Y si la copia está en una unidad conectada al servidor, también la cifra.",
              "Luego está el error humano, que es lo más habitual. Alguien borra una carpeta, sobrescribe un Excel o vacía la papelera sin mirar. Con una buena política de copias, eso se arregla en minutos.",
              "Y hay que pensar en lo que cuesta un día parado. Sin correo, sin facturación y sin acceso a los archivos, una oficina no trabaja. La copia de seguridad es lo que convierte ese día en una hora.",
              "Si tu empresa está en Mallorca o en cualquier otra isla, hay un matiz más: la copia externa conviene que esté fuera de la isla. Una tormenta o un corte eléctrico grande afectan a toda la zona a la vez.",
            ],
          },
          {
            heading: "Cómo lo monto con Nakivo",
            blocks: [
              "Para servidores y máquinas virtuales, la herramienta que más uso es **Nakivo Backup & Replication**. Trabaja con VMware y Hyper-V, que son los hipervisores que más me encuentro, y también con servidores físicos.",
              "El esquema tiene tres piezas:",
              {
                ol: [
                  "**Una copia diaria** a un repositorio local, normalmente un NAS. Es la copia rápida: si hay que restaurar algo, sale de aquí en minutos.",
                  "**Una copia secundaria (Backup Copy)** que lleva esas copias a otro sitio, ya sea otra sede o un almacenamiento en la nube. Esa es la copia externa.",
                  "**Copias inmutables.** Configuro el repositorio para que las copias no se puedan borrar ni modificar durante unos días, ni siquiera con una cuenta de administrador. Si entra un ransomware, no puede tocarlas.",
                ],
              },
              "Además, Nakivo manda un informe por correo cada vez que termina un trabajo. Si una copia falla, me entero esa misma mañana, no el día que hace falta restaurar.",
              "Si una empresa ya trabaja con **Veeam**, no lo cambio por cambiar. Lo conozco bien y el esquema es el mismo: copia local, copia externa e inmutabilidad.",
            ],
          },
          {
            heading: "Dónde entra Acronis",
            blocks: [
              "Nakivo brilla con servidores. Para los equipos de los usuarios, sobre todo portátiles que entran y salen de la oficina, prefiero **Acronis**.",
              "El agente se instala en cada equipo y copia a la nube aunque el portátil esté fuera de la red de la empresa. Si a alguien le roban el portátil en un viaje, sus archivos siguen a salvo y se recuperan en un equipo nuevo.",
              "También permite copiar el equipo entero o solo carpetas concretas. Para la mayoría de usuarios basta con los documentos y el escritorio, que es donde de verdad está su trabajo.",
            ],
          },
          {
            heading: "Un ejemplo sin nombres",
            blocks: [
              "Para una oficina de 10 a 20 puestos, con un par de servidores virtualizados, el esquema que propongo es este:",
              {
                list: [
                  "Copia diaria de las máquinas virtuales con Nakivo a un NAS de la oficina, con dos semanas de historial.",
                  "Copia secundaria cada noche a un almacenamiento en la nube fuera de Baleares, inmutable durante 14 días.",
                  "Acronis en los portátiles, con copia a la nube de documentos y escritorio.",
                  "Una copia aparte de Microsoft 365, que Nakivo también cubre, porque si alguien borra un correo, Microsoft solo lo guarda unas semanas.",
                ],
              },
              "Con eso hay tres copias, en tres soportes, y una fuera de la isla. Cumple la regla con margen.",
              "El ejemplo más pequeño que tengo es mi propio [homelab](/proyectos/homelab-proxmox). Proxmox hace una copia completa de cada máquina cada noche, guarda dos en local y sube la más reciente a Google Drive. Es la misma idea, a escala de casa.",
            ],
          },
          {
            heading: "La parte que casi nadie hace: probar",
            blocks: [
              "Una copia que nunca se ha restaurado es una promesa, no una copia. Por eso programo pruebas de restauración periódicas. Recupero una máquina o unos archivos en un entorno aparte y compruebo que todo arranca y se abre bien.",
              "Nakivo ayuda con esto: arranca la máquina desde la copia y te envía una captura de pantalla del sistema ya iniciado. Así sabes que la copia arranca sin tener que restaurarla entera. Aun así, de vez en cuando hago una restauración completa a mano.",
              "Hay una versión ampliada de la regla que lo resume bien: **3-2-1-1-0**. Una copia inmutable más y cero errores en las verificaciones.",
              "Si no tienes claro si tus copias cumplen la regla 3-2-1, [cuéntamelo](/#contact) y lo revisamos juntos. Aquí puedes ver cómo trabajo en [administración de sistemas](/servicios/sistemas#backup).",
            ],
          },
        ],
      },
      en: {
        title: "3-2-1 backup: what it is and how I apply it in companies",
        excerpt:
          "Three copies, two media and one off-site. I explain the 3-2-1 rule and how I set it up with Nakivo and Acronis.",
        description:
          "What the 3-2-1 backup rule is and how to apply it in your company with Nakivo, Veeam and Acronis. A simple backup strategy so you never lose data or days of work.",
        intro:
          "The 3-2-1 rule fits in one line: three copies of your data, on two different media, with one of them off-site. It is the foundation of any company backup strategy. When a backup fails on the day you need it, it is almost always because one of those three numbers was skipped.",
        sections: [
          {
            heading: "What each number means",
            blocks: [
              {
                list: [
                  "**3 copies.** The original data plus two more copies. If you only have one copy and it fails right when you need it, you have nothing.",
                  "**2 different media.** For example, the server disk and a NAS, or a NAS and the cloud. Each medium fails for different reasons, so it is unlikely both fail at once.",
                  "**1 copy off-site.** A fire, a flood or a burglary wipes out everything in the office, backups included. The off-site copy is the one that saves you then.",
                ],
              },
              "It sounds like a lot, but you set it up once and then it runs on its own.",
            ],
          },
          {
            heading: "Why it matters for a small business",
            blocks: [
              "The risk is not just a disk dying. The most serious threat today is ransomware: it encrypts your files and demands a ransom. And if the backup sits on a drive connected to the server, it gets encrypted too.",
              "Then there is human error, the most common one. Someone deletes a folder, overwrites a spreadsheet or empties the recycle bin without looking. With a good backup policy, that is fixed in minutes.",
              "And think about what a day of downtime costs. No email, no invoicing and no access to files means the office simply stops. A backup is what turns that day into an hour.",
              "If your company is in Mallorca or on any other island, there is one more detail: the off-site copy should ideally be off the island. A storm or a major power cut hits the whole area at once.",
            ],
          },
          {
            heading: "How I set it up with Nakivo",
            blocks: [
              "For servers and virtual machines, the tool I use most is **Nakivo Backup & Replication**. It works with VMware and Hyper-V, the hypervisors I come across most, and with physical servers too.",
              "The setup has three parts:",
              {
                ol: [
                  "**A daily backup** to a local repository, usually a NAS. This is the fast copy: if something needs restoring, it comes from here in minutes.",
                  "**A secondary copy (Backup Copy)** that sends those backups somewhere else, either another site or cloud storage. That is the off-site copy.",
                  "**Immutable backups.** I configure the repository so backups cannot be deleted or changed for a number of days, not even with an administrator account. If ransomware gets in, it cannot touch them.",
                ],
              },
              "On top of that, Nakivo emails a report every time a job finishes. If a backup fails, I know that same morning, not on the day I need to restore.",
              "If a company already runs **Veeam**, I do not replace it for the sake of it. I know it well and the setup is the same: local copy, off-site copy and immutability.",
            ],
          },
          {
            heading: "Where Acronis comes in",
            blocks: [
              "Nakivo shines with servers. For users' machines, especially laptops that come and go from the office, I prefer **Acronis**.",
              "The agent runs on each machine and backs up to the cloud even when the laptop is outside the company network. If someone has their laptop stolen on a trip, their files are safe and can be restored to a new machine.",
              "It can back up the whole machine or just specific folders. For most users, documents and desktop are enough, because that is where their work actually lives.",
            ],
          },
          {
            heading: "An example without names",
            blocks: [
              "For an office of 10 to 20 workstations with a couple of virtualized servers, this is the setup I propose:",
              {
                list: [
                  "Daily backup of the virtual machines with Nakivo to a NAS in the office, keeping two weeks of history.",
                  "A secondary copy every night to cloud storage outside the Balearic Islands, immutable for 14 days.",
                  "Acronis on laptops, backing up documents and desktop to the cloud.",
                  "A separate backup of Microsoft 365, which Nakivo also covers, because if someone deletes an email, Microsoft only keeps it for a few weeks.",
                ],
              },
              "That gives you three copies, on three media, with one off the island. It meets the rule with room to spare.",
              "The smallest example I have is my own [homelab](/proyectos/homelab-proxmox). Proxmox takes a full backup of every machine each night, keeps two locally and uploads the latest one to Google Drive. Same idea, at home scale.",
            ],
          },
          {
            heading: "The part almost nobody does: testing",
            blocks: [
              "A backup that has never been restored is a promise, not a backup. That is why I schedule regular restore tests. I recover a machine or some files in a separate environment and check that everything boots and opens properly.",
              "Nakivo helps here: it boots the machine from the backup and sends you a screenshot of the running system. That way you know the backup boots without restoring it in full. Even so, every now and then I do a full restore by hand.",
              "There is an extended version of the rule that sums it up well: **3-2-1-1-0**. One more immutable copy and zero errors in verification.",
              "If you are not sure whether your backups meet the 3-2-1 rule, [tell me about it](/#contact) and we will review them together. You can see how I work in [systems administration](/servicios/sistemas#backup).",
            ],
          },
        ],
      },
    },
  },
  {
    slug: "por-que-nextjs",
    category: "desarrollo",
    date: "2026-10-18",
    ogImage: "/blog/por-que-nextjs-og.jpg",
    post: {
      es: {
        title: "Por qué elijo Next.js para webs de clientes",
        seoTitle: "Por qué uso Next.js en webs de clientes",
        excerpt:
          "Más rápida, más segura y más fácil de mantener que un WordPress con plantilla. Te cuento por qué Next.js es mi opción por defecto.",
        description:
          "Next.js vs WordPress para webs corporativas: rendimiento, SEO, seguridad y mantenimiento. Las ventajas de Next.js y cuándo tiene sentido una web profesional con Next.js.",
        intro:
          "Cuando me encargan una web, lo primero que decido es con qué la construyo. Casi siempre elijo Next.js. No es por moda: me da webs más rápidas, más seguras y más fáciles de mantener que un WordPress con plantilla.",
        sections: [
          {
            heading: "Qué es Next.js, en corto",
            blocks: [
              "Next.js es un framework para construir webs con React. Lo mantiene Vercel y lo usan desde proyectos personales hasta empresas muy grandes.",
              "La idea clave es sencilla. En lugar de montar la página en el navegador del visitante, Next.js la prepara antes, al publicar la web o en el servidor. El visitante recibe una página ya hecha, que se pinta al momento.",
              "Con WordPress, cada visita suele pasar por PHP y una base de datos para construir la página. Con caché mejora, pero es una capa más que configurar y mantener.",
            ],
          },
          {
            heading: "Rendimiento: la web ya está hecha cuando llega la visita",
            blocks: [
              "Una web corporativa cambia poco. Las páginas de servicios, de equipo o de contacto son iguales para todo el mundo. Next.js las genera una vez y las sirve como archivos estáticos desde una red de servidores repartida por todo el mundo.",
              "A eso se suma la optimización de imágenes. Next.js convierte cada foto a formatos modernos como AVIF o WebP y la sirve al tamaño justo para cada pantalla. Las fuentes se cargan desde el propio dominio, sin depender de servicios externos.",
              "Este mismo portfolio funciona así. Todas las páginas se generan al publicar y las imágenes salen en AVIF o WebP. No hay plugins cargando scripts que nadie ha pedido.",
            ],
          },
          {
            heading: "SEO desde el código",
            blocks: [
              "Google tiene en cuenta la velocidad y la experiencia en móvil. Una web rápida parte con ventaja.",
              "Pero el SEO técnico va más allá. En Next.js, cada página define en el propio código su título, su descripción y su imagen para redes. El sitemap se genera solo con todas las rutas, y los datos estructurados que ayudan a Google a entender quién eres se añaden sin plugins.",
              "En WordPress todo esto es posible, pero suele depender de un plugin de SEO, otro de caché y otro de imágenes. Cada uno con sus ajustes, sus actualizaciones y sus conflictos.",
            ],
          },
          {
            heading: "Seguridad: menos piezas, menos puertas",
            blocks: [
              "La gran mayoría de los fallos de seguridad de WordPress vienen de plugins y temas. Una web con quince plugins tiene quince piezas de terceros que mantener al día, y basta con que una falle.",
              "Una web hecha con Next.js no tiene panel de administración público ni base de datos expuesta. No hay un /wp-admin que los bots puedan atacar probando contraseñas. La superficie de ataque es mucho más pequeña.",
            ],
          },
          {
            heading: "Mantenimiento y despliegue sin sustos",
            blocks: [
              "El código vive en un repositorio con control de versiones. Cada cambio queda registrado: qué se tocó, cuándo y por qué.",
              "Cuando subo un cambio, Vercel construye la web y la publica en un par de minutos. Antes puedo revisar una vista previa en una dirección aparte. Y si algo sale mal, volver a la versión anterior es un clic.",
              "No hay actualizaciones del núcleo que rompan el tema, ni plugins que dejen de ser compatibles de un día para otro.",
            ],
          },
          {
            heading: "Cuándo no lo recomiendo",
            blocks: [
              "Next.js no es para todo. Si quieres editar cada día textos, imágenes y páginas por tu cuenta, con un editor visual, WordPress te da más autonomía desde el primer día.",
              "Lo mismo con un blog grande con varias personas publicando. Ahí la solución suele ser un punto intermedio: Next.js para la web y un gestor de contenidos aparte (un CMS headless) para que el equipo escriba sin tocar código.",
              "Para una web corporativa, un portfolio o una landing page que cambian de vez en cuando, Next.js gana en casi todo.",
            ],
          },
          {
            heading: "Lo que ganas tú",
            blocks: [
              {
                list: [
                  "Una web que carga rápido, también en el móvil y con mala cobertura.",
                  "SEO técnico resuelto desde el principio.",
                  "Menos riesgos de seguridad y nada de actualizaciones de plugins.",
                  "Cambios publicados en minutos, con vuelta atrás inmediata.",
                  "Un diseño propio, no una plantilla que comparten miles de webs.",
                ],
              },
              "Si estás pensando en crear o renovar la web de tu empresa, echa un vistazo a cómo trabajo en [desarrollo web](/servicios/web) o [escríbeme](/#contact) y lo hablamos.",
            ],
          },
        ],
      },
      en: {
        title: "Why I choose Next.js for client websites",
        excerpt:
          "Faster, more secure and easier to maintain than a WordPress theme. Here is why Next.js is my default choice.",
        description:
          "Next.js vs WordPress for company websites: performance, SEO, security and maintenance. The advantages of Next.js and when a professional Next.js website makes sense.",
        intro:
          "When I take on a website, the first decision is what to build it with. Almost every time, I pick Next.js. It is not about trends: it gives me websites that are faster, more secure and easier to maintain than a WordPress theme.",
        sections: [
          {
            heading: "What Next.js is, in short",
            blocks: [
              "Next.js is a framework for building websites with React. It is maintained by Vercel and used by everything from personal projects to very large companies.",
              "The key idea is simple. Instead of building the page in the visitor's browser, Next.js prepares it beforehand, when the site is published or on the server. The visitor gets a ready-made page that shows up instantly.",
              "With WordPress, each visit usually goes through PHP and a database to build the page. Caching helps, but it is one more layer to configure and maintain.",
            ],
          },
          {
            heading: "Performance: the page is ready before the visitor arrives",
            blocks: [
              "A company website does not change much. The services, team and contact pages are the same for everyone. Next.js generates them once and serves them as static files from a network of servers spread around the world.",
              "Add image optimization to that. Next.js converts every photo to modern formats like AVIF or WebP and serves it at the right size for each screen. Fonts load from your own domain, with no external services involved.",
              "This portfolio works exactly like that. Every page is generated at publish time and images are served as AVIF or WebP. No plugins loading scripts nobody asked for.",
            ],
          },
          {
            heading: "SEO built into the code",
            blocks: [
              "Google takes speed and the mobile experience into account. A fast website starts ahead.",
              "But technical SEO goes further. In Next.js, each page defines its title, description and social image in the code itself. The sitemap is generated automatically with every route, and the structured data that helps Google understand who you are is added without plugins.",
              "All of this is possible in WordPress, but it usually relies on one plugin for SEO, another for caching and another for images. Each with its own settings, updates and conflicts.",
            ],
          },
          {
            heading: "Security: fewer parts, fewer doors",
            blocks: [
              "The vast majority of WordPress security issues come from plugins and themes. A site with fifteen plugins has fifteen third-party parts to keep up to date, and it only takes one to fail.",
              "A Next.js website has no public admin panel and no exposed database. There is no /wp-admin for bots to attack by guessing passwords. The attack surface is much smaller.",
            ],
          },
          {
            heading: "Maintenance and deployment without surprises",
            blocks: [
              "The code lives in a version-controlled repository. Every change is recorded: what was touched, when and why.",
              "When I push a change, Vercel builds the site and publishes it in a couple of minutes. Before that I can check a preview at a separate address. And if something goes wrong, rolling back is one click.",
              "No core updates breaking the theme, and no plugins that stop being compatible overnight.",
            ],
          },
          {
            heading: "When I do not recommend it",
            blocks: [
              "Next.js is not for everything. If you want to edit text, images and pages yourself every day with a visual editor, WordPress gives you more independence from day one.",
              "The same goes for a large blog with several people publishing. There the answer is usually a middle ground: Next.js for the website and a separate content manager (a headless CMS) so the team can write without touching code.",
              "For a company website, a portfolio or a landing page that changes now and then, Next.js wins on almost everything.",
            ],
          },
          {
            heading: "What you get",
            blocks: [
              {
                list: [
                  "A website that loads fast, even on mobile with poor coverage.",
                  "Technical SEO sorted from the start.",
                  "Fewer security risks and no plugin updates.",
                  "Changes published in minutes, with instant rollback.",
                  "A design of your own, not a template shared by thousands of sites.",
                ],
              },
              "If you are thinking about building or redesigning your company website, take a look at how I work in [web development](/servicios/web) or [get in touch](/#contact) and we will talk it through.",
            ],
          },
        ],
      },
    },
  },
];

export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

/** Minutos de lectura aproximados (unas 200 palabras por minuto). */
export function readingMinutes(content: BlogPostContent) {
  const text = [
    content.intro,
    ...content.sections.flatMap((s) => [
      s.heading ?? "",
      ...s.blocks.map((b) =>
        typeof b === "string"
          ? b
          : "list" in b
            ? b.list.join(" ")
            : "ol" in b
              ? b.ol.join(" ")
              : "h3" in b
                ? b.h3
                : "",
      ),
    ]),
  ].join(" ");
  return Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 200));
}
