/**
 * Datos del sitio en un solo sitio.
 *
 * SITE_URL: dirección pública de la web. La usan metadata (vistas previas al compartir),
 * sitemap.xml y robots.txt. Cuando haya dominio propio, cambiar solo esta línea.
 */
export const SITE_URL = "https://portfolio-angel-vert.vercel.app";

/**
 * Clave de acceso de Web3Forms (formulario de contacto -> Gmail de Ángel).
 * Es pública por diseño: Web3Forms la usa desde el navegador y solo permite enviar
 * correos a la cuenta que la registró. No es un secreto.
 */
export const WEB3FORMS_KEY = "cbbda3f8-e741-4a3e-b07f-5a74db4663fa";

/**
 * Datos del titular para el aviso legal (LSSI art. 10). Rellena `nif` antes de
 * publicar: mientras estén vacíos, la página no muestra esas líneas.
 */
export const LEGAL = {
  nombre: "Ángel Fernández Garriga",
  email: "angelfernandezgarriga@gmail.com",
  localidad: "Palma de Mallorca, Islas Baleares, España",
  nif: "",
  domicilio: "Palma de Mallorca, Islas Baleares, España",
};
