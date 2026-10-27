"use client";

import Link from "next/link";
import { Reveal } from "./reveal";
import { Arrow, Block, SectionHeading, formatDate, headingNumber } from "./project-article";
import { useI18n } from "@/lib/i18n";
import { getLegalPage, type LegalId } from "@/lib/legal";

/** Página legal: /aviso-legal, /privacidad o /cookies. Misma maqueta que los artículos. */
export function LegalPageView({ id }: { id: LegalId }) {
  const { t, locale } = useI18n();
  const page = getLegalPage(id)!;
  const content = page.content[locale];

  return (
    <main id="main" tabIndex={-1} className="scroll-mt-[72px] outline-none">
      <header className="mx-auto max-w-4xl px-6 pt-14 md:px-8 md:pt-20">
        <Reveal>
          <Link
            href="/"
            className="group text-muted inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-[var(--fg)]"
          >
            <Arrow back />
            {t("blog.home")}
          </Link>
          <h1 className="mt-8 text-[clamp(2.25rem,5.5vw,3.75rem)] leading-[1.04] font-semibold tracking-[-0.04em]">
            {content.title}
          </h1>
          <p className="text-muted mt-6 text-sm">
            {t("legal.updated")}{" "}
            <time dateTime={page.updated} suppressHydrationWarning>
              {formatDate(page.updated, locale)}
            </time>
          </p>
        </Reveal>
      </header>

      <article className="mx-auto max-w-2xl px-6 pt-12 pb-20 md:px-8 md:pt-16 md:pb-28">
        <Reveal className="mb-14">
          <Block block={content.intro} />
        </Reveal>
        {content.sections.map((section, s) => (
          <Reveal key={s} className="mb-14 last:mb-0">
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
    </main>
  );
}
