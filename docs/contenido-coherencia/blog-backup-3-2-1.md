# backup-3-2-1, texto completo revisado

Sin cambios en slug, título, título SEO, description ni excerpt. Se aplica en `/admin/blog` (artículo publicado).

Cambios pedidos:
- Microsoft 365 ya no se atribuye a Nakivo. Solo se dice que necesita su propia copia con una herramienta dedicada, sin nombrar producto.
- "Fuera de la isla" en todo el texto (desaparece "fuera de Baleares").
- "Microsoft solo lo guarda unas semanas" pasa a decir que la retención depende del tipo de elemento y de la política.
- Caso propio, el homelab, solo con datos de la página del proyecto (copias de unos 10 GB, subida diaria a la nube, aviso por Telegram, dos copias en local).
- Dos imágenes nuevas, `esquema-3-2-1-es.webp` y `flujo-homelab-es.webp` (y sus `-en`), en `imagenes/`.

Verificación de lo que el artículo dice de Nakivo, Veeam y Acronis (documentación oficial):
- Nakivo, copia local y Backup Copy a otra ubicación o a la nube, inmutabilidad, verificación por captura de pantalla y aviso por correo. **Confirmado** en su centro de ayuda (Backup Copy Job Wizard, "Instant Verification", inmutabilidad). Detalle importante que añado: la inmutabilidad exige guardar las copias en archivos separados y la documentación indica que no se admite en repositorios cifrados. "Ni siquiera con una cuenta de administrador" se mantiene, porque Nakivo dice que ni siquiera root puede cambiar el estado.
- Nakivo con VMware, Hyper-V y servidores físicos. Es de su catálogo de producto. Lo dejo como estaba.
- Acronis, agente en cada equipo y copia a la nube. **Confirmado**, pero la documentación indica que, si el equipo está fuera de la red, la copia se hace cuando hay conexión. Cambio "aunque el portátil esté fuera de la red de la empresa" por "cuando tiene conexión a Internet, esté donde esté".
- Veeam, la frase de que "el esquema es el mismo con inmutabilidad" **no la he verificado**, así que la he quitado. Ahora dice solo que sigo el mismo esquema con la herramienta que ya tengan.
- Fuera de ámbito. En el export, la `description` SEO menciona "Nakivo, Veeam o Acronis". Sigue siendo verdad porque Veeam se nombra, pero si prefieres quitarlo de la description, dímelo (es un cambio de SEO que tienes que aprobar).

## ES

La regla 3-2-1 cabe en una línea: tres copias de tus datos, en dos soportes distintos y una de ellas fuera de la oficina. Es la base de cualquier estrategia de backup en una empresa. Cuando una copia falla el día que hace falta, casi siempre es porque se saltó uno de esos tres números.

## Qué significa cada número

- **3 copias.** El dato original y dos copias más. Si solo tienes una copia y falla justo cuando la necesitas, no tienes nada.
- **2 soportes distintos.** Por ejemplo, el disco del servidor y un NAS, o un NAS y la nube. Cada soporte falla por motivos distintos, así que es difícil que fallen los dos a la vez.
- **1 copia fuera.** Un incendio, una inundación o un robo se llevan por delante todo lo que hay en la oficina, copias incluidas. La copia externa es la que te salva en ese caso.

Parece mucho, pero se monta una vez y después funciona casi sola.

![Esquema de la regla 3-2-1. A la izquierda, el dato original en el servidor. En el centro, una segunda copia en un NAS de la oficina, en otro soporte. A la derecha, una tercera copia en la nube, fuera de la isla.](/blog-img/backup-3-2-1/esquema-3-2-1-es.webp "Dónde vive cada copia en la regla 3-2-1.")

## Por qué importa en una empresa pequeña

El riesgo no es solo que un disco se rompa. El peligro más serio hoy es el ransomware, que cifra los archivos y pide un rescate. Y si la copia está en una unidad conectada al servidor, también la cifra.

Luego está el error humano, que es lo más habitual. Alguien borra una carpeta, sobrescribe un Excel o vacía la papelera sin mirar. Con una buena política de copias, eso se arregla en minutos.

Y hay que pensar en lo que cuesta un día parado. Sin correo, sin facturación y sin acceso a los archivos, una oficina no trabaja. La copia de seguridad es lo que convierte ese día en una hora. Lo mismo vale para el acceso remoto. Si falla el equipo de la [VPN de la oficina](/blog/vpn-pyme-acceso-remoto), nadie entra desde casa hasta que se repone, y con su configuración copiada eso lleva minutos.

Si tu empresa está en Mallorca o en cualquier otra isla, hay un matiz más. La copia externa conviene que esté fuera de la isla, porque una tormenta o un corte eléctrico grande afectan a toda la zona a la vez.

## Cómo lo monto con Nakivo

Para servidores y máquinas virtuales, la herramienta que más uso es **Nakivo Backup & Replication**. Trabaja con VMware y Hyper-V, que son los hipervisores que más me encuentro, y también con servidores físicos.

El esquema tiene tres piezas:

1. **Una copia diaria** a un repositorio local, normalmente un NAS. Es la copia rápida. Si hay que restaurar algo, sale de aquí en minutos.
2. **Una copia secundaria (Backup Copy)** que lleva esas copias a otro sitio, ya sea otra sede o un almacenamiento en la nube. Esa es la copia externa.
3. **Copias inmutables.** Configuro el repositorio para que las copias no se puedan borrar ni modificar durante unos días, ni siquiera con una cuenta de administrador. Si entra un ransomware, no puede tocarlas. Esta opción tiene condiciones, por ejemplo no se puede usar en repositorios cifrados, así que lo compruebo al diseñar el repositorio.

Además, Nakivo puede mandar un informe por correo cada vez que termina un trabajo. Si una copia falla, me entero esa misma mañana, no el día que hace falta restaurar.

Si una empresa ya trabaja con otra herramienta, como **Veeam**, no la cambio por cambiar. Sigo el mismo esquema, copia local, copia externa y copias que no se puedan borrar, con lo que ya tengan.

## Dónde entra Acronis

Nakivo brilla con servidores. Para los equipos de los usuarios, sobre todo portátiles que entran y salen de la oficina, prefiero **Acronis**.

El agente se instala en cada equipo y copia a la nube cuando tiene conexión a Internet, esté donde esté, y no solo dentro de la red de la empresa. Si a alguien le roban el portátil en un viaje, sus archivos siguen a salvo y se recuperan en un equipo nuevo.

También permite copiar el equipo entero o solo carpetas concretas. Para la mayoría de usuarios basta con los documentos y el escritorio, que es donde de verdad está su trabajo.

## Un ejemplo sin nombres

Para una oficina de 10 a 20 puestos, con un par de servidores virtualizados, el esquema que propongo es este:

- Copia diaria de las máquinas virtuales con Nakivo a un NAS de la oficina, con dos semanas de historial.
- Copia secundaria cada noche a un almacenamiento en la nube fuera de la isla, inmutable durante 14 días.
- Acronis en los portátiles, con copia a la nube de documentos y escritorio.
- Una copia aparte de Microsoft 365 con una herramienta dedicada. Microsoft cuida el servicio, pero no equivale a una copia de seguridad propia. Cuánto tiempo se puede recuperar algo borrado depende del tipo de elemento y de la política de retención que tenga la empresa.

Con eso hay tres copias, en tres soportes, y una fuera de la isla. Cumple la regla con margen.

## Mi caso, el homelab

El ejemplo más pequeño que tengo es mi propio [homelab](/proyectos/homelab-proxmox). Cada noche Proxmox hace una copia completa de cada máquina. Cada tanda ronda los 10 GB, casi todo es la máquina de Home Assistant, y guardo las dos últimas en el propio servidor. Después, un script sube la más reciente a Google Drive.

Lo que más me enseñó es que el límite no siempre es técnico. Con la cuenta gratuita de Drive no caben dos tandas, así que el script borra la copia anterior antes de subir la nueva. Eso deja un pequeño hueco sin copia remota mientras dura la subida, y lo asumo. Para una empresa, ese hueco se resuelve con más espacio.

Y cada mañana recibo un aviso por Telegram con el resultado de la copia y el tamaño de cada máquina. Es la parte que más recomiendo copiar. Una copia que nadie vigila puede fallar sin que te enteres.

![Flujo diario de las copias de mi homelab. Proxmox hace una copia completa de cada máquina y guarda las dos últimas en local. Un script sube la más reciente a Google Drive, de unos 10 GB. Al terminar, un aviso por Telegram cuenta cómo ha ido.](/blog-img/backup-3-2-1/flujo-homelab-es.webp "Recorrido diario de las copias del homelab.")

## La parte que casi nadie hace, probar

Una copia que nunca se ha restaurado es una promesa, no una copia. Por eso programo pruebas de restauración periódicas. Recupero una máquina o unos archivos en un entorno aparte y compruebo que todo arranca y se abre bien.

Nakivo ayuda con esto. Puede arrancar la máquina desde la copia y enviarte una captura de pantalla del sistema ya iniciado. Así sabes que la copia arranca sin tener que restaurarla entera. Aun así, de vez en cuando hago una restauración completa a mano.

Hay una versión ampliada de la regla que lo resume bien, **3-2-1-1-0**. Una copia inmutable más y cero errores en las verificaciones.

Si no tienes claro si tus copias cumplen la regla 3-2-1, [cuéntamelo](/#contact) y lo revisamos juntos. Aquí puedes ver cómo trabajo en [administración de sistemas](/servicios/sistemas#backup).

## EN

The 3-2-1 rule fits in one line: three copies of your data, on two different media, with one of them off-site. It is the foundation of any company backup strategy. When a backup fails on the day you need it, it is almost always because one of those three numbers was skipped.

## What each number means

- **3 copies.** The original data plus two more copies. If you only have one copy and it fails right when you need it, you have nothing.
- **2 different media.** For example, the server disk and a NAS, or a NAS and the cloud. Each medium fails for different reasons, so it is unlikely both fail at once.
- **1 copy off-site.** A fire, a flood or a burglary wipes out everything in the office, backups included. The off-site copy is the one that saves you then.

It sounds like a lot, but you set it up once and then it mostly runs on its own.

![Diagram of the 3-2-1 rule. On the left, the original data on the server. In the middle, a second copy on a NAS in the office, on a different medium. On the right, a third copy in the cloud, off the island.](/blog-img/backup-3-2-1/esquema-3-2-1-en.webp "Where each copy lives in the 3-2-1 rule.")

## Why it matters for a small business

The risk is not just a disk dying. The most serious threat today is ransomware, which encrypts your files and demands a ransom. And if the backup sits on a drive connected to the server, it gets encrypted too.

Then there is human error, the most common one. Someone deletes a folder, overwrites a spreadsheet or empties the recycle bin without looking. With a good backup policy, that is fixed in minutes.

And think about what a day of downtime costs. No email, no invoicing and no access to files means the office simply stops. A backup is what turns that day into an hour. The same goes for remote access. If the machine running the [office VPN](/blog/vpn-pyme-acceso-remoto) fails, nobody can get in from home until it is replaced, and with its configuration backed up that takes minutes.

If your company is in Mallorca or on any other island, there is one more detail. The off-site copy should ideally be off the island, because a storm or a major power cut hits the whole area at once.

## How I set it up with Nakivo

For servers and virtual machines, the tool I use most is **Nakivo Backup & Replication**. It works with VMware and Hyper-V, the hypervisors I come across most, and with physical servers too.

The setup has three parts:

1. **A daily backup** to a local repository, usually a NAS. This is the fast copy. If something needs restoring, it comes from here in minutes.
2. **A secondary copy (Backup Copy)** that sends those backups somewhere else, either another site or cloud storage. That is the off-site copy.
3. **Immutable backups.** I configure the repository so backups cannot be deleted or changed for a number of days, not even with an administrator account. If ransomware gets in, it cannot touch them. This option has conditions, for example it cannot be used on encrypted repositories, so I check it when designing the repository.

On top of that, Nakivo can email a report every time a job finishes. If a backup fails, I know that same morning, not on the day I need to restore.

If a company already runs another tool, such as **Veeam**, I do not replace it for the sake of it. I follow the same setup, a local copy, an off-site copy and copies that cannot be deleted, with what they already have.

## Where Acronis comes in

Nakivo shines with servers. For users' machines, especially laptops that come and go from the office, I prefer **Acronis**.

The agent runs on each machine and backs up to the cloud whenever it has an Internet connection, wherever it is, not only inside the company network. If someone has their laptop stolen on a trip, their files are safe and can be restored to a new machine.

It can back up the whole machine or just specific folders. For most users, documents and desktop are enough, because that is where their work actually lives.

## An example without names

For an office of 10 to 20 workstations with a couple of virtualized servers, this is the setup I propose:

- Daily backup of the virtual machines with Nakivo to a NAS in the office, keeping two weeks of history.
- A secondary copy every night to cloud storage off the island, immutable for 14 days.
- Acronis on laptops, backing up documents and desktop to the cloud.
- A separate backup of Microsoft 365 with a dedicated tool. Microsoft looks after the service, but that is not the same as having your own backup. How long a deleted item can be recovered depends on the type of item and on the retention policy the company has.

That gives you three copies, on three media, with one off the island. It meets the rule with room to spare.

## My own case, the homelab

The smallest example I have is my own [homelab](/proyectos/homelab-proxmox). Every night Proxmox takes a full backup of each machine. Each batch is around 10 GB, mostly the Home Assistant machine, and I keep the last two on the server itself. Then a script uploads the most recent one to Google Drive.

What taught me the most is that the limit is not always technical. The free Drive account cannot hold two batches, so the script deletes the previous copy before uploading the new one. That leaves a small gap without a remote copy while the upload runs, and I accept it. For a company, that gap is solved with more space.

And every morning I get a Telegram message with the result of the backup and the size of each machine. It is the part I most recommend copying. A backup nobody watches can fail without you knowing.

![Daily flow of my homelab backups. Proxmox takes a full backup of each machine and keeps the last two locally. A script uploads the most recent one to Google Drive, around 10 GB. When it finishes, a Telegram message reports how it went.](/blog-img/backup-3-2-1/flujo-homelab-en.webp "Daily path of the homelab backups.")

## The part almost nobody does, testing

A backup that has never been restored is a promise, not a backup. That is why I schedule regular restore tests. I recover a machine or some files in a separate environment and check that everything boots and opens properly.

Nakivo helps here. It can boot the machine from the backup and send you a screenshot of the running system. That way you know the backup boots without restoring it in full. Even so, every now and then I do a full restore by hand.

There is an extended version of the rule that sums it up well, **3-2-1-1-0**. One more immutable copy and zero errors in verification.

If you are not sure whether your backups meet the 3-2-1 rule, [tell me about it](/#contact) and we will review them together. You can see how I work in [systems administration](/servicios/sistemas#backup).
