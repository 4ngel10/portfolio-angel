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

/** Imagen dentro del artículo. width y height son los del archivo, para reservar el hueco. */
export type PostImage = {
  img: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
};
export type PostBlock = string | { h3: string } | { list: string[] } | { ol: string[] } | PostImage;
export type PostSection = { heading?: string; blocks: PostBlock[] };
export type Post = { title?: string; intro?: string; sections: PostSection[] };

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
  /** Imagen para compartir en redes (Open Graph), 1200x630. */
  ogImage?: string;
  /** Fecha de publicación del artículo, AAAA-MM-DD. */
  date?: string;
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
    post: {
      es: {
        title: "Automatizar el mapeo de impresoras en RDS con PowerShell y Active Directory",
        intro:
          "En un cliente con varias sedes y más de 30 impresoras, configurar las impresoras a mano cada vez que un usuario iniciaba sesión era insostenible. Cada alta nueva, cada cambio de puesto, cada “se me han borrado las impresoras” significaba conectarse al equipo y añadirlas una a una. Con bandejas, ajustes predefinidos y todo. Multiplica eso por 90 usuarios y ya te imaginas.",
        sections: [
          {
            blocks: [
              "Así que decidí automatizarlo con un script de PowerShell que se lanza por GPO en el inicio de sesión.",
            ],
          },
          {
            heading: "La idea",
            blocks: [
              "El planteamiento es sencillo: que sea Active Directory quien sepa qué impresoras necesita cada usuario. Creé dos atributos personalizados en AD: uno para la impresora predeterminada y otro para las adicionales. Cuando el usuario inicia sesión en el servidor RDS, una GPO lanza el script, que lee esos atributos y mapea automáticamente las impresoras que le corresponden.",
              "¿Por qué AD y no otra cosa? Porque es el sitio natural donde ya gestionas al usuario. Si alguien cambia de sede o de departamento, solo tienes que actualizar sus atributos en AD y la próxima vez que inicie sesión ya tiene sus impresoras nuevas. Sin tocar el equipo, sin conectarte en remoto, sin tickets.",
            ],
          },
          {
            heading: "Qué hace el script",
            blocks: [
              "El script no solo instala las impresoras. También configura las bandejas y los ajustes predefinidos de cada una. Si una impresora tiene la bandeja 2 para papel A3 y la 3 para sobres, el usuario la recibe lista para usar sin tener que tocar nada.",
              "El proceso es limpio: al arrancar, el script consulta AD, obtiene la lista de impresoras asignadas al usuario, las mapea con su configuración y establece la predeterminada. Todo transparente para el usuario.",
            ],
          },
          {
            heading: "Logs para dormir tranquilo",
            blocks: [
              "Cada ejecución genera un log individual por usuario en una carpeta compartida del servidor. Queda registrado qué impresoras se han mapeado, a qué hora y si ha ido bien o ha fallado algo.",
              "Esto parece un detalle menor, pero cuando un usuario dice “no me funciona la impresora” y tú puedes mirar su log y ver exactamente qué ha pasado, te ahorras bastante tiempo de diagnóstico.",
            ],
          },
          {
            heading: "El botón de “arréglame las impresoras”",
            blocks: [
              "Uno de los problemas recurrentes era que a veces, por un error o un cambio de configuración, las impresoras del usuario desaparecían. En vez de abrir un ticket y esperar, el script deja un acceso directo en el escritorio que resetea la GPO y vuelve a lanzar el mapeo completo.",
              "El usuario hace doble clic y en unos segundos tiene todas sus impresoras de vuelta. Esto ha reducido bastante las incidencias relacionadas con impresoras.",
            ],
          },
          {
            heading: "Números",
            blocks: [
              "El script gestiona unos 90 usuarios y entre 30 y 35 impresoras repartidas en varias sedes. Lleva varias versiones de mejoras incrementales y ahora mismo está en la v6.0. Cada iteración ha ido puliendo cosas: mejor gestión de errores, los logs, la configuración de bandejas, el acceso directo de recuperación.",
            ],
          },
          {
            heading: "Lo que me llevo",
            blocks: [
              "Este proyecto me enseñó que la mejor automatización es la que el usuario ni nota. Nadie te da las gracias porque sus impresoras aparezcan solas, pero sí que dejan de llamarte para que se las configures. Y eso, al final, es el objetivo.",
              "Si trabajas en un entorno con muchas impresoras y muchos usuarios, te animo a explorar este enfoque. La inversión inicial de montar el script merece la pena con creces.",
            ],
          },
        ],
      },
      en: {
        title: "Automating printer mapping on RDS with PowerShell and Active Directory",
        intro:
          "At a client with several sites and more than 30 printers, setting up printers by hand every time a user signed in was unsustainable. Every new hire, every desk change, every “my printers are gone” meant connecting to the machine and adding them one by one. Trays, presets and all. Multiply that by 90 users and you get the picture.",
        sections: [
          {
            blocks: [
              "So I decided to automate it with a PowerShell script launched by GPO at sign-in.",
            ],
          },
          {
            heading: "The idea",
            blocks: [
              "The approach is simple: let Active Directory know which printers each user needs. I created two custom attributes in AD: one for the default printer and another for the additional ones. When the user signs in to the RDS server, a GPO launches the script, which reads those attributes and automatically maps the printers that belong to them.",
              "Why AD and not something else? Because it is the natural place where you already manage the user. If someone changes site or department, you only update their attributes in AD and the next time they sign in they already have their new printers. No touching the machine, no remote sessions, no tickets.",
            ],
          },
          {
            heading: "What the script does",
            blocks: [
              "The script does not just install the printers. It also configures each one's trays and presets. If a printer has tray 2 for A3 paper and tray 3 for envelopes, the user gets it ready to use without touching anything.",
              "The process is clean: on start, the script queries AD, gets the list of printers assigned to the user, maps them with their configuration and sets the default one. All transparent to the user.",
            ],
          },
          {
            heading: "Logs to sleep well",
            blocks: [
              "Every run writes an individual log per user to a shared folder on the server. It records which printers were mapped, at what time, and whether everything went fine or something failed.",
              "It looks like a small detail, but when a user says “my printer doesn't work” and you can open their log and see exactly what happened, you save a lot of troubleshooting time.",
            ],
          },
          {
            heading: "The “fix my printers” button",
            blocks: [
              "A recurring problem was that sometimes, because of an error or a configuration change, a user's printers disappeared. Instead of opening a ticket and waiting, the script leaves a desktop shortcut that resets the GPO and runs the full mapping again.",
              "The user double-clicks it and in a few seconds all their printers are back. This has noticeably cut down printer-related incidents.",
            ],
          },
          {
            heading: "Numbers",
            blocks: [
              "The script handles around 90 users and 30 to 35 printers spread across several sites. It has gone through several rounds of incremental improvements and is currently at v6.0. Each iteration polished something: better error handling, the logs, tray configuration, the recovery shortcut.",
            ],
          },
          {
            heading: "What I take away",
            blocks: [
              "This project taught me that the best automation is the one the user does not even notice. Nobody thanks you because their printers show up on their own, but they do stop calling you to set them up. And in the end, that is the goal.",
              "If you work in an environment with lots of printers and lots of users, I encourage you to explore this approach. The initial investment in building the script pays off many times over.",
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
    coverAlt: {
      es: "Captura de Prompt Vault: buscador, filtros por tipo y categoría, y tarjetas de prompts y skills de IA con sus etiquetas.",
      en: "Prompt Vault screenshot: search bar, filters by type and category, and cards of AI prompts and skills with their tags.",
    },
    ogImage: "/projects/prompt-vault-og.jpg",
    imageDark: "/projects/prompt-vault-dark.webp",
    date: "2026-10-16",
    post: {
      es: {
        title: "Prompt Vault: mi bóveda personal de prompts",
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
        title: "Prompt Vault: my personal prompt vault",
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
              "Otro contenedor, esta vez con WireGuard, una VPN moderna, rápida y muy ligera. Cuando estoy fuera me conecto y el móvil se comporta como si estuviera dentro de casa. Muy útil para trabajar desde el ordenador mediante escritorio remoto desde un móvil o una tablet.",
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
              "Todo lo anterior no vale nada si un día el SSD dice basta. Por eso tengo dos sistemas de copias que no dependen el uno del otro.",
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
              "Another container, this time with WireGuard, a modern, fast and very light VPN. When I am away I connect and my phone behaves as if it were at home. Very handy for working on my computer over remote desktop from a phone or a tablet.",
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
              "None of the above is worth anything if the SSD gives up one day. That is why I have two backup systems that do not depend on each other.",
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
  {
    slug: "flexgrip",
    key: "p4",
    cover: "FG",
    tint: 14,
    tech: ["Astro", "Stripe", "SEO"],
    url: "https://www.flexgrip.site/",
    image: "/projects/flexgrip.webp",
    coverAlt: {
      es: "Captura de FlexGrip: titular «Entrena en cualquier lugar por solo 14,99 €», botón de compra y un kit con cinco bandas elásticas de colores, un handgrip y una bolsa de malla.",
      en: "FlexGrip screenshot: headline “Entrena en cualquier lugar por solo 14,99 €”, a buy button and a kit with five colored resistance bands, a hand gripper and a mesh bag.",
    },
    ogImage: "/projects/flexgrip-og.jpg",
    date: "2026-10-20",
    post: {
      es: {
        title: "FlexGrip: una tienda de un solo producto",
        intro:
          "FlexGrip es una tienda online con un único producto: un kit de fitness con cinco bandas elásticas, un handgrip regulable y una bolsa de malla. Está pensada para una sola cosa, que quien llega entienda qué se lleva y pueda comprarlo sin dar vueltas.",
        sections: [
          {
            heading: "Qué es",
            blocks: [
              "Una web en español con el producto en primer plano: titular claro, precio, botón de compra y las garantías a la vista (30 días de devolución, 3 años de garantía y envío exprés).",
              "Más abajo se detalla qué incluye el kit, con las bandas de ligera a extra fuerte y el handgrip regulable, y hay una comparativa, opiniones de clientes y preguntas frecuentes.",
            ],
          },
          {
            heading: "Cómo está hecha",
            blocks: [
              "Con Astro, que genera páginas estáticas muy ligeras y rápidas de cargar, justo lo que necesita una tienda donde cada segundo cuenta. El pago se resuelve con enlaces de Stripe, sin montar un carrito propio.",
              "El diseño es oscuro, con un verde lima como único acento, y está pensado para leerse bien en el móvil, que es desde donde llega la mayoría de la gente.",
            ],
          },
          {
            heading: "Dónde verla",
            blocks: ["Puedes visitarla en [flexgrip.site](https://www.flexgrip.site/)."],
          },
        ],
      },
      en: {
        title: "FlexGrip: a single-product store",
        intro:
          "FlexGrip is an online store with a single product: a fitness kit with five resistance bands, an adjustable hand gripper and a mesh bag. It is built for one thing: whoever lands on it understands what they get and can buy it without detours.",
        sections: [
          {
            heading: "What it is",
            blocks: [
              "A Spanish-language site with the product front and center: a clear headline, the price, a buy button and the guarantees in plain sight (30-day returns, a 3-year warranty and express shipping).",
              "Further down it details what the kit includes, with bands from light to extra heavy and the adjustable gripper, plus a comparison, customer reviews and an FAQ.",
            ],
          },
          {
            heading: "How it is built",
            blocks: [
              "With Astro, which generates very light static pages that load fast, exactly what a store needs when every second counts. Payment is handled with Stripe links, so there is no custom cart to maintain.",
              "The design is dark with a lime green as the only accent, made to read well on mobile, which is where most people arrive from.",
            ],
          },
          {
            heading: "Where to see it",
            blocks: ["You can visit it at [flexgrip.site](https://www.flexgrip.site/)."],
          },
        ],
      },
    },
  },
];

export function getProject(slug: string) {
  return PROJECTS.find((p) => p.slug === slug);
}
