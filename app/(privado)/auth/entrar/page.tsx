import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getI18n } from "@/lib/portal/i18n";
import { I18nBoundary } from "@/components/portal/i18n-boundary";
import { Prefs } from "@/components/portal/prefs";
import { Aparece } from "@/components/portal/aparece";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("enter.metaTitle"), robots: { index: false, follow: false } };
}

/**
 * Destino del enlace de invitación. Abrirlo no gasta el enlace: solo al pulsar "Entrar" se envía
 * el formulario por POST a /auth/callback, que canjea el hash. Así los filtros de correo que
 * abren los enlaces por su cuenta no lo consumen antes que la persona.
 */
export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string }>;
}) {
  const { token_hash: tokenHash, type } = await searchParams;
  if (!tokenHash || tokenHash.length > 512 || type !== "magiclink") redirect("/login?error=enlace");

  const { t } = await getI18n();
  return (
    <I18nBoundary>
      <div className="bg-paper text-ink flex min-h-dvh flex-col">
        <header className="flex items-center justify-between px-4 py-5 md:px-8">
          <Link
            href="/"
            className="text-muted hover:text-ink text-sm font-medium transition-colors"
          >
            {t("common.backToSite")}
          </Link>
          <Prefs />
        </header>
        <main
          id="main"
          tabIndex={-1}
          className="flex flex-1 items-center justify-center px-4 pb-16"
        >
          <Aparece>
            <div className="border-rule bg-paper-alt w-[min(420px,calc(100vw-2rem))] rounded-2xl border p-6 md:p-8">
              <h1 className="text-2xl font-semibold tracking-tight">{t("enter.title")}</h1>
              <p className="text-muted mt-3">{t("enter.body")}</p>
              <form action="/auth/callback" method="POST" className="mt-6">
                <input type="hidden" name="token_hash" value={tokenHash} />
                <input type="hidden" name="type" value="magiclink" />
                <button type="submit" className="btn-primary w-full justify-center">
                  {t("enter.submit")}
                </button>
              </form>
            </div>
          </Aparece>
        </main>
      </div>
    </I18nBoundary>
  );
}
