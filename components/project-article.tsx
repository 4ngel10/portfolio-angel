"use client";

import Link from "next/link";
import { motion, useScroll, useSpring } from "framer-motion";
import { Reveal } from "./reveal";
import { TiltCard } from "./tilt-card";
import { ProjectCover } from "./project-cover";
import { useI18n, type Locale } from "@/lib/i18n";
import { PROJECTS, getProject, type PostBlock, type PostSection } from "@/lib/projects";

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

/** Número de un H2 contando solo las secciones con título (la primera puede no tenerlo). */
function headingNumber(sections: PostSection[], index: number) {
  return sections.slice(0, index + 1).filter((s) => s.heading).length;
}

function Block({ block, dropCap = false }: { block: PostBlock; dropCap?: boolean }) {
  if (typeof block === "string")
    return (
      <p
        className={`text-muted mb-5 text-[17px] leading-[1.75] last:mb-0 ${
          // Letra capital en el primer párrafo del artículo, para abrir la lectura.
          dropCap
            ? "first-letter:float-left first-letter:mt-1 first-letter:mr-3 first-letter:font-mono first-letter:text-[3.4rem] first-letter:leading-[0.85] first-letter:font-medium first-letter:text-[var(--accent)]"
            : ""
        }`}
      >
        <Inline text={block} />
      </p>
    );
  if ("h3" in block)
    return (
      <h3 className="group mt-10 mb-3 flex items-center gap-3 text-[19px] leading-snug font-semibold tracking-tight">
        <span
          className="h-[2px] w-4 shrink-0 rounded-full transition-[width] duration-300 group-hover:w-8"
          style={{ background: "var(--accent)" }}
          aria-hidden
        />
        {block.h3}
      </h3>
    );
  // Los puntos de las listas se desplazan y se encienden al pasar el ratón.
  const ITEM =
    "group/item relative rounded-lg transition-[transform,color] duration-200 hover:translate-x-1.5 hover:text-[var(--fg)]";
  if ("ol" in block)
    return (
      <ol className="text-muted mb-5 flex flex-col gap-3 text-[17px] leading-[1.75] last:mb-0">
        {block.ol.map((item, i) => (
          <li key={i} className={`${ITEM} pl-8`}>
            <span
              className="absolute top-0 left-0 inline-block font-mono text-[15px] font-medium transition-transform duration-200 group-hover/item:scale-125"
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
        <li key={i} className={`${ITEM} pl-6`}>
          <span
            className="absolute top-[0.8em] left-1 h-1.5 w-1.5 rounded-full transition-transform duration-200 group-hover/item:scale-[1.8]"
            style={{ background: "var(--accent)" }}
            aria-hidden
          />
          <Inline text={item} />
        </li>
      ))}
    </ul>
  );
}

/** Barra de progreso de lectura bajo la nav. Indica posición, no es decorativa. */
function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, mass: 0.3 });
  return (
    <motion.div
      className="fixed top-[72px] right-0 left-0 z-40 h-[3px] origin-left"
      style={{ scaleX, background: "var(--accent)" }}
      aria-hidden
    />
  );
}

/** Título de sección con su número y una línea de acento que se dibuja al aparecer. */
function SectionHeading({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-3">
        <span className="font-mono text-[12px] font-medium" style={{ color: "var(--accent)" }}>
          {String(n).padStart(2, "0")}
        </span>
        <motion.span
          className="h-px w-16 origin-left"
          style={{ background: "var(--accent)" }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "0px 0px -15% 0px" }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
          aria-hidden
        />
      </div>
      <h2 className="text-[clamp(1.5rem,3vw,2rem)] leading-tight font-semibold tracking-[-0.03em]">
        {children}
      </h2>
    </div>
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
      <ReadingProgress />
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
                  className="rounded px-2 py-0.5 font-mono text-[11px] transition-[transform,color] duration-200 hover:-translate-y-0.5 hover:text-[var(--accent)]"
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

      <div
        className="mx-auto mt-14 max-w-6xl px-6 md:mt-20 md:px-8"
        style={{ perspective: "1600px" }}
      >
        <Reveal>
          {/* La portada se inclina con el ratón y la imagen se acerca (group-hover de ProjectCover). */}
          <TiltCard
            maxTilt={3}
            className="group border-rule overflow-hidden rounded-2xl border transition-[box-shadow,border-color] duration-300 hover:border-[var(--accent)] hover:shadow-[0_40px_80px_-35px_rgba(194,65,12,0.35)]"
          >
            <ProjectCover
              project={project}
              alt={title}
              sizes="(min-width: 1152px) 1088px, 100vw"
              className="aspect-[16/9]"
            />
          </TiltCard>
        </Reveal>
      </div>

      <article className="mx-auto max-w-2xl px-6 py-20 md:px-8 md:py-28">
        {post.sections.map((section, s) => (
          <Reveal key={s} className="mb-16 last:mb-0">
            {section.heading && (
              <SectionHeading n={headingNumber(post.sections, s)}>{section.heading}</SectionHeading>
            )}
            {section.blocks.map((block, i) => (
              <Block key={i} block={block} dropCap={s === 0 && i === 0} />
            ))}
          </Reveal>
        ))}
      </article>

      {next !== project && (
        <section className="bg-paper-alt border-rule border-t">
          <div className="mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-20">
            <Link
              href={`/proyectos/${next.slug}`}
              className="block"
              style={{ perspective: "1200px" }}
            >
              <TiltCard
                lift
                maxTilt={4}
                className="group border-rule flex flex-col overflow-hidden rounded-2xl border transition-[box-shadow,border-color] duration-300 hover:border-[var(--accent)] hover:shadow-[0_30px_60px_-25px_rgba(194,65,12,0.3)] md:flex-row"
                style={{ background: "var(--bg)" }}
              >
                <ProjectCover
                  project={next}
                  alt={t(`portfolio.${next.key}Title`)}
                  sizes="(min-width: 768px) 320px, 100vw"
                  className="h-44 shrink-0 md:h-auto md:w-80"
                />
                <span className="flex flex-1 flex-col justify-center gap-3 p-7 md:p-10">
                  <span className="text-muted block text-sm font-medium">{t("project.next")}</span>
                  <span className="block text-[clamp(1.5rem,3.5vw,2.5rem)] leading-[1.05] font-semibold tracking-[-0.035em] transition-colors duration-200 group-hover:text-[var(--accent)]">
                    {t(`portfolio.${next.key}Title`)}
                  </span>
                  <span className="text-muted inline-flex items-center gap-2 text-sm font-medium transition-colors duration-200 group-hover:text-[var(--accent)]">
                    {t("project.read")}
                    <Arrow />
                  </span>
                </span>
              </TiltCard>
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
