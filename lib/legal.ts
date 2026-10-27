/**
 * Páginas legales: /aviso-legal, /privacidad y /cookies. Texto en ES y EN con los mismos
 * bloques que el blog. Los datos del titular salen de LEGAL (lib/site.ts).
 * Dentro del texto: **negrita** y [enlace](/ruta). Sin em dashes.
 */

import type { Locale } from "./i18n";
import type { PostSection } from "./projects";
import { LEGAL } from "./site";

export type LegalId = "aviso-legal" | "privacidad" | "cookies";

export type LegalContent = {
  title: string;
  description: string;
  intro: string;
  sections: PostSection[];
};

export type LegalPage = {
  id: LegalId;
  /** AAAA-MM-DD de la última revisión. */
  updated: string;
  content: Record<Locale, LegalContent>;
};

const UPDATED = "2026-10-27";

const holderEs = [
  `**Titular:** ${LEGAL.nombre}`,
  ...(LEGAL.nif ? [`**NIF:** ${LEGAL.nif}`] : []),
  ...(LEGAL.domicilio
    ? [`**Domicilio:** ${LEGAL.domicilio}`]
    : [`**Localidad:** ${LEGAL.localidad}`]),
  `**Correo electrónico:** ${LEGAL.email}`,
];
const holderEn = [
  `**Owner:** ${LEGAL.nombre}`,
  ...(LEGAL.nif ? [`**Tax ID (NIF):** ${LEGAL.nif}`] : []),
  ...(LEGAL.domicilio ? [`**Address:** ${LEGAL.domicilio}`] : [`**Location:** ${LEGAL.localidad}`]),
  `**Email:** ${LEGAL.email}`,
];

export const LEGAL_PAGES: LegalPage[] = [
  {
    id: "aviso-legal",
    updated: UPDATED,
    content: {
      es: {
        title: "Aviso legal",
        description:
          "Datos del titular de esta web, condiciones de uso, propiedad intelectual y legislación aplicable, conforme a la Ley 34/2002 (LSSI-CE).",
        intro:
          "Este sitio web es el portfolio profesional de Ángel Fernández Garriga. En cumplimiento de la Ley 34/2002 de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), aquí tienes los datos del titular y las condiciones de uso.",
        sections: [
          {
            heading: "Datos del titular",
            blocks: [
              { list: holderEs },
              "Actividad: servicios profesionales de administración de sistemas y desarrollo web.",
            ],
          },
          {
            heading: "Condiciones de uso",
            blocks: [
              "El acceso a la web es gratuito y supone aceptar estas condiciones. Te comprometes a usarla de forma lícita y sin dañar su funcionamiento ni el de terceros.",
              "El área de clientes (portal) es de acceso restringido a quienes tengan una cuenta creada por el titular. Las credenciales son personales e intransferibles.",
            ],
          },
          {
            heading: "Propiedad intelectual",
            blocks: [
              "Los textos, el diseño, el código y las imágenes de esta web son del titular, salvo que se indique otra cosa. Los nombres y logotipos de terceros que aparecen (tecnologías, herramientas y proyectos) pertenecen a sus respectivos propietarios.",
              "No se permite reproducir ni distribuir el contenido sin permiso previo, salvo citas breves con enlace a la fuente.",
            ],
          },
          {
            heading: "Responsabilidad y enlaces",
            blocks: [
              "El titular procura que la información sea correcta y esté actualizada, pero no garantiza que no haya errores ni interrupciones del servicio. Los artículos del blog son orientativos y no sustituyen un asesoramiento profesional para tu caso.",
              "Esta web enlaza a sitios de terceros (LinkedIn, GitHub y otros). El titular no controla su contenido ni responde de él.",
            ],
          },
          {
            heading: "Protección de datos y cookies",
            blocks: [
              "El tratamiento de datos personales se explica en la [política de privacidad](/privacidad), y el uso de cookies y almacenamiento local en la [política de cookies](/cookies).",
            ],
          },
          {
            heading: "Legislación y jurisdicción",
            blocks: [
              "Estas condiciones se rigen por la ley española. Para cualquier controversia, las partes se someten a los juzgados y tribunales que correspondan conforme a la normativa aplicable y, en el caso de consumidores, a los de su domicilio.",
            ],
          },
        ],
      },
      en: {
        title: "Legal notice",
        description:
          "Site owner details, terms of use, intellectual property and governing law, in line with Spanish Law 34/2002 (LSSI-CE).",
        intro:
          "This website is the professional portfolio of Ángel Fernández Garriga. In compliance with Spanish Law 34/2002 on Information Society Services and Electronic Commerce (LSSI-CE), here are the owner's details and the terms of use.",
        sections: [
          {
            heading: "Owner details",
            blocks: [
              { list: holderEn },
              "Activity: professional systems administration and web development services.",
            ],
          },
          {
            heading: "Terms of use",
            blocks: [
              "Access to the website is free and implies acceptance of these terms. You agree to use it lawfully and without harming its operation or that of third parties.",
              "The client area (portal) is restricted to people who have an account created by the owner. Credentials are personal and non-transferable.",
            ],
          },
          {
            heading: "Intellectual property",
            blocks: [
              "The texts, design, code and images of this website belong to the owner unless stated otherwise. Third-party names and logos shown (technologies, tools and projects) belong to their respective owners.",
              "You may not reproduce or distribute the content without prior permission, except for short quotes linking to the source.",
            ],
          },
          {
            heading: "Liability and links",
            blocks: [
              "The owner tries to keep the information accurate and up to date, but does not guarantee the absence of errors or interruptions. Blog articles are for guidance and do not replace professional advice for your case.",
              "This website links to third-party sites (LinkedIn, GitHub and others). The owner does not control their content and is not responsible for it.",
            ],
          },
          {
            heading: "Data protection and cookies",
            blocks: [
              "Personal data processing is explained in the [privacy policy](/privacidad), and the use of cookies and local storage in the [cookie policy](/cookies).",
            ],
          },
          {
            heading: "Governing law and jurisdiction",
            blocks: [
              "These terms are governed by Spanish law. For any dispute, the parties submit to the courts that correspond under applicable rules and, for consumers, to the courts of their place of residence.",
            ],
          },
        ],
      },
    },
  },
  {
    id: "privacidad",
    updated: UPDATED,
    content: {
      es: {
        title: "Política de privacidad",
        description:
          "Cómo trato tus datos personales: responsable, finalidades, base legal, destinatarios, conservación y derechos según el RGPD y la LOPDGDD.",
        intro:
          "Esta política explica qué datos personales trato cuando usas esta web, para qué y con qué base legal, conforme al Reglamento (UE) 2016/679 (RGPD) y a la Ley Orgánica 3/2018 (LOPDGDD).",
        sections: [
          { heading: "Responsable del tratamiento", blocks: [{ list: holderEs }] },
          {
            heading: "Qué datos trato y para qué",
            blocks: [
              { h3: "Formulario de contacto" },
              "Datos: nombre, correo electrónico, servicio de interés y mensaje. Finalidad: responder a tu consulta. Base legal: tu consentimiento, que das al enviar el formulario (art. 6.1.a RGPD).",
              { h3: "Área de clientes" },
              "Datos: los de tu cuenta (correo, nombre), los de tu empresa, proyectos, incidencias, presupuestos (incluida su aceptación o firma), horas y archivos que subas. Finalidad: prestar el servicio contratado y gestionar la relación con el cliente. Base legal: ejecución del contrato o de medidas precontractuales (art. 6.1.b RGPD) y obligaciones legales, como las fiscales y contables (art. 6.1.c).",
              { h3: "Correos del servicio" },
              "Te enviaré avisos relacionados con tu cuenta o tus proyectos (por ejemplo, enlaces de acceso o notificaciones de incidencias). No se envían comunicaciones comerciales.",
            ],
          },
          {
            heading: "Destinatarios y encargados del tratamiento",
            blocks: [
              "No vendo ni cedo tus datos. Para prestar el servicio uso proveedores que actúan como encargados del tratamiento:",
              {
                list: [
                  "**Web3Forms:** recibe el mensaje del formulario de contacto y lo reenvía a mi correo.",
                  "**Google (Gmail):** buzón donde recibo esos mensajes.",
                  "**Supabase:** base de datos, autenticación y almacenamiento de archivos del área de clientes.",
                  "**Vercel:** alojamiento de la web.",
                  "**Resend:** envío de correos del servicio.",
                ],
              },
              "Algunos de estos proveedores pueden tratar datos fuera del Espacio Económico Europeo. En ese caso, la transferencia se ampara en garantías adecuadas, como las cláusulas contractuales tipo de la Comisión Europea o el Marco de Privacidad de Datos UE-EE. UU.",
            ],
          },
          {
            heading: "Cuánto tiempo los conservo",
            blocks: [
              "Los mensajes del formulario, durante el tiempo necesario para atender tu consulta y, si no hay relación posterior, hasta un máximo de un año.",
              "Los datos del área de clientes, mientras dure la relación y, después, bloqueados durante los plazos legales de conservación (por ejemplo, seis años para documentación mercantil y contable).",
              "Pasados esos plazos, se eliminan de forma segura.",
            ],
          },
          {
            heading: "Tus derechos",
            blocks: [
              `Puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad escribiendo a ${LEGAL.email}, indicando el derecho que quieres ejercer. Si has dado tu consentimiento, puedes retirarlo en cualquier momento sin que afecte a lo ya tratado.`,
              "Si consideras que no se han atendido bien tus derechos, puedes presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).",
            ],
          },
          {
            heading: "Seguridad",
            blocks: [
              "Aplico medidas técnicas y organizativas razonables: conexión cifrada (HTTPS), control de accesos por roles, autenticación en dos pasos para la administración y aislamiento de los datos de cada cliente.",
            ],
          },
          {
            heading: "Cookies y cambios en esta política",
            blocks: [
              "El uso de cookies y almacenamiento local se detalla en la [política de cookies](/cookies). Esta política puede actualizarse; la fecha de la última revisión figura al inicio de la página.",
            ],
          },
        ],
      },
      en: {
        title: "Privacy policy",
        description:
          "How I handle your personal data: controller, purposes, legal basis, recipients, retention and your rights under the GDPR and Spanish LOPDGDD.",
        intro:
          "This policy explains which personal data I process when you use this website, why, and on what legal basis, under Regulation (EU) 2016/679 (GDPR) and Spanish Organic Law 3/2018 (LOPDGDD).",
        sections: [
          { heading: "Data controller", blocks: [{ list: holderEn }] },
          {
            heading: "What data I process and why",
            blocks: [
              { h3: "Contact form" },
              "Data: name, email, service of interest and message. Purpose: answering your enquiry. Legal basis: your consent, given when you submit the form (art. 6.1.a GDPR).",
              { h3: "Client area" },
              "Data: your account details (email, name), your company, projects, issues, quotes (including their acceptance or signature), hours and files you upload. Purpose: providing the contracted service and managing the client relationship. Legal basis: performance of a contract or pre-contractual measures (art. 6.1.b GDPR) and legal obligations such as tax and accounting (art. 6.1.c).",
              { h3: "Service emails" },
              "I will send you notices related to your account or projects (for example, access links or issue notifications). No marketing emails are sent.",
            ],
          },
          {
            heading: "Recipients and processors",
            blocks: [
              "I do not sell or share your data. To provide the service I use providers acting as data processors:",
              {
                list: [
                  "**Web3Forms:** receives the contact form message and forwards it to my email.",
                  "**Google (Gmail):** the mailbox where I receive those messages.",
                  "**Supabase:** database, authentication and file storage for the client area.",
                  "**Vercel:** website hosting.",
                  "**Resend:** sending of service emails.",
                ],
              },
              "Some of these providers may process data outside the European Economic Area. In that case the transfer relies on appropriate safeguards, such as the European Commission's standard contractual clauses or the EU-US Data Privacy Framework.",
            ],
          },
          {
            heading: "How long I keep it",
            blocks: [
              "Form messages: for as long as needed to handle your enquiry and, if there is no further relationship, for a maximum of one year.",
              "Client area data: while the relationship lasts and, afterwards, blocked for the legal retention periods (for example, six years for commercial and accounting records).",
              "Once those periods end, data is securely deleted.",
            ],
          },
          {
            heading: "Your rights",
            blocks: [
              `You can exercise your rights of access, rectification, erasure, objection, restriction and portability by writing to ${LEGAL.email}, stating the right you want to exercise. If you gave consent, you can withdraw it at any time without affecting prior processing.`,
              "If you think your rights were not properly handled, you can lodge a complaint with the Spanish Data Protection Agency (www.aepd.es).",
            ],
          },
          {
            heading: "Security",
            blocks: [
              "I apply reasonable technical and organizational measures: encrypted connection (HTTPS), role-based access control, two-step authentication for administration and isolation of each client's data.",
            ],
          },
          {
            heading: "Cookies and changes to this policy",
            blocks: [
              "The use of cookies and local storage is detailed in the [cookie policy](/cookies). This policy may be updated; the date of the last review appears at the top of the page.",
            ],
          },
        ],
      },
    },
  },
  {
    id: "cookies",
    updated: UPDATED,
    content: {
      es: {
        title: "Política de cookies",
        description:
          "Qué cookies y almacenamiento local usa esta web: solo técnicos y de preferencias, sin analítica ni publicidad, por lo que no se pide consentimiento.",
        intro:
          "Esta web no usa cookies de analítica, publicidad ni seguimiento, y no carga recursos de terceros que las instalen (las fuentes se sirven desde el propio sitio). Solo se usan cookies y almacenamiento local técnicos o de preferencias, que según el art. 22.2 de la LSSI-CE no requieren consentimiento.",
        sections: [
          {
            heading: "Qué se guarda en tu navegador",
            blocks: [
              {
                list: [
                  "**locale** (cookie propia, 1 año): recuerda el idioma elegido (ES o EN).",
                  "**locale** y **theme** (almacenamiento local, sin caducidad): idioma y tema claro u oscuro que elegiste.",
                  "**Cookies de sesión de Supabase** (propias, solo si inicias sesión en el área de clientes o en la administración): mantienen tu sesión abierta y son imprescindibles para ese servicio.",
                ],
              },
            ],
          },
          {
            heading: "Servicios de terceros",
            blocks: [
              "El formulario de contacto envía los datos a Web3Forms al pulsar enviar. No instala cookies en tu navegador. Más información en la [política de privacidad](/privacidad).",
            ],
          },
          {
            heading: "Cómo borrarlas o bloquearlas",
            blocks: [
              "Puedes eliminar o bloquear cookies y datos del sitio desde los ajustes de tu navegador. Si lo haces, la web seguirá funcionando, pero tendrás que volver a elegir idioma y tema, y a iniciar sesión en el área de clientes.",
            ],
          },
          {
            heading: "Cambios",
            blocks: [
              "Si en el futuro se añade analítica u otro servicio que use cookies no necesarias, se pedirá tu consentimiento previo y se actualizará esta política.",
            ],
          },
        ],
      },
      en: {
        title: "Cookie policy",
        description:
          "Which cookies and local storage this website uses: only technical and preference ones, with no analytics or advertising, so no consent is required.",
        intro:
          "This website does not use analytics, advertising or tracking cookies, and it does not load third-party resources that set them (fonts are served from the site itself). It only uses technical or preference cookies and local storage, which under art. 22.2 of the Spanish LSSI-CE do not require consent.",
        sections: [
          {
            heading: "What is stored in your browser",
            blocks: [
              {
                list: [
                  "**locale** (first-party cookie, 1 year): remembers the language you chose (ES or EN).",
                  "**locale** and **theme** (local storage, no expiry): the language and light or dark theme you chose.",
                  "**Supabase session cookies** (first-party, only if you sign in to the client area or administration): keep your session open and are strictly necessary for that service.",
                ],
              },
            ],
          },
          {
            heading: "Third-party services",
            blocks: [
              "The contact form sends your data to Web3Forms when you press send. It sets no cookies in your browser. More information in the [privacy policy](/privacidad).",
            ],
          },
          {
            heading: "How to delete or block them",
            blocks: [
              "You can delete or block cookies and site data from your browser settings. If you do, the site keeps working, but you will have to choose language and theme again and sign in again to the client area.",
            ],
          },
          {
            heading: "Changes",
            blocks: [
              "If analytics or another service using non-essential cookies is added in the future, your prior consent will be requested and this policy will be updated.",
            ],
          },
        ],
      },
    },
  },
];

export function getLegalPage(id: string) {
  return LEGAL_PAGES.find((p) => p.id === id);
}
