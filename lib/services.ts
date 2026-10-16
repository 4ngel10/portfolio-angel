/**
 * Contenido de las páginas de servicio, en los dos idiomas.
 * Cada servicio tiene su página en /servicios/<id> (app/servicios/[id]/page.tsx),
 * a la que enlaza su card de la home (components/services.tsx).
 *
 * Todo sale de lo que ya cuenta la web: stack técnico, áreas de trabajo,
 * certificaciones y proyectos. Si añades una tecnología, añádela aquí también.
 * En el texto vale **negrita** y [enlace](/ruta). Sin em dashes.
 */

import type { Locale } from "./i18n";

export type ServiceGroup = { title: string; items: string[]; tools?: string[] };

export type ServiceDetail = {
  id: string;
  /** Prefijo de las claves de la card en messages/*.json: s1, s2. */
  key: string;
  intro: Record<Locale, string[]>;
  groups: Record<Locale, ServiceGroup[]>;
};

export const SERVICES: ServiceDetail[] = [
  {
    id: "sistemas",
    key: "s1",
    intro: {
      es: [
        "Me encargo de que la base tecnológica de tu empresa funcione sin que tengas que pensar en ella: servidores, red, copias de seguridad, correo y dispositivos.",
        "Vengo de infraestructuras complejas del sector hotelero, con varios servidores en paralelo y entornos que no se pueden permitir un minuto de parada. Por eso trabajo con documentación, estandarización y continuidad de negocio como pilares.",
      ],
      en: [
        "I make sure your company's technical foundation works without you having to think about it: servers, network, backups, email and devices.",
        "I come from complex hospitality infrastructures, with several servers running in parallel and environments that cannot afford a minute of downtime. That is why documentation, standardization and business continuity are the pillars of how I work.",
      ],
    },
    groups: {
      es: [
        {
          title: "Servidores y virtualización",
          items: [
            "Despliegue y mantenimiento de Windows Server y Active Directory: usuarios, grupos, permisos y directivas.",
            "Virtualización con Hyper-V, VMware y Proxmox, y servicios en contenedores con Docker.",
            "Automatización de tareas repetitivas con PowerShell.",
            "Servicios en la nube con Azure.",
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
          title: "Redes y seguridad perimetral",
          items: [
            "Diseño y segmentación de redes con VLANs, para que cada tipo de equipo esté en su sitio.",
            "Firewalls y seguridad perimetral con Fortinet, pfSense y OPNsense.",
            "Redes wifi gestionadas con UniFi y Omada (certificación Omada OCNA Wireless).",
            "VPN para conectarse a la empresa desde fuera de forma segura.",
          ],
          tools: ["Fortinet", "pfSense", "OPNsense", "UniFi", "Omada"],
        },
        {
          title: "Backup y continuidad de negocio",
          items: [
            "Estrategias de copia 3-2-1: varias copias, en distintos soportes y una fuera de la oficina.",
            "Copias de servidores y equipos con Veeam y Acronis.",
            "Pruebas de restauración: una copia que nunca se ha probado no es una copia.",
            "Planes para volver a funcionar rápido si algo falla.",
          ],
          tools: ["Veeam", "Acronis"],
        },
        {
          title: "Microsoft 365 y correo",
          items: [
            "Administración de Microsoft 365: usuarios, licencias, buzones y permisos.",
            "Seguridad del correo con Hornetsecurity (certificación Hornetsecurity Engineering): antispam, antiphishing y protección frente a amenazas.",
          ],
          tools: ["Microsoft 365", "Hornetsecurity"],
        },
        {
          title: "Dispositivos y monitorización",
          items: [
            "Gestión remota de equipos, inventario y parches con NinjaOne.",
            "Gestión de móviles y portátiles (MDM) con Intune y SOTI.",
            "Monitorización de la infraestructura con Zabbix y Grafana, con avisos antes de que el problema llegue al usuario.",
          ],
          tools: ["NinjaOne", "Intune", "SOTI", "Zabbix", "Grafana"],
        },
        {
          title: "VoIP y centralitas",
          items: [
            "Instalación y configuración de centralitas 3CX (certificación 3CX Basic Engineer V20).",
            "Telefonía IP para oficinas: extensiones, colas y desvíos.",
          ],
          tools: ["3CX"],
        },
        {
          title: "Domótica",
          items: [
            "Automatización del hogar con Home Assistant: luces, climatización, escenas e integración con asistentes de voz. Lo cuento en mi [homelab personal](/proyectos/homelab-proxmox).",
          ],
          tools: ["Home Assistant"],
        },
      ],
      en: [
        {
          title: "Servers and virtualization",
          items: [
            "Deployment and maintenance of Windows Server and Active Directory: users, groups, permissions and policies.",
            "Virtualization with Hyper-V, VMware and Proxmox, and containerized services with Docker.",
            "Automating repetitive tasks with PowerShell.",
            "Cloud services with Azure.",
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
          title: "Networking and perimeter security",
          items: [
            "Network design and segmentation with VLANs, so every kind of device sits where it belongs.",
            "Firewalls and perimeter security with Fortinet, pfSense and OPNsense.",
            "Managed wifi networks with UniFi and Omada (Omada OCNA Wireless certification).",
            "VPNs to connect to the company securely from outside.",
          ],
          tools: ["Fortinet", "pfSense", "OPNsense", "UniFi", "Omada"],
        },
        {
          title: "Backup and business continuity",
          items: [
            "3-2-1 backup strategies: several copies, on different media, one of them off-site.",
            "Server and endpoint backups with Veeam and Acronis.",
            "Restore tests: a backup that has never been tested is not a backup.",
            "Plans to get back up and running fast if something fails.",
          ],
          tools: ["Veeam", "Acronis"],
        },
        {
          title: "Microsoft 365 and email",
          items: [
            "Microsoft 365 administration: users, licenses, mailboxes and permissions.",
            "Email security with Hornetsecurity (Hornetsecurity Engineering certification): antispam, antiphishing and threat protection.",
          ],
          tools: ["Microsoft 365", "Hornetsecurity"],
        },
        {
          title: "Devices and monitoring",
          items: [
            "Remote management, inventory and patching with NinjaOne.",
            "Mobile and laptop management (MDM) with Intune and SOTI.",
            "Infrastructure monitoring with Zabbix and Grafana, with alerts before a problem reaches the user.",
          ],
          tools: ["NinjaOne", "Intune", "SOTI", "Zabbix", "Grafana"],
        },
        {
          title: "VoIP and phone systems",
          items: [
            "Installation and configuration of 3CX phone systems (3CX Basic Engineer V20 certification).",
            "IP telephony for offices: extensions, queues and call forwarding.",
          ],
          tools: ["3CX"],
        },
        {
          title: "Home automation",
          items: [
            "Home automation with Home Assistant: lights, climate, scenes and voice assistant integration. I write about it in my [personal homelab](/proyectos/homelab-proxmox).",
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
        "Diseño y desarrollo webs profesionales para empresas y profesionales que quieren una presencia online cuidada, rápida y mantenible, sin plantillas infladas ni letra pequeña.",
        "Me ocupo de todo el camino: desde el diseño hasta el dominio, el despliegue y el mantenimiento. Y como vengo de sistemas, la parte técnica que no se ve también está bien resuelta.",
      ],
      en: [
        "I design and build professional websites for companies and professionals who want a polished, fast and maintainable online presence, with no bloated templates and no fine print.",
        "I take care of the whole journey: from design to domain, deployment and maintenance. And since I come from systems, the technical side nobody sees is solid too.",
      ],
    },
    groups: {
      es: [
        {
          title: "Diseño y desarrollo a medida",
          items: [
            "Webs corporativas, portfolios y landing pages.",
            "Diseño propio para cada proyecto, nada de plantillas genéricas.",
            "Código moderno con Next.js y TypeScript, fácil de mantener y de ampliar.",
          ],
          tools: ["Next.js", "TypeScript", "React", "Tailwind CSS"],
        },
        {
          title: "Aplicaciones web",
          items: [
            "Apps con inicio de sesión, base de datos y datos sincronizados en la nube.",
            "Aplicaciones instalables en el móvil (PWA) que funcionan como una app nativa.",
            "Un ejemplo real: [Prompt Vault](/proyectos/prompt-vault), mi bóveda de prompts con React y Supabase.",
          ],
          tools: ["React", "Supabase", "PWA"],
        },
        {
          title: "Rendimiento y SEO",
          items: [
            "Webs responsive que se ven bien en móvil, tablet y escritorio.",
            "Optimizadas para cargar rápido.",
            "SEO técnico: títulos y descripciones, sitemap, y vistas previas cuidadas al compartir en redes.",
          ],
        },
        {
          title: "Dominio, hosting y despliegue",
          items: [
            "Registro y configuración del dominio, DNS y certificados HTTPS.",
            "Despliegue en Vercel o en servidores propios con Nginx o Apache.",
            "Control de versiones y despliegue automático: cada cambio llega a producción sin pasos manuales.",
          ],
          tools: ["Vercel", "Nginx", "Apache", "GitLab"],
        },
        {
          title: "Detalles que marcan la diferencia",
          items: [
            "Webs en varios idiomas.",
            "Modo claro y oscuro.",
            "Accesibilidad: contraste, navegación con teclado y respeto por quien prefiere menos animaciones.",
          ],
        },
        {
          title: "Mantenimiento",
          items: [
            "Actualizaciones, cambios de contenido y mejoras continuas.",
            "Una persona de referencia que conoce tu web y responde.",
          ],
        },
      ],
      en: [
        {
          title: "Custom design and development",
          items: [
            "Corporate websites, portfolios and landing pages.",
            "A design of its own for each project, no generic templates.",
            "Modern code with Next.js and TypeScript, easy to maintain and extend.",
          ],
          tools: ["Next.js", "TypeScript", "React", "Tailwind CSS"],
        },
        {
          title: "Web applications",
          items: [
            "Apps with sign-in, a database and data synced to the cloud.",
            "Installable mobile apps (PWA) that behave like native apps.",
            "A real example: [Prompt Vault](/proyectos/prompt-vault), my prompt vault built with React and Supabase.",
          ],
          tools: ["React", "Supabase", "PWA"],
        },
        {
          title: "Performance and SEO",
          items: [
            "Responsive websites that look right on phone, tablet and desktop.",
            "Optimized to load fast.",
            "Technical SEO: titles and descriptions, sitemap, and polished previews when shared on social media.",
          ],
        },
        {
          title: "Domain, hosting and deployment",
          items: [
            "Domain registration and setup, DNS and HTTPS certificates.",
            "Deployment on Vercel or on your own servers with Nginx or Apache.",
            "Version control and automatic deployment: every change reaches production with no manual steps.",
          ],
          tools: ["Vercel", "Nginx", "Apache", "GitLab"],
        },
        {
          title: "Details that make the difference",
          items: [
            "Multi-language websites.",
            "Light and dark mode.",
            "Accessibility: contrast, keyboard navigation and respect for people who prefer less motion.",
          ],
        },
        {
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
