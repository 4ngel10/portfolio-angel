"use client";

import Link from "next/link";
import { Reveal } from "./reveal";
import { Arrow, formatDate } from "./project-article";
import { useI18n } from "@/lib/i18n";
import { BLOG_POSTS } from "@/lib/blog";

/** Cuántos artículos recientes se enseñan en la home. */
const LATEST = 2;

/**
 * Mención corta al blog en la home, entre Proyectos y Contacto. Es el ancla #blog que
 * marca el scroll spy de la nav (el enlace "Blog" de la nav lleva a /blog).
 */
export function BlogTeaser() {
  const { t, locale } = useI18n();

  return (
    <section id="blog" className="scroll-mt-[72px] py-16 md:py-20">
      <Reveal className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-[1fr_1.4fr] md:gap-14 md:px-8">
        <div>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.05] font-semibold tracking-[-0.035em]">
            {t("blog.title")}
          </h2>
          <p className="text-muted mt-4 max-w-sm text-[15px] leading-relaxed">
            {t("blog.homeLead")}
          </p>
          <Link
            href="/blog"
            className="group text-muted mt-5 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-[var(--accent)]"
          >
            {t("blog.all")}
            <Arrow />
          </Link>
        </div>

        <ul className="border-rule flex flex-col border-t">
          {BLOG_POSTS.slice(0, LATEST).map((p) => (
            <li key={p.slug} className="border-rule border-b">
              <Link
                href={`/blog/${p.slug}`}
                className="group flex items-center justify-between gap-6 py-5"
              >
                <span className="min-w-0">
                  <span className="text-muted block text-[12px]">
                    <span
                      className="font-mono font-semibold tracking-wider uppercase"
                      style={{ color: "var(--accent)" }}
                    >
                      {t(`blog.cat.${p.category}`)}
                    </span>
                    <span className="mx-2 opacity-40" aria-hidden>
                      ·
                    </span>
                    <time dateTime={p.date} suppressHydrationWarning>
                      {formatDate(p.date, locale)}
                    </time>
                  </span>
                  <span className="mt-1.5 block text-[17px] leading-snug font-semibold tracking-tight transition-colors duration-200 group-hover:text-[var(--accent)]">
                    {p.post[locale].title}
                  </span>
                </span>
                <span className="text-muted shrink-0 transition-colors duration-200 group-hover:text-[var(--accent)]">
                  <Arrow />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
