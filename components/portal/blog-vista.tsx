"use client";

import { useState } from "react";
import { BlogArticle } from "@/components/blog-article";
import { FixedLocale, type Locale } from "@/lib/i18n";
import type { BlogPost } from "@/lib/blog-types";
import { usePT } from "./i18n-provider";

/** Vista previa de un artículo con el componente real de la web, en español o en inglés. */
export function BlogVista({ post }: { post: BlogPost }) {
  const { t } = usePT();
  const [idioma, setIdioma] = useState<Locale>("es");

  return (
    <>
      <div className="border-rule bg-paper-alt mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm">
        <span className="text-muted">{t("blog.preview.banner")}</span>
        <div role="group" aria-label={t("blog.preview.lang")} className="flex gap-1">
          {(["es", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={idioma === l}
              onClick={() => setIdioma(l)}
              className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${idioma === l ? "border-[var(--accent)] text-[var(--accent)]" : "border-rule text-muted hover:text-ink"}`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <FixedLocale locale={idioma}>
        <div className="border-rule -mx-2 overflow-hidden rounded-2xl border">
          <BlogArticle post={post} next={null} comoDiv />
        </div>
      </FixedLocale>
    </>
  );
}
