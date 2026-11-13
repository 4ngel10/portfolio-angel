import { LOCALES } from "@/lib/rutas";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { CASE_DRAFTS, casesVisible, getCaseDraft } from "@/lib/cases";

type Params = Promise<{ lang: string; slug: string }>;

// Borradores: solo los slugs de lib/cases.ts, y nunca en producción.
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => CASE_DRAFTS.map((c) => ({ lang, slug: c.slug })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const draft = getCaseDraft((await params).slug);
  return {
    title: draft ? `${draft.title} (borrador)` : "Caso no encontrado",
    robots: { index: false, follow: false },
  };
}

const SECTIONS = [
  "Contexto",
  "Mi papel",
  "Antes y después",
  "Fragmento saneado",
  "Cita del cliente",
];

export default async function Page({ params }: { params: Params }) {
  const draft = getCaseDraft((await params).slug);
  if (!draft || !casesVisible()) notFound();
  return (
    <>
      <Nav />
      <main id="main" tabIndex={-1} className="scroll-mt-[72px] outline-none">
        <article className="mx-auto max-w-6xl px-6 py-14 md:px-8 md:py-20">
          <p className="border-rule text-muted mb-8 max-w-4xl rounded-xl border p-4 text-sm">
            Borrador, no publicado. Esta página no sale en el sitemap, no está enlazada y no se ve
            en producción. Falta el contenido.
          </p>
          <h1 className="max-w-5xl text-[clamp(1.9rem,4vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.035em] text-balance">
            {draft.title}
          </h1>
          <p className="text-muted mt-5 max-w-4xl text-lg leading-relaxed">{draft.topic}</p>
          <div className="mt-12 max-w-4xl space-y-10">
            {SECTIONS.map((s) => (
              <section key={s}>
                <h2 className="text-[clamp(1.5rem,3vw,2rem)] leading-tight font-semibold tracking-[-0.03em]">
                  {s}
                </h2>
                <p className="text-muted mt-3 text-[15px]">Pendiente de contenido.</p>
              </section>
            ))}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
