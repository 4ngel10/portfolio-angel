# Pruebas manuales de accesibilidad

Guion corto para hacer a mano con teclado y con un lector de pantalla (NVDA o el Narrador de Windows,
`Win + Ctrl + Intro`). Hazlo en Edge o Chrome, con tema claro y con tema oscuro. Cada ronda tarda
unos 15 minutos. Los fallos se anotan con página, paso y lo que se esperaba.

Teclas: `Tab` y `Shift + Tab` mueven el foco, `Intro` activa enlaces y botones, `Espacio` activa
botones y abre el desplegable, `Escape` cierra el menú móvil. Con NVDA, `H` salta entre títulos, `D`
entre landmarks, `F` entre campos y `Insert + F7` abre la lista de elementos.

## Siempre (todas las páginas)

1. Recarga y pulsa `Tab` una vez. Debe aparecer "Ir al contenido principal". Con `Intro` el foco salta
   al contenido y el siguiente `Tab` ya no pasa por la nav.
2. Recorre toda la página con `Tab`. El orden debe seguir el visual y cada elemento debe mostrar un
   contorno claro (anillo naranja de 2 px). Ninguno puede quedar sin contorno ni atrapar el foco.
3. Con NVDA, `D` debe encontrar: banner (cabecera), navegación principal, principal, navegación de
   secciones, navegación legal y pie. Un solo banner.
4. `H` debe dar un solo título de nivel 1 y los demás sin saltos de nivel.

## Inicio (/)

1. Cabecera: `Tab` por logo, Servicios, Proyectos, Sobre mí, Blog, Contacto, ES/EN, tema y
   "Pedir presupuesto". El enlace de la página actual se anuncia como "ubicación actual".
2. Cambia el idioma con ES/EN y el tema con el botón de luna o sol. Deben anunciarse con nombre y estado.
3. Marquesina de tecnologías: el lector la lee una sola vez (nombre "marquee" y la lista).
4. Enlaces internos (`Intro` sobre "Contacto"): la página se desplaza y el foco queda en la sección.
5. **Formulario**
   - Envía vacío: el navegador marca el primer campo obligatorio y el lector lo anuncia.
   - Escribe `a@b` como correo y envía: el foco va al campo de correo, el lector dice "no válido" y lee
     "Escribe un correo válido…". Lo escrito se conserva.
   - Envía un mensaje correcto: el lector anuncia "Mensaje enviado" sin mover el foco.
   - Haz cuatro envíos válidos seguidos en menos de 10 minutos: los tres primeros salen y el cuarto
     anuncia el aviso de límite.
6. Botones flotantes: baja por la página. Aparecen "Contactar" (solo en móvil o tablet) y "Volver
   arriba". Ambos se alcanzan con `Tab`, tienen nombre y "Volver arriba" lleva al inicio de la página.

## Menú móvil (ancho de ventana menor de 1024 px)

1. `Tab` hasta el botón de menú. El lector dice "menú, botón, contraído".
2. `Intro` abre el menú: ahora dice "expandido" y el siguiente `Tab` entra en los enlaces.
3. `Escape` cierra el menú y el foco vuelve al botón.
4. Con el menú abierto, `Intro` en un enlace lo cierra y navega.

## Servicios (/servicios/sistemas y /servicios/web)

1. Las cards recorren con `Tab` sin trampas y cada una se lee con su título.
2. Preguntas frecuentes: `Intro` o `Espacio` abren y cierran cada pregunta. El lector anuncia expandido o contraído.
3. Entra por `/servicios/sistemas#mantenimiento`: la página baja a la card y el foco queda allí.

## Proyectos y blog

1. La barra de progreso de lectura no se anuncia (es decorativa).
2. Las tarjetas de "Siguiente proyecto" y "Leer artículo" son enlaces con nombre propio.
3. Imágenes: cada portada tiene texto alternativo que describe la imagen.

## Páginas legales y 404

1. En `/privacidad` y `/cookies` los títulos permiten saltar por secciones con `H`.
2. En una URL que no existe la 404 se lee entera.

## Con movimiento reducido

Activa Windows, Configuración, Accesibilidad, Efectos visuales, "Efectos de animación" en desactivado.

1. Recarga. La marquesina no se mueve: se ve la lista entera, centrada y en varias líneas.
2. El título del hero no sube ni se desvanece al cargar.
3. Un enlace interno (por ejemplo "Contacto") salta a la sección sin deslizarse.
4. Al pasar el ratón por la foto del hero o por una card no hay animación.
5. En una URL que no existe, el cursor de la 404 no parpadea.

## Si algo falla

Anota: página, tema, navegador, lector de pantalla y versión, pasos y resultado. Los contrastes y los
contornos de foco se midieron con un script (todo el texto de las páginas públicas cumple 4,5:1 en los
dos temas), así que lo que más interesa de la prueba manual es lo que solo se nota con el lector:
nombres, orden y anuncios.
