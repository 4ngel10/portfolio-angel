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
    slug: "mantenimiento-web-pyme",
    category: "desarrollo",
    date: "2026-11-10",
    ogImage: "/blog/mantenimiento-web-pyme-og.jpg",
    post: {
      es: {
        title: "Mantenimiento web para pymes, qué revisar cada mes",
        seoTitle: "Mantenimiento web para pymes, qué revisar",
        excerpt:
          "Una web publicada no es una web terminada. Estas son las cinco cosas que se rompen sin avisar y la revisión mensual que las detecta a tiempo.",
        description:
          "Mantenimiento web para pymes y autónomos, qué revisar cada mes para no perder clientes sin saberlo. Lo hago en remoto desde Palma de Mallorca.",
        intro:
          "El mantenimiento web para una pyme consiste en revisar cada mes cinco cosas que se rompen sin avisar, el dominio, el certificado de seguridad, el formulario de contacto, la velocidad y los enlaces. Son unos 15 minutos y evitan lo más caro, que es perder consultas sin enterarte.",
        sections: [
          {
            heading: "Una web publicada no es una web terminada",
            blocks: [
              "Cuando se entrega una web, todo funciona. El problema es que una web no vive aislada. Depende de un dominio que se renueva, de un certificado que caduca, de un servicio que envía los mensajes del formulario y de un hosting que se actualiza. Si una de esas piezas falla, la web puede seguir viéndose normal mientras deja de hacer su trabajo.",
              "Lo peligroso es que no suele haber ningún aviso. Nadie te llama para decirte que el formulario no envía, y el cliente que no consigue escribirte no insiste, se va a otro sitio. Por eso conviene mirar la web con regularidad, aunque parezca que va bien.",
              {
                img: "/blog/mantenimiento-web-pyme/cuando-falla-es.webp",
                alt: "Mantenimiento web para pymes, tres fallos silenciosos y su consecuencia. Dominio sin renovar, la web y el correo caen y se pierden consultas. Certificado caducado, aviso de sitio no seguro y el cliente se va. Formulario roto, los mensajes no llegan y un cliente se queda sin respuesta.",
                width: 1600,
                height: 800,
                caption: "Tres fallos que nadie notifica y lo que provocan.",
              },
            ],
          },
          {
            heading: "Las cinco cosas que se rompen sin avisar",
            blocks: [
              { h3: "El dominio y su renovación" },
              "El dominio se paga cada cierto tiempo. Si caduca, la web deja de cargar y el correo que usa ese dominio también. Es un descuido muy común, sobre todo cuando el dominio se compró hace años a nombre de otra persona o con una tarjeta que ya no existe. Conviene saber a nombre de quién está, dónde se renueva y cuándo toca.",
              { h3: "El certificado de seguridad" },
              "El candado junto a la dirección indica que la conexión va cifrada. Cuando el certificado caduca, el navegador muestra un aviso de sitio no seguro y mucha gente cierra la pestaña. Muchos hosting lo renuevan solos, pero no siempre, así que se comprueba.",
              { h3: "El formulario de contacto" },
              "Es la pieza que más dinero mueve y la que más se olvida. Un cambio en el correo, un filtro de spam o un servicio de envío que falla pueden dejar el formulario muerto sin que se vea ningún error. La única forma de saberlo es enviar un mensaje de prueba y comprobar que llega.",
              { h3: "La velocidad en el móvil" },
              "Con el tiempo se suben fotos más pesadas, se añaden herramientas y la web se vuelve lenta. La mayoría de las visitas de un negocio local llegan desde el móvil, así que esa es la prueba que importa. Mi enfoque de rendimiento lo cuento en [por qué uso Next.js en webs de clientes](/blog/por-que-nextjs).",
              { h3: "Los enlaces y los textos" },
              "Un botón que lleva a una página que ya no existe, un horario antiguo o un precio que ya no es el mismo restan confianza. Recorrer la web como lo haría un cliente nuevo suele destapar estos detalles en pocos minutos.",
            ],
          },
          {
            heading: "Revisión mensual de la web en 15 minutos",
            blocks: [
              "No hace falta saber de informática para hacer una revisión básica. Esta es la rutina que recomiendo a un autónomo o a una pyme pequeña, en cinco pasos.",
              {
                ol: [
                  "**Mira la fecha de renovación del dominio** y confirma que el método de pago sigue vigente.",
                  "**Abre la web en el navegador** y comprueba que aparece el candado y que no hay avisos.",
                  "**Envía un mensaje de prueba** por el formulario y verifica que llega a tu bandeja, también a la carpeta de spam.",
                  "**Abre la web desde el móvil** con datos móviles y fíjate en cuánto tarda en cargar.",
                  "**Recorre las páginas principales** buscando enlaces rotos, horarios, teléfonos y precios desactualizados.",
                ],
              },
              {
                img: "/blog/mantenimiento-web-pyme/revision-mensual-es.webp",
                alt: "Lista de revisión mensual del mantenimiento web para una pyme con cinco puntos. Dominio y fecha de renovación, certificado SSL y candado en la barra, formulario de contacto con mensaje de prueba, velocidad con prueba en el móvil, y enlaces y textos recorriendo la web.",
                width: 1600,
                height: 800,
                caption: "La revisión mensual, punto por punto.",
              },
              "Si tu web tiene tienda o pagos, añade una compra de prueba. En mi proyecto [FlexGrip](/proyectos/flexgrip), una tienda con pago por Stripe, ese es el paso que más cuidado merece.",
            ],
          },
          {
            heading: "Qué incluye el mantenimiento web de una pyme y qué no",
            blocks: [
              "Cuando alguien se encarga del mantenimiento por ti, debería cubrir al menos lo siguiente.",
              {
                list: [
                  "**Revisión periódica** del dominio, el certificado, el formulario, la velocidad y los enlaces.",
                  "**Actualizaciones** de lo que use tu web para que no queden versiones antiguas con fallos conocidos.",
                  "**Copias de seguridad** comprobadas, siguiendo la idea de [la regla 3-2-1](/blog/backup-3-2-1).",
                  "**Cambios pequeños** de texto, horarios o precios cuando los necesites.",
                  "**Respuesta rápida** si algo deja de funcionar.",
                ],
              },
              "Lo que normalmente no entra es una web nueva, un rediseño o campañas de publicidad. Son otros trabajos y se presupuestan aparte. Conviene que quede claro desde el principio qué entra y qué no, para que nadie se lleve sorpresas.",
            ],
          },
          {
            heading: "Cuándo conviene encargarlo a alguien",
            blocks: [
              "Si te gusta revisar tu web tú mismo, la rutina de arriba te sirve. Pero muchos negocios prefieren no pensar en ello, y es razonable. Cuando llevas un negocio, el tiempo se va en atender clientes, no en comprobar certificados.",
              "En mis webs me encargo del dominio, el hosting y el mantenimiento, y lo explico en la página de [desarrollo web](/servicios/web#mantenimiento). Para empezar, la web debería estar bien planteada desde el inicio. Qué necesita para conseguir clientes lo cuento en [qué debe tener la web de una pyme](/blog/web-pyme-que-vende). Y si quieres que revise la tuya, [cuéntame tu caso](/#contact).",
            ],
          },
        ],
      },
      en: {
        title: "Website maintenance for small businesses, monthly checks",
        seoTitle: "Website maintenance for small businesses",
        excerpt:
          "A published website is not a finished website. Here are the five things that break without warning and the monthly check that catches them in time.",
        description:
          "Website maintenance for small businesses, what to check every month so you do not lose customers unnoticed. Done remotely from Palma de Mallorca.",
        intro:
          "Website maintenance for a small business means checking five things every month that break without warning, the domain, the security certificate, the contact form, the speed and the links. It takes about 15 minutes and prevents the most expensive problem, losing enquiries without knowing it.",
        sections: [
          {
            heading: "A published website is not a finished website",
            blocks: [
              "When a website is delivered, everything works. The problem is that a website does not live on its own. It depends on a domain that must be renewed, a certificate that expires, a service that sends the form messages and a hosting plan that gets updated. If one of those pieces fails, the site can look normal while it stops doing its job.",
              "The dangerous part is that there is usually no warning. Nobody calls to tell you the form does not send, and a customer who cannot reach you does not insist, they go somewhere else. That is why it pays to look at your website regularly, even when it seems fine.",
              {
                img: "/blog/mantenimiento-web-pyme/cuando-falla-en.webp",
                alt: "Website maintenance for small businesses, three silent failures and their consequence. Domain not renewed, site and email go down and enquiries are lost. Expired certificate, unsafe site warning and the customer leaves. Broken form, messages never arrive and a customer is left unanswered.",
                width: 1600,
                height: 800,
                caption: "Three failures nobody reports and what they cause.",
              },
            ],
          },
          {
            heading: "The five things that break without warning",
            blocks: [
              { h3: "The domain and its renewal" },
              "The domain is paid for periodically. If it expires, the website stops loading and so does any email that uses that domain. It is a very common oversight, especially when the domain was bought years ago in someone else's name or with a card that no longer exists. You should know whose name it is under, where it is renewed and when.",
              { h3: "The security certificate" },
              "The padlock next to the address shows the connection is encrypted. When the certificate expires, the browser shows an unsafe site warning and many people close the tab. Many hosting plans renew it automatically, but not always, so you check.",
              { h3: "The contact form" },
              "It is the piece that moves the most money and the one most often forgotten. A change of email, a spam filter or a sending service that fails can leave the form dead with no visible error. The only way to know is to send a test message and check it arrives.",
              { h3: "Speed on mobile" },
              "Over time heavier photos get uploaded, tools get added and the site slows down. Most visits to a local business come from a phone, so that is the test that matters. I explain my approach to performance in [why I use Next.js for client websites](/blog/por-que-nextjs).",
              { h3: "Links and texts" },
              "A button that leads to a page that no longer exists, an old opening time or a price that has changed all reduce trust. Browsing the site the way a new customer would usually reveals these details in a few minutes.",
            ],
          },
          {
            heading: "The monthly website check in 15 minutes",
            blocks: [
              "You do not need IT knowledge to do a basic check. This is the routine I recommend to a freelancer or a small business, in five steps.",
              {
                ol: [
                  "**Look at the domain renewal date** and confirm the payment method is still valid.",
                  "**Open the website in your browser** and check the padlock appears and there are no warnings.",
                  "**Send a test message** through the form and verify it reaches your inbox, spam folder included.",
                  "**Open the website on your phone** using mobile data and notice how long it takes to load.",
                  "**Browse the main pages** looking for broken links and outdated opening times, phone numbers and prices.",
                ],
              },
              {
                img: "/blog/mantenimiento-web-pyme/revision-mensual-en.webp",
                alt: "Monthly website maintenance checklist for a small business with five points. Domain and renewal date, SSL certificate and the padlock in the bar, contact form with a test message, speed with a test on your phone, and links and texts by browsing the site.",
                width: 1600,
                height: 800,
                caption: "The monthly check, point by point.",
              },
              "If your website has a shop or payments, add a test purchase. In my project [FlexGrip](/proyectos/flexgrip), a shop with Stripe payments, that is the step that deserves the most care.",
            ],
          },
          {
            heading: "What website maintenance for a small business includes and what it does not",
            blocks: [
              "When someone takes care of maintenance for you, it should cover at least the following.",
              {
                list: [
                  "**Regular checks** of the domain, the certificate, the form, the speed and the links.",
                  "**Updates** of whatever your website uses, so old versions with known flaws do not linger.",
                  "**Verified backups**, following the idea of [the 3-2-1 rule](/blog/backup-3-2-1).",
                  "**Small changes** to texts, opening times or prices when you need them.",
                  "**Fast response** if something stops working.",
                ],
              },
              "What normally does not fall under it is a new website, a redesign or advertising campaigns. Those are separate jobs quoted separately. It helps to be clear from the start about what is in and what is out, so nobody gets surprises.",
            ],
          },
          {
            heading: "When it makes sense to hand it over",
            blocks: [
              "If you like checking your website yourself, the routine above works for you. But many businesses prefer not to think about it, and that is reasonable. When you run a business, your time goes on serving customers, not on checking certificates.",
              "On my websites I take care of the domain, hosting and maintenance, and I explain it on the [web development](/servicios/web#mantenimiento) page. To begin with, the website should be well planned from the start. What it needs to win customers is covered in [what a small business website needs](/blog/web-pyme-que-vende). And if you want me to review yours, [tell me about your case](/#contact).",
            ],
          },
        ],
      },
    },
  },
  {
    slug: "vpn-pyme-acceso-remoto",
    category: "sistemas",
    date: "2026-11-02",
    ogImage: "/blog/vpn-pyme-acceso-remoto-og.jpg",
    post: {
      es: {
        title: "VPN para pymes, acceder a la oficina desde fuera sin abrir puertos en el router",
        seoTitle: "VPN para pymes, acceso remoto seguro",
        excerpt:
          "Abrir puertos en el router para trabajar desde casa es cómodo y peligroso. Te explico cómo funciona una VPN y qué necesita una pyme para usarla bien.",
        description:
          "VPN para pymes: cómo acceder a la red de la oficina desde fuera sin abrir puertos en el router, cómo funciona en la práctica y qué errores evitar al montarla.",
        intro:
          "Cuando alguien necesita entrar al servidor o al escritorio de la oficina desde casa, lo primero que se suele hacer es abrir un puerto en el router. Funciona, pero deja un servicio de tu red visible para cualquiera en Internet. Una VPN resuelve lo mismo con mucho menos riesgo, y no hace falta ser una gran empresa para tenerla.",
        sections: [
          {
            heading: "Por qué no conviene abrir puertos en el router",
            blocks: [
              "Un puerto abierto es una puerta al exterior. En cuanto existe, hay escáneres automáticos que lo encuentran y empiezan a probar contraseñas, versiones antiguas y fallos conocidos. No hace falta que seas un objetivo: basta con que la puerta esté ahí.",
              "Además, cada servicio expuesto es algo más que actualizar y vigilar. Con varios puertos abiertos, el riesgo crece sin que nadie lo note, sobre todo si el equipo no tiene a alguien dedicado a sistemas.",
              {
                img: "/blog/vpn-pyme-acceso-remoto/puerto-vs-vpn-es.webp",
                alt: "Comparativa de dos formas de entrar a la red de la oficina. Con puerto abierto, Internet llega al servidor a través del router y lo ven los escáneres. Con VPN, solo el puerto de la VPN está abierto en el router y entra únicamente quien tiene credencial.",
                width: 1600,
                height: 800,
                caption: "Puerto abierto frente a VPN.",
              },
            ],
          },
          {
            heading: "Cómo funciona una VPN en la práctica",
            blocks: [
              "Una VPN crea un túnel cifrado entre el dispositivo de la persona (portátil, móvil o tablet) y la red de la oficina. Mientras está conectada, el equipo se comporta como si estuviera dentro: ve el servidor, las carpetas compartidas, las impresoras y puede abrir el escritorio remoto. Si ese escritorio es un servidor RDS, en el proyecto de [mapeo de impresoras en RDS con PowerShell](/proyectos/mapeo-impresoras-rds) cuento cómo dejo las impresoras listas al iniciar sesión.",
              "Lo importante es lo que no pasa: los servicios internos ya no se publican en Internet. Solo queda abierto un puerto, el de la propia VPN, y no responde a quien no lleva una clave válida.",
              "En mi homelab uso WireGuard, una VPN moderna, rápida y muy ligera. Cuando estoy fuera me conecto y el móvil se comporta como si estuviera en casa. Lo cuento en el proyecto [Homelab personal sobre Proxmox](/proyectos/homelab-proxmox). Es el mismo principio que aplicaría a una oficina pequeña.",
              {
                img: "/blog/vpn-pyme-acceso-remoto/flujo-vpn-es.webp",
                alt: "Flujo de acceso con VPN: un portátil o móvil con la app VPN activa se conecta por un túnel cifrado a través de Internet, atraviesa el router por un solo puerto y llega a la red de la oficina, con escritorio remoto, archivos e impresoras.",
                width: 1600,
                height: 800,
                caption: "Recorrido de una conexión desde fuera de la oficina.",
              },
            ],
          },
          {
            heading: "Qué necesita una pyme para montarla",
            blocks: [
              "No es un proyecto enorme. Estas son las piezas que reviso antes de empezar:",
              {
                ol: [
                  "**Dónde vive la VPN:** el propio router si lo permite, un pequeño servidor o un contenedor en una máquina que ya esté encendida.",
                  "**Quién necesita entrar:** una lista corta de personas y dispositivos. Cada uno con su propia clave, no una compartida.",
                  "**A qué debe llegar cada uno:** no todo el mundo necesita ver todo. Se limita el acceso a lo que cada persona usa.",
                  "**Cómo se da de baja a alguien:** si un portátil se pierde o alguien deja la empresa, se retira su clave y el resto sigue funcionando.",
                  "**Cómo se conecta el usuario:** una app instalada y configurada una vez, con un solo botón para activar o desactivar.",
                ],
              },
            ],
          },
          {
            heading: "Errores comunes",
            blocks: [
              {
                list: [
                  "**Compartir una sola clave** entre varias personas: nadie sabe quién se conecta y no se puede retirar a uno sin afectar a todos.",
                  "**Dejar el escritorio remoto abierto además de la VPN:** se pierde justo lo que se quería ganar.",
                  "**No actualizar el servidor VPN ni el router.** Que sea seguro no significa que se pueda olvidar.",
                  "**Dar acceso a toda la red a todos** en lugar de solo a lo necesario.",
                  "**No tener una copia de la configuración.** Si falla el equipo, hay que volver a repartir las claves. Lo trato en [la regla de copias 3-2-1](/blog/backup-3-2-1).",
                ],
              },
              "Si en tu negocio alguien accede hoy desde fuera con un puerto abierto, es de las primeras cosas que revisaría. Puedes ver qué hago en [sistemas](/servicios/sistemas) o [contarme tu caso](/#contact).",
            ],
          },
        ],
      },
      en: {
        title:
          "VPN for small businesses, reaching the office from outside without opening router ports",
        seoTitle: "VPN for small businesses, secure remote access",
        excerpt:
          "Opening ports on the router to work from home is convenient and risky. Here is how a VPN works and what a small business needs to use it well.",
        description:
          "VPN for small businesses: how to reach the office network from outside without opening router ports, how it works in practice and which mistakes to avoid when setting it up.",
        intro:
          "When someone needs to reach the office server or desktop from home, the first thing people usually do is open a port on the router. It works, but it leaves a service on your network visible to anyone on the Internet. A VPN does the same job with far less risk, and you do not need to be a big company to have one.",
        sections: [
          {
            heading: "Why you should not open ports on the router",
            blocks: [
              "An open port is a door to the outside. As soon as it exists, automated scanners find it and start trying passwords, old versions and known flaws. You do not have to be a target: the door just has to be there.",
              "On top of that, every exposed service is one more thing to update and watch. With several open ports the risk grows without anyone noticing, especially if the team has nobody dedicated to systems.",
              {
                img: "/blog/vpn-pyme-acceso-remoto/puerto-vs-vpn-en.webp",
                alt: "Comparison of two ways into the office network. With an open port, the Internet reaches the server through the router and scanners can see it. With a VPN, only the VPN port is open on the router and only people with credentials get in.",
                width: 1600,
                height: 800,
                caption: "Open port versus VPN.",
              },
            ],
          },
          {
            heading: "How a VPN works in practice",
            blocks: [
              "A VPN creates an encrypted tunnel between the person's device (laptop, phone or tablet) and the office network. While it is connected, the device behaves as if it were inside: it sees the server, shared folders and printers, and it can open remote desktop. If that desktop is an RDS server, in the project on [printer mapping on RDS with PowerShell](/proyectos/mapeo-impresoras-rds) I describe how I leave the printers ready at sign in.",
              "What matters is what no longer happens: internal services are not published on the Internet. Only one port stays open, the VPN's own, and it does not answer anyone without a valid key.",
              "In my homelab I use WireGuard, a modern, fast and very light VPN. When I am away I connect and my phone behaves as if it were at home. I describe it in the project [Personal homelab on Proxmox](/proyectos/homelab-proxmox). It is the same principle I would apply to a small office.",
              {
                img: "/blog/vpn-pyme-acceso-remoto/flujo-vpn-en.webp",
                alt: "Access flow with a VPN: a laptop or phone with the VPN app on connects through an encrypted tunnel over the Internet, passes the router through a single port and reaches the office network, with remote desktop, files and printers.",
                width: 1600,
                height: 800,
                caption: "Path of a connection from outside the office.",
              },
            ],
          },
          {
            heading: "What a small business needs to set it up",
            blocks: [
              "It is not a huge project. These are the pieces I check before starting:",
              {
                ol: [
                  "**Where the VPN lives:** the router itself if it allows it, a small server or a container on a machine that is already on.",
                  "**Who needs to get in:** a short list of people and devices. Each with their own key, not a shared one.",
                  "**What each person should reach:** not everyone needs to see everything. Access is limited to what each person uses.",
                  "**How someone is removed:** if a laptop is lost or someone leaves the company, their key is revoked and everyone else keeps working.",
                  "**How the user connects:** an app installed and set up once, with a single button to turn it on or off.",
                ],
              },
            ],
          },
          {
            heading: "Common mistakes",
            blocks: [
              {
                list: [
                  "**Sharing a single key** between several people: nobody knows who is connected and you cannot remove one person without affecting everyone.",
                  "**Leaving remote desktop open as well as the VPN:** you lose exactly what you wanted to gain.",
                  "**Not updating the VPN server or the router.** Being secure does not mean it can be forgotten.",
                  "**Giving everyone access to the whole network** instead of only what they need.",
                  "**Not keeping a copy of the configuration.** If the machine fails, the keys have to be handed out again. I cover this in [the 3-2-1 backup rule](/blog/backup-3-2-1).",
                ],
              },
              "If someone at your business reaches the office from outside through an open port today, it is one of the first things I would review. You can see what I do in [systems](/servicios/sistemas) or [tell me about your case](/#contact).",
            ],
          },
        ],
      },
    },
  },
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
          "Qué debe tener la web de una pyme para conseguir clientes, con mensaje claro, contacto visible, velocidad en móvil y SEO local. Y qué elementos sobran.",
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
            heading: "Velocidad y móvil, la mayoría llega desde el teléfono",
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
              "Una web pequeña y clara, bien mantenida, rinde más que una grande y confusa. Qué revisar para mantenerla al día lo cuento en [el mantenimiento de la web de una pyme](/blog/mantenimiento-web-pyme).",
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
          "What a small business website needs to win customers, with a clear message, visible contact, mobile speed and local SEO. And what a company site can skip.",
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
            heading: "Speed and mobile, most people arrive from a phone",
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
                  '**A title and a description per page** that include what you do and the city, for example: "Renovations in Palma de Mallorca".',
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
              "A small, clear, well-maintained site performs better than a big, confusing one. What to check to keep it up to date is covered in [maintaining a small business website](/blog/mantenimiento-web-pyme).",
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
        title: "Backup 3-2-1, qué es y cómo lo aplico en empresas",
        seoTitle: "Backup 3-2-1, qué es y cómo aplicarlo",
        excerpt:
          "Tres copias, dos soportes y una fuera de la oficina. Te explico la regla 3-2-1 y cómo la monto con Nakivo y Acronis.",
        description:
          "Qué es la regla de backup 3-2-1 y cómo aplicarla en tu empresa con Nakivo, Veeam y Acronis. Una estrategia sencilla para no perder datos ni días de trabajo.",
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
              "Y hay que pensar en lo que cuesta un día parado. Sin correo, sin facturación y sin acceso a los archivos, una oficina no trabaja. La copia de seguridad es lo que convierte ese día en una hora. Lo mismo vale para el acceso remoto. Si falla el equipo de la [VPN de la oficina](/blog/vpn-pyme-acceso-remoto), nadie entra desde casa hasta que se repone, y con su configuración copiada eso lleva minutos.",
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
            heading: "La parte que casi nadie hace, probar",
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
        title: "3-2-1 backup, what it is and how I apply it in companies",
        excerpt:
          "Three copies, two media and one off-site. I explain the 3-2-1 rule and how I set it up with Nakivo and Acronis.",
        description:
          "What the 3-2-1 backup rule is and how to apply it in your company with Nakivo, Veeam and Acronis. A simple strategy so you never lose data or days of work.",
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
              "And think about what a day of downtime costs. No email, no invoicing and no access to files means the office simply stops. A backup is what turns that day into an hour. The same goes for remote access. If the machine running the [office VPN](/blog/vpn-pyme-acceso-remoto) fails, nobody can get in from home until it is replaced, and with its configuration backed up that takes minutes.",
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
            heading: "The part almost nobody does, testing",
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
          "Next.js frente a WordPress en webs corporativas, con rendimiento, SEO, seguridad y mantenimiento. Cuándo tiene sentido una web profesional con Next.js.",
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
            heading: "Rendimiento, la web ya está hecha cuando llega la visita",
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
            heading: "Seguridad, menos piezas, menos puertas",
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
              "Next.js no es para todo. Si quieres editar cada día textos, imágenes y páginas por tu cuenta, con un editor visual, WordPress te da más autonomía desde el primer día. Y para una aplicación con usuarios y base de datos, como [Prompt Vault](/proyectos/prompt-vault), que construí con React y Vite, el planteamiento es distinto.",
              "Lo mismo con un blog grande con varias personas publicando. Ahí la solución suele ser un punto intermedio: Next.js para la web y un gestor de contenidos aparte (un CMS headless) para que el equipo escriba sin tocar código.",
              "Para una web corporativa, un portfolio o una landing page que cambian de vez en cuando, Next.js gana en casi todo. Qué debe llevar esa web para conseguir clientes lo cuento en [la web de una pyme que consigue clientes](/blog/web-pyme-que-vende).",
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
          "Next.js vs WordPress for company websites, on performance, SEO, security and maintenance. When a professional Next.js website makes sense.",
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
            heading: "Performance, the page is ready before the visitor arrives",
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
            heading: "Security, fewer parts, fewer doors",
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
              "Next.js is not for everything. If you want to edit text, images and pages yourself every day with a visual editor, WordPress gives you more independence from day one. And for an application with users and a database, like [Prompt Vault](/proyectos/prompt-vault), which I built with React and Vite, the approach is different.",
              "The same goes for a large blog with several people publishing. There the answer is usually a middle ground: Next.js for the website and a separate content manager (a headless CMS) so the team can write without touching code.",
              "For a company website, a portfolio or a landing page that changes now and then, Next.js wins on almost everything. What that site needs to win customers is covered in [the small business website that wins customers](/blog/web-pyme-que-vende).",
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
