"use client";

import { Reveal, RevealGroup, RevealItem } from "./reveal";
import { useI18n } from "@/lib/i18n";
import type { Testimonial } from "@/lib/testimonials";

/** Opiniones de clientes (lib/testimonials.ts). La página no la pinta si no hay ninguna. */
export function Testimonials({ items }: { items: Testimonial[] }) {
  const { t, locale } = useI18n();
  if (items.length === 0) return null;
  return (
    <section id="testimonios" className="border-rule scroll-mt-[72px] border-t py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <Reveal>
          <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.035em]">
            {t("testimonials.title")}
          </h2>
        </Reveal>
        <RevealGroup className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
          {items.map((item) => (
            <RevealItem key={`${item.name}-${item.company}`} as="div">
              <figure
                className="border-rule flex h-full flex-col rounded-2xl border p-6"
                style={{ background: "var(--bg)" }}
              >
                <blockquote className="text-[15px] leading-relaxed">
                  <p>{item.quote[locale]}</p>
                </blockquote>
                <figcaption className="mt-auto pt-5 text-[13px]">
                  <span className="block font-semibold">{item.name}</span>
                  <span className="text-muted block">
                    {item.role}, {item.company}
                  </span>
                </figcaption>
              </figure>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
