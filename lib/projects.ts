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
 *   con bloques: un string es un párrafo, `{ h3 }` un subtítulo, `{ list }` una lista
 *   y `{ ol }` una lista numerada.
 * - Dentro del texto: **negrita** y [enlace](https://...).
 * - Sin em dashes.
 */

import type { Locale } from "./i18n";

export type PostBlock = string | { h3: string } | { list: string[] } | { ol: string[] };
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
  /** Fecha de publicación del artículo, AAAA-MM-DD. */
  date?: string;
  post: Record<Locale, Post>;
};

export const PROJECTS: Project[] = [
  {
    slug: "web-hotel",
    key: "p1",
    cover: "WEB",
    tint: 8,
    tech: ["HTML", "CSS", "JavaScript", "Vercel"],
    post: {
      es: {
        sections: [
          {
            heading: "El proyecto",
            blocks: [
              "Rediseño de la web corporativa de un cliente del sector hotelero, con foco en rendimiento, reservas y navegación en varios idiomas.",
              "Estoy escribiendo este caso. Pronto contaré el proceso completo.",
            ],
          },
        ],
      },
      en: {
        sections: [
          {
            heading: "The project",
            blocks: [
              "Redesign of the corporate website for a hospitality client, focused on performance, bookings and multi-language navigation.",
              "I am writing up this case. The full process is coming soon.",
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
    image: "/projects/prompt-vault.png",
    imageDark: "/projects/prompt-vault-dark.png",
    date: "2026-10-16",
    post: {
      es: {
        title: "Prompt Vault: cómo construí mi propia bóveda de prompts con Claude Code",
        intro:
          "Llevo meses trabajando con herramientas de IA y tenía un problema tonto pero muy real: no encontraba mis prompts cuando los necesitaba. Así que me construí mi propia app para guardarlos. Y lo hice entero con Claude Code.",
        sections: [
          {
            heading: "Todo empezó con un problema muy tonto",
            blocks: [
              "A ver, la cosa es así. Si usas ChatGPT, Claude o cualquier modelo de IA con cierta frecuencia, acabas con un montón de prompts buenos repartidos por todas partes. Unos en notas del móvil. Otros en un documento de Google que abriste una vez. Algunos en conversaciones de WhatsApp. Y los mejores, claro, perdidos en algún chat antiguo que ya no encuentras.",
              "Yo tenía prompts para generar código, plantillas de escritura, skills para tareas que hago constantemente… y cada vez que necesitaba uno, me pasaba cinco minutos buscando entre capturas de pantalla y mensajes. Una pérdida de tiempo absurda.",
              "Y compartirlos era aún peor. Copiar, pegar, enviar por WhatsApp, que se pierda en el hilo… un desastre.",
              "Así que pensé: ¿y si me hago una app sencilla donde tenerlo todo en un sitio?",
            ],
          },
          {
            heading: "Qué es Prompt Vault",
            blocks: [
              "Prompt Vault es eso, mi bóveda personal de prompts y skills de IA. Una web app donde guardo todo lo que escribo para interactuar con modelos de lenguaje, organizado por categorías, con búsqueda rápida y copia en un clic.",
              "La idea era que fuese algo que pudiera usar desde el móvil mientras estoy fuera y desde el portátil cuando estoy trabajando. Por eso la hice como PWA. Se instala como app nativa, se abre desde el icono, sin barra del navegador. En Android, en iOS, en escritorio, funciona igual.",
              "Tiene modo claro y oscuro (que cambias con un botón, nada de andar buscando en ajustes), autenticación real con Google o email, y todos los datos sincronizados en la nube. Si guardo un prompt desde el móvil, lo tengo al instante en el ordenador.",
            ],
          },
          {
            heading: "El stack (sin dramas)",
            blocks: [
              "No quería complicarme la vida con un stack exótico. Elegí cosas que conozco y que funcionan bien juntas:",
              {
                list: [
                  "**React 19 + Vite 8** para el frontend. Vite arranca en milisegundos y React es React, se mueve muy rápido.",
                  "**Tailwind CSS v4** para los estilos. Cero archivos CSS sueltos. Todo inline, todo consistente.",
                  "**Supabase** para todo el backend: autenticación (Google OAuth y email), base de datos PostgreSQL con Row Level Security, y almacenamiento. Es como tener un Firebase pero con SQL de verdad.",
                  "**Vercel** para el despliegue. Push a main y ya está en producción. También uso Vercel Analytics para ver cómo se usa.",
                  "**vite-plugin-pwa** para convertirlo en una Progressive Web App instalable.",
                ],
              },
              "La tipografía es Plus Jakarta Sans, que le da un aire limpio y moderno sin recurrir a las de siempre.",
            ],
          },
          {
            heading: "Lo que puedes hacer con la app",
            blocks: [
              "Prompt Vault no es un bloc de notas con etiquetas. Cada cosa está pensada para que guardar y encontrar prompts sea tan natural como copiar y pegar.",
              { h3: "Tipos y categorías a tu manera" },
              "Cada prompt que guardas tiene un tipo y una categoría. Los tipos por defecto son “Prompt” y “Skill”, pero puedes crear los que quieras: “Plantilla”, “Agente”, lo que necesites. La app incluso ajusta el género gramatical automáticamente: si creas un tipo que termina en -a, dice “nueva” en vez de “nuevo”. Un detallito tonto que mola.",
              "Las categorías (Escritura, Código, Marketing, Productividad, Imagen) también son personalizables. Cada una tiene su color de una paleta pastel con 10 tonos, y todos cumplen contraste AA. O sea, bonitos y legibles.",
              { h3: "Buscar y filtrar" },
              "Arriba hay una barra de búsqueda que filtra en tiempo real por título y contenido. Puedes filtrar también por tipo y por categoría. Cuando tienes 50 o 100 prompts, esto marca la diferencia entre encontrar algo en 2 segundos o pasarte un rato buscando.",
              { h3: "Copiar en un clic" },
              "Esto es clave. Haces clic en “Copiar” y el prompt está en tu portapapeles, listo para pegar en ChatGPT, Claude o donde sea. Aparece un pequeño “Copiado” durante 2 segundos. Simple y efectivo.",
              { h3: "Compartir de dos formas" },
              "Puedes compartir un prompt de dos maneras:",
              {
                list: [
                  "**Por email:** escribes el correo de la persona y le aparece en su bóveda la próxima vez que entre. Solo lectura, que no te lo toque nadie.",
                  "**Por enlace público:** generas una URL y cualquiera puede verlo sin necesidad de cuenta. Si cambias de idea, desactivas el enlace y listo.",
                ],
              },
              { h3: "Papelera con deshacer" },
              "Cuando borras algo, no desaparece. Va a la papelera y tienes 6 segundos para arrepentirte con un aviso de “Deshacer”. Y si no, ahí sigue, accesible desde tu avatar durante 30 días.",
              { h3: "Modo oscuro" },
              "Un botón de sol/luna en la cabecera y ya. Toda la interfaz cambia. Si trabajas de noche con prompts, es una necesidad.",
              { h3: "Seguridad real" },
              "Cada usuario solo ve sus propios datos. Y no es un “if” en el frontend: está implementado con Row Level Security en Supabase. La base de datos misma rechaza cualquier consulta que intente tocar datos de otro. No hay forma de saltárselo.",
            ],
          },
          {
            heading: "Cómo lo hice: todo con Claude Code",
            blocks: [
              "Esto es lo que más me gusta contar. Todo el código de Prompt Vault lo he escrito con Claude Code, la herramienta de línea de comandos de Anthropic. No es que haya pegado trocitos generados por una IA y los haya cosido. Claude Code ha sido el motor de todo: desde la estructura del proyecto hasta la integración con Supabase y el despliegue.",
              "El proceso fue iterativo, como debería ser. Empecé con una versión mínima que guardaba prompts en localStorage, sin base de datos ni login. A partir de ahí fui añadiendo capas: primero las categorías y tipos personalizables con su paleta de colores, luego la migración a Supabase con autenticación real y Row Level Security, y por último las funciones de compartir, la papelera y la configuración PWA.",
              "Claude Code ha hecho de todo: crear componentes React completos, escribir políticas de seguridad en Supabase, configurar el OAuth de Google Cloud, diseñar la paleta de colores con contraste accesible, generar el manifiesto PWA con sus iconos… De todo.",
              "El repo está en GitHub y cada push a main despliega automáticamente en Vercel. Del commit a la web en producción, todo automático.",
            ],
          },
          {
            heading: "¿Y ahora qué?",
            blocks: [
              "Prompt Vault ya la uso a diario. Funciona, hace lo que necesito, y me ahorra tiempo de verdad. Pero tengo ideas para seguir: exportar e importar prompts en formatos estándar, carpetas para agrupar prompts relacionados, y un historial de versiones para esos prompts que vas puliendo con el tiempo.",
              "Si quieres verla en acción, está en [prompt-vault-three-xi.vercel.app](https://prompt-vault-three-xi.vercel.app/). Y el código está en [GitHub](https://github.com/4ngel10/prompt-vault). Es un ejemplo real de lo que puedes construir con Claude Code como única herramienta de desarrollo: una app completa con login, base de datos, compartición, diseño responsive y despliegue continuo. Todo desde la terminal.",
            ],
          },
        ],
      },
      en: {
        title: "Prompt Vault: how I built my own prompt vault with Claude Code",
        intro:
          "I have been working with AI tools for months and had a silly but very real problem: I could never find my prompts when I needed them. So I built my own app to keep them. And I built all of it with Claude Code.",
        sections: [
          {
            heading: "It all started with a silly problem",
            blocks: [
              "Here is the thing. If you use ChatGPT, Claude or any AI model fairly often, you end up with a pile of good prompts scattered everywhere. Some in phone notes. Others in a Google Doc you opened once. A few in WhatsApp chats. And the best ones, of course, lost in some old conversation you can no longer find.",
              "I had prompts for generating code, writing templates, skills for tasks I do all the time… and every time I needed one, I spent five minutes digging through screenshots and messages. An absurd waste of time.",
              "Sharing them was even worse. Copy, paste, send over WhatsApp, watch it get lost in the thread… a mess.",
              "So I thought: what if I build a simple app to keep everything in one place?",
            ],
          },
          {
            heading: "What Prompt Vault is",
            blocks: [
              "Prompt Vault is exactly that: my personal vault of AI prompts and skills. A web app where I keep everything I write to work with language models, organized by category, with fast search and one-click copy.",
              "I wanted something I could use from my phone when I am out and from my laptop when I am working. That is why I built it as a PWA. It installs like a native app and opens from its icon, with no browser bar. On Android, iOS or desktop, it works the same.",
              "It has light and dark mode (one button, no digging through settings), real authentication with Google or email, and all data synced to the cloud. If I save a prompt on my phone, it is on my computer instantly.",
            ],
          },
          {
            heading: "The stack (no drama)",
            blocks: [
              "I did not want to overcomplicate things with an exotic stack. I picked tools I know and that work well together:",
              {
                list: [
                  "**React 19 + Vite 8** for the frontend. Vite starts in milliseconds and React is React: it moves fast.",
                  "**Tailwind CSS v4** for styling. Zero loose CSS files. Everything inline, everything consistent.",
                  "**Supabase** for the whole backend: authentication (Google OAuth and email), a PostgreSQL database with Row Level Security, and storage. Like Firebase, but with real SQL.",
                  "**Vercel** for deployment. Push to main and it is in production. I also use Vercel Analytics to see how it is used.",
                  "**vite-plugin-pwa** to turn it into an installable Progressive Web App.",
                ],
              },
              "The typeface is Plus Jakarta Sans, which gives it a clean, modern feel without falling back on the usual suspects.",
            ],
          },
          {
            heading: "What you can do with the app",
            blocks: [
              "Prompt Vault is not a notepad with tags. Everything is designed so that saving and finding prompts feels as natural as copy and paste.",
              { h3: "Types and categories your way" },
              "Every prompt you save has a type and a category. The default types are “Prompt” and “Skill”, but you can create any you like: “Template”, “Agent”, whatever you need. In Spanish, the app even adjusts grammatical gender automatically: if a type ends in -a, it says “nueva” instead of “nuevo”. A silly little detail that I love.",
              "Categories (Writing, Code, Marketing, Productivity, Image) are customizable too. Each one gets a color from a 10-tone pastel palette, all of them meeting AA contrast. Pretty and readable.",
              { h3: "Search and filter" },
              "A search bar at the top filters by title and content in real time. You can also filter by type and category. With 50 or 100 prompts, that is the difference between finding something in 2 seconds and hunting for a while.",
              { h3: "One-click copy" },
              "This is the key part. Click “Copy” and the prompt is on your clipboard, ready to paste into ChatGPT, Claude or anywhere else. A small “Copied” shows up for 2 seconds. Simple and effective.",
              { h3: "Two ways to share" },
              "You can share a prompt in two ways:",
              {
                list: [
                  "**By email:** enter the person's address and it shows up in their vault the next time they sign in. Read-only, so nobody can change it.",
                  "**By public link:** generate a URL and anyone can view it without an account. Change your mind, turn the link off, done.",
                ],
              },
              { h3: "Trash with undo" },
              "When you delete something, it does not disappear. It goes to the trash and you get 6 seconds to change your mind with an “Undo” toast. After that it stays there, reachable from your avatar, for 30 days.",
              { h3: "Dark mode" },
              "A sun/moon button in the header and that is it. The whole interface switches. If you work with prompts at night, it is a must.",
              { h3: "Real security" },
              "Each user only sees their own data. And it is not an “if” in the frontend: it is enforced with Row Level Security in Supabase. The database itself rejects any query that tries to touch someone else's data. There is no way around it.",
            ],
          },
          {
            heading: "How I built it: all with Claude Code",
            blocks: [
              "This is the part I enjoy telling the most. All of Prompt Vault's code was written with Claude Code, Anthropic's command-line tool. I did not paste together bits generated by an AI. Claude Code drove everything: from the project structure to the Supabase integration and the deployment.",
              "The process was iterative, as it should be. I started with a minimal version that stored prompts in localStorage, with no database and no login. From there I added layers: first customizable categories and types with their color palette, then the move to Supabase with real authentication and Row Level Security, and finally sharing, the trash and the PWA setup.",
              "Claude Code did all of it: building complete React components, writing Supabase security policies, configuring Google Cloud OAuth, designing the color palette with accessible contrast, generating the PWA manifest and its icons… Everything.",
              "The repo lives on GitHub and every push to main deploys to Vercel automatically. From commit to production, fully automated.",
            ],
          },
          {
            heading: "What's next?",
            blocks: [
              "I use Prompt Vault every day. It works, it does what I need, and it genuinely saves me time. But I have ideas for what comes next: exporting and importing prompts in standard formats, folders to group related prompts, and version history for those prompts you keep refining over time.",
              "If you want to see it in action, it is at [prompt-vault-three-xi.vercel.app](https://prompt-vault-three-xi.vercel.app/). The code is on [GitHub](https://github.com/4ngel10/prompt-vault). It is a real example of what you can build with Claude Code as your only development tool: a complete app with login, database, sharing, responsive design and continuous deployment. All from the terminal.",
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
    image: "/projects/homelab.jpeg",
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
