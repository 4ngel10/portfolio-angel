# vpn-pyme-acceso-remoto, texto completo revisado

Sin cambios en slug, título, título SEO, description ni excerpt. Las dos imágenes del cuerpo ya existen (`puerto-vs-vpn-es.webp` y `flujo-vpn-es.webp`, y sus versiones `-en`), se mantienen tal cual. Se aplica en `/admin/blog` (artículo publicado, así que desde el panel, no por la API).

Cambios pedidos: WireGuard nombrado en la frase del puerto, el software de la VPN también se mantiene, caso propio (mi WireGuard del homelab, solo lo que ya dice la página del proyecto) y ampliación con decisiones previas, paso a paso y errores habituales. No hay cifras nuevas.

## ES

Cuando alguien necesita entrar al servidor o al escritorio de la oficina desde casa, lo primero que se suele hacer es abrir un puerto en el router. Funciona, pero deja un servicio de tu red visible para cualquiera en Internet. Una VPN resuelve lo mismo con mucho menos riesgo, y no hace falta ser una gran empresa para tenerla.

## Por qué no conviene abrir puertos en el router

Un puerto abierto es una puerta al exterior. En cuanto existe, hay escáneres automáticos que lo encuentran y empiezan a probar contraseñas, versiones antiguas y fallos conocidos. No hace falta que seas un objetivo, basta con que la puerta esté ahí.

Además, cada servicio expuesto es algo más que actualizar y vigilar. Con varios puertos abiertos, el riesgo crece sin que nadie lo note, sobre todo si el equipo no tiene a alguien dedicado a sistemas.

![Comparativa de dos formas de entrar a la red de la oficina. Con puerto abierto, Internet llega al servidor a través del router y lo ven los escáneres. Con VPN, solo el puerto de la VPN está abierto en el router y entra únicamente quien tiene credencial.](/blog-img/vpn-pyme-acceso-remoto/puerto-vs-vpn-es.webp "Puerto abierto frente a VPN.")

## Cómo funciona una VPN en la práctica

Una VPN crea un túnel cifrado entre el dispositivo de la persona (portátil, móvil o tablet) y la red de la oficina. Mientras está conectada, el equipo se comporta como si estuviera dentro: ve el servidor, las carpetas compartidas, las impresoras y puede abrir el escritorio remoto. Si ese escritorio es un servidor RDS, en el proyecto de [mapeo de impresoras en RDS con PowerShell](/proyectos/mapeo-impresoras-rds) cuento cómo dejo las impresoras listas al iniciar sesión.

Lo importante es lo que cambia. Los servicios internos dejan de publicarse en Internet y solo queda abierto un puerto, el de la propia VPN. Con WireGuard, ese puerto no responde a quien no presenta una clave válida, así que desde fuera se parece mucho a un puerto cerrado. Otras VPN se comportan de forma distinta, por eso conviene comprobar cómo responde la que vayas a usar. Y como cualquier servicio que mira a Internet, el software de la VPN también hay que mantenerlo actualizado.

![Flujo de acceso con VPN: un portátil o móvil con la app VPN activa se conecta por un túnel cifrado a través de Internet, atraviesa el router por un solo puerto y llega a la red de la oficina, con escritorio remoto, archivos e impresoras.](/blog-img/vpn-pyme-acceso-remoto/flujo-vpn-es.webp "Recorrido de una conexión desde fuera de la oficina.")

## Qué decidir antes de montarla

No es un proyecto enorme, pero conviene decidir cinco cosas antes de instalar nada. Cambiarlas después cuesta más que pensarlas ahora.

### Dónde vive la VPN

Puede vivir en el propio router, si lo permite, en un pequeño servidor o en un contenedor dentro de una máquina que ya esté encendida. Lo que importa es que esa máquina esté accesible, se actualice y tenga copia de su configuración. Un router doméstico con un firmware sin actualizar es una mala base.

### Quién necesita entrar y con qué dispositivo

Haz una lista corta de personas y dispositivos. Cada uno con su propia clave, no una compartida. Así sabes quién se conecta y puedes retirar a uno sin molestar a los demás.

### A qué debe llegar cada uno

No todo el mundo necesita ver todo. Una persona de administración quizá solo necesite el servidor de archivos y el escritorio remoto. Se limita el acceso a lo que cada persona usa, y si una clave se pierde, el daño posible es menor.

### Qué pasa cuando alguien se va o pierde un dispositivo

Si un portátil se pierde o alguien deja la empresa, se retira su clave y el resto sigue funcionando. Esto solo es fácil si cada persona tiene la suya desde el principio.

### Cómo se conecta el usuario

Una app instalada y configurada una vez, con un solo botón para activar o desactivar. Si conectarse es incómodo, la gente lo evita y vuelve a pedir que se abra un puerto.

## Mi caso, WireGuard en mi homelab

Uso WireGuard en mi homelab, una VPN moderna, rápida y muy ligera. Vive en un contenedor pequeño dentro del mismo mini PC que hace de servidor. Cuando estoy fuera me conecto desde el móvil y se comporta como si estuviera en casa. Lo cuento en el proyecto [Homelab personal sobre Proxmox](/proyectos/homelab-proxmox).

De ahí saco dos ideas que aplicaría a una oficina pequeña. La primera es que una VPN ligera en un contenedor es fácil de mover y de copiar, y eso la hace fácil de recuperar si falla el equipo. La segunda es que lo cómodo se usa. Si abrir la app es un gesto, se convierte en costumbre, y así no se vuelve a la tentación de abrir puertos.

## Paso a paso para una oficina pequeña

{ol}
1. **Inventario.** Quién necesita entrar, desde qué dispositivos y a qué servicios.
2. **Elegir dónde vive la VPN.** Router, servidor pequeño o contenedor, con acceso a la red interna.
3. **Crear una clave por persona y dispositivo.** Con un nombre que permita reconocerla después.
4. **Limitar a qué llega cada clave.** Solo los servidores o los rangos que esa persona usa.
5. **Probar desde fuera de la oficina.** Con los datos del móvil, no desde la wifi de la oficina, que no demuestra nada.
6. **Retirar los puertos que ya no hagan falta.** Una VPN que convive con un escritorio remoto abierto no ha resuelto el problema.
7. **Documentar y copiar la configuración.** Quién tiene qué clave y cómo se restaura el equipo.

## Errores comunes

- **Compartir una sola clave** entre varias personas. Nadie sabe quién se conecta y no se puede retirar a uno sin afectar a todos.
- **Dejar el escritorio remoto abierto además de la VPN.** Se pierde justo lo que se quería ganar.
- **No actualizar el servidor VPN ni el router.** Que sea seguro no significa que se pueda olvidar.
- **Dar acceso a toda la red a todos** en lugar de solo a lo necesario.
- **Probarla solo desde dentro de la oficina.** Parece que funciona, pero no se ha comprobado el recorrido real.
- **No tener un plan para el móvil o el portátil perdido.** Si nadie sabe qué clave retirar, la VPN se convierte en una puerta sin dueño.
- **No tener una copia de la configuración.** Si falla el equipo, hay que volver a repartir las claves. Lo trato en [la regla de copias 3-2-1](/blog/backup-3-2-1).

Si en tu negocio alguien accede hoy desde fuera con un puerto abierto, es de las primeras cosas que revisaría. Puedes ver qué hago en [sistemas](/servicios/sistemas) o [contarme tu caso](/#contact).

## EN

When someone needs to reach the office server or desktop from home, the first thing people usually do is open a port on the router. It works, but it leaves a service on your network visible to anyone on the Internet. A VPN solves the same problem with far less risk, and you do not need to be a big company to have one.

## Why opening ports on the router is a bad idea

An open port is a door to the outside. As soon as it exists, automated scanners find it and start trying passwords, old versions and known flaws. You do not need to be a target, it is enough that the door is there.

On top of that, every exposed service is one more thing to update and watch. With several open ports the risk grows without anyone noticing, especially if the team has nobody dedicated to systems.

![Comparison of two ways into the office network. With an open port, the Internet reaches the server through the router and scanners can see it. With a VPN, only the VPN port is open on the router and only people with a credential get in.](/blog-img/vpn-pyme-acceso-remoto/puerto-vs-vpn-en.webp "Open port versus VPN.")

## How a VPN works in practice

A VPN creates an encrypted tunnel between a person's device (laptop, phone or tablet) and the office network. While it is connected, the device behaves as if it were inside: it sees the server, the shared folders and the printers, and it can open the remote desktop. If that desktop is an RDS server, in the project on [printer mapping in RDS with PowerShell](/proyectos/mapeo-impresoras-rds) I explain how I get the printers ready at sign in.

What matters is what changes. Internal services stop being published on the Internet and only one port stays open, the VPN's own. With WireGuard, that port does not answer anyone who does not present a valid key, so from outside it looks a lot like a closed port. Other VPNs behave differently, so it is worth checking how the one you plan to use responds. And like any service facing the Internet, the VPN software also has to be kept up to date.

![VPN access flow: a laptop or phone with the VPN app on connects through an encrypted tunnel across the Internet, goes through the router on a single port and reaches the office network, with remote desktop, files and printers.](/blog-img/vpn-pyme-acceso-remoto/flujo-vpn-en.webp "Path of a connection from outside the office.")

## What to decide before setting it up

It is not a huge project, but it is worth deciding five things before installing anything. Changing them later costs more than thinking them through now.

### Where the VPN lives

It can live on the router itself if it allows it, on a small server or in a container inside a machine that is already on. What matters is that the machine is reachable, gets updated and has a copy of its configuration. A home router with outdated firmware is a poor foundation.

### Who needs to get in and with which device

Make a short list of people and devices. Each one gets their own key, not a shared one. That way you know who connects and you can remove one person without disturbing the rest.

### What each person should reach

Not everyone needs to see everything. Someone in administration may only need the file server and the remote desktop. Access is limited to what each person uses, and if a key is lost the possible damage is smaller.

### What happens when someone leaves or loses a device

If a laptop is lost or someone leaves the company, you remove their key and everyone else keeps working. That is only easy if each person has their own from the start.

### How the user connects

An app installed and set up once, with a single button to turn it on or off. If connecting is awkward, people avoid it and go back to asking for a port to be opened.

## My own case, WireGuard on my homelab

I use WireGuard on my homelab, a modern, fast and very light VPN. It lives in a small container inside the same mini PC that works as my server. When I am away I connect from my phone and it behaves as if I were at home. I describe it in the project [A personal homelab on Proxmox](/proyectos/homelab-proxmox).

I take two ideas from it for a small office. The first is that a light VPN in a container is easy to move and to copy, which makes it easy to recover if the machine fails. The second is that what is convenient gets used. If opening the app is a single gesture, it becomes a habit, and nobody is tempted to open ports again.

## Step by step for a small office

{ol}
1. **Inventory.** Who needs to get in, from which devices and to which services.
2. **Choose where the VPN lives.** Router, small server or container, with access to the internal network.
3. **Create one key per person and device.** With a name that lets you recognise it later.
4. **Limit what each key reaches.** Only the servers or ranges that person uses.
5. **Test from outside the office.** Using mobile data, not the office wifi, which proves nothing.
6. **Remove the ports that are no longer needed.** A VPN living alongside an open remote desktop has not solved the problem.
7. **Document and copy the configuration.** Who holds which key and how the machine is restored.

## Common mistakes

- **Sharing a single key** among several people. Nobody knows who is connecting and you cannot remove one person without affecting everyone.
- **Leaving the remote desktop open as well as the VPN.** You lose exactly what you wanted to gain.
- **Not updating the VPN server or the router.** Being secure does not mean it can be forgotten.
- **Giving everyone access to the whole network** instead of only what is needed.
- **Testing it only from inside the office.** It seems to work, but the real path has not been checked.
- **Having no plan for a lost phone or laptop.** If nobody knows which key to remove, the VPN becomes a door without an owner.
- **Having no copy of the configuration.** If the machine fails, you have to hand out the keys again. I cover it in [the 3-2-1 backup rule](/blog/backup-3-2-1).

If someone in your business reaches in from outside today through an open port, it is one of the first things I would review. You can see what I do in [systems](/servicios/sistemas) or [tell me about your case](/#contact).

---

Nota sobre el formato: en el panel, `{ol}` es solo una marca de este documento. En el editor se escribe como lista numerada (`1. `, `2. `...). Los textos "Mi caso" y "Paso a paso" son H2 nuevos. Los H3 son los del propio editor (`### `).
