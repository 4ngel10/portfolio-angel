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
            "Para acceso remoto, VPN siempre.",
          ],
          tools: ["Fortinet", "pfSense", "OPNsense", "UniFi", "Omada"],
        },
        {
          id: "backup",
          title: "Backup y continuidad de negocio",
          items: [
            "Aplico estrategias 3-2-1: varias copias, en distintos soportes y al menos una fuera de la oficina.",
            "Las herramientas que uso son Veeam y Acronis.",
            "En Baleares hay un detalle más: la copia externa conviene que esté fuera de la isla, para que un problema que afecte a toda la zona no se lleve también las copias. Lo explico a fondo en [Backup 3-2-1](/blog/backup-3-2-1).",
            "Y algo que no negocio: pruebas de restauración periódicas. Una copia que nunca se ha probado no es una copia de verdad.",
          ],
          tools: ["Veeam", "Acronis"],
        },
        {
          id: "microsoft-365",
          title: "Microsoft 365 y correo",
          items: [
            "Administro tenants de Microsoft 365 completos: usuarios, licencias, buzones y permisos.",
            "La seguridad del correo la gestiono con Hornetsecurity, que cubre antispam, antiphishing y protección frente a amenazas avanzadas.",
          ],
          tools: ["Microsoft 365", "Hornetsecurity"],
        },
        {
          id: "dispositivos",
          title: "Dispositivos y monitorización",
          items: [
            "Gestiono equipos en remoto con NinjaOne para inventario, parches y mantenimiento.",
            "Para móviles y portátiles uso Intune y SOTI como MDM.",
            "Toda la infraestructura la monitorizo con Zabbix y Grafana, con alertas configuradas para enterarme antes de que el problema llegue al usuario.",
          ],
          tools: ["NinjaOne", "Intune", "SOTI", "Zabbix", "Grafana"],
        },
        {
          id: "voip",
          title: "VoIP y centralitas",
          items: [
            "Instalo y configuro centralitas 3CX para oficinas: extensiones, colas, desvíos y toda la telefonía IP necesaria.",
          ],
          tools: ["3CX"],
        },
        {
          id: "domotica",
          title: "Domótica",
          items: [
            "Automatización del hogar con Home Assistant: luces, climatización, escenas e integración con asistentes de voz. Lo cuento más a fondo en mi [homelab personal](/proyectos/homelab-proxmox).",
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
            "For remote access, always a VPN.",
          ],
          tools: ["Fortinet", "pfSense", "OPNsense", "UniFi", "Omada"],
        },
        {
          id: "backup",
          title: "Backup and business continuity",
          items: [
            "I apply 3-2-1 strategies: several copies, on different media, and at least one off-site.",
            "The tools I use are Veeam and Acronis.",
            "In the Balearic Islands there is one more detail: the off-site copy should ideally be off the island, so a problem hitting the whole area does not take the backups with it. I explain it in depth in [3-2-1 backup](/blog/backup-3-2-1).",
            "And one thing I do not compromise on: regular restore tests. A backup that has never been tested is not a real backup.",
          ],
          tools: ["Veeam", "Acronis"],
        },
        {
          id: "microsoft-365",
          title: "Microsoft 365 and email",
          items: [
            "I administer complete Microsoft 365 tenants: users, licenses, mailboxes and permissions.",
            "I handle email security with Hornetsecurity, covering antispam, antiphishing and protection against advanced threats.",
          ],
          tools: ["Microsoft 365", "Hornetsecurity"],
        },
        {
          id: "dispositivos",
          title: "Devices and monitoring",
          items: [
            "I manage devices remotely with NinjaOne for inventory, patching and maintenance.",
            "For phones and laptops I use Intune and SOTI as MDM.",
            "I monitor the whole infrastructure with Zabbix and Grafana, with alerts set up so I find out before a problem reaches the user.",
          ],
          tools: ["NinjaOne", "Intune", "SOTI", "Zabbix", "Grafana"],
        },
        {
          id: "voip",
          title: "VoIP and phone systems",
          items: [
            "I install and configure 3CX phone systems for offices: extensions, queues, call forwarding and all the IP telephony needed.",
          ],
          tools: ["3CX"],
        },
        {
          id: "domotica",
          title: "Home automation",
          items: [
            "Home automation with Home Assistant: lights, climate, scenes and voice assistant integration. I go into more detail in my [personal homelab](/proyectos/homelab-proxmox).",
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
        "Diseño y desarrollo webs profesionales desde Palma de Mallorca para empresas y autónomos que quieren una presencia online cuidada, rápida y mantenible, sin plantillas infladas ni letra pequeña.",
        "Trabajo como desarrollador web freelance en Mallorca, así que hablas siempre con la misma persona. Me ocupo de todo el camino: desde el diseño hasta el dominio, el despliegue y el mantenimiento. Y como vengo de sistemas, la parte técnica que no se ve también está bien resuelta.",
      ],
      en: [
        "I design and build professional websites from Palma de Mallorca for companies and freelancers who want a polished, fast and maintainable online presence, with no bloated templates and no fine print.",
        "I work as a freelance web developer in Mallorca, so you always deal with the same person. I take care of the whole journey: from design to domain, deployment and maintenance. And since I come from systems, the technical side nobody sees is solid too.",
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
            "Webs corporativas, portfolios y landing pages para negocios de Mallorca y del resto de Baleares.",
            "Diseño propio para cada proyecto, nada de plantillas genéricas.",
            "Código moderno con Next.js y TypeScript, fácil de mantener y de ampliar. Te cuento [por qué lo elijo](/blog/por-que-nextjs).",
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
            "Registro y configuración del dominio, DNS y certificados HTTPS.",
            "Despliegue en Vercel o en servidores propios con Nginx o Apache.",
            "Control de versiones y despliegue automático: cada cambio llega a producción sin pasos manuales.",
          ],
          tools: ["Vercel", "Nginx", "Apache", "GitLab"],
        },
        {
          id: "detalles",
          title: "Detalles que marcan la diferencia",
          items: [
            "Webs en varios idiomas.",
            "Modo claro y oscuro.",
            "Accesibilidad: contraste, navegación con teclado y respeto por quien prefiere menos animaciones.",
          ],
        },
        {
          id: "mantenimiento",
          title: "Mantenimiento",
          items: [
            "Actualizaciones, cambios de contenido y mejoras continuas.",
            "Una persona de referencia que conoce tu web y responde.",
          ],
        },
      ],
      en: [
        {
          id: "diseno",
          title: "Custom design and development",
          items: [
            "Corporate websites, portfolios and landing pages for businesses in Mallorca and across the Balearic Islands.",
            "A design of its own for each project, no generic templates.",
            "Modern code with Next.js and TypeScript, easy to maintain and extend. Here is [why I choose it](/blog/por-que-nextjs).",
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
            "Domain registration and setup, DNS and HTTPS certificates.",
            "Deployment on Vercel or on your own servers with Nginx or Apache.",
            "Version control and automatic deployment: every change reaches production with no manual steps.",
          ],
          tools: ["Vercel", "Nginx", "Apache", "GitLab"],
        },
        {
          id: "detalles",
          title: "Details that make the difference",
          items: [
            "Multi-language websites.",
            "Light and dark mode.",
            "Accessibility: contrast, keyboard navigation and respect for people who prefer less motion.",
          ],
        },
        {
          id: "mantenimiento",
          title: "Maintenance",
          items: [
            "Updates, content changes and ongoing improvements.",
            "One go-to person who knows your website and answers.",
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
