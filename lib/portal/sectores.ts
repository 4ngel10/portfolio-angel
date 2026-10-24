/** Tipos de empresa para el alta y el filtro de proyectos. El texto sale de `sectors.*` en messages. */
export const SECTORES = [
  "hosteleria",
  "comercio",
  "salud",
  "tecnologia",
  "educacion",
  "industria",
  "servicios",
  "otro",
] as const;

export type Sector = (typeof SECTORES)[number];
