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
  /** Secciones opcionales, de momento solo en sistemas: casos reales, modalidades y preguntas. */
  showCases?: boolean;
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
        "Desde hace 3 años formo parte del equipo de sistemas de una empresa de servicios IT, con más de 60 hoteles, 120 servidores y 1.000 usuarios a cargo. Llevo esa misma forma de trabajar a tu negocio, con documentación, copias probadas y cambios planificados.",
      ],
      en: [
        "I look after your company's IT, from backups and email to the network, devices and servers. For freelancers, small businesses and new ventures, remotely or on site.",
        "For the past 3 years I've been part of the systems team at an IT services company, looking after more than 60 hotels, 120 servers and 1,000 users. I bring that same way of working to your business, with documentation, tested backups and planned changes.",
      ],
    },
    closing: {
      es: "Cuéntame qué tienes montado y qué te preocupa. Empezamos con una llamada gratuita de 15 minutos y después te envío un presupuesto. Respondo en 24 a 48 horas.",
      en: "Tell me what you have in place and what worries you. We start with a free 15-minute call and then I send you a quote. I reply within 24 to 48 hours.",
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
    showCases: true,
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
        "Diseño y desarrollo webs profesionales para empresas y autónomos que buscan una presencia online cuidada, rápida y fácil de mantener, sin plantillas infladas ni letra pequeña.",
        "Trabajo como desarrollador web freelance, lo que significa que tratas de forma directa y sin intermediarios con la misma persona. Me ocupo de todo el proceso, desde el diseño inicial hasta la gestión del dominio, el despliegue y el mantenimiento posterior. Al venir del mundo de los sistemas, garantizo que la infraestructura técnica y la seguridad que no se ven también quedan perfectamente resueltas, trabajes desde donde trabajes.",
      ],
      en: [
        "I design and build professional websites for companies and freelancers looking for a polished, fast and easy-to-maintain online presence, with no bloated templates and no fine print.",
        "I work as a freelance web developer, which means you deal directly, with no middlemen, with the same person. I take care of the whole process, from the initial design to domain management, deployment and ongoing maintenance. Coming from the world of systems, I make sure the technical infrastructure and the security you do not see are also perfectly taken care of, wherever you work from.",
      ],
    },
    closing: {
      es: "¿Quieres crear la página web de tu empresa en Mallorca o renovar la que tienes? Cuéntame qué necesitas y te respondo en 24 a 48 horas con una propuesta clara, sin compromiso.",
      en: "Want to build your company website in Mallorca or refresh the one you have? Tell me what you need and I will reply within 24 to 48 hours with a clear proposal, no strings attached.",
    },
    groups: {
      es: [
        {
          id: "diseno",
          title: "Diseño y desarrollo a medida",
          items: [
            "Webs corporativas, portfolios, landing pages, tiendas o webs para restaurantes adaptadas a cada tipo de negocio.",
            "Diseño propio para cada proyecto, sin plantillas genéricas ni elementos innecesarios.",
            "Desarrollo con código moderno utilizando tecnologías como Next.js, Astro y TypeScript para conseguir una web rápida, fácil de mantener y lista para crecer. Te cuento [por qué lo elijo](/blog/por-que-nextjs).",
          ],
          tools: ["Next.js", "TypeScript", "React", "Tailwind CSS"],
        },
        {
          id: "aplicaciones",
          title: "Aplicaciones web",
          items: [
            "Apps con inicio de sesión, base de datos y datos sincronizados en la nube.",
            "Aplicaciones instalables en el móvil (PWA) que funcionan como una app nativa.",
            "Un ejemplo real: [Prompt Vault](/proyectos/prompt-vault), mi bóveda de prompts con React y Supabase.",
          ],
          tools: ["React", "Supabase", "PWA"],
        },
        {
          id: "rendimiento",
          title: "Rendimiento y SEO",
          items: [
            "Webs responsive que se ven bien en móvil, tablet y escritorio.",
            "Optimizadas para cargar rápido.",
            "SEO técnico: títulos y descripciones, sitemap, y vistas previas cuidadas al compartir en redes.",
          ],
        },
        {
          id: "despliegue",
          title: "Dominio, hosting y despliegue",
          items: [
            "Gestión completa del dominio con configuración de DNS y certificados SSL para garantizar conexiones seguras.",
            "Despliegue en plataformas como Vercel o servidores VPS propios con Nginx o Apache según la escala del proyecto.",
            "Configuración de despliegue continuo mediante control de versiones, permitiendo actualizar la web automáticamente en producción a cada cambio.",
          ],
          tools: ["Vercel", "Nginx", "Apache", "GitLab"],
        },
        {
          id: "detalles",
          title: "Detalles que marcan la diferencia",
          items: [
            "Desarrollo webs multiidioma preparadas para llegar a cualquier público de forma clara.",
            "Integración de modo claro y oscuro adaptado a las preferencias del usuario o de su sistema.",
            "Accesibilidad garantizada cuidando el contraste de color, la navegación por teclado y el respeto por el rendimiento visual.",
          ],
        },
        {
          id: "mantenimiento",
          title: "Mantenimiento",
          items: [
            "Actualizaciones continuas, ajustes de contenido y mejoras periódicas para mantener la web siempre al día.",
            "Renovación y optimización de imágenes, fotografías y vídeos corporativos según las necesidades de la empresa.",
            "Un contacto directo que conoce a fondo el proyecto y responde rápido cuando necesitas cualquier cambio.",
          ],
        },
      ],
      en: [
        {
          id: "diseno",
          title: "Custom design and development",
          items: [
            "Corporate websites, portfolios, landing pages, online stores or restaurant websites adapted to each type of business.",
            "A design of its own for each project, with no generic templates or unnecessary elements.",
            "Development with modern code using technologies such as Next.js, Astro and TypeScript to deliver a website that is fast, easy to maintain and ready to grow. Here is [why I choose it](/blog/por-que-nextjs).",
          ],
          tools: ["Next.js", "TypeScript", "React", "Tailwind CSS"],
        },
        {
          id: "aplicaciones",
          title: "Web applications",
          items: [
            "Apps with sign-in, a database and data synced to the cloud.",
            "Installable mobile apps (PWA) that behave like native apps.",
            "A real example: [Prompt Vault](/proyectos/prompt-vault), my prompt vault built with React and Supabase.",
          ],
          tools: ["React", "Supabase", "PWA"],
        },
        {
          id: "rendimiento",
          title: "Performance and SEO",
          items: [
            "Responsive websites that look right on phone, tablet and desktop.",
            "Optimized to load fast.",
            "Technical SEO: titles and descriptions, sitemap, and polished previews when shared on social media.",
          ],
        },
        {
          id: "despliegue",
          title: "Domain, hosting and deployment",
          items: [
            "Full domain management with DNS configuration and SSL certificates to guarantee secure connections.",
            "Deployment on platforms such as Vercel or your own VPS servers with Nginx or Apache, depending on the scale of the project.",
            "Continuous deployment set up through version control, so the website updates automatically in production with every change.",
          ],
          tools: ["Vercel", "Nginx", "Apache", "GitLab"],
        },
        {
          id: "detalles",
          title: "Details that make the difference",
          items: [
            "I build multi-language websites ready to reach any audience clearly.",
            "Integration of light and dark mode adapted to the preferences of the user or their system.",
            "Guaranteed accessibility, with care for color contrast, keyboard navigation and respect for visual performance.",
          ],
        },
        {
          id: "mantenimiento",
          title: "Maintenance",
          items: [
            "Continuous updates, content adjustments and regular improvements to keep the website always up to date.",
            "Renewal and optimization of images, photographs and corporate videos according to the company's needs.",
            "A direct contact who knows the project in depth and responds quickly whenever you need any change.",
          ],
        },
      ],
    },
  },
];

export function getService(id: string) {
  return SERVICES.find((s) => s.id === id);
}
