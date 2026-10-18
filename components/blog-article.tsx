"use client";

import Link from "next/link";
import { Reveal } from "./reveal";
import { TiltCard } from "./tilt-card";
import {
  Arrow,
  Block,
  ReadingProgress,
  SectionHeading,
  formatDate,
  headingNumber,
} from "./project-article";
import { useI18n } from "@/lib/i18n";
import { BLOG_POSTS, getBlogPost, readingMinutes } from "@/lib/blog";

/** Artículo del blog: /blog/[slug]. Misma maqueta que los artículos de proyecto. */
export function BlogArticle({ slug }: { slug: string }) {
  const { t, locale } = useI18n();
  // La ruta ya valida el slug (notFound), aquí siempre existe.
  const post = getBlogPost(slug)!;
  const content = post.post[locale];

  const idx = BLOG_POSTS.indexOf(post);
  const next = BLOG_POSTS[(idx + 1) % BLOG_POSTS.length];

  return (
    <main id="main" tabIndex={-1} className="scroll-mt-[72px] outline-none">
      <ReadingProgress />
      <header className="mx-auto max-w-4xl px-6 pt-14 md:px-8 md:pt-20">
        <Reveal>
          <Link
            href="/blog"
            className="group text-muted inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-[var(--fg)]"
          >
            <Arrow back />
            {t("blog.back")}
          </Link>

          <h1 className="mt-8 text-[clamp(2.25rem,5.5vw,3.75rem)] leading-[1.04] font-semibold tracking-[-0.04em]">
            {content.title}
          </h1>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="text-muted text-sm">
              <time dateTime={post.date} suppressHydrationWarning>
                {formatDate(post.date, locale)}
              </time>
              <span className="mx-2 opacity-40">·</span>
              Ángel Fernández
              <span className="mx-2 opacity-40">·</span>
              {readingMinutes(content)} {t("blog.minutes")}
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

      <article className="mx-auto max-w-2xl px-6 pt-14 pb-20 md:px-8 md:pt-20 md:pb-28">
        <Reveal className="mb-16">
          {/* Entradilla con letra capital, como el primer párrafo de los proyectos. */}
          <Block block={content.intro} dropCap />
        </Reveal>
        {content.sections.map((section, s) => (
          <Reveal key={s} className="mb-16 last:mb-0">
            {section.heading && (
              <SectionHeading n={headingNumber(content.sections, s)}>
                {section.heading}
              </SectionHeading>
            )}
            {section.blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </Reveal>
        ))}
      </article>

      {next !== post && (
        <section className="bg-paper-alt border-rule border-t">
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
                  {next.post[locale].title}
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
    </main>
  );
}
