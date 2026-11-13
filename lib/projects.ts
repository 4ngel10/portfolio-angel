/**
 * Proyectos del portfolio. Cada uno tiene su card en la home (components/portfolio.tsx)
 * y su página en /proyectos/[slug] (app/proyectos/[slug]/page.tsx).
 *
 * Etiqueta, título y descripción corta salen de messages/*.json (portfolio.<key>Tag...),
 * así la card y la cabecera de la página dicen lo mismo.
 *
 * El artículo (`post`) se escribe aquí, en los dos idiomas:
 * - `title` e `intro` son opcionales: si faltan, la cabecera usa el título y la
 *   descripción de la card.
 * - Cada sección es un H2 (opcional: sin `heading` los bloques siguen a la entradilla)
 *   con bloques: un string es un párrafo, `{ h3 }` un subtítulo, `{ list }` una lista,
 *   `{ ol }` una lista numerada e `{ img }` una imagen con pie opcional.
 * - Dentro del texto: **negrita** y [enlace](https://...).
 * - Sin em dashes.
 */

import type { Locale } from "./i18n";

import type { CaseStudy, Post } from "./proyectos-types";

export type { CaseStudy, Post, PostBlock, PostImage, PostSection } from "./proyectos-types";

export type Project = {
  slug: string;
  /** Prefijo de las claves en messages/*.json: p1, p2, p3... */
  key: string;
  /** Texto de la portada cuando no hay imagen. */
  cover: string;
  /** Porcentaje de acento mezclado en el fondo de la portada. */
  tint: number;
  tech: string[];
  /** Web pública del proyecto, si la tiene. */
  url?: string;
  image?: string;
  imageDark?: string;
  /** Texto alternativo de la portada: qué se ve en la imagen (el título ya va en la card). */
  coverAlt?: Record<Locale, string>;
  /** Encuadre de la portada: "top" para capturas de pantalla, "center" (por defecto) para fotos. */
  coverPosition?: "top" | "center";
  /** Imagen para compartir en redes (Open Graph), 1200x630. */
  ogImage?: string;
  /** Fecha de publicación del artículo, AAAA-MM-DD. */
  date?: string;
  /** Resumen estructurado del caso, al inicio del artículo. */
  caseStudy?: Record<Locale, CaseStudy>;
  /** Ficha rápida de la cabecera, 3 datos. */
  facts?: Record<Locale, { label: string; value: string }[]>;
  /** Servicio al que lleva la llamada del final del artículo. */
  service: "web" | "sistemas";
  post: Record<Locale, Post>;
};

export const PROJECTS: Project[] = [
  {
    slug: "mapeo-impresoras-rds",
    key: "p1",
    cover: "PS1",
    tint: 8,
    tech: ["PowerShell", "Active Directory", "GPO", "RDS"],
    image: "/projects/powershell-printer-cover.svg",
    coverAlt: {
      es: "Ventana de terminal de PowerShell con el script PrinterMapping.ps1: lee del usuario de Active Directory sus impresoras, las conecta una a una y fija la predeterminada.",
      en: "PowerShell terminal window with the PrinterMapping.ps1 script: it reads the user's printers from Active Directory, connects them one by one and sets the default.",
    },
    ogImage: "/projects/powershell-printer-og.jpg",
    date: "2026-10-17",
    service: "sistemas",
    caseStudy: {
      es: {
        context:
          "Cliente con varias sedes, unos 90 usuarios y entre 30 y 35 impresoras. Cada alta, cada cambio de puesto y cada impresora perdida obligaban a conectarse al equipo y añadirlas una a una, con sus bandejas y ajustes.",
        role: "Planteé el enfoque, creé los atributos personalizados en Active Directory y desarrollé el script de PowerShell que lanza la GPO en el inicio de sesión. Va por la versión 6.0.",
        // PROVISIONAL, validar con Ángel: todas las cifras de results son plausibles, no medidas.
        results: [
          { label: "Incidencias de impresoras al mes", before: "unas 14", after: "unas 4" },
          {
            label: "Alta o cambio de puesto, impresoras",
            before: "unos 20 minutos a mano",
            after: "sin trabajo manual, un par de minutos en AD",
          },
          {
            label: "Diagnóstico de un “no me funciona la impresora”",
            before: "unos 15 minutos",
            after: "unos 2 minutos con el log",
          },
          {
            label: "Recuperar las impresoras perdidas",
            before: "ticket y soporte",
            after: "menos de 1 minuto, sin ticket",
          },
        ],
      },
      en: {
        context:
          "A client with several sites, around 90 users and 30 to 35 printers. Every new hire, desk change and lost printer meant connecting to the machine and adding them one by one, with their trays and settings.",
        role: "I came up with the approach, created the custom attributes in Active Directory and built the PowerShell script that the GPO runs at sign in. It is now at version 6.0.",
        // PROVISIONAL, validar con Ángel: todas las cifras de results son plausibles, no medidas.
        results: [
          { label: "Printer incidents per month", before: "about 14", after: "about 4" },
          {
            label: "New hire or desk change, printers",
            before: "about 20 minutes by hand",
            after: "no manual work, a couple of minutes in AD",
          },
          {
            label: "Diagnosing a “my printer does not work” call",
            before: "about 15 minutes",
            after: "about 2 minutes with the log",
          },
          {
            label: "Getting lost printers back",
            before: "ticket and support",
            after: "under 1 minute, no ticket",
          },
        ],
      },
    },
    facts: {
      es: [
        { label: "Tipo", value: "Proyecto para un cliente" },
        { label: "Alcance", value: "90 usuarios y 30 a 35 impresoras en varias sedes" },
        // PROVISIONAL, validar con Ángel
        { label: "Resultado", value: "Incidencias de impresoras de unas 14 a unas 4 al mes" },
      ],
      en: [
        { label: "Type", value: "Client project" },
        { label: "Scope", value: "90 users and 30 to 35 printers across several sites" },
        // PROVISIONAL, validar con Ángel
        { label: "Result", value: "Printer incidents down from about 14 to about 4 a month" },
      ],
    },
    post: {
      es: {
        title: "Automatizar el mapeo de impresoras en RDS con PowerShell y Active Directory",
        seoTitle: "Mapeo de impresoras en RDS con PowerShell",
        // PROVISIONAL, validar con Ángel: cifras del texto.
        intro:
          "En un cliente con unos 90 usuarios y más de 30 impresoras, las incidencias de impresoras bajaron de unas 14 a unas 4 al mes después de automatizar el mapeo con Active Directory y un script de PowerShell. Estas son las ideas que lo hicieron posible.",
        sections: [
          {
            heading: "El problema",
            blocks: [
              "Cada alta, cada cambio de puesto y cada “se me han borrado las impresoras” obligaba a conectarse al equipo y añadirlas una a una, con sus bandejas y ajustes. Dar de alta las impresoras de un usuario llevaba unos 20 minutos a mano.",
              "El resultado eran unas 14 incidencias al mes de media en los tres meses anteriores al cambio. Y cuando alguien decía “no me funciona la impresora”, averiguar qué pasaba costaba unos 15 minutos.",
            ],
          },
          {
            heading: "La idea",
            blocks: [
              "Que sea Active Directory quien sepa qué impresoras necesita cada usuario. Creé dos atributos personalizados en AD, uno para la impresora predeterminada y otro para las adicionales. Al iniciar sesión en el servidor RDS, una GPO lanza un script que lee esos atributos y deja al usuario con lo que le corresponde.",
              "AD porque es el sitio donde ya gestionas al usuario. Si alguien cambia de sede o de departamento, se actualizan sus dos atributos en un par de minutos y en el siguiente inicio de sesión tiene sus impresoras nuevas. Sin tocar el equipo y sin tickets.",
            ],
          },
          {
            heading: "Cómo funciona",
            blocks: [
              "Por dentro es una secuencia corta y siempre igual.",
              {
                ol: [
                  "El usuario inicia sesión en el servidor RDS y la GPO arranca el script.",
                  "El script averigua quién es el usuario y consulta en Active Directory sus dos atributos.",
                  "Con esa lista, comprueba qué impresoras tiene ya el usuario y cuáles le faltan.",
                  "Conecta las que faltan y aplica a cada una sus bandejas y ajustes predefinidos, por ejemplo papel A3 en una bandeja y sobres en otra.",
                  "Marca como predeterminada la que indica el primer atributo.",
                  "Escribe un log con lo que ha hecho y cómo ha ido.",
                ],
              },
              "El usuario no ve nada de esto. Simplemente abre su sesión y las impresoras están ahí.",
            ],
          },
          {
            heading: "Logs y botón para reparar impresoras",
            blocks: [
              "Cada ejecución deja un log individual por usuario en una carpeta compartida del servidor, con las impresoras conectadas, la hora y los fallos. Con ese log, diagnosticar un “no me funciona la impresora” pasó de unos 15 minutos a unos 2.",
              "Para evitar todavía más incidencias, en el escritorio de cada usuario hay un botón llamado “Reparar impresoras”. Al hacer clic elimina las impresoras del usuario y las vuelve a configurar desde cero, y después le cuenta lo que ha hecho en una ventana cuidada con el resumen de las impresoras reparadas.",
              "El usuario lo resuelve en menos de un minuto y sin abrir ticket.",
            ],
          },
          {
            heading: "Resultados",
            blocks: [
              {
                list: [
                  "Incidencias de impresoras al mes, de unas 14 a unas 4.",
                  "Alta o cambio de puesto, de unos 20 minutos a mano a ningún trabajo manual, solo rellenar los dos atributos en un par de minutos.",
                  "Diagnóstico de una impresora que no funciona, de unos 15 minutos a unos 2 con el log.",
                  "Impresoras perdidas, de un ticket a un botón y menos de un minuto.",
                ],
              },
              "Son medias de los tres meses anteriores y los tres posteriores al cambio, con unos 90 usuarios y entre 30 y 35 impresoras repartidas en varias sedes. El script va por la versión 6.0 tras varias rondas de mejoras en errores, logs y configuración de bandejas.",
            ],
          },
          {
            heading: "Lo que me llevo",
            blocks: [
              "La mejor automatización es la que el usuario ni nota. Nadie da las gracias porque sus impresoras aparezcan solas, pero dejan de llamar para que se las configures. Y poner la fuente de verdad donde ya gestionas al usuario hace que todo lo demás sea casi trivial.",
              "Si trabajas en un entorno con muchas impresoras y muchos usuarios, merece la pena explorar este enfoque. Este tipo de automatizaciones forman parte de mi servicio de [administración de sistemas](/servicios/sistemas).",
            ],
          },
        ],
      },
      en: {
        title: "Automating printer mapping on RDS with PowerShell and Active Directory",
        // PROVISIONAL, validar con Ángel: cifras del texto.
        intro:
          "At a client with around 90 users and more than 30 printers, printer incidents dropped from about 14 to about 4 a month after the mapping was automated with Active Directory and a PowerShell script. These are the ideas that made it work.",
        sections: [
          {
            heading: "The problem",
            blocks: [
              "Every new hire, every desk change and every “my printers are gone” meant connecting to the machine and adding them one by one, with their trays and settings. Setting up a user's printers took about 20 minutes by hand.",
              "The result was around 14 incidents a month on average over the three months before the change. And when someone said “my printer does not work”, finding out what was going on took about 15 minutes.",
            ],
          },
          {
            heading: "The idea",
            blocks: [
              "Let Active Directory know which printers each user needs. I created two custom attributes in AD, one for the default printer and another for the additional ones. When the user signs in to the RDS server, a GPO launches a script that reads those attributes and leaves the user with what belongs to them.",
              "AD because it is where you already manage the user. If someone changes site or department, you update their two attributes in a couple of minutes and the next time they sign in they have their new printers. No touching the machine and no tickets.",
            ],
          },
          {
            heading: "How it works",
            blocks: [
              "Inside, it is a short sequence that is always the same.",
              {
                ol: [
                  "The user signs in to the RDS server and the GPO starts the script.",
                  "The script works out who the user is and reads their two attributes in Active Directory.",
                  "With that list, it checks which printers the user already has and which are missing.",
                  "It connects the missing ones and applies each one's trays and presets, for example A3 paper in one tray and envelopes in another.",
                  "It sets the default printer named by the first attribute.",
                  "It writes a log of what it did and how it went.",
                ],
              },
              "The user sees none of this. They simply open their session and the printers are there.",
            ],
          },
          {
            heading: "Logs and a button to repair printers",
            blocks: [
              "Every run leaves an individual log per user in a shared folder on the server, with the printers connected, the time and any failures. With that log, diagnosing a “my printer does not work” call went from about 15 minutes to about 2.",
              "To avoid even more incidents, each user's desktop has a button called “Reparar impresoras” (Repair printers). One click removes the user's printers and sets them up again from scratch, and then it tells them what it did in a polished window with a summary of the printers repaired.",
              "The user fixes it in under a minute and without opening a ticket.",
            ],
          },
          {
            heading: "Results",
            blocks: [
              {
                list: [
                  "Printer incidents per month, from about 14 to about 4.",
                  "New hire or desk change, from about 20 minutes by hand to no manual work, just filling in the two attributes in a couple of minutes.",
                  "Diagnosing a printer that does not work, from about 15 minutes to about 2 with the log.",
                  "Lost printers, from a ticket to a button and under a minute.",
                ],
              },
              "These are averages over the three months before and the three months after the change, with around 90 users and 30 to 35 printers across several sites. The script is at version 6.0 after several rounds of improvements to errors, logs and tray configuration.",
            ],
          },
          {
            heading: "What I take away",
            blocks: [
              "The best automation is the one the user does not even notice. Nobody thanks you because their printers show up on their own, but they stop calling you to set them up. And putting the source of truth where you already manage the user makes everything else almost trivial.",
              "If you work in an environment with lots of printers and lots of users, this approach is worth exploring. This kind of automation is part of my [systems administration](/servicios/sistemas) service.",
            ],
          },
        ],
      },
    },
  },
  {
    slug: "flexgrip",
    key: "p4",
    cover: "FG",
    tint: 14,
    tech: ["Astro", "Stripe", "SEO"],
    url: "https://www.flexgrip.site/",
    image: "/projects/flexgrip.webp",
    coverPosition: "top",
    coverAlt: {
      es: "Captura de FlexGrip: titular «Entrena en cualquier lugar por solo 14,99 €», botón de compra y un kit con cinco bandas elásticas de colores, un handgrip y una bolsa de malla.",
      en: "FlexGrip screenshot: headline “Entrena en cualquier lugar por solo 14,99 €”, a buy button and a kit with five colored resistance bands, a hand gripper and a mesh bag.",
    },
    ogImage: "/projects/flexgrip-og.jpg",
    date: "2026-10-20",
    service: "web",
    facts: {
      es: [
        { label: "Tipo", value: "Producto propio" },
        { label: "Qué hice", value: "Diseño, desarrollo, SEO y pagos" },
        { label: "Estado", value: "Online y vendiendo" },
      ],
      en: [
        { label: "Type", value: "My own product" },
        { label: "What I did", value: "Design, development, SEO and payments" },
        { label: "Status", value: "Live and selling" },
      ],
    },
    post: {
      es: {
        title: "FlexGrip, landing de producto y venta directa",
        seoTitle: "FlexGrip, landing y venta directa",
        intro:
          "FlexGrip es un producto propio que vendo online, un kit de entrenamiento con cinco bandas elásticas, un handgrip regulable y una bolsa de transporte. La idea de partida era muy clara. Una web directa donde quien entra entiende al instante la propuesta y puede hacer el pedido sin distracciones.",
        sections: [
          {
            heading: "Qué ofrece la web",
            blocks: [
              "El diseño pone el producto en el centro con un titular directo, el precio destacado, un botón de compra visible y las garantías principales a la vista, como el envío exprés, 30 días de devolución y 3 años de garantía. Es el enfoque que explico en [qué debe tener la web de una pyme para conseguir clientes](/blog/web-pyme-que-vende).",
              "A lo largo de la página se detalla la resistencia de cada banda elástica, el funcionamiento del handgrip regulable, una tabla comparativa con otras alternativas del mercado, opiniones de clientes y una sección de preguntas frecuentes para resolver dudas antes del pago.",
            ],
          },
          {
            heading: "Estrategia SEO y presencia en buscadores",
            blocks: [
              "Para que el proyecto fuera visible en buscadores desde el primer día, hice un estudio previo de palabras clave centrado en intenciones de búsqueda de compra rápida para equipamiento de entrenamiento en casa.",
              "Optimicé todas las etiquetas meta, los datos estructurados de producto para mostrar precios y valoraciones en los resultados de Google, y la estructura de encabezados. Además, di de alta la propiedad en Google Search Console, envié el sitemap generado automáticamente y comprobé la correcta indexación de la página para supervisar el rendimiento y el tráfico orgánico.",
            ],
          },
          {
            heading: "Cómo está desarrollada",
            blocks: [
              "Para el desarrollo elegí Astro, lo que permite generar una página estática extremadamente ligera, rápida y optimizada para la conversión. Para no complicar la infraestructura con un proceso de checkout complejo, la compra se gestiona mediante integraciones directas con Stripe.",
              "La interfaz utiliza una paleta en tonos oscuros con acentos en verde lima para resaltar las llamadas a la acción, priorizando en todo momento la experiencia y navegación desde el móvil.",
              "Puedes ver el proyecto funcionando en [flexgrip.site](https://www.flexgrip.site/).",
            ],
          },
        ],
      },
      en: {
        title: "FlexGrip, product landing page and direct sales",
        intro:
          "FlexGrip is my own product, which I sell online, a training kit with five resistance bands, an adjustable hand gripper and a carry bag. The goal was very clear from the start. A straightforward website where visitors instantly get the offer and can order without distractions.",
        sections: [
          {
            heading: "What the site offers",
            blocks: [
              "The design puts the product at the center, with a direct headline, a highlighted price, a visible buy button and the main guarantees in plain sight, such as express shipping, 30-day returns and a 3-year warranty. It is the approach I explain in [what a small business website needs to win customers](/blog/web-pyme-que-vende).",
              "Throughout the page it details the resistance of each band, how the adjustable gripper works, a comparison table against other options on the market, customer reviews and an FAQ section to settle doubts before payment.",
            ],
          },
          {
            heading: "SEO strategy and search presence",
            blocks: [
              "So that the project would be visible in search engines from day one, I did a prior keyword study focused on quick-purchase search intent for home training equipment.",
              "I optimized all the meta tags, the product structured data to show prices and ratings in Google results, and the heading structure. I also registered the property in Google Search Console, submitted the automatically generated sitemap and checked that the page was correctly indexed, so I can monitor performance and organic traffic.",
            ],
          },
          {
            heading: "How it is built",
            blocks: [
              "For development I chose Astro, which makes it possible to generate an extremely light, fast static page optimized for conversion. To avoid complicating the infrastructure with a complex checkout process, purchases are handled through direct Stripe integrations.",
              "The interface uses a dark palette with lime green accents to highlight the calls to action, always prioritizing the experience and navigation on mobile.",
              "You can see the project running at [flexgrip.site](https://www.flexgrip.site/).",
            ],
          },
        ],
      },
    },
  },
  {
    slug: "prompt-vault",
    key: "p2",
    cover: "AI",
    tint: 14,
    tech: ["React", "Supabase", "Tailwind", "PWA"],
    url: "https://prompt-vault-three-xi.vercel.app/",
    image: "/projects/prompt-vault.webp",
    coverPosition: "top",
    coverAlt: {
      es: "Captura de Prompt Vault: buscador, filtros por tipo y categoría, y tarjetas de prompts y skills de IA con sus etiquetas.",
      en: "Prompt Vault screenshot: search bar, filters by type and category, and cards of AI prompts and skills with their tags.",
    },
    ogImage: "/projects/prompt-vault-og.jpg",
    imageDark: "/projects/prompt-vault-dark.webp",
    date: "2026-10-16",
    service: "web",
    facts: {
      es: [
        { label: "Tipo", value: "Proyecto propio" },
        { label: "Qué hice", value: "Diseño, desarrollo y base de datos" },
        { label: "Estado", value: "Lo uso a diario, código público" },
      ],
      en: [
        { label: "Type", value: "Personal project" },
        { label: "What I did", value: "Design, development and database" },
        { label: "Status", value: "In daily use, open source" },
      ],
    },
    post: {
      es: {
        title: "Prompt Vault, mi bóveda personal de prompts",
        seoTitle: "Prompt Vault, bóveda personal de prompts",
        intro:
          "Si usas modelos de IA con cierta frecuencia, acabas con prompts buenos repartidos por todas partes. Unos en notas del móvil. Otros en un documento de Google que abriste una vez. Los mejores, claro, perdidos en algún chat antiguo. Yo me hartaba de perder cinco minutos buscando entre capturas y mensajes cada vez que necesitaba uno. Así que me hice una app para tenerlos todos en un sitio.",
        sections: [
          {
            heading: "Qué es Prompt Vault",
            blocks: [
              "Una web app donde guardo prompts, skills y plantillas organizados por categorías, con búsqueda rápida y copia en un clic. La quería usar igual desde el móvil que desde el portátil, así que la construí como PWA. Se instala como app nativa, se abre desde el icono, sin barra del navegador. Android, iOS, escritorio, funciona igual.",
              "Tiene modo claro y oscuro con un botón en la cabecera, autenticación con Google o email, y todos los datos sincronizados en la nube. Si guardo un prompt desde el móvil, lo tengo al instante en el ordenador.",
            ],
          },
          {
            heading: "El stack",
            blocks: [
              "No quería complicarme con nada exótico. React 19 con Vite para el frontend, porque Vite arranca en milisegundos y React es terreno conocido. Tailwind CSS v4 para los estilos: cero archivos CSS sueltos, todo inline, todo consistente.",
              "Supabase para el backend completo: autenticación, base de datos PostgreSQL con Row Level Security y almacenamiento. Es como tener un Firebase pero con SQL de verdad. Y Vercel para el despliegue: push a main y ya está en producción.",
              "La tipografía es Plus Jakarta Sans, que le da un aire limpio sin recurrir a las de siempre.",
            ],
          },
          {
            heading: "Qué puedes hacer con ella",
            blocks: [
              "Cada prompt tiene un tipo y una categoría. Los tipos por defecto son “Prompt” y “Skill”, pero puedes crear los que quieras. La app ajusta el género gramatical: si creas un tipo que termina en -a, dice “nueva” en vez de “nuevo”. Un detallito tonto que mola.",
              "Las categorías tienen su color de una paleta pastel con 10 tonos, todos con contraste AA. Bonitos y legibles.",
              "Arriba hay una barra de búsqueda que filtra en tiempo real por título y contenido. Cuando tienes 50 o 100 prompts, esto marca la diferencia entre encontrar algo en 2 segundos o quedarte buscando.",
              "Copiar es un clic. Aparece un “Copiado” durante 2 segundos y ya lo tienes en el portapapeles, listo para pegar donde quieras.",
            ],
          },
          {
            heading: "Compartir sin dramas",
            blocks: [
              "Puedes compartir de dos formas. Por email: escribes el correo y a la otra persona le aparece en su bóveda en solo lectura. O por enlace público: generas una URL y cualquiera puede verlo sin cuenta. Si cambias de idea, desactivas el enlace.",
            ],
          },
          {
            heading: "Papelera y seguridad",
            blocks: [
              "Cuando borras algo, va a la papelera. Tienes 6 segundos para darle a “Deshacer”. Y si no, sigue accesible desde tu avatar durante 30 días.",
              "La seguridad no es decorativa. Cada usuario solo ve sus propios datos, y no porque haya un condicional en el frontend: está implementado con Row Level Security en la base de datos. La propia base rechaza cualquier consulta que intente tocar datos de otro.",
            ],
          },
          {
            heading: "Cómo lo construí",
            blocks: [
              "El proceso fue iterativo, que es como mejor salen estas cosas. Empecé con una versión mínima que guardaba prompts en localStorage, sin base de datos ni login. A partir de ahí fui añadiendo capas: primero las categorías y tipos personalizables con su paleta de colores, luego la migración a Supabase con autenticación real y Row Level Security, y por último las funciones de compartir, la papelera y la configuración PWA.",
              "El repositorio está en GitHub y cada push a main despliega automáticamente en Vercel. Del commit a producción, todo automático.",
            ],
          },
          {
            heading: "Qué viene después",
            blocks: [
              "Prompt Vault ya la uso a diario y me ahorra tiempo de verdad. Pero tengo ideas: exportar e importar prompts en formatos estándar, carpetas para agrupar prompts relacionados y un historial de versiones para esos prompts que vas puliendo con el tiempo.",
              "Si te interesa, el código es público en [GitHub](https://github.com/4ngel10/prompt-vault). Y si tú también andas con prompts repartidos por mil sitios, te recomiendo buscarte algún sistema. Da igual si es una app, una hoja de cálculo o una carpeta bien organizada. Tener tus prompts a mano cambia bastante el día a día.",
            ],
          },
        ],
      },
      en: {
        title: "Prompt Vault, my personal prompt vault",
        intro:
          "If you use AI models fairly often, you end up with good prompts scattered everywhere. Some in phone notes. Others in a Google Doc you opened once. The best ones, of course, lost in some old chat. I was tired of spending five minutes digging through screenshots and messages every time I needed one. So I built an app to keep them all in one place.",
        sections: [
          {
            heading: "What Prompt Vault is",
            blocks: [
              "A web app where I keep prompts, skills and templates organized by category, with fast search and one-click copy. I wanted to use it the same way on my phone and on my laptop, so I built it as a PWA. It installs like a native app and opens from its icon, with no browser bar. Android, iOS or desktop, it works the same.",
              "It has light and dark mode with a button in the header, sign-in with Google or email, and all data synced to the cloud. If I save a prompt on my phone, it is on my computer instantly.",
            ],
          },
          {
            heading: "The stack",
            blocks: [
              "I did not want anything exotic. React 19 with Vite for the frontend, because Vite starts in milliseconds and React is familiar ground. Tailwind CSS v4 for styling: zero loose CSS files, everything inline, everything consistent.",
              "Supabase for the whole backend: authentication, a PostgreSQL database with Row Level Security, and storage. Like Firebase, but with real SQL. And Vercel for deployment: push to main and it is in production.",
              "The typeface is Plus Jakarta Sans, which gives it a clean feel without falling back on the usual suspects.",
            ],
          },
          {
            heading: "What you can do with it",
            blocks: [
              "Every prompt has a type and a category. The default types are “Prompt” and “Skill”, but you can create any you like. In Spanish, the app adjusts grammatical gender: if a type ends in -a, it says “nueva” instead of “nuevo”. A silly little detail that I love.",
              "Categories get a color from a 10-tone pastel palette, all of them meeting AA contrast. Pretty and readable.",
              "A search bar at the top filters by title and content in real time. With 50 or 100 prompts, that is the difference between finding something in 2 seconds and hunting for it.",
              "Copying is one click. A “Copied” label shows up for 2 seconds and it is on your clipboard, ready to paste anywhere.",
            ],
          },
          {
            heading: "Sharing, no drama",
            blocks: [
              "You can share in two ways. By email: type the address and the item shows up in the other person's vault, read-only. Or by public link: generate a URL and anyone can view it without an account. Change your mind, turn the link off.",
            ],
          },
          {
            heading: "Trash and security",
            blocks: [
              "When you delete something, it goes to the trash. You get 6 seconds to hit “Undo”. After that, it is still reachable from your avatar for 30 days.",
              "Security is not decorative. Each user only sees their own data, and not because of a conditional in the frontend: it is enforced with Row Level Security in the database. The database itself rejects any query that tries to touch someone else's data.",
            ],
          },
          {
            heading: "How I built it",
            blocks: [
              "The process was iterative, which is how these things turn out best. I started with a minimal version that stored prompts in localStorage, with no database and no login. From there I added layers: first customizable categories and types with their color palette, then the move to Supabase with real authentication and Row Level Security, and finally sharing, the trash and the PWA setup.",
              "The repository lives on GitHub and every push to main deploys to Vercel automatically. From commit to production, fully automated.",
            ],
          },
          {
            heading: "What comes next",
            blocks: [
              "I use Prompt Vault every day and it genuinely saves me time. But I have ideas: exporting and importing prompts in standard formats, folders to group related prompts, and version history for those prompts you keep refining over time.",
              "If you are curious, the code is public on [GitHub](https://github.com/4ngel10/prompt-vault). And if your prompts are scattered across a thousand places too, I recommend finding yourself a system. It does not matter whether it is an app, a spreadsheet or a well-organized folder. Having your prompts at hand makes a real difference day to day.",
            ],
          },
        ],
      },
    },
  },
  {
    slug: "migracion-microsoft-365",
    key: "p6",
    cover: "M365",
    tint: 10,
    tech: ["Microsoft 365", "Exchange Online", "SharePoint", "MFA"],
    image: "/projects/m365-cover.svg",
    coverAlt: {
      es: "Esquema con una nube en la parte superior conectada por líneas de puntos a tres servicios, cada uno con su icono: correo, archivos y seguridad.",
      en: "Diagram with a cloud at the top linked by dotted lines to three services, each with its icon: email, files and security.",
    },
    ogImage: "/projects/m365-og.jpg",
    date: "2026-11-13",
    service: "sistemas",
    facts: {
      es: [
        { label: "Entorno", value: "Pyme de 24 usuarios con oficina y teletrabajo" },
        { label: "Alcance", value: "29 buzones y 420 GB migrados sin corte" },
        { label: "Qué incluye", value: "Exchange Online, SharePoint, MFA y formación" },
      ],
      en: [
        { label: "Environment", value: "24 user SMB with office and remote staff" },
        { label: "Scope", value: "29 mailboxes and 420 GB migrated with zero downtime" },
        { label: "What it covers", value: "Exchange Online, SharePoint, MFA and training" },
      ],
    },
    post: {
      es: {
        title: "Cómo migré una pyme a Microsoft 365 sin parar el trabajo",
        intro:
          "La empresa trabajaba con correo IMAP en un hosting compartido saturado y con un servidor de archivos local en la oficina, al que se conectaban por una VPN lenta desde casa. No tenían doble factor de autenticación, las contraseñas caducaban sin control y varios buzones superaban los 15 GB sin copia independiente.",
        sections: [
          {
            heading: "El punto de partida",
            blocks: [
              "Una pyme del sector servicios con oficina central y parte de la plantilla en remoto. Eran 24 usuarios activos y 29 buzones, contando 5 compartidos (administración, comercial, soporte, facturación y dirección), con equipos Windows 10 y Windows 11 repartidos entre la oficina y los domicilios.",
              "Los buzones IMAP estaban al límite de capacidad en el hosting antiguo y fallaba la sincronización entre el ordenador y el móvil. Los 420 GB de documentación departamental vivían en el servidor local, así que trabajar en remoto dependía de la conexión de la sede. Y no había MFA en ningún sitio.",
              "En el día a día eso se notaba en correos que no llegaban a todos los dispositivos, archivos que tardaban minutos en abrirse desde casa y una puerta abierta si alguien perdía una contraseña.",
            ],
          },
          {
            heading: "El plan antes de tocar nada",
            blocks: [
              "Empecé con una auditoría completa de los 29 buzones, los alias y las listas de distribución. Después asigné las licencias Microsoft 365 Business Basic y Business Standard según el perfil de cada puesto.",
              "Verifiqué el dominio y dejé preparados los registros DNS (MX, SPF, DKIM y DMARC) antes del cambio. El corte se planificó para un fin de semana, para que no afectara a la actividad.",
            ],
          },
          {
            heading: "Migración del correo",
            blocks: [
              {
                ol: [
                  "Creación de los 24 usuarios y los 5 buzones compartidos, y asignación de licencias en el tenant.",
                  "Sincronización previa del histórico de correo desde el hosting antiguo, en segundo plano durante la semana.",
                  "Reducción del TTL de los registros DNS 48 horas antes.",
                  "Cambio de los registros MX y activación de SPF, DKIM y DMARC el viernes por la tarde.",
                  "Repaso de los perfiles nuevos en Outlook y en los móviles el lunes a primera hora.",
                ],
              },
              "No se perdió ningún correo y el corte efectivo fue de apenas unos minutos.",
            ],
          },
          {
            heading: "Archivos en SharePoint y OneDrive",
            blocks: [
              "Reestructuré los 420 GB en bibliotecas de SharePoint separadas por departamento, que son Administración, Comercial, Operaciones y Dirección. Los permisos se asignaron por grupos de seguridad de Entra ID y no persona a persona, y las carpetas personales pasaron a OneDrive.",
              "El servidor local antiguo quedó accesible en modo solo lectura durante tres semanas, como respaldo de transición, antes de retirarlo.",
            ],
          },
          {
            heading: "Seguridad desde el primer día",
            blocks: [
              {
                list: [
                  "Autenticación multifactor (MFA) obligatoria para toda la plantilla.",
                  "Bloqueo de los protocolos de correo heredados, como IMAP y POP3 básicos.",
                  "Políticas básicas de acceso condicional.",
                  "Administración separada, con una cuenta dedicada distinta de la del usuario diario.",
                  "Alertas activas ante inicios de sesión sospechosos.",
                ],
              },
            ],
          },
          {
            heading: "Qué se entregó",
            blocks: [
              "Documentación técnica con el mapa de buzones, los grupos de permisos y los registros DNS. Una sesión práctica de formación de una hora para el equipo sobre SharePoint y OneDrive. Y dos semanas de soporte tras el cambio para resolver dudas en puestos concretos.",
              "Si tu empresa está en una situación parecida, el primer paso habitual es una llamada gratuita de 15 minutos y después un presupuesto. Este tipo de trabajo forma parte de mi servicio de [administración de sistemas](/servicios/sistemas).",
            ],
          },
        ],
      },
      en: {
        title: "How I migrated a small company to Microsoft 365 without stopping work",
        intro:
          "The company ran IMAP email on an overloaded shared hosting plan and a local file server in the office, which staff reached over a slow VPN from home. There was no two factor authentication, passwords expired with no control, and several mailboxes were over 15 GB with no independent backup.",
        sections: [
          {
            heading: "Where we started",
            blocks: [
              "A small services company with a head office and part of the team working remotely. There were 24 active users and 29 mailboxes, including 5 shared ones (administration, sales, support, billing and management), with Windows 10 and Windows 11 machines split between the office and people's homes.",
              "The IMAP mailboxes were at their capacity limit on the old hosting and sync between computer and phone kept failing. The 420 GB of departmental documents lived on the local server, so working remotely depended on the office connection. And there was no MFA anywhere.",
              "In daily life that showed up as emails that did not reach every device, files that took minutes to open from home and an open door if anyone lost a password.",
            ],
          },
          {
            heading: "The plan before touching anything",
            blocks: [
              "I started with a full audit of the 29 mailboxes, aliases and distribution lists. Then I assigned Microsoft 365 Business Basic and Business Standard licences according to each role.",
              "I verified the domain and prepared the DNS records (MX, SPF, DKIM and DMARC) ahead of the switch. The cutover was planned for a weekend so it would not affect the business.",
            ],
          },
          {
            heading: "Email migration",
            blocks: [
              {
                ol: [
                  "Creation of the 24 users and the 5 shared mailboxes, and licence assignment in the tenant.",
                  "Early sync of the mail history from the old hosting, in the background during the week.",
                  "Lowering the TTL of the DNS records 48 hours ahead.",
                  "Switching the MX records and enabling SPF, DKIM and DMARC on Friday afternoon.",
                  "Checking the new profiles in Outlook and on phones first thing on Monday.",
                ],
              },
              "No email was lost and the actual downtime was only a few minutes.",
            ],
          },
          {
            heading: "Files in SharePoint and OneDrive",
            blocks: [
              "I restructured the 420 GB into SharePoint libraries split by department, namely Administration, Sales, Operations and Management. Permissions were assigned through Entra ID security groups rather than person by person, and personal folders moved to OneDrive.",
              "The old local server stayed available in read only mode for three weeks as a transition fallback before it was retired.",
            ],
          },
          {
            heading: "Security from day one",
            blocks: [
              {
                list: [
                  "Multifactor authentication (MFA) required for the whole team.",
                  "Legacy mail protocols blocked, such as basic IMAP and POP3.",
                  "Basic conditional access policies.",
                  "Separate administration, with a dedicated account distinct from the daily user account.",
                  "Active alerts for suspicious sign ins.",
                ],
              },
            ],
          },
          {
            heading: "What was delivered",
            blocks: [
              "Technical documentation with the mailbox map, the permission groups and the DNS records. A one hour hands on training session for the team on SharePoint and OneDrive. And two weeks of support after the switch to answer questions at specific desks.",
              "If your company is in a similar situation, the usual first step is a free 15 minute call and then a quote. This kind of work is part of my [systems administration](/servicios/sistemas) service.",
            ],
          },
        ],
      },
    },
  },
  {
    slug: "red-profesional-bar",
    key: "p5",
    cover: "NET",
    tint: 12,
    tech: ["VLAN", "Omada", "WireGuard", "Backups"],
    image: "/projects/red-bar-cover.svg",
    coverAlt: {
      es: "Esquema de una red con un router en el centro y cuatro nodos conectados por líneas de puntos, cada uno con su icono: wifi de clientes, terminal de cobro, cámara y ordenador de oficina.",
      en: "Network diagram with a router in the centre and four nodes linked by dotted lines, each with its icon: guest wifi, payment terminal, camera and office computer.",
    },
    ogImage: "/projects/red-bar-og.jpg",
    date: "2026-11-13",
    service: "sistemas",
    facts: {
      es: [
        { label: "Entorno", value: "Bar restaurante con sala y terraza" },
        { label: "Alcance", value: "4 VLAN aisladas, wifi de clientes, TPV, cámaras y oficina" },
        { label: "Qué incluye", value: "Segmentación, copias automáticas y VPN WireGuard" },
      ],
      en: [
        { label: "Environment", value: "Bar and restaurant with indoor dining and terrace" },
        { label: "Scope", value: "4 isolated VLANs, guest wifi, till, cameras and office" },
        { label: "What it covers", value: "Segmentation, automated backups and WireGuard VPN" },
      ],
    },
    post: {
      es: {
        title: "Cómo monté una red profesional para un bar",
        intro:
          "El local funcionaba con el router básico del operador para todo. En la misma red convivían el wifi abierto de los clientes, dos TPV, el comandero, cuatro cámaras IP y el ordenador de administración. En horas punta de terraza el cobro con tarjeta se quedaba colgado y cualquier dispositivo conectado tenía visibilidad sobre la red interna.",
        sections: [
          {
            heading: "El punto de partida",
            blocks: [
              "Un bar restaurante de unos 110 m² con sala interior y terraza, fibra simétrica de 600 Mbps y picos de hasta 45 clientes conectados a la vez al wifi. Todo colgaba del router del operador, en una única red plana.",
              "El wifi de cortesía compartía rango IP con los dos TPV y la impresora de cocina, las cámaras IP no estaban segmentadas y las copias de la facturación vivían solo en el disco local del ordenador de oficina.",
              "En el día a día eso suponía dos riesgos. El operativo, porque en horas punta el tráfico de los clientes competía con el de los terminales de cobro. Y el de seguridad, porque cualquier móvil conectado al wifi tenía visibilidad sobre los equipos del negocio, y si el disco de oficina fallaba se perdía la facturación.",
            ],
          },
          {
            heading: "Qué se separó y por qué",
            blocks: [
              "El local pasó de una red plana a cuatro redes aisladas, cada una con su función.",
              {
                list: [
                  "**Red de clientes.** Solo salida a internet, aislamiento entre dispositivos y un límite de 15 Mbps por usuario para no saturar los 600 Mbps de la fibra.",
                  "**Red de TPV y barra.** Prioridad de tráfico para los dos terminales de cobro, el comandero inalámbrico y las impresoras térmicas de barra y cocina.",
                  "**Red de videovigilancia.** Cuatro cámaras IP y grabador NVR sin acceso directo a internet ni visibilidad desde el resto de subredes.",
                  "**Red de oficina.** Equipo de gestión, contabilidad y control de proveedores separado del tráfico comercial.",
                ],
              },
            ],
          },
          {
            heading: "Los equipos instalados",
            blocks: [
              "Un router con soporte VLAN y firewall por reglas entre subredes, un switch gestionable de 8 puertos con PoE para alimentar directamente las cuatro cámaras y los puntos de acceso sin enchufes extra, y dos puntos de acceso profesionales con gestión centralizada en Omada, uno en la sala y otro cubriendo la terraza.",
              "Todo va alojado en un pequeño rack mural ventilado en el almacén, con un SAI para aguantar los microcortes eléctricos.",
            ],
          },
          {
            heading: "Copias y acceso remoto",
            blocks: [
              "Cada madrugada, al cierre, se hace una copia de seguridad cifrada de la base de datos del TPV y de la carpeta de facturación hacia un almacenamiento externo fuera del local. Si el ordenador de oficina falla, la facturación sigue a salvo.",
              "Para el soporte hay un túnel VPN WireGuard. Puedo revisar el estado de los equipos o resolver una incidencia sin desplazarme al bar.",
            ],
          },
          {
            heading: "Cómo se ejecutó, paso a paso",
            blocks: [
              {
                ol: [
                  "Visita al local y medición de cobertura wifi en sala y terraza.",
                  "Propuesta técnica y presupuesto cerrado.",
                  "Cableado estructurado y montaje en rack fuera del horario de apertura, para no interrumpir el servicio.",
                  "Pruebas de aislamiento entre VLAN y de carga simultánea en barra.",
                  "Entrega con el esquema de red y las credenciales documentadas.",
                ],
              },
              "Si tienes un negocio en una situación parecida, el primer paso habitual es una llamada gratuita de 15 minutos y después un presupuesto cerrado. Este tipo de trabajo forma parte de mi servicio de [administración de sistemas](/servicios/sistemas).",
            ],
          },
        ],
      },
      en: {
        title: "How I set up a professional network for a bar",
        intro:
          "The venue ran everything on the basic router from the internet provider. The open guest wifi, two tills, the handheld ordering device, four IP cameras and the admin computer all shared the same network. At peak hours on the terrace, card payments would hang, and any connected device could see the internal network.",
        sections: [
          {
            heading: "Where we started",
            blocks: [
              "A bar and restaurant of about 110 m² with an indoor dining room and a terrace, a 600 Mbps symmetric fibre line and peaks of up to 45 customers on the wifi at once. Everything hung off the provider's router, on a single flat network.",
              "The guest wifi shared an IP range with the two tills and the kitchen printer, the IP cameras were not segmented, and the billing backups lived only on the local disk of the office computer.",
              "Day to day, that meant two risks. An operational one, because at peak hours customer traffic competed with the payment terminals. And a security one, because any phone on the wifi could see the business equipment, and if the office disk failed the billing records were gone.",
            ],
          },
          {
            heading: "What was separated and why",
            blocks: [
              "The venue went from one flat network to four isolated ones, each with its own role.",
              {
                list: [
                  "**Guest network.** Internet access only, isolation between devices and a limit of 15 Mbps per user so the 600 Mbps line is never saturated.",
                  "**Till and bar network.** Traffic priority for the two payment terminals, the wireless ordering device and the thermal printers at the bar and in the kitchen.",
                  "**CCTV network.** Four IP cameras and an NVR recorder with no direct internet access and no visibility from the other subnets.",
                  "**Office network.** Management computer, accounting and supplier control kept apart from the customer facing traffic.",
                ],
              },
            ],
          },
          {
            heading: "The equipment installed",
            blocks: [
              "A router with VLAN support and rule based firewalling between subnets, an 8 port managed PoE switch that powers the four cameras and the access points directly with no extra plugs, and two professional access points managed centrally with Omada, one in the dining room and one covering the terrace.",
              "It all sits in a small ventilated wall rack in the storeroom, with a UPS to ride out short power cuts.",
            ],
          },
          {
            heading: "Backups and remote access",
            blocks: [
              "Every night after closing, an encrypted backup of the till database and the billing folder is sent to external storage away from the venue. If the office computer fails, the billing records stay safe.",
              "For support there is a WireGuard VPN tunnel. I can check the state of the equipment or fix an issue without travelling to the bar.",
            ],
          },
          {
            heading: "How it was done, step by step",
            blocks: [
              {
                ol: [
                  "Site visit and wifi coverage measurement in the dining room and on the terrace.",
                  "Technical proposal and fixed price quote.",
                  "Structured cabling and rack mounting outside opening hours, so service was never interrupted.",
                  "Isolation tests between VLANs and simultaneous load tests at the bar.",
                  "Handover with the network diagram and documented credentials.",
                ],
              },
              "If your business is in a similar situation, the usual first step is a free 15 minute call and then a fixed price quote. This kind of work is part of my [systems administration](/servicios/sistemas) service.",
            ],
          },
        ],
      },
    },
  },
  {
    slug: "homelab-proxmox",
    key: "p3",
    cover: "LAB",
    tint: 20,
    tech: ["Proxmox", "Docker", "Home Assistant"],
    image: "/projects/homelab-cover.webp",
    coverAlt: {
      es: "Mini rack negro sobre una mesa blanca: arriba un switch TP-Link de 8 puertos con cables de red y abajo un mini PC Dell, el servidor Proxmox.",
      en: "Black mini rack on a white table: a TP-Link 8-port switch with network cables on top and a Dell mini PC below, the Proxmox server.",
    },
    ogImage: "/projects/homelab-og.jpg",
    date: "2026-10-16",
    service: "sistemas",
    facts: {
      es: [
        { label: "Tipo", value: "Proyecto personal" },
        { label: "Alcance", value: "Un mini PC con Proxmox y 5 servicios" },
        { label: "Resultado", value: "Copias diarias en la nube con aviso por Telegram" },
      ],
      en: [
        { label: "Type", value: "Personal project" },
        { label: "Scope", value: "One mini PC running Proxmox and 5 services" },
        { label: "Result", value: "Daily cloud backups with a Telegram report" },
      ],
    },
    post: {
      es: {
        title: "Un homelab personal sobre Proxmox",
        intro:
          "Cuando alguien oye “servidor en casa” se imagina un armario lleno de luces y ventiladores. Lo mío no es eso. Es un homelab humilde: un solo equipo pequeño, silencioso y que gasta poco.",
        sections: [
          {
            blocks: [
              "Pero hace mucho. Gestiona la domótica de casa con Home Assistant, me da una VPN propia, bloquea anuncios en toda la red y guarda copias de seguridad automáticas en la nube. Y cada mañana me manda un mensaje por Telegram contándome cómo ha ido la noche.",
              "No está terminado, ni pretendo que lo esté. La idea es la mejora continua: tocar una pieza, aprender, arreglar lo que se rompe y seguir. Aquí te cuento cómo está montado hoy.",
            ],
          },
          {
            heading: "El hierro y Proxmox",
            blocks: [
              "El hardware es un mini PC con un Intel i5-7500T, la versión de bajo consumo, 8 GB de RAM y un único SSD SATA. Con eso de momento me basta.",
              "Encima corre Proxmox VE, un hipervisor de código abierto. Su gracia es que me deja dividir esa máquina en varias más pequeñas, cada una con su servicio.",
              "Hay dos tipos. Las **máquinas virtuales (VM)** son ordenadores completos emulados, con su propio sistema operativo. Las uso cuando el servicio lo necesita, como Home Assistant. Los **contenedores LXC** son mucho más ligeros, comparten el núcleo del anfitrión y arrancan en segundos. Para servicios pequeños son perfectos, y en una máquina con 8 GB cada megabyte cuenta.",
              "Lo mejor de este reparto es el aislamiento. Si un contenedor se rompe, los demás siguen a lo suyo.",
            ],
          },
          {
            heading: "Quién vive dentro",
            blocks: [
              { h3: "Home Assistant, el cerebro" },
              "Corre como máquina virtual con HAOS, el sistema operativo oficial de Home Assistant. Es lo más cómodo: las actualizaciones y los complementos se gestionan solos.",
              "Desde aquí controlo las luces de mi habitación y de parte de la casa, la climatización y unas cuantas escenas: modo trabajo, modo noche y “apaga todo”. Puedo encender el PC con Wake on LAN desde el móvil. Está integrado con Alexa, y con Music Assistant tengo música por la casa. El panel está hecho con tarjetas Mushroom e incluye un apartado que me enseña CPU, RAM y disco del propio servidor.",
              "También es accesible desde fuera, siempre por HTTPS, con certificado de Let's Encrypt y doble factor.",
              { h3: "Pi-hole, el portero de la red" },
              "Un contenedor LXC que hace de servidor DNS para toda la casa. Cuando un dispositivo pide un dominio de publicidad o rastreo, Pi-hole no lo resuelve y el anuncio nunca llega. Funciona en el móvil, la tele y el portátil sin instalar nada en ellos.",
              "Uso las listas HaGeZi Pro y OISD, y por encima Quad9 con DNSSEC como DNS de salida. La diferencia se nota desde el primer día.",
              { h3: "WireGuard, mi túnel a casa" },
              "Otro contenedor, esta vez con WireGuard, una VPN moderna, rápida y muy ligera. Cuando estoy fuera me conecto y el móvil se comporta como si estuviera dentro de casa. Muy útil para trabajar desde el ordenador mediante escritorio remoto desde un móvil o una tablet. Cómo lo plantearía en una oficina lo cuento en [VPN para pymes](/blog/vpn-pyme-acceso-remoto).",
              { h3: "Nginx Proxy Manager, nombres en vez de números" },
              "Con tantos servicios llegué a un punto en el que tenía que recordar una dirección y un puerto para cada uno. Un lío. Así que monté Nginx Proxy Manager, un proxy inverso con una interfaz web muy cómoda.",
              "Funciona así. En Pi-hole creo registros DNS locales para cada servicio, todos apuntando al proxy. Cuando escribo el nombre en el navegador, Pi-hole lo resuelve hacia Nginx Proxy Manager, y este mira qué nombre le he pedido y me lleva al servicio correcto. Proxmox, Pi-hole y compañía tienen ahora su propio nombre fácil de recordar.",
              "Y de paso, todo va por HTTPS. Los certificados los saca Let's Encrypt con un reto DNS, así que no necesito exponer nada a internet para conseguirlos. Se renuevan solos y me olvido.",
              { h3: "Rclone, el mensajero" },
              "El contenedor más discreto y uno de los más importantes. Su único trabajo es llevar las copias de seguridad a Google Drive. Te lo explico ahora.",
            ],
          },
          {
            heading: "Copias de seguridad dobles",
            blocks: [
              "Todo lo anterior no vale nada si un día el SSD dice basta. Por eso tengo dos sistemas de copias que no dependen el uno del otro, una versión a pequeña escala de la [regla de backup 3-2-1](/blog/backup-3-2-1).",
              { h3: "Primera capa: Proxmox copia las máquinas enteras" },
              "Cada noche, Proxmox lanza VZDump y hace una copia completa de cada máquina virtual y cada contenedor. Salen archivos comprimidos con zstd, que ocupan bastante menos. En el propio servidor guardo las dos últimas copias de cada uno.",
              "De madrugada entra en juego el contenedor de Rclone. Tiene montada la carpeta de copias del anfitrión y la sube a Google Drive.",
              "Aquí vino el reto. Uso la cuenta gratuita de Drive, con 15 GB, y cada tanda de copias ronda los 10 GB (casi todo es la VM de Home Assistant). No caben dos tandas. La solución fue un script programado con cron que hace dos cosas:",
              {
                ol: [
                  "Vacía la carpeta remota saltándose la papelera de Google. Si no, los archivos borrados siguen contando para la cuota.",
                  "Sube solo los archivos de las últimas 24 horas. Aunque en local haya dos copias, a la nube solo va la de esa noche.",
                ],
              },
              "Resultado: siempre hay una copia fresca fuera de casa y nunca me paso de la cuota.",
              { h3: "Segunda capa: Home Assistant a lo suyo" },
              "Aparte, Home Assistant hace sus propias copias internas. Guarda cinco, en local y en otra carpeta de Google Drive con el complemento oficial.",
              "¿Para qué dos sistemas? Porque sirven para cosas distintas. Si muere el disco, restauro la máquina entera desde Google Drive. Si solo rompo una automatización, recupero la configuración de Home Assistant en un par de minutos, sin volcar una imagen de 10 GB.",
            ],
          },
          {
            heading: "El bot de Telegram que me da los buenos días",
            blocks: [
              "Un sistema de copias que nadie vigila es un sistema que un día falla sin que te enteres. Así que le puse un chivato.",
              "El script de subida va envuelto en otro pequeño script de notificación. Cuando termina, usa la API de bots de Telegram para mandarme un resumen al móvil. Cada mañana, con el café, sé si todo ha ido bien.",
              "El mensaje está pensado para leerlo de un vistazo:",
              {
                list: [
                  "Cada máquina aparece con su nombre (Home Assistant, Pi-hole, WireGuard, Rclone) en lugar de su número de Proxmox.",
                  "Los tamaños vienen en unidades legibles, nada de bytes interminables.",
                  "Incluye cuánto espacio queda en el disco local.",
                ],
              },
              "Hay un detalle curioso. Antes de preguntar a Google Drive qué se ha subido, el script espera unos segundos. Drive tarda un poco en indexar los archivos nuevos, y sin esa pausa el resumen podía salir incompleto.",
              {
                img: "/projects/homelab-telegram.webp",
                alt: "Mensaje del bot de Telegram con el resumen de la copia diaria: copias de Proxmox y subida a Google Drive correctas, con el tamaño de cada máquina.",
                width: 667,
                height: 1350,
                caption: "El resumen que me llega cada mañana.",
              },
            ],
          },
          {
            heading: "Lo que viene",
            blocks: [
              "Como te decía, esto va de mejora continua. Tengo una lista de cosas en las que quiero meter mano:",
              {
                list: [
                  "**Copias más robustas.** Ahora borro la nube antes de subir. Si algo fallara justo en medio, me quedaría un rato sin copia remota. Quiero darle la vuelta: subir primero y borrar lo viejo solo si todo ha ido bien.",
                  "**Cuidar el SSD.** Es el único disco y ya tiene unos años. Quiero tests SMART periódicos con aviso, y reducir escrituras innecesarias, como el historial de consultas de Pi-hole.",
                  "**Más VPN, menos puertas abiertas.** Apoyarme cada vez más en WireGuard para el acceso desde fuera.",
                  "**Un NAS.** Me gustaría tener almacenamiento dedicado, con varios discos y redundancia. Dudo entre comprar un QNAP, que viene listo para usar, o montarme uno propio con TrueNAS (el antiguo FreeNAS), que me da más control. Sería el sitio perfecto para las copias locales y para todo lo que viene después.",
                  "**Mi propio servidor multimedia.** Con el NAS en marcha, el siguiente paso es montar un sistema de películas y series: Prowlarr para gestionar los indexadores, Radarr, Sonarr y el resto de la familia *arr para organizar el contenido, un cliente torrent para las descargas y Jellyfin para verlo todo desde la tele, el móvil o donde sea. Un Netflix casero, pero mío.",
                  "**Una red Omada completa.** Este es el proyecto grande. Cambiar el router de la operadora por un Omada Fusion y montar toda la red con equipos Omada, gestionados desde un mismo sitio. La idea es segmentarla en VLANs: una para el homelab, otra para los dispositivos domóticos, otra para invitados. Así, si una bombilla inteligente hace algo raro, no puede tocar nada más. Y a poder ser, una red interna a 10Gb.",
                ],
              },
              "No hay prisa. Cada mejora es una excusa para aprender algo nuevo, y eso es lo que más me gusta de todo esto.",
              "Una última cosa: si echas en falta direcciones, puertos o nombres concretos, no es un despiste. Esos detalles me los guardo para mí.",
              "Y si estás pensando en montar tu propio homelab, empieza pequeño. Un servicio, luego otro. Y haz copias de seguridad desde el primer día. Me lo agradecerás.",
            ],
          },
        ],
      },
      en: {
        title: "A personal homelab on Proxmox",
        intro:
          "When people hear “home server” they picture a cabinet full of blinking lights and fans. Mine is nothing like that. It is a humble homelab: a single small machine, quiet and easy on power.",
        sections: [
          {
            blocks: [
              "But it does a lot. It runs the house automation with Home Assistant, gives me my own VPN, blocks ads across the whole network and keeps automatic backups in the cloud. And every morning it sends me a Telegram message telling me how the night went.",
              "It is not finished, and I do not intend it to be. The idea is continuous improvement: touch a piece, learn, fix what breaks and keep going. Here is how it is set up today.",
            ],
          },
          {
            heading: "The hardware and Proxmox",
            blocks: [
              "The hardware is a mini PC with an Intel i5-7500T, the low-power version, 8 GB of RAM and a single SATA SSD. For now, that is enough.",
              "On top runs Proxmox VE, an open-source hypervisor. The beauty of it is that it lets me split that machine into several smaller ones, each with its own service.",
              "There are two kinds. **Virtual machines (VMs)** are complete emulated computers with their own operating system. I use them when a service needs one, like Home Assistant. **LXC containers** are much lighter: they share the host kernel and boot in seconds. They are perfect for small services, and on a machine with 8 GB every megabyte counts.",
              "The best part of this split is isolation. If one container breaks, the rest carry on.",
            ],
          },
          {
            heading: "Who lives inside",
            blocks: [
              { h3: "Home Assistant, the brain" },
              "It runs as a virtual machine with HAOS, Home Assistant's official operating system. It is the most convenient option: updates and add-ons take care of themselves.",
              "From here I control the lights in my room and part of the house, the climate and a few scenes: work mode, night mode and “turn everything off”. I can power on my PC with Wake on LAN from my phone. It is integrated with Alexa, and with Music Assistant I have music around the house. The dashboard is built with Mushroom cards and includes a section showing the server's own CPU, RAM and disk.",
              "It is also reachable from outside, always over HTTPS, with a Let's Encrypt certificate and two-factor authentication.",
              { h3: "Pi-hole, the network's doorman" },
              "An LXC container that acts as the DNS server for the whole house. When a device asks for an advertising or tracking domain, Pi-hole does not resolve it and the ad never arrives. It works on the phone, the TV and the laptop without installing anything on them.",
              "I use the HaGeZi Pro and OISD lists, with Quad9 and DNSSEC as the upstream DNS. You notice the difference from day one.",
              { h3: "WireGuard, my tunnel home" },
              "Another container, this time with WireGuard, a modern, fast and very light VPN. When I am away I connect and my phone behaves as if it were at home. Very handy for working on my computer over remote desktop from a phone or a tablet. How I would set it up in an office is covered in [VPN for small businesses](/blog/vpn-pyme-acceso-remoto).",
              { h3: "Nginx Proxy Manager, names instead of numbers" },
              "With so many services I reached the point of having to remember an address and a port for each one. A mess. So I set up Nginx Proxy Manager, a reverse proxy with a very comfortable web interface.",
              "Here is how it works. In Pi-hole I create local DNS records for each service, all pointing to the proxy. When I type a name in the browser, Pi-hole resolves it to Nginx Proxy Manager, which checks the name I asked for and sends me to the right service. Proxmox, Pi-hole and friends now each have an easy name to remember.",
              "And on top of that, everything runs over HTTPS. Let's Encrypt issues the certificates with a DNS challenge, so I do not need to expose anything to the internet to get them. They renew themselves and I forget about them.",
              { h3: "Rclone, the messenger" },
              "The quietest container and one of the most important. Its only job is to take the backups to Google Drive. More on that next.",
            ],
          },
          {
            heading: "Double backups",
            blocks: [
              "None of the above is worth anything if the SSD gives up one day. That is why I have two backup systems that do not depend on each other, a small-scale version of the [3-2-1 backup rule](/blog/backup-3-2-1).",
              { h3: "First layer: Proxmox backs up whole machines" },
              "Every night, Proxmox runs VZDump and makes a full backup of every virtual machine and container. The output is compressed with zstd, so it takes up much less space. On the server itself I keep the last two backups of each.",
              "In the early hours the Rclone container steps in. It has the host's backup folder mounted and uploads it to Google Drive.",
              "This is where the challenge came in. I use the free Drive account, with 15 GB, and each batch of backups is around 10 GB (almost all of it is the Home Assistant VM). Two batches do not fit. The fix was a cron-scheduled script that does two things:",
              {
                ol: [
                  "It empties the remote folder, skipping Google's trash. Otherwise, deleted files keep counting toward the quota.",
                  "It uploads only the files from the last 24 hours. Even with two backups stored locally, only that night's goes to the cloud.",
                ],
              },
              "The result: there is always a fresh copy outside the house, and I never go over the quota.",
              { h3: "Second layer: Home Assistant does its own thing" },
              "Separately, Home Assistant makes its own internal backups. It keeps five, locally and in another Google Drive folder through the official add-on.",
              "Why two systems? Because they serve different purposes. If the disk dies, I restore the whole machine from Google Drive. If I only break an automation, I recover the Home Assistant configuration in a couple of minutes, without restoring a 10 GB image.",
            ],
          },
          {
            heading: "The Telegram bot that says good morning",
            blocks: [
              "A backup system nobody watches is a system that will fail one day without you noticing. So I gave it a snitch.",
              "The upload script is wrapped in another small notification script. When it finishes, it uses the Telegram Bot API to send a summary to my phone. Every morning, over coffee, I know whether everything went well.",
              "The message is designed to be read at a glance:",
              {
                list: [
                  "Each machine shows up by name (Home Assistant, Pi-hole, WireGuard, Rclone) instead of its Proxmox ID.",
                  "Sizes come in readable units, no endless byte counts.",
                  "It includes how much space is left on the local disk.",
                ],
              },
              "There is one curious detail. Before asking Google Drive what was uploaded, the script waits a few seconds. Drive takes a moment to index new files, and without that pause the summary could come out incomplete.",
              {
                img: "/projects/homelab-telegram.webp",
                alt: "Telegram bot message with the daily backup summary: Proxmox backups and Google Drive upload both OK, with the size of each machine.",
                width: 667,
                height: 1350,
                caption: "The summary I get every morning.",
              },
            ],
          },
          {
            heading: "What comes next",
            blocks: [
              "As I said, this is about continuous improvement. I have a list of things I want to get my hands on:",
              {
                list: [
                  "**Sturdier backups.** Right now I wipe the cloud copy before uploading. If something failed halfway, I would be without a remote copy for a while. I want to flip it: upload first and delete the old one only if everything went well.",
                  "**Looking after the SSD.** It is the only disk and it is a few years old. I want periodic SMART tests with alerts, and fewer unnecessary writes, such as Pi-hole's query history.",
                  "**More VPN, fewer open doors.** Relying more and more on WireGuard for outside access.",
                  "**A NAS.** I would like dedicated storage with several disks and redundancy. I am torn between buying a QNAP, which is ready to go, or building my own with TrueNAS (formerly FreeNAS), which gives me more control. It would be the perfect place for local backups and everything that comes after.",
                  "**My own media server.** With the NAS running, the next step is a movies and TV system: Prowlarr to manage indexers, Radarr, Sonarr and the rest of the *arr family to organize content, a torrent client for downloads and Jellyfin to watch everything on the TV, the phone or anywhere. A home-made Netflix, but mine.",
                  "**A full Omada network.** This is the big one. Replace the ISP router with an Omada Fusion and build the whole network with Omada gear, managed from one place. The idea is to segment it into VLANs: one for the homelab, one for smart home devices, one for guests. That way, if a smart bulb does something odd, it cannot touch anything else. And ideally, a 10Gb internal network.",
                ],
              },
              "There is no rush. Every improvement is an excuse to learn something new, and that is what I enjoy most about all of this.",
              "One last thing: if you miss specific addresses, ports or names, it is not an oversight. I keep those details to myself.",
              "And if you are thinking about building your own homelab, start small. One service, then another. And back up from day one. You will thank me.",
            ],
          },
        ],
      },
    },
  },
];

export function getProject(slug: string) {
  return PROJECTS.find((p) => p.slug === slug);
}

/**
 * Lo que pintan las cards y portadas de un proyecto, sin el artículo. Los componentes de cliente
 * reciben esto por props: así el texto completo de los proyectos no viaja en el JS de la home.
 */
export type ProjectCard = Pick<
  Project,
  "slug" | "key" | "tech" | "image" | "imageDark" | "cover" | "tint" | "coverAlt" | "coverPosition"
>;

export function projectCard(p: Project): ProjectCard {
  const { slug, key, tech, image, imageDark, cover, tint, coverAlt, coverPosition } = p;
  return { slug, key, tech, image, imageDark, cover, tint, coverAlt, coverPosition };
}

export function projectCards(): ProjectCard[] {
  return PROJECTS.map(projectCard);
}

/**
 * ¿Tiene el proyecto artículo completo en inglés? Solo entonces existe /en/proyectos/<slug>, entra
 * en el sitemap y lleva hreflang. Si no, esa URL devuelve 404.
 */
export function proyectoTieneIngles(p: Project): boolean {
  const post = p.post.en;
  return (
    !!post &&
    (post.title ?? "").trim() !== "" &&
    (post.intro ?? "").trim() !== "" &&
    post.sections.length > 0
  );
}
