"use client";

import Link from "next/link";
import { Reveal } from "./reveal";
import { TiltCard } from "./tilt-card";
import { Arrow, Block, ReadingProgress, SectionHeading, formatDate } from "./project-article";
import { ServiceCta } from "./service-cta";
import { useI18n } from "@/lib/i18n";
import { readingMinutes, type BlogPost, type BlogPostSummary } from "@/lib/blog-types";

/** Artículo del blog: /blog/[slug]. Misma maqueta que los artículos de proyecto. */
export function BlogArticle({
  post,
  next,
  comoDiv = false,
}: {
  post: BlogPost;
  next: BlogPostSummary | null;
  /** Pinta un <div> en vez de <main id="main">, para la vista previa del admin (que ya tiene su <main>). */
  comoDiv?: boolean;
}) {
  const { t, locale } = useI18n();
  const content = post.post[locale];

  return (
    <Contenedor comoDiv={comoDiv}>
      <ReadingProgress />
      <header className="mx-auto max-w-6xl px-6 pt-14 md:px-8 md:pt-20">
        <Reveal>
          <Link
            href="/blog"
            className="group text-muted inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-[var(--fg)]"
          >
            <Arrow back />
            {t("blog.back")}
          </Link>

          <h1 className="mt-8 max-w-5xl text-[clamp(2.25rem,5.5vw,3.75rem)] leading-[1.04] font-semibold tracking-[-0.04em]">
            {content.title}
          </h1>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="text-muted text-sm">
              <time dateTime={post.date} suppressHydrationWarning className="whitespace-nowrap">
                {formatDate(post.date, locale)}
              </time>{" "}
              <span className="whitespace-nowrap">
                <span className="mr-2 opacity-40" aria-hidden>
                  ·
                </span>
                Ángel Fernández
              </span>{" "}
              <span className="whitespace-nowrap">
                <span className="mr-2 opacity-40" aria-hidden>
                  ·
                </span>
                {readingMinutes(content)} {t("blog.minutes")}
              </span>
            </span>
            <span
              className="font-mono text-[11px] font-semibold tracking-wider uppercase"
              style={{ color: "var(--accent)" }}
            >
              {t(`blog.cat.${post.category}`)}
            </span>
          </div>
        </Reveal>
      </header>

      <article className="mx-auto max-w-6xl px-6 pt-14 pb-20 md:px-8 md:pt-20 md:pb-28">
        <Reveal className="mb-16 max-w-4xl">
          <Block block={content.intro} />
        </Reveal>
        {content.sections.map((section, s) => (
          <Reveal key={s} className="mb-16 max-w-4xl last:mb-0">
            {section.heading && <SectionHeading>{section.heading}</SectionHeading>}
            {section.blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </Reveal>
        ))}
      </article>

      <ServiceCta service={post.category === "desarrollo" ? "web" : "sistemas"} />

      {next && (
        <section className="border-rule border-t">
          <div className="mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-20">
            <Link href={`/blog/${next.slug}`} className="block" style={{ perspective: "1200px" }}>
              <TiltCard
                lift
                maxTilt={4}
                className="group border-rule flex flex-col gap-3 rounded-2xl border p-7 transition-[box-shadow,border-color] duration-300 hover:border-[var(--accent)] hover:shadow-[0_30px_60px_-25px_rgba(194,65,12,0.3)] md:p-10"
                style={{ background: "var(--bg)" }}
              >
                <span className="text-muted block text-sm font-medium">{t("blog.next")}</span>
                <span className="block text-[clamp(1.5rem,3.5vw,2.5rem)] leading-[1.05] font-semibold tracking-[-0.035em] transition-colors duration-200 group-hover:text-[var(--accent)]">
                  {next[locale].title}
                </span>
                <span className="text-muted inline-flex items-center gap-2 text-sm font-medium transition-colors duration-200 group-hover:text-[var(--accent)]">
                  {t("blog.read")}
                  <Arrow />
                </span>
              </TiltCard>
            </Link>
          </div>
        </section>
      )}
    </Contenedor>
  );
}

function Contenedor({ comoDiv, children }: { comoDiv: boolean; children: React.ReactNode }) {
  if (comoDiv) return <div>{children}</div>;
  return (
    <main id="main" tabIndex={-1} className="scroll-mt-[72px] outline-none">
      {children}
    </main>
  );
}
