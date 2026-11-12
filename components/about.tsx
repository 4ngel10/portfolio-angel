"use client";

import { useI18n } from "@/lib/i18n";
import { CV } from "@/lib/site";
import { srcSetSobreMi } from "@/lib/sobre-mi-foto";
import { Reveal, RevealGroup, RevealItem } from "./reveal";

// Stack completo por área.
const STACK: { labelKey: string; items: string[] }[] = [
  {
    labelKey: "about.catSystems",
    items: ["Windows Server", "Active Directory", "PowerShell", "Hyper-V", "VMware", "Proxmox"],
  },
  { labelKey: "about.catM365", items: ["Microsoft 365", "Intune", "Hornetsecurity"] },
  { labelKey: "about.catNetwork", items: ["Fortinet", "UniFi", "pfSense"] },
  { labelKey: "about.catBackup", items: ["Veeam", "Nakivo", "NinjaOne"] },
  {
    labelKey: "about.catWeb",
    items: ["Next.js", "TypeScript", "Vercel", "Supabase", "Shopify", "Stripe"],
  },
];

function StackCategory({ cat }: { cat: (typeof STACK)[number] }) {
  const { t } = useI18n();
  return (
    <>
      <div className="mb-2 text-[13px] font-semibold">{t(cat.labelKey)}</div>
      <div className="flex flex-wrap gap-1.5">
        {cat.items.map((it) => (
          <span
            key={it}
            className="border-rule rounded-md border px-2.5 py-1 font-mono text-[11px] transition-[transform,border-color,color] duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)]"
            style={{ background: "var(--bg)" }}
          >
            {it}
          </span>
        ))}
      </div>
    </>
  );
}

export function About() {
  const { t, locale } = useI18n();

  return (
    <section id="about" className="bg-paper-alt scroll-mt-[72px] py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <Reveal>
          <h2 className="max-w-4xl text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.035em]">
            {t("about.title")}
          </h2>
        </Reveal>

        {/* Desde lg, el recorte va a la derecha del texto, alineado abajo con el último párrafo. En
            móvil y tablet va justo debajo del título (order-first), como la foto del hero. */}
        <div className="mt-10 grid gap-y-10 lg:grid-cols-12 lg:items-end lg:gap-x-8 lg:gap-y-0">
          <div className="lg:col-span-8">
            <RevealGroup className="max-w-3xl space-y-6" stagger={0.08}>
              <RevealItem as="div">
                <p className="text-muted text-base leading-[1.75] md:text-[17px]">
                  {t("about.p1")}
                </p>
              </RevealItem>
              <RevealItem as="div">
                <p className="text-muted text-base leading-[1.75] md:text-[17px]">
                  {t("about.p2")}
                </p>
              </RevealItem>
              {CV[locale] && (
                <RevealItem as="div">
                  <a href={CV[locale]} download className="btn-secondary">
                    {t("about.cvLink")}
                  </a>
                </RevealItem>
              )}
            </RevealGroup>
          </div>

          {/* Recorte con fondo transparente. Carga diferida y sin priority: está lejos del primer
              pantallazo. Los anchos de srcset y sizes cubren 168 px (móvil) y 208 px (escritorio) a 1x, 2x
              y 3x, así que cada pantalla baja una sola variante (lib/sobre-mi-foto.ts). */}
          <Reveal className="order-first lg:order-none lg:col-span-4 lg:justify-self-end">
            <div className="group relative mx-auto w-[168px] lg:mx-0 lg:w-[208px]">
              {/* Halo muy sutil, para que el polo oscuro no se pierda sobre el fondo. */}
              <div
                aria-hidden
                className="pointer-events-none absolute"
                style={{
                  inset: "12% -6% 0 -6%",
                  background:
                    "radial-gradient(closest-side, color-mix(in oklab, var(--accent) 10%, transparent), transparent)",
                }}
              />
              <picture>
                <source
                  type="image/avif"
                  srcSet={srcSetSobreMi("avif")}
                  sizes="(min-width: 1024px) 208px, 168px"
                />
                <source
                  type="image/webp"
                  srcSet={srcSetSobreMi("webp")}
                  sizes="(min-width: 1024px) 208px, 168px"
                />
                <img
                  src="/angel-cutout-sm.webp"
                  alt={t("about.photoAlt")}
                  width={520}
                  height={920}
                  loading="lazy"
                  decoding="async"
                  className="relative block h-auto w-full origin-bottom transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.03]"
                />
              </picture>
            </div>
          </Reveal>
        </div>

        <div className="mt-6">
          {/* Desde md, el stack se ve abierto. Por debajo, plegado en un <details> nativo
              (funciona sin JS y con teclado). Dos bloques, uno oculto con display:none según
              el ancho, para no depender de forzar el estado "open" por CSS o JS. */}
          <div className="hidden md:block">
            <RevealGroup className="grid grid-cols-3 gap-x-6 gap-y-5" stagger={0.07}>
              {STACK.map((cat) => (
                <RevealItem key={cat.labelKey}>
                  <StackCategory cat={cat} />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>

          <details className="group md:hidden">
            <summary className="border-rule text-muted flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 border-y py-2 text-sm font-semibold transition-colors hover:text-[var(--fg)] [&::-webkit-details-marker]:hidden">
              {t("about.stackOpen")}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-open:rotate-180"
                aria-hidden
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 pt-5">
              {STACK.map((cat) => (
                <div key={cat.labelKey}>
                  <StackCategory cat={cat} />
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}
