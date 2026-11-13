# Proyectos del portfolio

Los proyectos de la web (la home, `/proyectos/<slug>`, `/en/proyectos/<slug>` y las páginas de servicio) viven en Supabase, en la tabla `portfolio_projects`, y se gestionan desde `/admin/portfolio`. Es el mismo patrón que el blog (`docs/blog.md`), sin API ni claves: los escribes tú desde el panel.

Todo lo que publiques sale en la web al instante, sin desplegar.

## Crear un proyecto

1. **Nuevo proyecto** (o "Proyecto del portfolio" en el menú "Nuevo"). Rellena los datos comunes y las dos pestañas, Español e Inglés.
2. **Guardar borrador**. Un borrador no se ve en la web.
3. **Vista previa** (se abre en otra pestaña): el artículo con los componentes reales, en español y en inglés, y debajo la card como sale en la home.
4. **Publicar**. La fecha va junto al botón: vacío es ahora, una fecha futura lo deja **Programado** (sale en la primera regeneración tras su hora, como máximo una hora después).

El comprobador del lateral enseña en vivo qué impide publicar (errores en rojo) y qué conviene revisar (avisos en ámbar).

## Qué lleva cada proyecto

- **Etiqueta**: una o dos palabras con el área. Las habituales son Automatización, Desarrollo web e Infraestructura (EN: Automation, Web development, Infrastructure).
- **Card**: título corto, descripción de una o dos frases y 3 o 4 tecnologías. Sin dos puntos, sin guiones como puntuación y sin rayas largas.
- **Artículo**: título largo, entradilla y cuerpo con marcas (`## H2`, `### H3`, `- lista`, `1. ordenada`, `![alt](ruta "pie")`, **negrita** y [enlace](/ruta)). Los H2 van sin número.
- **Ficha rápida**: exactamente 3 datos por idioma (Tipo, Alcance o Qué hice, Estado o Resultado).
- **Inglés, todo o nada**: si escribes algo, tiene que estar completo (título, entradilla y las mismas secciones que el español). Sin inglés, `/en/proyectos/<slug>` da 404 y el proyecto no sale en la home en inglés.
- **Servicio**: `web` o `sistemas`. Decide a qué servicio lleva la llamada del final del artículo.
- **Sale en /servicios/web y /servicios/sistemas** (`en_servicios`): las casillas deciden en qué páginas de servicio sale la card. La card de esta misma web siempre cierra `/servicios/web`.
- **Resumen del caso** (opcional): contexto, mi papel, cifras antes y después, fragmento de código y cita. Las cifras y la cita tienen que ser reales. La cita exige la casilla "Con permiso del cliente" y que las cifras no sean provisionales.

## Portadas e imágenes

- **Portada**: elige una de `public/projects/` o sube una nueva (se convierte a WebP, 2200 px como máximo, y va al bucket `portfolio`, que se sirve por `/portfolio-img/<slug>/<archivo>`). Con imagen, el texto alternativo es obligatorio en cada idioma. Sin imagen se ve el texto de portada sobre la trama de puntos.
- **Imagen oscura** (opcional): se ve en el tema oscuro en lugar de la clara.
- **Imágenes del artículo**: botón "Subir imagen al texto"; se pega en el cursor y hay que rellenar su alt.
- **Imagen para redes** (1200x630): si la pones, se usa tal cual. Si no, la web genera una con el título y la etiqueta ("PROYECTO · ETIQUETA"). Una subida se guarda como WebP; para un JPG, pon la ruta de `public/projects/`.
- Un SVG se revisa al subirlo (sin scripts, recursos externos ni rayas largas) y se convierte a WebP. Nunca se guarda un SVG en el bucket.
- Las fotos de cámara originales no van a `public/` ni al bucket sin convertir.

## Orden

Las flechas de la lista suben y bajan un proyecto en la home. Un proyecto nuevo se crea al final. El orden de la home es: trabajo para clientes y producto propio primero, el homelab el último.

Las flechas usan la función de Postgres `mover_proyecto` (`db/rls.sql`). Si el panel dice que falta, lanza `db/rls.sql` entero en el editor de SQL de Supabase.

## Casos de ejemplo y cifras provisionales

- **Caso de ejemplo**: un caso inventado para enseñar cómo trabajo. Al marcar la casilla, el editor pega las marcas obligatorias (descripción que empieza por "Caso de ejemplo.", primer dato de la ficha y primer párrafo con el aviso). No puede llevar cita ni cifras antes y después. Los proyectos actuales son trabajos reales.
- **Cifras provisionales**: se puede publicar, pero el panel lo recuerda (chip en la lista, aviso en el comprobador y entrada en "Pendiente de ti") hasta que pulses "Marcar cifras como validadas".

## Despublicar y borrar

- **Despublicar**: antes de hacerlo, el panel avisa de que `/proyectos/<slug>` dará 404 y de en qué páginas deja de salir (la home y, si estaba marcado, `/servicios/web` o `/servicios/sistemas`).
- **Borrar**: un borrador se borra sin más; uno publicado exige escribir su slug. El slug de un proyecto publicado no se puede cambiar.
- Se guardan las 20 últimas versiones de cada proyecto, con "Restaurar" en el lateral (no cambia el slug, el estado ni la posición).

## Palabras prohibidas (opcional)

La variable de entorno `PALABRAS_PROHIBIDAS` es una lista separada por comas de nombres que no se pueden nombrar (clientes, grupos hoteleros). Se compara sin distinguir mayúsculas y, si aparece alguno en cualquier texto de un proyecto, el comprobador bloquea publicar. Vacía o sin definir, no valida nada.

Va en `.env.local` y en Vercel (Settings, Environment Variables; después hay que redesplegar). No lleva `NEXT_PUBLIC_`, así que no llega al navegador, y los nombres reales no entran en el repositorio. Ejemplo: `PALABRAS_PROHIBIDAS=Hoteles Ejemplo,Bar Modelo`. Cuidado con palabras cortas o comunes: la coincidencia es por subcadena, así que `Sol` bloquearía "solución".

## Copia de seguridad y restauración

**Exportar**: en `/admin/portfolio`, "Exportar todo (JSON)". Descarga `portfolio-AAAA-MM-DD.json` con todos los proyectos (también borradores) y sus versiones. Guárdalo fuera de `public/` y del repositorio: lleva los textos reales.

**Restaurar desde el JSON** (si se borra un proyecto o hay que volver a una copia):

1. Genera el SQL, en la raíz del proyecto:
   ```bash
   npx tsx scripts/restaurar-proyectos.ts C:/ruta/portfolio-2026-11-14.json
   ```
   Escribe `db/restaurar-proyectos.sql` (ignorado por git). Con `--versiones` incluye también el historial.
2. Abre el archivo, revísalo y lánzalo en el editor de SQL de Supabase. Es una transacción: cada proyecto es un `insert ... on conflict (id) do update`, así que repone los que falten y deja los demás como estaban en la copia.
3. Borra `db/restaurar-proyectos.sql` cuando termines.
4. Entra en el panel y pulsa Guardar en un proyecto, o espera una hora, para que la web refresque su caché.

Las imágenes del bucket `portfolio` no van en el JSON: solo sus rutas. Si se pierde el bucket, hay que volver a subirlas.

## Para desarrolladores

- **Lectura pública**: `lib/proyectos-db.ts`. Cliente anon sin cookies, columnas por nombre (nunca `select(*)`: `anon` no lee `created_by`), `unstable_cache` con la etiqueta `portfolio` y `revalidate` de 3600. Si Supabase falla lanza una excepción, nunca devuelve `[]`.
- **Tras cualquier cambio** llama a `revalidarPortfolio(slug)` (`lib/proyectos-revalidate.ts`): invalida la etiqueta, la home, los servicios, la página del proyecto, su imagen social y el sitemap, en español y en inglés.
- **Validador**: `lib/proyectos-validate.ts`, compartido por el panel y las acciones. Los mensajes van en español. Sin regex con barras invertidas. Si cambias una regla, ajusta su prueba en `scripts/probar-proyectos.ts`.
- **Acciones**: `lib/proyectos-actions.ts`. Todas empiezan con `requireAdmin()`.
- **Pruebas**: `npx tsx scripts/probar-proyectos.ts`. Con las claves de Supabase en `.env.local` también comprueba que los proyectos publicados pasan el comprobador y hacen la ida y vuelta del conversor sin pérdidas. Con `PORTFOLIO_EXPORT=<copia.json>` prueba una copia de seguridad.
- **Seguridad y RLS**: `db/rls.sql` (apartado 11), `db/verificar-rls.sql` y `docs/pruebas-rls.md` (apartado 6).
