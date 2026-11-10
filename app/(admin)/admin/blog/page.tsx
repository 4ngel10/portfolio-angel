import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { estadoDe, listarPostsAdmin } from "@/lib/blog-admin";
import { validarPost } from "@/lib/blog-validate";
import { EmptyState, PageHeader, Panel } from "@/components/portal/ui";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("blog.title") };
}

export default async function AdminBlogPage() {
  await requireAdmin();
  const { t, fecha } = await getI18n();
  const posts = await listarPostsAdmin();
  const ahora = Date.now();

  const filas = posts.map((p) => {
    const r = validarPost(
      {
        slug: p.slug,
        category: p.category,
        ogImage: p.og_image,
        creadoPor: p.created_by,
        es: p.content.es,
        en: p.content.en,
      },
      { publicar: true },
    );
    return { p, estado: estadoDe(p, ahora), errores: r.errores.length, avisos: r.avisos.length };
  });

  const estadoTexto = {
    borrador: t("blog.status.draft"),
    programado: t("blog.status.scheduled"),
    publicado: t("blog.status.published"),
  };
  const chip =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap";

  return (
    <>
      <PageHeader
        title={t("blog.title")}
        intro={t("blog.intro")}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/admin/blog/claves" className="btn-secondary">
              {t("blog.keys.link")}
            </Link>
            <a href="/api/admin/blog/exportar" className="btn-secondary" download>
              {t("blog.exportAll")}
            </a>
            <Link href="/admin/blog/nuevo" className="btn-primary">
              {t("blog.newPost")}
            </Link>
          </div>
        }
      />

      {filas.length === 0 ? (
        <EmptyState>{t("blog.empty")}</EmptyState>
      ) : (
        <Panel>
          <div
            className="text-muted hidden grid-cols-[minmax(0,1fr)_8rem_8rem_8rem_8rem_12rem] gap-4 border-b border-[var(--rule)] pb-2 text-xs font-medium lg:grid"
            aria-hidden
          >
            <span>{t("blog.colTitle")}</span>
            <span>{t("blog.colCategory")}</span>
            <span>{t("blog.colStatus")}</span>
            <span>{t("blog.colDate")}</span>
            <span>{t("blog.colEdited")}</span>
            <span>{t("blog.colChecks")}</span>
          </div>
          <ul className="divide-y divide-[var(--rule)]">
            {filas.map(({ p, estado, errores, avisos }) => (
              <li key={p.id}>
                <Link
                  href={`/admin/blog/${p.id}`}
                  className="group -mx-2 grid gap-x-4 gap-y-1.5 rounded-lg px-2 py-3 transition-colors duration-150 hover:bg-[var(--chip)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] lg:grid-cols-[minmax(0,1fr)_8rem_8rem_8rem_8rem_12rem] lg:items-center"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium group-hover:text-[var(--accent)]">
                      {p.content.es.title || t("blog.untitled")}
                    </span>
                    <span className="text-muted block truncate font-mono text-xs">{p.slug}</span>
                  </span>
                  <span className="text-muted text-sm">{t(`blog.cat.${p.category}`)}</span>
                  <span>
                    <span
                      className={`${chip} ${estado === "publicado" ? "border-[var(--positive)] text-[var(--positive)]" : estado === "programado" ? "border-[var(--accent)] text-[var(--accent)]" : "border-rule text-muted"}`}
                    >
                      {estadoTexto[estado]}
                    </span>
                  </span>
                  <span className="text-muted text-sm">
                    {p.published_at ? fecha(p.published_at) : "-"}
                  </span>
                  <span className="text-muted text-sm">{fecha(p.updated_at)}</span>
                  <span className="flex flex-wrap gap-1.5">
                    {errores > 0 ? (
                      <span className={`${chip} border-[var(--danger)] text-[var(--danger)]`}>
                        {t("blog.chipErrors", { n: errores })}
                      </span>
                    ) : (
                      <span className={`${chip} border-rule text-muted`}>
                        {t("blog.chipReady")}
                      </span>
                    )}
                    {avisos > 0 ? (
                      <span className={`${chip} border-[var(--warn)] text-[var(--warn)]`}>
                        {t("blog.chipWarnings", { n: avisos })}
                      </span>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </>
  );
}
