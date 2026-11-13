"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import type { ProjectCard as DatosCard } from "@/lib/projects";
import { ProjectCover } from "./project-cover";
import { Reveal, RevealGroup, RevealItem } from "./reveal";

const CARD =
  "border-rule flex h-full flex-col overflow-hidden rounded-2xl border transition-[box-shadow,border-color] duration-300";
const CARD_LINK =
  "group hover:border-[var(--accent)] hover:shadow-[0_30px_60px_-25px_rgba(194,65,12,0.3)]";

const Arrow = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="transition-transform duration-200 group-hover:translate-x-1"
    aria-hidden
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

/** Card de un proyecto de PROJECTS: mismo diseño que las de la home, con zoom discreto y sin tilt. */
function ProjectCard({ project }: { project: DatosCard }) {
  const { t, locale, l } = useI18n();
  const title = t(`portfolio.${project.key}Title`);
  return (
    <Link
      href={l(`/proyectos/${project.slug}`)}
      className="block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
    >
      <div className={`${CARD} ${CARD_LINK}`} style={{ background: "var(--bg)" }}>
        <ProjectCover
          project={project}
          alt={project.coverAlt?.[locale] ?? title}
          sizes="(min-width: 1024px) 370px, (min-width: 640px) 50vw, 100vw"
          className="h-52"
        />
        <div className="flex flex-1 flex-col p-6">
          <span
            className="mb-2 inline-block font-mono text-[11px] font-semibold tracking-wider uppercase"
            style={{ color: "var(--accent)" }}
          >
            {t(`portfolio.${project.key}Tag`)}
          </span>
          <h3 className="mb-2 origin-left text-[17px] leading-snug font-semibold tracking-tight transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.06] group-hover:font-bold">
            {title}
          </h3>
          <p className="text-muted mb-4 text-[13px] leading-relaxed">
            {t(`portfolio.${project.key}Desc`)}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {project.tech.map((tt) => (
              <span
                key={tt}
                className="rounded px-2 py-0.5 font-mono text-[11px]"
                style={{ background: "var(--chip)", color: "var(--muted)" }}
              >
                {tt}
              </span>
            ))}
          </div>
          <span className="text-muted mt-auto inline-flex items-center gap-2 self-start pt-5 text-[13px] font-medium transition-colors duration-200 group-hover:text-[var(--accent)]">
            {t("project.readArticle")}
            <Arrow />
          </span>
        </div>
      </div>
    </Link>
  );
}

const SELF_TECH = ["Next.js", "Supabase", "Tailwind CSS"];

/** Portada de esta misma web: captura del hero en claro y en oscuro (public/projects/this-site*.webp). */
const SELF_COVER = {
  image: "/projects/this-site.webp",
  imageDark: "/projects/this-site-dark.webp",
  cover: "",
  tint: 8,
};

/** Card de esta misma web: igual que las de proyecto, pero enlaza a la home. */
function SelfCard() {
  const { t, l } = useI18n();
  return (
    <Link
      href={l("/")}
      className="block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
    >
      <div className={`${CARD} ${CARD_LINK}`} style={{ background: "var(--bg)" }}>
        <ProjectCover
          project={SELF_COVER}
          alt={t("servicesPage.thisSiteAlt")}
          sizes="(min-width: 1024px) 370px, (min-width: 640px) 50vw, 100vw"
          className="h-52"
        />
        <div className="flex flex-1 flex-col p-6">
          <span
            className="mb-2 inline-block font-mono text-[11px] font-semibold tracking-wider uppercase"
            style={{ color: "var(--accent)" }}
          >
            {t("portfolio.p2Tag")}
          </span>
          <h3 className="mb-2 origin-left text-[17px] leading-snug font-semibold tracking-tight transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.06] group-hover:font-bold">
            {t("servicesPage.thisSiteTitle")}
          </h3>
          <p className="text-muted mb-4 text-[13px] leading-relaxed">
            {t("servicesPage.thisSiteText")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SELF_TECH.map((tt) => (
              <span
                key={tt}
                className="rounded px-2 py-0.5 font-mono text-[11px]"
                style={{ background: "var(--chip)", color: "var(--muted)" }}
              >
                {tt}
              </span>
            ))}
          </div>
          <span className="text-muted mt-auto inline-flex items-center gap-2 self-start pt-5 text-[13px] font-medium transition-colors duration-200 group-hover:text-[var(--accent)]">
            {t("servicesPage.thisSiteCta")}
            <Arrow />
          </span>
        </div>
      </div>
    </Link>
  );
}

/**
 * Proyectos reales de un servicio: tres cards en fila (una columna en móvil). `items` son slugs de
 * PROJECTS, o "self" para la card de esta misma web. Los textos salen de portfolio.* y no se copian.
 */
export function RealProjects({ title, items }: { title: string; items: (DatosCard | "self")[] }) {
  return (
    <>
      <Reveal>
        <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.08] font-semibold tracking-[-0.035em]">
          {title}
        </h2>
      </Reveal>
      <RevealGroup
        className="mt-10 grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3"
        stagger={0.08}
      >
        {items.map((item) => (
          <RevealItem key={item === "self" ? "self" : item.slug} className="h-full">
            {item === "self" ? <SelfCard /> : <ProjectCard project={item} />}
          </RevealItem>
        ))}
      </RevealGroup>
    </>
  );
}
