"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Bullet } from "./bullet";
import { Reveal, RevealGroup, RevealItem } from "./reveal";

// Reduced motion: lo resuelve <MotionConfig reducedMotion="user"> (lib/motion.tsx), que salta los
// transforms al estado final. No se ramifica con useReducedMotion (rompe la hidratación).
// data-reveal en lo que se dibuja: sin JS, el <noscript> del layout lo deja a la vista completo.

const EASE = [0.23, 1, 0.32, 1] as const;
const VIEWPORT = { once: true, margin: "0px 0px -10% 0px" } as const;
/** Lo que tarda en dibujarse la línea de acento (s). */
const DRAW = 1.2;
const STEPS = [1, 2, 3, 4, 5, 6];

/** Servicio cuya página muestra el proceso: decide el ejemplo de la maqueta del área de clientes. */
export type ProcessService = "sistemas" | "web";
const CLIENT_ITEMS = [1, 2, 3, 4, 5];

const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    {children}
  </svg>
);

const ICONS: Record<number, React.ReactNode> = {
  // Teléfono
  1: (
    <Icon>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </Icon>
  ),
  // Candado
  2: (
    <Icon>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Icon>
  ),
  // Documento
  3: (
    <Icon>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </Icon>
  ),
  // Bandera
  4: (
    <Icon>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </Icon>
  ),
  // Check en círculo
  5: (
    <Icon>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </Icon>
  ),
  // Salvavidas
  6: (
    <Icon>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
      <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
      <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
      <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
    </Icon>
  ),
};

/** Maqueta decorativa de una tarjeta del área de clientes, con los tokens de la web. */
function PortalMock({ service }: { service: ProcessService }) {
  const { t } = useI18n();
  return (
    <div
      aria-hidden
      className="border-rule relative rounded-2xl border p-6 md:p-7"
      style={{ background: "var(--bg)" }}
    >
      <span className="text-muted absolute top-4 right-5 text-[11px]">
        {t("process.mockSample")}
      </span>
      <p className="pr-24 text-[17px] font-semibold tracking-tight">
        {t(`process.mock.${service}.project`)}
      </p>

      <div className="mt-5">
        <div className="h-2 w-full rounded-full" style={{ background: "var(--rule)" }}>
          <div className="h-2 w-[60%] overflow-hidden rounded-full">
            <m.span
              data-reveal
              className="block h-2 origin-left rounded-full"
              style={{ background: "var(--accent)" }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={VIEWPORT}
              transition={{ duration: 1, delay: 0.2, ease: EASE }}
            />
          </div>
        </div>
        <p className="text-muted mt-2 font-mono text-xs">{t("process.mockProgress")}</p>
      </div>

      <div className="border-rule mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 border-t pt-5">
        <span
          className="rounded px-2 py-0.5 font-mono text-[11px] font-semibold"
          style={{
            background: "color-mix(in oklab, var(--accent) 14%, transparent)",
            color: "var(--accent)",
          }}
        >
          {t("process.mockYourTurn")}
        </span>
        <span className="text-sm">{t(`process.mock.${service}.task`)}</span>
      </div>

      <div className="border-rule mt-5 flex items-center justify-between gap-4 border-t pt-5 text-sm">
        <span className="text-muted">{t("process.mockHours")}</span>
        <span className="font-mono font-semibold">{t("process.mockHoursValue")}</span>
      </div>
    </div>
  );
}

/**
 * "Cómo trabajo": esquema visual del proceso, de la primera llamada a la entrega, y el bloque
 * del área de clientes. Desde lg, línea de tiempo horizontal con los 6 pasos en una fila; por
 * debajo, vertical con los nodos a la izquierda. La línea de acento se dibuja una vez al entrar.
 */
export function Process({ service }: { service: ProcessService }) {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-8">
      <Reveal>
        <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.08] font-semibold tracking-[-0.035em]">
          {t("process.title")}
        </h2>
        <p className="text-muted mt-5 max-w-[65ch] text-[17px] leading-relaxed">
          {t("process.lead")}
        </p>
      </Reveal>

      <RevealGroup
        as="ol"
        className="relative mt-14 lg:grid lg:grid-cols-6 lg:gap-4"
        stagger={0.08}
      >
        {/* Escritorio: línea base y línea de acento, de nodo a nodo (centros del 1.º al 6.º). */}
        <span
          aria-hidden
          className="absolute top-6 left-6 hidden h-px w-[calc((100%+1rem)*5/6)] lg:block"
          style={{ background: "var(--rule)" }}
        />
        <m.span
          aria-hidden
          data-reveal
          className="absolute top-[23px] left-6 hidden h-0.5 w-[calc((100%+1rem)*5/6)] origin-left lg:block"
          style={{ background: "var(--accent)" }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={VIEWPORT}
          transition={{ duration: DRAW, ease: EASE }}
        />

        {STEPS.map((n, i) => (
          <RevealItem
            key={n}
            as="li"
            className="relative flex gap-5 pb-10 last:pb-0 lg:block lg:pb-0"
          >
            {/* Vertical: tramo hasta el nodo siguiente, que se dibuja al llegar a él. */}
            {n < STEPS.length && (
              <>
                <span
                  aria-hidden
                  className="absolute top-12 bottom-0 left-6 w-px lg:hidden"
                  style={{ background: "var(--rule)" }}
                />
                <m.span
                  aria-hidden
                  data-reveal
                  className="absolute top-12 bottom-0 left-[23px] w-0.5 origin-top lg:hidden"
                  style={{ background: "var(--accent)" }}
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={VIEWPORT}
                  transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
                />
              </>
            )}

            <div
              className="border-rule relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border text-[var(--accent)]"
              style={{ background: "var(--bg)" }}
            >
              {/* Borde de acento que se enciende cuando la línea llega al nodo. */}
              <m.span
                aria-hidden
                data-reveal
                className="pointer-events-none absolute -inset-px rounded-xl border border-[var(--accent)]"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={VIEWPORT}
                transition={{ duration: 0.3, delay: (DRAW * i) / (STEPS.length - 1) }}
              />
              {ICONS[n]}
            </div>

            <div className="min-w-0 lg:mt-5">
              <span className="text-muted font-mono text-xs">{n}</span>
              <h3 className="mt-1 text-[17px] leading-snug font-semibold tracking-tight">
                {t(`process.s${n}Title`)}
              </h3>
              <p className="text-muted mt-2 text-[14px] leading-relaxed">
                {t(`process.s${n}Text`)}
              </p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>

      {/* Área de clientes: la ventaja diferencial. */}
      <div className="mt-20 grid items-center gap-10 md:mt-24 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <h3 className="text-[clamp(1.4rem,2.6vw,2rem)] leading-[1.15] font-semibold tracking-[-0.03em]">
            {t("process.clientTitle")}
          </h3>
          <ul className="mt-6 flex flex-col gap-3">
            {CLIENT_ITEMS.map((n) => (
              <li key={n} className="text-muted flex gap-3 text-[16px] leading-relaxed">
                <Bullet />
                <span>{t(`process.client${n}`)}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/login"
            className="text-muted mt-8 inline-block text-sm underline decoration-[var(--rule)] underline-offset-4 transition-colors hover:text-[var(--accent)] hover:decoration-[var(--accent)]"
          >
            {t("process.signIn")}
          </Link>
        </Reveal>

        <Reveal delay={0.1}>
          <PortalMock service={service} />
          <p className="sr-only">{t("process.mockSr")}</p>
        </Reveal>
      </div>
    </div>
  );
}
