# Blog, guía de uso

El blog vive en Supabase (tabla `blog_posts`) y se gestiona desde `/admin/blog`, con tu sesión y el segundo factor. Las imágenes están en el bucket público `blog` y se sirven por `/blog-img/<slug>/<archivo>`. Cualquier cambio que hagas en el panel sale en la web sin desplegar.

## Publicar un artículo desde el panel

1. En `/admin/blog`, **Nuevo artículo** (también está en el menú "Nuevo").
2. Datos comunes: slug (va en la URL y no se puede cambiar una vez publicado), categoría y fecha. La fecha vacía es "ahora"; una fecha futura lo deja **programado**.
3. Rellena las pestañas Español e Inglés. El cuerpo se escribe con marcas: `##` H2, `###` H3, `- ` lista, `1. ` lista ordenada, `![alt](ruta "pie")` imagen, línea en blanco entre bloques, `**negrita**` y `[enlace](/ruta)`.
4. **Subir imagen** convierte a WebP y pega la marca donde tengas el cursor. Rellena el alt. Un SVG se acepta, pero se convierte a WebP.
5. El **comprobador** de la derecha enseña errores (en rojo, impiden publicar) y avisos (en ámbar). Pulsar uno te lleva a su idioma.
6. **Guardar borrador**, **Vista previa** (también de borradores, en ES y EN) y, sin errores, **Publicar** o **Programar**.
7. Tras publicar sale la URL pública, con un botón para copiarla y otro a la Inspección de URLs de Search Console, para pedir la indexación.

Un artículo programado aparece en la primera regeneración de la web tras su hora (se regenera cada hora como máximo).

## Imagen para redes

Si el artículo no tiene `og_image`, la web genera una de 1200x630 con el título en español y la categoría (`/blog/<slug>/opengraph-image`). Los 5 artículos originales conservan la suya. En el editor, sin `og_image` verás la miniatura de la generada (cuando el artículo esté publicado) y, si hay una subida, un botón para quitarla y volver a la generada.

## Claves de la API (para la rutina de Claude)

La rutina crea **borradores** por `/api/blog`. Nunca publica ni borra.

- **Crear:** `/admin/blog/claves`, un nombre que diga para qué sirve (aparecerá en los borradores como `api:nombre`) y **Crear clave**. La clave (`blg_...`) se enseña **una sola vez**: cópiala y guárdala como secreto de la rutina, nunca en el repositorio.
- **Revocar:** en la misma página, **Revocar**. Deja de funcionar al instante. Si pierdes una clave no se puede recuperar: revócala y crea otra.
- **Límites:** 20 artículos y 60 imágenes por clave y hora, JSON de hasta 400 KB.
- Los borradores que crea la API salen en "Pendiente de ti" del Resumen hasta que los publiques.
- Prueba completa de la API: `npx tsx --env-file=.env.local scripts/probar-api-blog.ts` (con `npm run dev` en marcha). Usa la base de datos de `.env.local`, que es la de producción, y borra todo lo que crea.

## Recuperar contenido

- **Una versión anterior de un artículo:** en su editor, **Historial de versiones**, **Restaurar**. Se guardan las 20 últimas y la actual se archiva antes de restaurar.
- **Copia de seguridad:** `/admin/blog`, **Exportar todo (JSON)**. Descarga todos los artículos y sus versiones. Guárdala de vez en cuando.
- **Restaurar desde el JSON exportado** (si se pierde un artículo o la tabla): cada elemento de `posts` es una fila de `blog_posts` (`slug`, `category`, `status`, `published_at`, `content`, `og_image`, `created_by`). Se recrea con un `insert` en el SQL Editor, o creando el artículo en el panel y pegando el `content` por la API (`PUT /api/blog/posts/<slug>` con `category`, `es`, `en`). Las imágenes están en el bucket, no en el JSON.
- Las pruebas del validador con los artículos reales: `BLOG_EXPORT=<ruta del JSON> npm test`.

## Si una página del blog no se actualiza

La web guarda los artículos en caché con la etiqueta `blog` y la regenera cada hora como respaldo. Al guardar, publicar, despublicar, duplicar, borrar o restaurar desde el panel se invalida sola (`revalidarBlog` en `lib/blog-revalidate.ts`). Si algo no cambia:

1. Recarga con Ctrl+F5: puede ser la caché del navegador.
2. Comprueba que el artículo está **Publicado** y no **Programado** con fecha futura (`/admin/blog`).
3. Espera como mucho una hora, que es el respaldo.
4. Un cambio hecho **directamente en la base de datos** (SQL Editor) no avisa a la web. Guarda el artículo una vez desde el panel, o despliega, para forzarlo.
5. Si la imagen para redes de un artículo no se refresca en una red social, es la caché de esa red (Facebook, LinkedIn y X guardan la imagen un tiempo).

## Reglas de contenido

Título y H2 sin dos puntos (coma), sin rayas largas, rangos como "24 a 48" y no "24-48", "Palma de Mallorca" solo en la `description`, `description` de 120 a 155 caracteres, al menos un enlace a `/servicios/sistemas` o `/servicios/web`, y al menos 2 imágenes con alt. El comprobador las avisa o las exige.
