/**
 * Contenido de las páginas de servicio, en los dos idiomas.
 * Cada servicio tiene su página en /servicios/<id> (app/servicios/[id]/page.tsx),
 * a la que enlaza su card de la home (components/services.tsx).
 *
 * Todo sale de lo que ya cuenta la web: stack técnico, áreas de trabajo
 * y proyectos. Si añades una tecnología, añádela aquí también.
 * En el texto vale **negrita** y [enlace](/ruta). Sin em dashes.
 */

import type { Locale } from "./i18n";

/** `id` es el ancla del apartado (/servicios/sistemas#redes); igual en los dos idiomas. */
export type ServiceGroup = {
  id: string;
  title: string;
  /** Una frase con el problema que resuelve; se muestra bajo el título. */
  lead?: string;
  items: string[];
  tools?: string[];
};

export type ServiceMode = { title: string; text: string };
export type ServiceFaq = { q: string; a: string };

export type ServiceDetail = {
  id: string;
  /** Prefijo de las claves de la card en messages/*.json: s1, s2. */
  key: string;
  intro: Record<Locale, string[]>;
  /** Texto del bloque final, antes del botón de contacto. */
  closing: Record<Locale, string>;
  groups: Record<Locale, ServiceGroup[]>;
  /** Secciones opcionales, de momento solo en sistemas: modalidades y preguntas. */
  /** Proyectos reales: slugs de PROJECTS, y "self" para la card de esta misma web. */
  projects?: string[];
  modes?: Record<Locale, { title: string; lead: string; note: string; items: ServiceMode[] }>;
  faq?: Record<Locale, { title: string; items: ServiceFaq[] }>;
};

export const SERVICES: ServiceDetail[] = [
  {
    id: "sistemas",
    key: "s1",
    intro: {
      es: [
        "Me ocupo de la informática de tu empresa, desde las copias de seguridad y el correo hasta la red, los equipos y los servidores. Para autónomos, pymes y negocios que empiezan, en remoto o presencial.",
        "Desde hace 3 años formo parte del equipo de sistemas de una empresa de servicios IT que lleva más de 60 hoteles, 120 servidores y 1.000 usuarios. Llevo esa misma forma de trabajar a tu negocio, con documentación, copias probadas y cambios planificados.",
      ],
      en: [
        "I look after your company's IT, from backups and email to the network, devices and servers. For freelancers, small businesses and new ventures, remotely or on site.",
        "For the past 3 years I've been part of the systems team at an IT services company that looks after more than 60 hotels, 120 servers and 1,000 users. I bring that same way of working to your business, with documentation, tested backups and planned changes.",
      ],
    },
    closing: {
      es: "Cuéntame qué tienes montado y qué te preocupa. Empezamos con una llamada gratuita de 15 minutos y después te envío un presupuesto. Respondo en 24 horas.",
      en: "Tell me what you have in place and what worries you. We start with a free 15-minute call and then I send you a quote. I reply within 24 hours.",
    },
    groups: {
      es: [
        {
          id: "backup",
          title: "Copias de seguridad y continuidad",
          lead: "Que un fallo o un ataque no te haga perder datos ni días de trabajo.",
          items: [
            "Copias automáticas con la regla [3-2-1](/blog/backup-3-2-1), siempre con una copia fuera de la oficina.",
            "Reviso cada día que se han hecho y pruebo a restaurarlas cada cierto tiempo.",
            "Un plan claro para volver a trabajar rápido si algo falla.",
          ],
          tools: ["Veeam", "Nakivo", "Acronis"],
        },
        {
          id: "microsoft-365",
          title: "Microsoft 365 y correo",
          lead: "Correo, archivos y equipo de trabajo ordenados y protegidos.",
          items: [
            "Altas, bajas, licencias y permisos de tu equipo.",
            "Filtro de correo contra spam, phishing y suplantaciones.",
            "SharePoint y OneDrive organizados, con copia de seguridad.",
          ],
          tools: [
            "Microsoft 365",
            "Azure",
            "SharePoint",
            "Hornetsecurity",
            "FortiMail",
            "AvePoint",
          ],
        },
        {
          id: "redes",
          title: "Redes, wifi y seguridad",
          lead: "Una red rápida y segura, con cada cosa en su sitio.",
          items: [
            "Wifi estable en toda la oficina o el local, también para clientes.",
            "Firewall y red separada por tipos de equipo, para que un problema no se extienda.",
            "Acceso remoto seguro por VPN para trabajar desde fuera.",
          ],
          tools: ["Fortinet", "pfSense", "OPNsense", "UniFi", "Omada"],
        },
        {
          id: "dispositivos",
          title: "Equipos y soporte",
          lead: "Ordenadores y móviles al día, y alguien que responde cuando algo falla.",
          items: [
            "Soporte remoto a tu equipo, sin esperar a que vaya nadie.",
            "Actualizaciones, antivirus y control de los equipos desde un panel central.",
            "Aviso automático si un equipo o servidor da problemas, antes de que lo notes.",
          ],
          tools: ["NinjaOne", "Intune", "SOTI", "Zabbix", "Grafana"],
        },
        {
          id: "servidores",
          title: "Servidores y virtualización",
          lead: "Servidores en la oficina o en la nube, estables y documentados.",
          items: [
            "Instalación y mantenimiento de Windows Server y Active Directory.",
            "Virtualización con Hyper-V, VMware o Proxmox para aprovechar mejor el hardware.",
            "Tareas repetitivas automatizadas con PowerShell.",
          ],
          tools: [
            "Windows Server",
            "Active Directory",
            "Hyper-V",
            "VMware",
            "Proxmox",
            "Docker",
            "PowerShell",
            "Azure",
          ],
        },
        {
          id: "voip",
          title: "Centralita y telefonía",
          lead: "Teléfonos que funcionan en la oficina y en el móvil.",
          items: [
            "Centralita 3CX con extensiones, colas y desvíos.",
            "Líneas SIP para pagar menos en telefonía.",
            "App en el móvil para atender las llamadas desde fuera.",
          ],
          tools: ["3CX"],
        },
      ],
      en: [
        {
          id: "backup",
          title: "Backups and business continuity",
          lead: "So a failure or an attack doesn't cost you data or days of work.",
          items: [
            "Automatic backups following the [3-2-1](/blog/backup-3-2-1) rule, always with a copy off site.",
            "I check every day that they ran, and test restoring them regularly.",
            "A clear plan to get back to work fast if something breaks.",
          ],
          tools: ["Veeam", "Nakivo", "Acronis"],
        },
        {
          id: "microsoft-365",
          title: "Microsoft 365 and email",
          lead: "Email, files and your team's workspace, organised and protected.",
          items: [
            "New starters, leavers, licences and permissions.",
            "Email filtering against spam, phishing and impersonation.",
            "SharePoint and OneDrive organised and backed up.",
          ],
          tools: [
            "Microsoft 365",
            "Azure",
            "SharePoint",
            "Hornetsecurity",
            "FortiMail",
            "AvePoint",
          ],
        },
        {
          id: "redes",
          title: "Networks, wifi and security",
          lead: "A fast, secure network with everything in its place.",
          items: [
            "Reliable wifi across the office or shop, guests included.",
            "Firewall and a network split by device type, so one problem doesn't spread.",
            "Secure remote access over VPN to work from anywhere.",
          ],
          tools: ["Fortinet", "pfSense", "OPNsense", "UniFi", "Omada"],
        },
        {
          id: "dispositivos",
          title: "Devices and support",
          lead: "Computers and phones kept up to date, and someone who answers when something breaks.",
          items: [
            "Remote support for your team, without waiting for a visit.",
            "Updates, antivirus and device control from a central dashboard.",
            "Automatic alerts if a computer or server has problems, before you notice.",
          ],
          tools: ["NinjaOne", "Intune", "SOTI", "Zabbix", "Grafana"],
        },
        {
          id: "servidores",
          title: "Servers and virtualisation",
          lead: "Servers on site or in the cloud, stable and documented.",
          items: [
            "Windows Server and Active Directory setup and maintenance.",
            "Virtualisation with Hyper-V, VMware or Proxmox to get more out of your hardware.",
            "Repetitive tasks automated with PowerShell.",
          ],
          tools: [
            "Windows Server",
            "Active Directory",
            "Hyper-V",
            "VMware",
            "Proxmox",
            "Docker",
            "PowerShell",
            "Azure",
          ],
        },
        {
          id: "voip",
          title: "Phone system",
          lead: "Phones that work in the office and on your mobile.",
          items: [
            "3CX phone system with extensions, queues and call forwarding.",
            "SIP lines to cut your phone bill.",
            "A mobile app to take calls from anywhere.",
          ],
          tools: ["3CX"],
        },
      ],
    },
    modes: {
      es: {
        title: "Cómo podemos trabajar.",
        lead: "Me adapto a lo que necesites. Estas son las formas más habituales.",
        note: "En remoto desde el primer día. Presencial en Mallorca y en cualquier otro lugar, con el desplazamiento por cuenta del cliente.",
        items: [
          {
            title: "Proyecto puntual",
            text: "Una instalación, una migración o un cambio concreto, con presupuesto antes de empezar.",
          },
          {
            title: "Bolsa de horas",
            text: "Horas de soporte que se descuentan según se usan y no caducan. Las ves en tu área de clientes.",
          },
          {
            title: "Mantenimiento continuo",
            text: "Reviso cada mes que todo siga en orden, con actualizaciones y copias comprobadas.",
          },
          {
            title: "Auditoría y mejoras",
            text: "Reviso tu infraestructura y te entrego un informe con lo que funciona, lo que falla y qué mejorar primero.",
          },
          {
            title: "Estudio de viabilidad",
            text: "Antes de invertir, analizo si una solución encaja en tu negocio y qué necesitarías.",
          },
          {
            title: "Urgencias",
            text: "Si algo crítico se cae, lo atiendo también fuera de horario.",
          },
        ],
      },
      en: {
        title: "How we can work together.",
        lead: "I adapt to what you need. These are the most common options.",
        note: "Remote from day one. On site in Mallorca and anywhere else, with travel costs covered by the client.",
        items: [
          {
            title: "One-off project",
            text: "An installation, a migration or a specific change, quoted before we start.",
          },
          {
            title: "Hour bank",
            text: "Support hours used as you need them, with no expiry. You can track them in your client area.",
          },
          {
            title: "Ongoing maintenance",
            text: "Every month I check everything is in order, with updates and verified backups.",
          },
          {
            title: "Audit and improvements",
            text: "I review your infrastructure and give you a report on what works, what doesn't and what to fix first.",
          },
          {
            title: "Feasibility study",
            text: "Before you invest, I check whether a solution fits your business and what it would take.",
          },
          {
            title: "Emergencies",
            text: "If something critical goes down, I handle it outside business hours too.",
          },
        ],
      },
    },
    faq: {
      es: {
        title: "Preguntas frecuentes.",
        items: [
          {
            q: "¿Trabajas en remoto?",
            a: "Sí. La mayoría del soporte se hace en remoto, que es más rápido. Si hace falta, voy en persona.",
          },
          {
            q: "¿Atiendes urgencias fuera de horario?",
            a: "Sí. Si algo crítico deja de funcionar, avísame y lo atiendo aunque sea fuera de horario.",
          },
          {
            q: "¿Cuánto cuesta?",
            a: "Depende de lo que necesites. Tras la llamada gratuita de 15 minutos te envío un presupuesto, sin compromiso.",
          },
          {
            q: "¿Trabajas con empresas pequeñas?",
            a: "Sí, con autónomos, pymes y negocios que empiezan. No hace falta tener un servidor para necesitar ayuda con la informática.",
          },
          {
            q: "¿Y si ya tengo un informático o un proveedor?",
            a: "Puedo encargarme de una parte concreta, como las copias o la red, o hacer una auditoría para ver qué mejorar.",
          },
        ],
      },
      en: {
        title: "FAQ.",
        items: [
          {
            q: "Do you work remotely?",
            a: "Yes. Most support is done remotely, which is faster. If needed, I come on site.",
          },
          {
            q: "Do you handle emergencies outside business hours?",
            a: "Yes. If something critical stops working, let me know and I'll handle it even outside business hours.",
          },
          {
            q: "How much does it cost?",
            a: "It depends on what you need. After the free 15-minute call I send you a quote, with no obligation.",
          },
          {
            q: "Do you work with small businesses?",
            a: "Yes, with freelancers, small businesses and new ventures. You don't need a server to need help with IT.",
          },
          {
            q: "What if I already have an IT person or provider?",
            a: "I can take on a specific part, like backups or the network, or run an audit to see what to improve.",
          },
        ],
      },
    },
  },
  {
    id: "web",
    key: "s2",
    intro: {
      es: [
        "Diseño y desarrollo webs a medida para autónomos, pymes y negocios que empiezan. Una web sencilla puede estar lista en una semana, y me encargo del dominio, el hosting y el mantenimiento.",
        "Tratas siempre con la misma persona, de la primera idea a la publicación. Y como también soy administrador de sistemas, la parte que no se ve, el servidor, la seguridad y las copias, queda igual de bien resuelta.",
      ],
      en: [
        "I design and build custom websites for freelancers, small businesses and new ventures. A simple site can be ready in a week, and I take care of the domain, hosting and maintenance.",
        "You always deal with the same person, from the first idea to launch. And since I'm also a systems administrator, the part you don't see, the server, security and backups, is just as well looked after.",
      ],
    },
    closing: {
      es: "¿Quieres crear la web de tu negocio o renovar la que tienes? Empezamos con una llamada gratuita de 15 minutos y después te envío un presupuesto. Respondo en 24 horas.",
      en: "Want to build your business website or refresh the one you have? We start with a free 15-minute call and then I send you a quote. I reply within 24 hours.",
    },
    groups: {
      es: [
        {
          id: "diseno",
          title: "Diseño y desarrollo a medida",
          lead: "Una web propia, pensada para tu negocio y para que te contacten.",
          items: [
            "Webs corporativas, landing pages, tiendas online o webs para restaurantes.",
            "Diseño propio para cada proyecto, sin plantillas genéricas.",
            "Hecha con Next.js y TypeScript, rápida y fácil de mantener. Te cuento [por qué lo elijo](/blog/por-que-nextjs).",
          ],
          tools: ["Next.js", "TypeScript", "React", "Tailwind CSS"],
        },
        {
          id: "rendimiento",
          title: "Rendimiento y SEO",
          lead: "Rápida en el móvil y lista para que te encuentren en Google.",
          items: [
            "Se ve bien en móvil, tablet y escritorio.",
            "Carga rápida, que también cuenta para Google.",
            "Títulos, descripciones, sitemap y vistas previas cuidadas al compartir en redes.",
          ],
        },
        {
          id: "despliegue",
          title: "Dominio, hosting y despliegue",
          lead: "Tú no te preocupas de la parte técnica, me encargo yo.",
          items: [
            "Registro del dominio, DNS y certificado SSL para una conexión segura.",
            "Publicación en Vercel o en un servidor propio, según lo que necesite el proyecto.",
            "Cada cambio se publica solo, sin tocar nada a mano en producción.",
          ],
          tools: ["Vercel", "Nginx", "Apache", "GitLab"],
        },
        {
          id: "mantenimiento",
          title: "Mantenimiento",
          lead: "Tu web siempre al día, con alguien que la conoce y responde rápido.",
          items: [
            "Cambios de textos, fotos y contenido cuando lo necesites.",
            "Actualizaciones y mejoras periódicas.",
            "Un contacto directo que conoce el proyecto a fondo.",
          ],
        },
        {
          id: "aplicaciones",
          title: "Aplicaciones web",
          lead: "Cuando necesitas algo más que una web, con usuarios y datos.",
          items: [
            "Apps con inicio de sesión y base de datos, y me encargo también del servidor.",
            "Instalables en el móvil (PWA), como una app normal.",
            "Un ejemplo real es [Prompt Vault](/proyectos/prompt-vault), hecho con React y Supabase.",
          ],
          tools: ["React", "Supabase", "PWA"],
        },
        {
          id: "detalles",
          title: "Detalles que marcan la diferencia",
          lead: "Lo que muchas webs olvidan y tus clientes notan.",
          items: [
            "Web en varios idiomas para llegar a más clientes.",
            "Modo claro y oscuro según la preferencia de cada visitante.",
            "Accesible, con buen contraste y navegable con teclado.",
          ],
        },
      ],
      en: [
        {
          id: "diseno",
          title: "Custom design and development",
          lead: "A website of your own, built for your business and to get you contacted.",
          items: [
            "Company sites, landing pages, online stores or restaurant websites.",
            "An original design for each project, no generic templates.",
            "Built with Next.js and TypeScript, fast and easy to maintain. Here's [why I choose it](/blog/por-que-nextjs).",
          ],
          tools: ["Next.js", "TypeScript", "React", "Tailwind CSS"],
        },
        {
          id: "rendimiento",
          title: "Performance and SEO",
          lead: "Fast on mobile and ready to be found on Google.",
          items: [
            "Looks right on phone, tablet and desktop.",
            "Loads fast, which Google rewards too.",
            "Titles, descriptions, sitemap and polished previews when shared on social media.",
          ],
        },
        {
          id: "despliegue",
          title: "Domain, hosting and deployment",
          lead: "You don't worry about the technical side, I handle it.",
          items: [
            "Domain registration, DNS and SSL certificate for a secure connection.",
            "Hosted on Vercel or your own server, depending on what the project needs.",
            "Every change goes live automatically, with no manual steps in production.",
          ],
          tools: ["Vercel", "Nginx", "Apache", "GitLab"],
        },
        {
          id: "mantenimiento",
          title: "Maintenance",
          lead: "Your website always up to date, with someone who knows it and replies fast.",
          items: [
            "Text, photo and content changes whenever you need them.",
            "Regular updates and improvements.",
            "A direct contact who knows the project inside out.",
          ],
        },
        {
          id: "aplicaciones",
          title: "Web applications",
          lead: "When you need more than a website, with users and data.",
          items: [
            "Apps with sign-in and a database, and I look after the server too.",
            "Installable on your phone (PWA), just like a regular app.",
            "A real example is [Prompt Vault](/proyectos/prompt-vault), built with React and Supabase.",
          ],
          tools: ["React", "Supabase", "PWA"],
        },
        {
          id: "detalles",
          title: "Details that make the difference",
          lead: "What many websites forget and your customers notice.",
          items: [
            "Multilingual site to reach more customers.",
            "Light and dark mode based on each visitor's preference.",
            "Accessible, with good contrast and full keyboard navigation.",
          ],
        },
      ],
    },
    projects: ["flexgrip", "prompt-vault", "self"],
    modes: {
      es: {
        title: "Cómo podemos trabajar.",
        lead: "Me adapto a lo que necesites. Estas son las formas más habituales.",
        note: "En remoto desde el primer día. Presencial en Mallorca y en cualquier otro lugar, con el desplazamiento por cuenta del cliente.",
        items: [
          {
            title: "Web nueva",
            text: "Diseño y desarrollo desde cero, con presupuesto antes de empezar.",
          },
          {
            title: "Renovación",
            text: "Rehago tu web actual para que se vea mejor, cargue más rápido y se encuentre en Google.",
          },
          {
            title: "Landing page",
            text: "Una página única para un producto, un servicio o una campaña, pensada para que te contacten.",
          },
          {
            title: "Tienda online",
            text: "Venta online con pago seguro por Stripe, como en FlexGrip.",
          },
          {
            title: "Mantenimiento",
            text: "Cambios y mejoras cuando los necesites, también con bolsa de horas.",
          },
          {
            title: "Aplicación a medida",
            text: "Primero estudiamos si es viable y qué necesitas, y después la desarrollo.",
          },
        ],
      },
      en: {
        title: "How we can work together.",
        lead: "I adapt to what you need. These are the most common options.",
        note: "Remote from day one. On site in Mallorca and anywhere else, with travel costs covered by the client.",
        items: [
          {
            title: "New website",
            text: "Designed and built from scratch, quoted before we start.",
          },
          {
            title: "Redesign",
            text: "I rebuild your current site so it looks better, loads faster and gets found on Google.",
          },
          {
            title: "Landing page",
            text: "A single page for a product, service or campaign, built to get you contacted.",
          },
          {
            title: "Online store",
            text: "Online sales with secure Stripe checkout, like FlexGrip.",
          },
          {
            title: "Maintenance",
            text: "Changes and improvements whenever you need them, also with an hour bank.",
          },
          {
            title: "Custom application",
            text: "First we look at whether it's feasible and what you need, then I build it.",
          },
        ],
      },
    },
    faq: {
      es: {
        title: "Preguntas frecuentes.",
        items: [
          {
            q: "¿Cuánto tardas en hacer una web?",
            a: "Una web sencilla, alrededor de una semana. Si es más grande, te doy el plazo en el presupuesto.",
          },
          {
            q: "¿Cuánto cuesta?",
            a: "Depende de lo que necesites. Tras la llamada gratuita de 15 minutos te envío un presupuesto, sin compromiso.",
          },
          {
            q: "¿Te encargas del dominio y el hosting?",
            a: "Sí. Lo registro, lo configuro y lo mantengo, para que no tengas que preocuparte de nada.",
          },
          {
            q: "¿Qué pasa después de publicarla?",
            a: "Puedo encargarme del mantenimiento, con cambios y mejoras cuando los necesites o con una bolsa de horas.",
          },
          {
            q: "¿Puedes renovar mi web actual?",
            a: "Sí. Reviso la que tienes y te propongo qué mantener y qué mejorar.",
          },
        ],
      },
      en: {
        title: "FAQ.",
        items: [
          {
            q: "How long does a website take?",
            a: "A simple site takes about a week. For bigger projects, the timeline comes with the quote.",
          },
          {
            q: "How much does it cost?",
            a: "It depends on what you need. After the free 15-minute call I send you a quote, with no obligation.",
          },
          {
            q: "Do you handle the domain and hosting?",
            a: "Yes. I register it, set it up and maintain it, so you don't have to worry about a thing.",
          },
          {
            q: "What happens after launch?",
            a: "I can take care of maintenance, with changes and improvements when you need them or with an hour bank.",
          },
          {
            q: "Can you redesign my current website?",
            a: "Yes. I review what you have and suggest what to keep and what to improve.",
          },
        ],
      },
    },
  },
];

export function getService(id: string) {
  return SERVICES.find((s) => s.id === id);
}
