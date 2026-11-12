# Plan premium (fase 7)

Propuesta, sin código. Cada decisión lleva un número (D1, D2...) para que la apruebes o la descartes con
una línea. Lo que no apruebes no se toca. Todo lo que dependa de datos tuyos aparece como pendiente:
no se inventa nada.

## 1. Identidad principal

### Dónde estamos

- Hero: "Tu informática y tu web, con el rigor de un hotel que no puede parar." Dos CTA: Pedir
  presupuesto y Ver servicios.
- Servicios: "Dos servicios, una sola persona al teléfono." Sistemas ya va primero.
- Orden de la home: hero, servicios, tecnologías, proyectos, testimonios (oculta), sobre mí, blog, contacto.
- Lo que más pesa en credibilidad es de sistemas: 3 años, 60 hoteles, 120 servidores, 1.000 usuarios del
  equipo y tres certificaciones. El título SEO de la home ya es de sistemas ("Informático para empresas y autónomos en Mallorca").
- Las ofertas de empleo que buscas, técnico de sistemas, piden justo eso: experiencia, certificaciones,
  stack y un CV.

### Opción A. Sistemas principal, web secundaria (recomendada)

| Zona               | Cambio                                                                                                                                                                                                                                                                                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero               | H1 "Tu informática, con el rigor de un hotel que no puede parar." Lead "Administrador de sistemas en un equipo que lleva más de 60 hoteles. También hago webs para negocios." (EN equivalente). CTA principal Pedir presupuesto. CTA secundaria Ver CV cuando exista, si no Ver servicios. La tira de cifras y certificaciones se queda: ya es de sistemas. |
| Servicios          | Sistemas a doble ancho con sus 4 puntos y la web como card más pequeña, con título "Sistemas, y también tu web." Los dos siguen enlazando a su página.                                                                                                                                                                                                      |
| Navegación         | Igual (Servicios, Proyectos, Sobre mí, Blog, Contacto). Un sexto enlace apretaría la nav. El CV va en el hero, Sobre mí y el footer, no en la nav.                                                                                                                                                                                                          |
| Orden de secciones | Igual salvo los proyectos de sistemas primero (RDS y homelab antes que FlexGrip y Prompt Vault). Hoy el homelab va el último por una regla de CLAUDE.md, que habría que revisar (D4).                                                                                                                                                                       |
| Títulos            | Sobre mí: "Soy Ángel, administrador de sistemas. También desarrollo webs." La web sigue con su propio título SEO local en `/servicios/web`.                                                                                                                                                                                                                 |
| SEO                | Sin cambios: el título de la home y de `/servicios/sistemas` ya empujan sistemas.                                                                                                                                                                                                                                                                           |

Qué se pierde: la web deja de abrir la portada. Sigue teniendo su página, su título local y sus proyectos,
y es lo más barato de recuperar si cambias de idea.

### Opción B. Dos portadas separadas

- `/` pasa a ser un selector y salen `/sistemas` y `/web` como portadas completas.
- A favor: cada público ve solo lo suyo y cada portada afina su SEO.
- En contra:
  - Duplica hero, tira de pruebas, proyectos y mantenimiento.
  - Parte la autoridad de la home en tres.
  - Un reclutador aterriza en un selector, que es fricción.
  - Ya existen `/servicios/sistemas` y `/servicios/web`, que hacen de portadas.
- No la recomiendo. Si quieres más peso para la web, se amplía `/servicios/web` (ya está en marcha con el
  SEO local).

### Búsqueda de empleo (afecta a ambas opciones)

- **Visibilidad discreta:** CV descargable en Sobre mí y en el footer, y LinkedIn con "Open to work" fuera
  de la web. Un aviso "busco empleo" en la portada puede restar confianza a un cliente que quiere
  continuidad.
- **Contrato:** revisa pluriempleo y no competencia en servicios informáticos en general, porque ofreces
  servicios de sistemas y web mientras trabajas en una empresa de servicios IT. La web ya aclara que las
  cifras son del equipo, pero conviene tenerlo claro.
- **Redacción en presente:** si cambias de empresa hay que reescribir "Trabajo en el equipo..." y la tira
  de cifras.
- **Pie de página:** "Disponible para nuevos proyectos" puede leerse como autónomo. Decide si lo cambias o
  añades una frase de disponibilidad.

### Decisiones

- [ ] **D1.** Elegir la opción A. Si no, la B o seguir como estamos.
- [ ] **D2.** H1 y lead del hero como en la tabla (ES y EN, sin dos puntos ni guiones).
- [ ] **D3.** Sistemas a doble ancho y web como card pequeña en Servicios.
- [ ] **D4.** Proyectos de sistemas primero (cambia la regla "homelab el último").
- [ ] **D5.** CV como CTA secundaria del hero, en Sobre mí y en el footer (necesita el PDF, ver sección 4).
- [ ] **D6.** Sin aviso de búsqueda de empleo en la web; solo CV y LinkedIn.

## 2. Demo pública del área de clientes

### Qué enseñaría

Una ruta `/demo` que se ve igual que el portal de un cliente, con una banda fija "Demo. Datos inventados".

| Pantalla       | Contenido de ejemplo                                                     |
| -------------- | ------------------------------------------------------------------------ |
| Resumen        | Empresa "Ejemplo Servicios S.L. (demo)" y 2 proyectos con hitos y estado |
| Incidencias    | 3 incidencias, una con respuesta, con prioridades distintas              |
| Bolsa de horas | 20 h contratadas, movimientos que descuentan y el aviso al 20 %          |
| Presupuestos   | Uno enviado y uno aceptado, con la firma simulada                        |
| Archivos       | Lista de documentos ficticios, sin descarga                              |

Datos marcados como falsos: emails `@ejemplo.invalid`, NIF `B00000000`, importes redondos y nada que se
parezca a un cliente real. Sustituye la maqueta estática de la sección "Cómo trabajo".

### Cómo aislarla

- **A. Demo estática sin Supabase (recomendada).** Datos en `lib/demo/` con los mismos tipos que los
  reales, y los componentes de solo lectura que ya usa "Ver como cliente" (`components/portal/vistas-cliente.tsx`).
  Sin sesión, sin cookies, sin server actions y sin variables de entorno. Las acciones (abrir una incidencia,
  firmar) cambian un estado local y no se guardan. Un test falla si algo de `app/demo` o `lib/demo`
  importa Supabase o `createAdminClient`.
- B. Cuenta demo en el Supabase real. Descartada: mezcla datos, necesita una contraseña compartida y abre
  escrituras públicas.
- C. Proyecto Supabase aparte. Solo vale si quieres demostrar escritura real. Coste y mantenimiento sin
  beneficio claro.

### Riesgos

| Riesgo                                            | Cómo se evita                                                  |
| ------------------------------------------------- | -------------------------------------------------------------- |
| Que algo lea datos reales                         | La opción A no tiene red ni claves; test de imports prohibidos |
| Usar capturas del portal real en la demo          | Prohibido, solo datos de `lib/demo/`                           |
| Que la demo se indexe o se tome por real          | `noindex`, fuera del sitemap y banda fija con texto accesible  |
| La demo se desactualiza respecto al portal        | Mismos tipos TypeScript: si cambia el esquema, no compila      |
| Abuso (spam, subidas)                             | No hay endpoints ni formularios que guarden nada               |
| Dato personal inventado que coincida con uno real | Dominios `.invalid` y nombres claramente ficticios             |

Esfuerzo estimado: 1 día. No toca RLS ni la CSP.

### Decisiones

- [ ] **D7.** Hacer la demo con la opción A.
- [ ] **D8.** Ubicación en `/demo`, enlazada desde "Cómo trabajo" y desde `/servicios/sistemas`.
- [ ] **D9.** Pantallas y datos de la tabla (dime si quieres otro sector de ejemplo).

## 3. Scripts de PowerShell en GitHub

### Antes de nada

Los scripts se hicieron para un cliente de tu empresa. Sin permiso por escrito de ella (y del cliente si
procede) no se publican, aunque se sanee todo. Con permiso, publicar solo lo genérico.
Hoy el único con caso en la web es el mapeo de impresoras en RDS (versión 6.0). Dime qué otros hay;
no asumo ninguno.

### Qué quitar al sanear

| Tipo               | Ejemplos                                                      | Sustituir por                               |
| ------------------ | ------------------------------------------------------------- | ------------------------------------------- |
| Dominios           | FQDN de AD, sufijos UPN, correos                              | `contoso.local`, `usuario@contoso.local`    |
| Rutas              | `\\servidor\recurso`, rutas de usuario, de logs               | `\\print01.contoso.local\imp`               |
| Nombres            | Servidores, impresoras, colas, sedes, OU, GPO, grupos         | `PRN-SEDE1-01`, `OU=Sedes`                  |
| Atributos internos | Atributos personalizados de AD y sus valores                  | Nombres genéricos documentados en el README |
| Red                | IPs, rangos, SIDs, GUID                                       | Documentación `192.0.2.x` y GUID falsos     |
| Secretos           | Credenciales, tokens, SMTP                                    | Variables de entorno y `ejemplo.json` vacío |
| Contexto           | Nombres de clientes y personas, tickets, comentarios internos | Eliminar                                    |
| Historial git      | Commits antiguos con datos reales                             | Repo nuevo con historial limpio             |

Comprobación: PSScriptAnalyzer, `gitleaks` y una búsqueda por texto de cada dominio, servidor y cliente
real antes de publicar.

### Estructura del repo

Un repo por script notable, nombre descriptivo (por ejemplo `powershell-ad-printer-mapping`).

```
README.md          qué resuelve, requisitos, cómo funciona, instalación por GPO, parámetros
src/               el script
config/ejemplo.json  configuración con datos falsos
docs/arquitectura.md  diagrama (atributos en AD, GPO, flujo al iniciar sesión)
tests/             Pester con datos ficticios
CHANGELOG.md
LICENSE            MIT (o la que decidas)
SECURITY.md
.github/workflows/ PSScriptAnalyzer y Pester
```

README en español, con un resumen en inglés. Incluye una sección de limitaciones y de qué se cambió
para publicarlo.

### Enlazar desde los proyectos

- Campo opcional `links` en cada proyecto (`{ label, href }`), pintado como "Ver código en GitHub" en la
  cabecera del proyecto y en la card. Enlace externo con `target="_blank" rel="noopener noreferrer"`.
- JSON-LD `SoftwareSourceCode` (lenguaje PowerShell, repositorio y autor) en la página del proyecto.
- El README enlaza de vuelta a la página del proyecto. Se fija el repo en tu perfil de GitHub.
- Se cita "Va por la versión 6.0" solo si coincide con la versión publicada.

### Decisiones

- [ ] **D10.** Confirmo que tengo permiso para publicar el script de RDS (o lo pido primero).
- [ ] **D11.** Lista de otros scripts que quiero publicar (la das tú).
- [ ] **D12.** Licencia MIT (o la que prefieras).
- [ ] **D13.** Añadir el campo `links` y el JSON-LD a los proyectos.

## 4. Pendiente que depende de ti, por impacto

Impacto = efecto en conseguir clientes o entrevistas por el esfuerzo que cuesta.

| #   | Qué                                                                 | Para qué                                         | Qué necesito de ti                                                                         | Dónde entra                                   |
| --- | ------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------ | --------------------------------------------- |
| 1   | CV en PDF (ES y EN)                                                 | Búsqueda de empleo                               | Los dos PDF                                                                                | `CV` en `lib/site.ts`                         |
| 2   | Perfil de empresa de Google                                         | Aparecer en Maps y en el SEO local               | Verificarlo (código postal o vídeo), categoría, zona de servicio y si ocultas la dirección | Fuera de la web, y `sameAs` del JSON-LD       |
| 3   | Reserva de llamada (Cal.com u otra)                                 | Convierte mejor que el formulario                | La URL                                                                                     | `CONTACT.bookingUrl` (cambia el CTA del hero) |
| 4   | Teléfono y WhatsApp                                                 | Contacto inmediato en local                      | Decidir si los publicas y el número                                                        | `CONTACT.phone` y `whatsapp`                  |
| 5   | Texto de disponibilidad                                             | Fija expectativas (horario, urgencias, empleo)   | Una frase en ES y EN                                                                       | `CONTACT.availability`                        |
| 6   | Casos reales (migración de Microsoft 365 y restauración de copia)   | Prueba real y desbloquea la página local de M365 | Datos reales y permiso del cliente                                                         | `lib/cases.ts` (hoy en borrador, noindex)     |
| 7   | Cifras del caso RDS (tiempo por alta, incidencias, antes y después) | Convierte una anécdota en prueba                 | Números reales de tu empresa o estimados sin inventar                                      | `caseStudy.results` del proyecto              |
| 8   | Testimonios                                                         | Prueba social                                    | Textos con permiso expreso                                                                 | `lib/testimonials.ts` con `permission: true`  |
| 9   | Permiso y lista de scripts                                          | Desbloquea la sección 3                          | Sí o no de tu empresa y los scripts                                                        | Repos nuevos                                  |
| 10  | Foto nueva tuya para el hero                                        | Confianza y primera impresión                    | Hecho en la rama `foto-hero` (foto entera, 4:5, esquinas redondeadas, sin halo)            | `components/hero-photo.tsx` y `public/hero/`  |
| 11  | Certificaciones: fechas e identificadores                           | Credibilidad verificable                         | Fecha y enlace de cada una                                                                 | `lib/certifications.ts` y el JSON-LD          |

Pendiente técnico tras tus decisiones y tras el merge a `main`:

- **Rehacer `this-site.webp` y `this-site-dark.webp`.** Son una captura del hero antiguo (con la foto en
  rectángulo). Se rehacen tras el merge a `main` y, si cambia el hero (D1 a D3) o llega la foto nueva,
  mejor después de eso.
- **Dependabot:** los cinco PR (#3 a #7) siguen abiertos contra `main` a propósito. Los regeneras tú tras
  el merge de `mejoras` a `main`, para que partan del código actual. No se tocan antes.
- Paso de la CSP a enforce cuando haya informes limpios en los logs.

## Orden de trabajo propuesto

1. D1 a D6 (identidad): medio día, solo textos y orden. Después, la foto nueva y la captura de `this-site.webp`.
2. Pendientes 1, 3 y 5 en cuanto los tengas (minutos de código cada uno).
3. D7 a D9 (demo): 1 día.
4. D10 a D13 (scripts): según el permiso, 1 día por repo.
5. Casos, cifras y testimonios cuando los tengas: cada uno es un PR corto.
