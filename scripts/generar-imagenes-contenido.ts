/**
 * Genera las imágenes de los artículos por-que-nextjs y backup-3-2-1 (1600x800 WebP, ES y EN)
 * en docs/contenido-coherencia/imagenes/. Renderiza HTML con las fuentes de assets/fonts en
 * Edge o Chrome sin interfaz y convierte con sharp. Estilo de la web: fondo #0a0f1c, acento
 * #fb923c, Space Grotesk y JetBrains Mono, trazos de 2 px y radios de 16 px como máximo.
 * Uso: npx tsx scripts/generar-imagenes-contenido.ts
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const RAIZ = process.cwd();
const SALIDA = path.join(RAIZ, "docs", "contenido-coherencia", "imagenes");
const TMP = path.join(SALIDA, "_tmp");
const NAVEGADORES = [
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
];
const navegador = NAVEGADORES.find((n) => existsSync(n));
if (!navegador) throw new Error("No hay Edge ni Chrome");

const fuente = (f: string) => pathToFileURL(path.join(RAIZ, "assets", "fonts", f)).href;

const CSS = `
@font-face{font-family:SG;src:url(${fuente("SpaceGrotesk-Medium.ttf")})}
@font-face{font-family:JB;src:url(${fuente("JetBrainsMono-SemiBold.ttf")})}
*{box-sizing:border-box;margin:0}
html,body{width:1600px;height:800px;background:#0a0f1c;color:#fff;font-family:SG,sans-serif;overflow:hidden}
body{position:relative;background:radial-gradient(ellipse 60% 50% at 85% 0%,rgba(251,146,60,.14),transparent 70%),#0a0f1c}
.box{position:absolute;border:2px solid #2a3350;border-radius:16px;background:#0f1629;padding:28px;display:flex;flex-direction:column;justify-content:center;gap:10px}
.box.acc{border-color:#fb923c}
.t{font-size:38px;line-height:1.1}
.s{font-family:JB,monospace;font-size:24px;color:#9aa4bf;line-height:1.3}
.tag{position:absolute;font-family:JB,monospace;font-size:26px;color:#fb923c;letter-spacing:.04em;text-transform:uppercase}
.ar{position:absolute;height:0;border-top:2px solid #fb923c}
.ar::after{content:"";position:absolute;right:-2px;top:-8px;border:7px solid transparent;border-left:12px solid #fb923c;border-right:0}
.dn{position:absolute;width:0;border-left:2px solid #fb923c}
.dn::after{content:"";position:absolute;left:-8px;bottom:-2px;border:7px solid transparent;border-top:12px solid #fb923c;border-bottom:0}
`;

type Caja = { x: number; y: number; w: number; h: number; t: string; s?: string; acc?: boolean };
const caja = (c: Caja) =>
  `<div class="box${c.acc ? " acc" : ""}" style="left:${c.x}px;top:${c.y}px;width:${c.w}px;height:${c.h}px"><div class="t">${c.t}</div>${c.s ? `<div class="s">${c.s}</div>` : ""}</div>`;
const flecha = (x: number, y: number, w: number) =>
  `<div class="ar" style="left:${x}px;top:${y}px;width:${w}px"></div>`;
const baja = (x: number, y: number, h: number) =>
  `<div class="dn" style="left:${x}px;top:${y}px;height:${h}px"></div>`;
const etiqueta = (x: number, y: number, t: string) =>
  `<div class="tag" style="left:${x}px;top:${y}px">${t}</div>`;

type Idioma = "es" | "en";

function servirPagina(l: Idioma): string {
  const T =
    l === "es"
      ? {
          a: "WordPress",
          a1: "Visita",
          a2: "Servidor y PHP",
          a2s: "Monta la página",
          a3: "Base de datos",
          a3s: "Textos y ajustes",
          a4: "Página",
          a4s: "Con caché opcional",
          b: "Web estática con Next.js",
          b1: "Al publicar",
          b1s: "Se genera cada página",
          b2: "Red de servidores",
          b2s: "Archivos ya hechos",
          b3: "Visita",
          b4: "Página",
          b4s: "Se pinta al momento",
        }
      : {
          a: "WordPress",
          a1: "Visit",
          a2: "Server and PHP",
          a2s: "Builds the page",
          a3: "Database",
          a3s: "Text and settings",
          a4: "Page",
          a4s: "With optional cache",
          b: "Static site with Next.js",
          b1: "On publish",
          b1s: "Every page is generated",
          b2: "Server network",
          b2s: "Ready-made files",
          b3: "Visit",
          b4: "Page",
          b4s: "Shows up instantly",
        };
  const w = 320,
    h = 190,
    xs = [80, 460, 840, 1220];
  const fila = (y: number, items: [string, string?, boolean?][]) =>
    items.map((it, i) => caja({ x: xs[i], y, w, h, t: it[0], s: it[1], acc: it[2] })).join("") +
    [0, 1, 2].map((i) => flecha(xs[i] + w + 10, y + h / 2, xs[i + 1] - xs[i] - w - 20)).join("");
  return (
    etiqueta(80, 56, T.a) +
    fila(110, [[T.a1], [T.a2, T.a2s], [T.a3, T.a3s], [T.a4, T.a4s]]) +
    etiqueta(80, 400, T.b) +
    fila(454, [[T.b1, T.b1s, true], [T.b2, T.b2s, true], [T.b3], [T.b4, T.b4s, true]])
  );
}

function piezas(l: Idioma): string {
  const es = l === "es";
  const wp = es
    ? ["Núcleo", "Tema", "Plugins", "PHP", "Base de datos"]
    : ["Core", "Theme", "Plugins", "PHP", "Database"];
  const nx = es ? ["Framework", "Node", "Dependencias"] : ["Framework", "Node", "Dependencies"];
  const col = (x: number, t: string, items: string[], acc: boolean) =>
    etiqueta(x, 56, t) +
    items.map((it, i) => caja({ x, y: 120 + i * 112, w: 640, h: 92, t: it, acc })).join("");
  return (
    col(80, "WordPress", wp, false) +
    col(880, es ? "Web con Next.js" : "Next.js site", nx, true) +
    caja({
      x: 880,
      y: 120 + 3 * 112 + 24,
      w: 640,
      h: 160,
      t: es ? "Vista previa antes de publicar" : "Preview before publishing",
      s: es ? "El fallo se ve antes que el visitante" : "A failure is seen before the visitor",
      acc: true,
    })
  );
}

function esquema(l: Idioma): string {
  const es = l === "es";
  const w = 400,
    h = 300,
    y = 210,
    xs = [100, 600, 1100];
  const c = es
    ? [
        ["1 Dato original", "Servidor de la oficina"],
        ["2 Copia local", "NAS, otro soporte"],
        ["3 Copia externa", "Nube, fuera de la isla"],
      ]
    : [
        ["1 Original data", "Office server"],
        ["2 Local copy", "NAS, another medium"],
        ["3 Off-site copy", "Cloud, off the island"],
      ];
  return (
    etiqueta(100, 80, es ? "Regla 3-2-1" : "3-2-1 rule") +
    c.map((it, i) => caja({ x: xs[i], y, w, h, t: it[0], s: it[1], acc: i === 2 })).join("") +
    flecha(xs[0] + w + 10, y + h / 2, xs[1] - xs[0] - w - 20) +
    flecha(xs[1] + w + 10, y + h / 2, xs[2] - xs[1] - w - 20) +
    `<div class="s" style="position:absolute;left:100px;top:600px;font-size:30px">${es ? "3 copias, 2 soportes y 1 fuera de la isla" : "3 copies, 2 media and 1 off the island"}</div>`
  );
}

function flujo(l: Idioma): string {
  const es = l === "es";
  const w = 330,
    h = 230,
    y = 190,
    xs = [60, 450, 840, 1230];
  const c = es
    ? [
        ["Proxmox", "Copia completa de cada máquina"],
        ["En local", "Las dos últimas copias"],
        ["Script", "Sube la más reciente"],
        ["Google Drive", "Unos 10 GB"],
      ]
    : [
        ["Proxmox", "Full backup of each machine"],
        ["Local", "The last two copies"],
        ["Script", "Uploads the most recent"],
        ["Google Drive", "Around 10 GB"],
      ];
  return (
    etiqueta(60, 80, es ? "Copia diaria del homelab" : "Daily homelab backup") +
    c.map((it, i) => caja({ x: xs[i], y, w, h, t: it[0], s: it[1], acc: i === 3 })).join("") +
    [0, 1, 2].map((i) => flecha(xs[i] + w + 6, y + h / 2, xs[i + 1] - xs[i] - w - 12)).join("") +
    baja(xs[2] + w / 2, y + h + 10, 90) +
    caja({
      x: 700,
      y: 520,
      w: 540,
      h: 150,
      t: "Telegram",
      s: es ? "Aviso diario con el resultado" : "Daily report with the result",
    })
  );
}

const IMAGENES: Record<string, (l: Idioma) => string> = {
  "servir-pagina": servirPagina,
  "piezas-mantener": piezas,
  "esquema-3-2-1": esquema,
  "flujo-homelab": flujo,
};

async function main() {
  mkdirSync(TMP, { recursive: true });
  for (const [nombre, fn] of Object.entries(IMAGENES)) {
    for (const l of ["es", "en"] as Idioma[]) {
      const html = `<!doctype html><meta charset="utf-8"><style>${CSS}</style><body>${fn(l)}</body>`;
      const f = path.join(TMP, `${nombre}-${l}.html`);
      const png = path.join(TMP, `${nombre}-${l}.png`);
      writeFileSync(f, html);
      execFileSync(
        navegador,
        [
          "--headless=new",
          "--disable-gpu",
          "--hide-scrollbars",
          "--force-device-scale-factor=1",
          "--allow-file-access-from-files",
          "--virtual-time-budget=3000",
          "--window-size=1600,800",
          `--screenshot=${png}`,
          pathToFileURL(f).href,
        ],
        { stdio: "ignore" },
      );
      const out = path.join(SALIDA, `${nombre}-${l}.webp`);
      await sharp(png)
        .resize(1600, 800, { fit: "cover", position: "top" })
        .webp({ quality: 88 })
        .toFile(out);
      console.log("ok", out);
    }
  }
  rmSync(TMP, { recursive: true, force: true });
}
main();
