# Proyectos, cambios de coherencia (para aplicar en /admin/portfolio)

Los proyectos viven en Supabase, no en el repo. Estos cambios son pares "buscar / poner" para pegar en el editor de cada proyecto (ES y EN). El texto de "buscar" sale de la versión de `lib/projects.ts` anterior a la migración (commit `5d5e6a7^`), porque el export de proyectos no llegó. **Si editaste el proyecto en el panel después de migrarlo, puede que algún "buscar" ya no coincida**: dime cuál y lo ajusto contra el export real.

Reglas aplicadas: sin rayas largas, sin dos puntos ni guiones como puntuación, sin absolutos, sin marcas ni modelos de cliente.

---

## 1. migracion-microsoft-365

| Dónde | Buscar | Poner |
|---|---|---|
| Ficha "Alcance" ES | 29 buzones y 420 GB migrados sin corte | 29 buzones y 420 GB migrados con un corte planificado de minutos en fin de semana |
| Ficha "Scope" EN | 29 mailboxes and 420 GB migrated with zero downtime | 29 mailboxes and 420 GB migrated with a planned cut of a few minutes over a weekend |
| El punto de partida ES | contando 5 compartidos (administración, comercial, soporte, facturación y dirección), | contando los buzones compartidos de cada departamento, |
| Where we started EN | including 5 shared ones (administration, sales, support, billing and management), | including the shared mailboxes of each department, |
| Migración del correo, paso 1 ES | Creación de los 24 usuarios y los 5 buzones compartidos, | Creación de los 24 usuarios y los buzones compartidos de cada departamento, |
| Mail migration, step 1 EN | Creation of the 24 users and the 5 shared mailboxes, | Creation of the 24 users and the shared mailboxes of each department, |
| SharePoint ES | Reestructuré los 420 GB en bibliotecas de SharePoint separadas por departamento, que son Administración, Comercial, Operaciones y Dirección. | Reestructuré los 420 GB en una biblioteca de SharePoint por departamento. |
| SharePoint EN | I restructured the 420 GB into SharePoint libraries split by department, namely Administration, Sales, Operations and Management. | I restructured the 420 GB into one SharePoint library per department. |

Anonimización (sin cambiar el razonamiento técnico):

| Dónde | Buscar | Poner |
|---|---|---|
| Paso 4 ES | el viernes por la tarde. | al empezar el fin de semana. |
| Paso 5 ES | el lunes a primera hora. | al empezar la semana. |
| Step 4 EN | on Friday afternoon. | at the start of the weekend. |
| Step 5 EN | first thing on Monday. | at the start of the week. |

La portada (`m365-cover.svg`, `m365-og.jpg`) solo lleva iconos de correo, archivos y seguridad. Sin texto, nombres ni IPs. No hace falta tocarla. "Sin parar el trabajo" del título es coherente con un corte de minutos en fin de semana.

---

## 2. red-profesional-bar

No hay apartado de resultado (no hay dato medido).

| Dónde | Buscar | Poner |
|---|---|---|
| Etiquetas (tech) | VLAN, Omada, WireGuard, Backups | VLAN, Firewall, VPN, Backups |
| Ficha "Entorno" ES | Bar restaurante con sala y terraza | Local de hostelería con sala y terraza |
| Ficha "Environment" EN | Bar and restaurant with indoor dining and terrace | Hospitality venue with indoor dining and terrace |
| Ficha "Alcance" ES | 4 VLAN aisladas, wifi de clientes, TPV, cámaras y oficina | Redes aisladas para clientes, cobro, cámaras y oficina |
| Ficha "Scope" EN | 4 isolated VLANs, guest wifi, till, cameras and office | Isolated networks for guests, payments, cameras and office |
| Ficha "Qué incluye" ES | Segmentación, copias automáticas y VPN WireGuard | Segmentación, copias cifradas fuera del local y acceso remoto seguro |
| Ficha "What it covers" EN | Segmentation, automated backups and WireGuard VPN | Segmentation, encrypted off-site backups and secure remote access |
| Intro ES | el wifi abierto de los clientes, dos TPV, el comandero, cuatro cámaras IP y el ordenador de administración | el wifi abierto de los clientes, los terminales de cobro, el comandero, las cámaras IP y el ordenador de administración |
| Intro EN | The open guest wifi, two tills, the handheld ordering device, four IP cameras and the admin computer | The open guest wifi, the payment terminals, the handheld ordering device, the IP cameras and the admin computer |
| Punto de partida ES | Un bar restaurante de unos 110 m² con sala interior y terraza | Un local de hostelería con sala interior y terraza |
| Where we started EN | A bar and restaurant of about 110 m² with an indoor dining room and a terrace | A hospitality venue with an indoor dining room and a terrace |
| ES | compartía rango IP con los dos TPV y la impresora de cocina | compartía red con los terminales de cobro y la impresora de cocina |
| EN | shared an IP range with the two tills and the kitchen printer | shared a network with the payment terminals and the kitchen printer |
| Red de clientes ES | y un límite de 15 Mbps por usuario para no saturar los 600 Mbps de la fibra. | y un tope de 15 Mbps por usuario. Es un límite por cliente para que nadie acapare la línea, no un caudal garantizado. El consumo real simultáneo queda por debajo de los 600 Mbps de la fibra, porque no todos usan la red a la vez. |
| Guest network EN | and a limit of 15 Mbps per user so the 600 Mbps line is never saturated. | and a cap of 15 Mbps per user. It is a per client limit so nobody hogs the line, not a guaranteed speed. Real simultaneous use stays below the 600 Mbps of the fibre, because not everyone is online at the same time. |
| Red de TPV ES | Prioridad de tráfico para los dos terminales de cobro, el comandero inalámbrico y las impresoras térmicas de barra y cocina. | Prioridad de tráfico para los terminales de cobro, el comandero inalámbrico y las impresoras de barra y cocina. |
| Till network EN | Traffic priority for the two payment terminals, the wireless ordering device and the thermal printers at the bar and in the kitchen. | Traffic priority for the payment terminals, the wireless ordering device and the printers at the bar and in the kitchen. |
| Videovigilancia ES | Cuatro cámaras IP y grabador NVR sin acceso directo a internet ni visibilidad desde el resto de subredes. | Cámaras IP y grabador en una red sin salida a internet ni visibilidad desde el resto de subredes. |
| CCTV EN | Four IP cameras and an NVR recorder with no direct internet access and no visibility from the other subnets. | IP cameras and a recorder on a network with no internet access and no visibility from the other subnets. |
| Equipos ES | un switch gestionable de 8 puertos con PoE para alimentar directamente las cuatro cámaras y los puntos de acceso sin enchufes extra, y dos puntos de acceso profesionales con gestión centralizada en Omada, uno en la sala y otro cubriendo la terraza. | un switch gestionable que alimenta por el propio cable de red las cámaras y los puntos de acceso, y puntos de acceso profesionales con gestión centralizada que cubren la sala y la terraza. |
| Equipment EN | an 8 port managed PoE switch that powers the four cameras and the access points directly with no extra plugs, and two professional access points managed centrally with Omada, one in the dining room and one covering the terrace. | a managed switch that powers the cameras and the access points over the network cable itself, and professional access points managed centrally that cover the dining room and the terrace. |
| Equipos ES | Todo va alojado en un pequeño rack mural ventilado en el almacén, con un SAI para aguantar los microcortes eléctricos. | Todo va en un pequeño rack ventilado, con un SAI para aguantar los microcortes eléctricos. |
| Equipment EN | It all sits in a small ventilated wall rack in the storeroom, with a UPS to ride out short power cuts. | It all sits in a small ventilated rack, with a UPS to ride out short power cuts. |
| Copias ES | Cada madrugada, al cierre, se hace una copia de seguridad cifrada de la base de datos del TPV y de la carpeta de facturación hacia un almacenamiento externo fuera del local. | Cada día se hace una copia cifrada de los datos de cobro y de la facturación hacia un almacenamiento fuera del local. |
| Backups EN | Every night after closing, an encrypted backup of the till database and the billing folder is sent to external storage away from the venue. | Every day an encrypted copy of the payment data and the billing records is sent to storage away from the venue. |
| Acceso ES | Para el soporte hay un túnel VPN WireGuard. Puedo revisar el estado de los equipos o resolver una incidencia sin desplazarme al bar. | Para el soporte hay un acceso remoto cifrado. Puedo revisar el estado de los equipos o resolver una incidencia sin desplazarme al local. |
| Access EN | For support there is a WireGuard VPN tunnel. I can check the state of the equipment or fix an issue without travelling to the bar. | For support there is an encrypted remote access. I can check the state of the equipment or fix an issue without travelling to the venue. |
| Paso 4 ES | Pruebas de aislamiento entre VLAN y de carga simultánea en barra. | Pruebas de aislamiento entre redes y de carga simultánea. |
| Step 4 EN | Isolation tests between VLANs and simultaneous load tests at the bar. | Isolation tests between networks and simultaneous load tests. |

Títulos "Cómo monté una red profesional para un bar" / "How I set up a professional network for a bar" y el slug `red-profesional-bar` quedan igual: dicen "bar" pero no identifican el local. Si prefieres "para un local de hostelería", cambia título y avísame, porque tocaría el slug y el SEO.

Portada (`red-bar-cover.svg`, `red-bar-og.jpg`): solo iconos de wifi, cobro, cámara y ordenador, sin texto, nombres ni IPs. No hace falta tocarla.

---

## 3. flexgrip

| Dónde | Buscar | Poner |
|---|---|---|
| Ficha "Estado" ES | Online y vendiendo | Online |
| Ficha "Status" EN | Live and selling | Live |
| Cómo está desarrollada ES (al final del primer párrafo) | la compra se gestiona mediante integraciones directas con Stripe. | la compra se gestiona mediante integraciones directas con Stripe. Elegí Astro porque es una landing estática de un solo producto, sin área privada ni base de datos, y envía muy poco JavaScript al navegador. Next.js lo reservo para webs con más páginas o con parte de aplicación. |
| How it is built EN | purchases are handled through direct Stripe integrations. | purchases are handled through direct Stripe integrations. I chose Astro because this is a static single product landing page, with no private area and no database, and it sends very little JavaScript to the browser. I keep Next.js for websites with more pages or an application side. |

---

## 4. homelab-proxmox

| Dónde | Buscar | Poner |
|---|---|---|
| Portada alt ES | arriba un switch TP-Link de 8 puertos con cables de red y abajo un mini PC Dell, el servidor Proxmox. | arriba un switch de 8 puertos con cables de red y abajo un mini PC, el servidor Proxmox. |
| Cover alt EN | a TP-Link 8-port switch with network cables on top and a Dell mini PC below, the Proxmox server. | an 8-port switch with network cables on top and a mini PC below, the Proxmox server. |
| Inicio ES | Pero hace mucho. Gestiona la domótica de casa con Home Assistant, me da una VPN propia, | Aun siendo pequeño, da mucho de sí. Gestiona la domótica de casa con Home Assistant, me da una VPN propia, |
| Start EN | But it does a lot. It runs the house automation with Home Assistant, gives me my own VPN, | Small as it is, it does a lot. It runs the house automation with Home Assistant, gives me my own VPN, |
| Home Assistant ES | Desde aquí controlo las luces de mi habitación y de parte de la casa, la climatización y unas cuantas escenas: modo trabajo, modo noche y “apaga todo”. Puedo encender el PC con Wake on LAN desde el móvil. Está integrado con Alexa, y con Music Assistant tengo música por la casa. | Desde aquí automatizo las luces, la climatización y la música de casa con Music Assistant. |
| Home Assistant EN | From here I control the lights in my room and part of the house, the climate and a few scenes: work mode, night mode and “turn everything off”. I can power on my PC with Wake on LAN from my phone. It is integrated with Alexa, and with Music Assistant I have music around the house. | From here I automate the lights, the climate and the music around the house with Music Assistant. |
| Home Assistant ES | También es accesible desde fuera, siempre por HTTPS, con certificado de Let's Encrypt y doble factor. | (borrar la frase) |
| Home Assistant EN | It is also reachable from outside, always over HTTPS, with a Let's Encrypt certificate and two-factor authentication. | (delete the sentence) |
| Copias ES | Resultado: siempre hay una copia fresca fuera de casa y nunca me paso de la cuota. | Hay copia remota todos los días. El único hueco es el rato que tarda la subida diaria, porque el script borra la copia anterior antes de subir la nueva. Con ese reparto no supero la cuota gratuita. |
| Backups EN | The result: there is always a fresh copy outside the house, and I never go over the quota. | There is a remote copy every day. The only gap is the time the daily upload takes, because the script deletes the previous copy before uploading the new one. With that approach I stay within the free quota. |

Pendiente de tu decisión, "Lo que viene" (lo dejo como está, como pediste):
- Sigue incluyendo el plan de VLAN ("Una red Omada completa") y "Más VPN, menos puertas abiertas". En tu primer mensaje pedías quitar los planes de VLAN y de "puertas abiertas". En el segundo decías dejar "Lo que viene" como está. Lo he leído como que se refería al hueco de la copia remota. Si quieres también recortar esos dos puntos, dímelo y preparo el texto.
- Como esa sección dice "menos puertas abiertas", **no afirmo en el blog que el homelab tenga solo el puerto de la VPN abierto**.
