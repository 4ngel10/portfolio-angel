# Portfolio · Ángel Fernández

Portfolio personal bilingüe (ES/EN) con dark mode. Next.js 15 · TypeScript · Tailwind v4 · Framer Motion.

## Puesta en marcha

```bash
npm install
npm run dev    # http://localhost:3000
```

Primera vez en el equipo: abrir la carpeta en VS Code (`code .`), aceptar la instalación de las extensiones recomendadas (`.vscode/extensions.json`) y usar el terminal integrado.

## Scripts

| | |
|---|---|
| `npm run dev` | dev server |
| `npm run build` | build producción |
| `npm run start` | sirve el build |
| `npm run lint` | eslint next |
| `npm run typecheck` | tsc --noEmit |
| `npm run format` | prettier --write . |

## Deploy en Vercel

```bash
git init
git add .
git commit -m "chore: initial scaffold"
gh repo create portfolio-angel --public --source=. --remote=origin --push
```

Luego [vercel.com/new](https://vercel.com/new) → importar el repo → deploy. Framework detectado como Next.js.

Variables de entorno (opcional, para que el formulario envíe emails de verdad):

- `RESEND_API_KEY` — crear cuenta en [resend.com](https://resend.com), verificar dominio
- `CONTACT_TO=angelfernandezgarriga@gmail.com`

Sin esas variables el endpoint `POST /api/contact` solo hace `console.log` del mensaje.

## Trabajando con Claude Code

El fichero `CLAUDE.md` del root contiene convenciones del proyecto (paleta, tipografía, qué NO tocar). Claude Code lo lee al abrir la sesión.

Para iterar:

```bash
# en el terminal integrado de VS Code
claude          # abre sesión en este repo
```

Luego pedirle cosas tipo "añade una sección de testimonios", "pasa el i18n a next-intl", "refactoriza el formulario para usar server actions". Mantendrá las convenciones.

## Estructura

Ver `CLAUDE.md`.

## Licencia

MIT.
