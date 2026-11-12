"use client";

import Link from "next/link";
import { Reveal, RevealGroup, RevealItem } from "./reveal";
import { ZoomCard } from "./zoom-card";
import { Arrow, formatDate } from "./project-article";
import { useI18n } from "@/lib/i18n";
import type { BlogPostSummary } from "@/lib/blog-types";

/** Listado del blog: /blog. Mismo lenguaje de cards que proyectos y servicios. */
export function BlogIndex({ posts }: { posts: BlogPostSummary[] }) {
  const { t, locale, l } = useI18n();

  return (
    <main id="main" tabIndex={-1} className="scroll-mt-[72px] outline-none">
      <header className="mx-auto max-w-6xl px-6 pt-14 pb-16 md:px-8 md:pt-20 md:pb-20">
        <Reveal>
          <Link
            href={l("/")}
            className="group text-muted inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-[var(--fg)]"
          >
            <Arrow back />
            {t("blog.home")}
          </Link>
          <h1 className="mt-8 max-w-5xl text-[clamp(2.25rem,5.5vw,3.75rem)] leading-[1.04] font-semibold tracking-[-0.04em]">
            {t("blog.title")}
          </h1>
          <p className="text-muted mt-6 max-w-4xl text-[19px] leading-relaxed">{t("blog.lead")}</p>
        </Reveal>
      </header>

      <section className="border-rule bg-paper-alt border-t py-16 md:py-24">
        <RevealGroup
          className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-6 md:grid-cols-2 md:px-8"
          stagger={0.08}
        >
          {posts.map((p) => {
            const content = p[locale];
            return (
              <RevealItem key={p.slug} className="h-full">
                <Link
                  href={l(`/blog/${p.slug}`)}
                  className="block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
                >
                  <ZoomCard
                    className="group border-rule h-full rounded-2xl border p-7 transition-[box-shadow,border-color] duration-300 hover:border-[var(--accent)] hover:shadow-[0_30px_60px_-25px_rgba(194,65,12,0.3)]"
                    style={{ background: "var(--bg)" }}
                  >
                    <article className="flex h-full flex-col">
                      <div className="text-muted text-sm">
                        <span
                          className="font-mono text-[11px] font-semibold tracking-wider whitespace-nowrap uppercase"
                          style={{ color: "var(--accent)" }}
                        >
                          {t(`blog.cat.${p.category}`)}
                        </span>{" "}
                        <span className="whitespace-nowrap">
                          <span className="mx-1 opacity-40" aria-hidden>
                            ·
                          </span>
                          <time dateTime={p.date} suppressHydrationWarning>
                            {formatDate(p.date, locale)}
                          </time>
                        </span>{" "}
                        <span className="whitespace-nowrap">
                          <span className="mx-1 opacity-40" aria-hidden>
                            ·
                          </span>
                          {content.minutes} {t("blog.minutes")}
                        </span>
                      </div>
                      {/* Mismo hover que los títulos de proyectos: crece y pasa a negrita. */}
                      <h2 className="mt-4 origin-left text-[clamp(1.35rem,2.6vw,1.75rem)] leading-snug font-semibold tracking-[-0.025em] transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.03] group-hover:font-bold">
                        {content.title}
                      </h2>
                      <p className="text-muted mt-3 max-w-2xl text-[15px] leading-relaxed">
                        {content.excerpt}
                      </p>
                      <span className="text-muted mt-auto inline-flex items-center gap-2 pt-6 text-[13px] font-medium transition-colors duration-200 group-hover:text-[var(--accent)]">
                        {t("blog.read")}
                        <Arrow />
                      </span>
                    </article>
                  </ZoomCard>
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </section>
    </main>
  );
}
