import "server-only";
import { readdir } from "node:fs/promises";
import path from "node:path";

/**
 * Imágenes que ya hay en public/projects, para elegirlas en el editor del portfolio en vez de
 * subirlas. Solo rutas de portadas (webp, svg, jpg, png); sin los originales pesados, que no van
 * en public/.
 */
export async function portadasConocidas(): Promise<string[]> {
  try {
    const archivos = await readdir(path.join(process.cwd(), "public", "projects"));
    return archivos
      .filter((a) => [".webp", ".svg", ".jpg", ".png"].some((e) => a.toLowerCase().endsWith(e)))
      .sort()
      .map((a) => `/projects/${a}`);
  } catch {
    return [];
  }
}
