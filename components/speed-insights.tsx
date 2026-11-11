"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { esRutaPrivada } from "@/lib/rutas-privadas";

// En su propio chunk: no pesa en el primer JS de la página.
const VercelSpeedInsights = dynamic(() =>
  import("@vercel/speed-insights/next").then((m) => m.SpeedInsights),
);

/**
 * Vercel Speed Insights: métricas de rendimiento (Web Vitals) anónimas de la web pública.
 * No se carga en /admin, /portal ni el resto de rutas privadas: ahí las rutas llevan identificadores.
 * El layout solo lo pinta en producción (VERCEL_ENV), así que en local y en previews no hay nada.
 */
export function SpeedInsightsPublico() {
  const pathname = usePathname();
  if (esRutaPrivada(pathname)) return null;
  return <VercelSpeedInsights />;
}
