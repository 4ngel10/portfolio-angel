"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

export function Hero() {
  const { t } = useI18n();

  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-28 md:pt-36 md:pb-32">
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage: "radial-gradient(var(--rule) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse at 70% 40%, #000 20%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at 70% 40%, #000 20%, transparent 70%)",
        }}
      />
      <div className="relative max-w-6xl mx-auto px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="font-mono inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium text-muted mb-6"
          style={{ borderColor: "var(--rule)", background: "var(--chip)" }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" style={{ boxShadow: "0 0 0 3px rgba(16,185,129,0.2)" }} />
          {t("hero.badge")}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.23, 1, 0.32, 1] }}
          className="text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.05] tracking-[-0.035em] max-w-4xl"
        >
          {t("hero.titleStart")} <span className="text-accent">{t("hero.titleAccent1")}</span>,<br className="hidden md:inline" />{" "}
          {t("hero.titleMid")} <span className="text-accent">{t("hero.titleAccent2")}</span>.
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="font-mono text-sm md:text-[15px] text-muted mt-5 flex flex-wrap items-center gap-2"
        >
          <span>{t("hero.role1")}</span>
          <span className="w-1 h-1 rounded-full bg-current opacity-40" />
          <span>{t("hero.role2")}</span>
        </motion.div>

        <div className="text-sm text-muted mt-3 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0 1 16 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {t("hero.location")}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="text-lg leading-relaxed text-muted mt-8 max-w-xl"
        >
          {t("hero.lead")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex flex-col sm:flex-row gap-3 mt-10"
        >
          <a href="#contact" className="btn-primary">
            {t("hero.ctaPrimary")}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
          <a href="#portfolio" className="btn-secondary">{t("hero.ctaSecondary")}</a>
        </motion.div>
      </div>
    </section>
  );
}
