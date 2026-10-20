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
export type ServiceGroup = { id: string; title: string; items: string[]; tools?: string[] };

export type ServiceDetail = {
  id: string;
  /** Prefijo de las claves de la card en messages/*.json: s1, s2. */
  key: string;
  intro: Record<Locale, string[]>;
  /** Texto del bloque final, antes del botón de contacto. */
  closing: Record<Locale, string>;
  groups: Record<Locale, ServiceGroup[]>;
};

export const SERVICES: ServiceDetail[] = [
  {
    id: "sistemas",
    key: "s1",
    intro: {
      es: [
        "Soy técnico de sistemas en Palma de Mallorca y me encargo de que la tecnología de tu empresa funcione sin que tengas que pensar en ella. Servidores, red, copias de seguridad, correo, dispositivos. Que todo esté en su sitio y que si algo falla, se recupere rápido.",
        "Vengo de infraestructuras en el sector hotelero, con varios servidores en paralelo y entornos donde una caída no es una opción. Eso me enseñó a trabajar con documentación, estandarización y planes de continuidad como base de todo. Hoy llevo esa misma forma de trabajar a la administración de sistemas y el soporte IT de empresas en Mallorca.",
      ],
      en: [
        "I am a systems technician based in Palma de Mallorca, and I make sure your company's technology works without you having to think about it. Servers, network, backups, email, devices. Everything in its place, and if something fails, it recovers fast.",
        "I come from hospitality infrastructures, with several servers running in parallel and environments where downtime is not an option. That taught me to build everything on documentation, standardization and continuity plans. Today I bring that same way of working to systems administration and IT support for businesses in Mallorca.",
      ],
    },
    closing: {
      es: "¿Buscas soporte IT para tu empresa en Mallorca? Cuéntame qué tienes montado y qué te preocupa. Te respondo en 24-48 horas con una propuesta clara, sin compromiso.",
      en: "Looking for IT support for your business in Mallorca? Tell me what you have in place and what worries you. I reply within 24-48 hours with a clear proposal, no strings attached.",
    },
    groups: {
      es: [
        {
          id: "servidores",
          title: "Servidores y virtualización",
          items: [
            "Despliego y mantengo entornos con Windows Server y Active Directory: usuarios, grupos, permisos y directivas.",
            "Trabajo con virtualización tanto en Hyper-V como en VMware y Proxmox, y con contenedores Docker para servicios más ligeros.",
            "Las tareas repetitivas las automatizo con PowerShell.",
            "También gestiono servicios en Azure.",
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
          id: "redes",
          title: "Redes y seguridad perimetral",
          items: [
            "Diseño redes segmentadas con VLANs para que cada tipo de equipo esté aislado donde le toca.",
            "Configuro firewalls con Fortinet, pfSense y OPNsense.",
            "Gestiono redes wifi con UniFi y Omada.",
            "Para acceso remoto, VPN e IPsec.",
          ],
          tools: ["Fortinet", "pfSense", "OPNsense", "UniFi", "Omada"],
        },
        {
          id: "backup",
          title: "Backup y continuidad de negocio",
          items: [
            "Aplico estrategias 3-2-1 con varias copias, en distintos soportes y siempre una fuera de la oficina. Lo explico a fondo en [Backup 3-2-1](/blog/backup-3-2-1).",
            "Trabajo principalmente con Nakivo, Veeam y Acronis según las necesidades del entorno.",
            "Monitorizo las copias a diario para reaccionar de inmediato si falla cualquier tarea.",
            "Realizo pruebas de restauración periódicas, porque una copia que nunca se ha probado no es una copia de verdad.",
          ],
          tools: ["Nakivo", "Veeam", "Acronis"],
        },
        {
          id: "microsoft-365",
          title: "Microsoft 365 y correo",
          items: [
            "Administro tenants de Microsoft 365 completos con gestión de usuarios, licencias, buzones y asignación de permisos.",
            "Configuro políticas de acceso condicional e integración con Azure para reforzar la seguridad de la identidad corporativa.",
            "Organizo y gestiono la estructura de documentos y permisos en SharePoint para facilitar el trabajo en equipo.",
            "Implemento sistemas de filtrado de correo que protegen la bandeja de entrada frente a spam, phishing y amenazas avanzadas.",
            "Realizo copias de seguridad de Microsoft 365 para mantener a salvo el correo, SharePoint y toda la información de la empresa.",
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
          id: "dispositivos",
          title: "Dispositivos y monitorización",
          items: [
            "Gestiono y mantengo equipos y portátiles en remoto a través de herramientas de gestión como NinjaOne o Syncro.",
            "Despliego y configuro Microsoft Intune para el control centralizado de los equipos informáticos de la empresa.",
            "Superviso y gestiono la flota de dispositivos móviles con SOTI MobiControl para asegurar el cumplimiento de políticas de seguridad.",
            "Monitorizo la infraestructura con Zabbix y Grafana con alertas configuradas para detectar incidencias antes de que afecten a los usuarios.",
          ],
          tools: ["NinjaOne", "Intune", "SOTI", "Zabbix", "Grafana"],
        },
        {
          id: "voip",
          title: "VoIP y centralitas",
          items: [
            "Instalo y configuro centralitas 3CX para oficinas con gestión de extensiones, colas de llamada y reglas de desvío.",
            "Integro líneas SIP trunk con proveedores IP para optimizar los costes de telefonía y mejorar la calidad de las llamadas.",
            "Configuro la app móvil de 3CX para que los empleados puedan atender sus extensiones corporativas desde cualquier sitio.",
            "Monitorizo y mantengo el estado de la centralita para garantizar un servicio de voz estable y sin interrupciones.",
          ],
          tools: ["3CX"],
        },
        {
          id: "domotica",
          title: "Domótica",
          items: [
            "Diseño e integro sistemas domóticos basados en Home Assistant para el control centralizado de iluminación, climatización y persianas.",
            "Configuro automatizaciones, escenas personalizadas e integración fluida con asistentes de voz para facilitar el día a día. Lo cuento más a fondo en mi [homelab personal](/proyectos/homelab-proxmox).",
          ],
          tools: ["Home Assistant"],
        },
      ],
      en: [
        {
          id: "servidores",
          title: "Servers and virtualization",
          items: [
            "I deploy and maintain Windows Server and Active Directory environments: users, groups, permissions and policies.",
            "I work with virtualization on Hyper-V as well as VMware and Proxmox, and with Docker containers for lighter services.",
            "I automate repetitive tasks with PowerShell.",
            "I also manage services on Azure.",
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
          id: "redes",
          title: "Networking and perimeter security",
          items: [
            "I design networks segmented with VLANs so every kind of device is isolated where it belongs.",
            "I configure firewalls with Fortinet, pfSense and OPNsense.",
            "I manage wifi networks with UniFi and Omada.",
            "For remote access, VPN and IPsec.",
          ],
          tools: ["Fortinet", "pfSense", "OPNsense", "UniFi", "Omada"],
        },
        {
          id: "backup",
          title: "Backup and business continuity",
          items: [
            "I apply 3-2-1 strategies with several copies, on different media, and always one outside the office. I explain it in depth in [3-2-1 backup](/blog/backup-3-2-1).",
            "I mainly work with Nakivo, Veeam and Acronis, depending on the needs of the environment.",
            "I monitor the backups daily so I can react immediately if any job fails.",
            "I run regular restore tests, because a backup that has never been tested is not a real backup.",
          ],
          tools: ["Nakivo", "Veeam", "Acronis"],
        },
        {
          id: "microsoft-365",
          title: "Microsoft 365 and email",
          items: [
            "I administer complete Microsoft 365 tenants, including user management, licenses, mailboxes and permission assignment.",
            "I configure conditional access policies and Azure integration to strengthen corporate identity security.",
            "I organize and manage the document and permission structure in SharePoint to make teamwork easier.",
            "I implement email filtering systems that protect the inbox from spam, phishing and advanced threats.",
            "I back up Microsoft 365 to keep email, SharePoint and all of the company's information safe.",
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
          id: "dispositivos",
          title: "Devices and monitoring",
          items: [
            "I manage and maintain computers and laptops remotely through management tools such as NinjaOne or Syncro.",
            "I deploy and configure Microsoft Intune for centralized control of the company's computers.",
            "I supervise and manage the fleet of mobile devices with SOTI MobiControl to ensure compliance with security policies.",
            "I monitor the infrastructure with Zabbix and Grafana, with alerts set up to detect incidents before they affect users.",
          ],
          tools: ["NinjaOne", "Intune", "SOTI", "Zabbix", "Grafana"],
        },
        {
          id: "voip",
          title: "VoIP and phone systems",
          items: [
            "I install and configure 3CX phone systems for offices, with management of extensions, call queues and forwarding rules.",
            "I integrate SIP trunk lines with IP providers to optimize telephony costs and improve call quality.",
            "I set up the 3CX mobile app so employees can answer their corporate extensions from anywhere.",
            "I monitor and maintain the state of the phone system to guarantee a stable, uninterrupted voice service.",
          ],
          tools: ["3CX"],
        },
        {
          id: "domotica",
          title: "Home automation",
          items: [
            "I design and integrate home automation systems based on Home Assistant for centralized control of lighting, climate and blinds.",
            "I set up automations, custom scenes and seamless voice assistant integration to make everyday life easier. I go into more detail in my [personal homelab](/proyectos/homelab-proxmox).",
          ],
          tools: ["Home Assistant"],
        },
      ],
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
      es: "¿Quieres crear la página web de tu empresa en Mallorca o renovar la que tienes? Cuéntame qué necesitas y te respondo en 24-48 horas con una propuesta clara, sin compromiso.",
      en: "Want to build your company website in Mallorca or refresh the one you have? Tell me what you need and I will reply within 24-48 hours with a clear proposal, no strings attached.",
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

/** Cómo trabajo: los principios comunes a los dos servicios. */
export const PRINCIPLES: Record<Locale, { title: string; text: string }[]> = {
  es: [
    {
      title: "Documentación",
      text: "Todo lo que monto queda documentado. Si mañana lo gestiona otra persona, sabrá qué hay y por qué.",
    },
    {
      title: "Estandarización",
      text: "Mismas configuraciones y mismos procesos en todos los equipos. Menos sorpresas y menos errores.",
    },
    {
      title: "Continuidad de negocio",
      text: "Pienso primero en qué pasa si algo falla, y en cómo volver a funcionar lo antes posible.",
    },
    {
      title: "Comunicación clara",
      text: "Te respondo en 24-48 h con una propuesta concreta, sin tecnicismos innecesarios ni letra pequeña.",
    },
  ],
  en: [
    {
      title: "Documentation",
      text: "Everything I set up gets documented. If someone else manages it tomorrow, they will know what is there and why.",
    },
    {
      title: "Standardization",
      text: "Same configurations and same processes across every device. Fewer surprises, fewer mistakes.",
    },
    {
      title: "Business continuity",
      text: "I think first about what happens if something fails, and how to get back up as fast as possible.",
    },
    {
      title: "Clear communication",
      text: "I reply within 24-48 h with a concrete proposal, without needless jargon or fine print.",
    },
  ],
};

export function getService(id: string) {
  return SERVICES.find((s) => s.id === id);
}
