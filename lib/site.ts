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
export const LAST_UPDATED = "2026-11-10";

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
  email: "angelfernandezgarriga@gmail.com",
  localidad: "Palma de Mallorca, Islas Baleares, España",
  nif: "45613752Z",
  domicilio: "Palma de Mallorca, Islas Baleares, España",
};
