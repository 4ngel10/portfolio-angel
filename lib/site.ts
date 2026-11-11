/**
 * Datos del sitio en un solo sitio.
 *
 * SITE_URL: dirección pública de la web. La usan metadata (vistas previas al compartir),
 * sitemap.xml y robots.txt. Si cambia el dominio, cambiar solo esta línea.
 */
export const SITE_URL = "https://www.angel-fernandez.es";

/**
 * Fecha de la última actualización de contenido de la home y las páginas de servicio (AAAA-MM-DD).
 * La usa sitemap.xml como lastModified. Se actualiza a mano al cambiar esas páginas.
 */
export const LAST_UPDATED = "2026-11-11";

/**
 * Clave de acceso de Web3Forms (formulario de contacto -> Gmail de Ángel).
 * Es pública por diseño: Web3Forms la usa desde el navegador y solo permite enviar
 * correos a la cuenta que la registró. No es un secreto.
 */
export const WEB3FORMS_KEY = "cbbda3f8-e741-4a3e-b07f-5a74db4663fa";

/**
 * Datos del titular para el aviso legal (LSSI art. 10). Los datos del titular se muestran tal cual; si
 * alguno queda vacío, la página no muestra esa línea.
 */
export const LEGAL = {
  nombre: "Ángel Fernández Garriga",
  email: "tecnico@angel-fernandez.es",
  localidad: "Palma de Mallorca, Islas Baleares, España",
  nif: "45613752Z",
  domicilio: "Palma de Mallorca, Islas Baleares, España",
};

/**
 * Vías de contacto opcionales. Mientras un campo esté vacío, la web no muestra nada de él y el
 * botón principal sigue siendo "Pedir presupuesto".
 *
 * - bookingUrl: URL de reserva (Cal.com o similar). Con ella, el botón principal del hero pasa a
 *   "Reservar llamada de 15 min" y "Pedir presupuesto" queda como secundario.
 * - whatsapp: número en formato internacional sin "+" ni espacios (p. ej. "34600000000").
 *   Sale en la sección de contacto y en el botón flotante del móvil.
 * - phone: igual que whatsapp, para llamadas. Si es el mismo número, no se repite.
 * - availability: línea de disponibilidad junto al contacto (horario, urgencias).
 */
export const CONTACT: {
  bookingUrl: string;
  whatsapp: string;
  phone: string;
  availability: { es: string; en: string };
} = {
  bookingUrl: "",
  whatsapp: "",
  phone: "",
  availability: { es: "", en: "" },
};

/**
 * CV en PDF, uno por idioma (ruta en /public, p. ej. "/cv/angel-fernandez-es.pdf"). Vacío, no se
 * muestra el enlace en Sobre mí ni en el footer.
 */
export const CV: { es: string; en: string } = { es: "", en: "" };
