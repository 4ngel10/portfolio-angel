import Image from "next/image";
import type { Project } from "@/lib/projects";

const EASE = "ease-[cubic-bezier(0.23,1,0.32,1)]";

/**
 * Portada de un proyecto: su captura (con versión oscura si la hay) o, si no tiene,
 * el texto en mono sobre la trama de puntos. Los efectos de hover se activan desde
 * un ancestro con la clase `group` (la card de la home); en la página del proyecto no hay.
 */
export function ProjectCover({
  project,
  alt,
  sizes,
  className = "",
  priority = false,
  children,
}: {
  project: Project;
  alt: string;
  sizes: string;
  className?: string;
  /** Imagen principal de la página (LCP): se carga ya, sin esperar al scroll. */
  priority?: boolean;
  children?: React.ReactNode;
}) {
  const { image, imageDark, cover, tint } = project;
  // Con una sola imagen se precarga en el <head>. Con versión oscura solo se ve una de las
  // dos según el tema, así que no se precarga ninguna: las dos se piden pronto y con prioridad.
  const load = !priority
    ? {}
    : imageDark
      ? { loading: "eager" as const, fetchPriority: "high" as const }
      : { preload: true };

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      // La portada mezcla el acento con el fondo alternativo, así funciona en claro y oscuro.
      style={{ background: `color-mix(in oklab, var(--accent) ${tint}%, var(--bg-alt))` }}
    >
      {image ? (
        <>
          {/* El tema va por la clase .dark en <html>, no por prefers-color-scheme. */}
          <Image
            src={image}
            alt={alt}
            fill
            sizes={sizes}
            {...load}
            className={`object-cover transition-transform duration-300 ${EASE} group-hover:scale-105 ${imageDark ? "[.dark_&]:hidden" : ""}`}
          />
          {imageDark && (
            <Image
              src={imageDark}
              alt={alt}
              fill
              sizes={sizes}
              {...load}
              className={`hidden object-cover transition-transform duration-300 ${EASE} group-hover:scale-105 [.dark_&]:block`}
            />
          )}
        </>
      ) : (
        <div
          className={`absolute inset-0 flex items-center justify-center transition-transform duration-300 ${EASE} group-hover:scale-110`}
        >
          <div
            className={`absolute inset-[-20%] opacity-60 transition-transform duration-300 ${EASE} group-hover:-translate-y-3 group-hover:translate-x-3`}
            style={{
              backgroundImage:
                "radial-gradient(color-mix(in oklab, var(--fg) 14%, transparent) 1px, transparent 1px)",
              backgroundSize: "14px 14px",
            }}
          />
          {/* Texto decorativo ("LAB", "AI"): el título del proyecto ya está en la card. */}
          <span
            aria-hidden
            className="relative z-10 font-mono text-5xl font-medium tracking-tight transition-colors duration-200 group-hover:text-[var(--accent)]"
          >
            {cover}
          </span>
        </div>
      )}
      {children}
    </div>
  );
}
