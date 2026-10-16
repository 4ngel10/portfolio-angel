"use client";

import Link from "next/link";
import { Reveal } from "./reveal";
import { ProjectCover } from "./project-cover";
import { useI18n, type Locale } from "@/lib/i18n";
import { PROJECTS, getProject, type PostBlock } from "@/lib/projects";

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

function formatDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

/** Texto con **negrita** y [enlace](url). Los enlaces externos abren en otra pestaña. */
export function Inline({ text }: { text: string }) {
  return text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g).map((part, i) => {
    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    if (bold)
      return (
        <strong key={i} className="font-semibold text-[var(--fg)]">
          {bold[1]}
        </strong>
      );
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const external = /^https?:\/\//.test(link[2]);
      return (
        <a
          key={i}
          href={link[2]}
          {...(external && { target: "_blank", rel: "noopener noreferrer" })}
          className="font-medium text-[var(--accent)] underline decoration-1 underline-offset-4 transition-colors hover:text-[var(--fg)]"
        >
          {link[1]}
        </a>
      );
    }
    return part;
  });
}

function Block({ block }: { block: PostBlock }) {
  if (typeof block === "string")
    return (
      <p className="text-muted mb-5 text-[17px] leading-[1.75] last:mb-0">
        <Inline text={block} />
      </p>
    );
  if ("h3" in block)
    return (
      <h3 className="mt-10 mb-3 text-[19px] leading-snug font-semibold tracking-tight">
        {block.h3}
      </h3>
    );
  if ("ol" in block)
    return (
      <ol className="text-muted mb-5 flex flex-col gap-3 text-[17px] leading-[1.75] last:mb-0">
        {block.ol.map((item, i) => (
          <li key={i} className="relative pl-8">
            <span
              className="absolute top-0 left-0 font-mono text-[15px] font-medium"
              style={{ color: "var(--accent)" }}
              aria-hidden
            >
              {i + 1}.
            </span>
            <Inline text={item} />
          </li>
        ))}
      </ol>
    );
  return (
    <ul className="text-muted mb-5 flex flex-col gap-3 text-[17px] leading-[1.75] last:mb-0">
      {block.list.map((item, i) => (
        <li key={i} className="relative pl-6">
          <span
            className="absolute top-[0.8em] left-1 h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--accent)" }}
            aria-hidden
          />
          <Inline text={item} />
        </li>
      ))}
    </ul>
  );
}

export function ProjectArticle({ slug }: { slug: string }) {
  const { t, locale } = useI18n();
  // La ruta ya valida el slug (notFound), aquí siempre existe.
  const project = getProject(slug)!;
  const title = t(`portfolio.${project.key}Title`);
  const post = project.post[locale];

  const idx = PROJECTS.indexOf(project);
  const next = PROJECTS[(idx + 1) % PROJECTS.length];

  return (
    <main>
      <header className="mx-auto max-w-4xl px-6 pt-14 md:px-8 md:pt-20">
        <Reveal>
          <Link
            href="/#portfolio"
            className="group text-muted inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-[var(--fg)]"
          >
            <Arrow back />
            {t("project.back")}
          </Link>

          <h1 className="mt-8 text-[clamp(2.25rem,5.5vw,3.75rem)] leading-[1.04] font-semibold tracking-[-0.04em]">
            {post.title ?? title}
          </h1>
          <p className="text-muted mt-6 max-w-2xl text-[19px] leading-relaxed">
            {post.intro ?? t(`portfolio.${project.key}Desc`)}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            {project.date && (
              <span className="text-muted text-sm">
                <time dateTime={project.date} suppressHydrationWarning>
                  {formatDate(project.date, locale)}
                </time>
                <span className="mx-2 opacity-40">·</span>
                Ángel Fernández
              </span>
            )}
            <span
              className="font-mono text-[11px] font-semibold tracking-wider uppercase"
              style={{ color: "var(--accent)" }}
            >
              {t(`portfolio.${project.key}Tag`)}
            </span>
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
          </div>

          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary group mt-10"
            >
              {t("project.visit")}
              <Arrow />
            </a>
          )}
        </Reveal>
      </header>

      <div className="mx-auto mt-14 max-w-6xl px-6 md:mt-20 md:px-8">
        <Reveal>
          <ProjectCover
            project={project}
            alt={title}
            sizes="(min-width: 1152px) 1088px, 100vw"
            className="border-rule aspect-[16/9] rounded-2xl border"
          />
        </Reveal>
      </div>

      <article className="mx-auto max-w-2xl px-6 py-20 md:px-8 md:py-28">
        {post.sections.map((section, s) => (
          <Reveal key={s} className="mb-16 last:mb-0">
            {section.heading && (
              <h2 className="mb-6 text-[clamp(1.5rem,3vw,2rem)] leading-tight font-semibold tracking-[-0.03em]">
                {section.heading}
              </h2>
            )}
            {section.blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </Reveal>
        ))}
      </article>

      {next !== project && (
        <section className="bg-paper-alt border-rule border-t">
          <div className="mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-20">
            <Link
              href={`/proyectos/${next.slug}`}
              className="group flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
            >
              <span>
                <span className="text-muted block text-sm font-medium">{t("project.next")}</span>
                <span className="mt-2 block text-[clamp(1.75rem,4vw,3rem)] leading-[1.05] font-semibold tracking-[-0.035em] transition-colors duration-200 group-hover:text-[var(--accent)]">
                  {t(`portfolio.${next.key}Title`)}
                </span>
              </span>
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                {t("project.read")}
                <Arrow />
              </span>
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
