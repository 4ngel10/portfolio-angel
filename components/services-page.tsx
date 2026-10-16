"use client";

import Link from "next/link";
import { Reveal, RevealGroup, RevealItem } from "./reveal";
import { Inline } from "./project-article";
import { SERVICE_ICONS } from "./service-icons";
import { CERTS } from "./about";
import { useI18n } from "@/lib/i18n";
import { SERVICES, PRINCIPLES, getService } from "@/lib/services";

const Arrow = ({ back = false }: { back?: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform duration-200 ${back ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`}
    aria-hidden
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const Check = () => (
  <svg
    className="mt-[0.4em] shrink-0"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ color: "var(--accent)" }}
    aria-hidden
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/** Página de un servicio: /servicios/[id]. */
export function ServicePage({ id }: { id: string }) {
  const { t, locale } = useI18n();
  // La ruta ya valida el id (notFound), aquí siempre existe.
  const service = getService(id)!;
  const idx = SERVICES.indexOf(service);
  const other = SERVICES[(idx + 1) % SERVICES.length];
  const [lead, ...rest] = service.intro[locale];

  return (
    <main>
      <header className="mx-auto max-w-4xl px-6 pt-14 pb-20 md:px-8 md:pt-20 md:pb-24">
        <Reveal>
          <Link
            href="/#services"
            className="group text-muted inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-[var(--fg)]"
          >
            <Arrow back />
            {t("servicesPage.back")}
          </Link>

          <div className="mt-10 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--accent)_10%,transparent)] text-[var(--accent)]">
              {SERVICE_ICONS[service.key]}
            </div>
            <span
              className="font-mono text-4xl font-medium tracking-tight opacity-25"
              style={{ color: "var(--accent)" }}
              aria-hidden
            >
              0{idx + 1}
            </span>
          </div>

          <h1 className="mt-6 text-[clamp(2.25rem,5.5vw,3.75rem)] leading-[1.04] font-semibold tracking-[-0.04em]">
            {t(`services.${service.key}Title`)}
          </h1>
          <p className="text-muted mt-6 max-w-2xl text-[19px] leading-relaxed">{lead}</p>
          {rest.map((p, i) => (
            <p key={i} className="text-muted mt-5 max-w-2xl text-[17px] leading-[1.75]">
              {p}
            </p>
          ))}

          {/* Las certificaciones son todas de sistemas: solo van en esa página. */}
          {service.id === "sistemas" && (
            <div className="mt-10">
              <h2 className="text-muted mb-3 text-xs font-semibold tracking-[0.08em] uppercase">
                {t("about.certsLabel")}
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {CERTS.map((c) => (
                  <div
                    key={c.title}
                    className="border-rule flex items-center gap-3 rounded-xl border px-4 py-3"
                    style={{ background: "var(--bg)" }}
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        background: "color-mix(in oklab, var(--accent) 10%, transparent)",
                        color: "var(--accent)",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <circle cx="12" cy="8" r="7" />
                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                      </svg>
                    </span>
                    <div className="text-[13px] leading-tight">
                      <div className="font-semibold">{c.title}</div>
                      <div className="text-muted mt-0.5 text-[12px]">{c.meta}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Reveal>
      </header>

      <section className="border-rule bg-paper-alt border-t py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <RevealGroup className="grid gap-5 md:grid-cols-2" stagger={0.06}>
            {service.groups[locale].map((g) => (
              <RevealItem
                key={g.title}
                className="border-rule flex h-full flex-col rounded-2xl border p-7 md:p-8"
                style={{ background: "var(--bg)" }}
              >
                <h2 className="text-[19px] leading-snug font-semibold tracking-tight">{g.title}</h2>
                <ul className="mt-4 flex flex-col gap-3">
                  {g.items.map((item, i) => (
                    <li key={i} className="text-muted flex gap-3 text-[15px] leading-relaxed">
                      <Check />
                      <span>
                        <Inline text={item} />
                      </span>
                    </li>
                  ))}
                </ul>
                {g.tools && (
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-6">
                    {g.tools.map((tool) => (
                      <span
                        key={tool}
                        className="rounded px-2 py-0.5 font-mono text-[11px]"
                        style={{ background: "var(--chip)", color: "var(--muted)" }}
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                )}
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="border-rule border-t py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <Reveal>
            <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.08] font-semibold tracking-[-0.035em]">
              {t("servicesPage.howTitle")}
            </h2>
            <p className="text-muted mt-5 max-w-xl text-[17px] leading-relaxed">
              {t("servicesPage.howLead")}
            </p>
          </Reveal>

          <RevealGroup className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" stagger={0.07}>
            {PRINCIPLES[locale].map((p, i) => (
              <RevealItem
                key={p.title}
                className="border-rule h-full rounded-2xl border p-6"
                style={{ background: "var(--bg)" }}
              >
                <span className="font-mono text-[11px]" style={{ color: "var(--accent)" }}>
                  0{i + 1}
                </span>
                <h3 className="mt-3 text-[17px] font-semibold tracking-tight">{p.title}</h3>
                <p className="text-muted mt-2 text-[14px] leading-relaxed">{p.text}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="border-rule bg-paper-alt border-t">
        <div className="mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-20">
          <Link
            href={`/servicios/${other.id}`}
            className="group flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
          >
            <span>
              <span className="text-muted block text-sm font-medium">
                {t("servicesPage.other")}
              </span>
              <span className="mt-2 block text-[clamp(1.75rem,4vw,3rem)] leading-[1.05] font-semibold tracking-[-0.035em] transition-colors duration-200 group-hover:text-[var(--accent)]">
                {t(`services.${other.key}Title`)}
              </span>
            </span>
            <span className="inline-flex items-center gap-2 text-sm font-medium">
              {t("servicesPage.more")}
              <Arrow />
            </span>
          </Link>
        </div>
      </section>

      <section className="border-rule border-t py-20 md:py-28">
        <Reveal className="mx-auto max-w-4xl px-6 text-center md:px-8">
          <h2 className="text-[clamp(1.75rem,4vw,3rem)] leading-[1.05] font-semibold tracking-[-0.035em]">
            {t("contact.title")}
          </h2>
          <p className="text-muted mx-auto mt-5 max-w-xl text-[17px] leading-relaxed">
            {t("contact.lead")}
          </p>
          <Link href="/#contact" className="btn-primary group mt-10">
            {t("nav.ctaContact")}
            <Arrow />
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
