import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ajustarTitulo, ANCHO_TITULO, ETIQUETA_CATEGORIA } from "./blog-og";

/**
 * Dibuja la imagen para redes de un artículo o de un proyecto del portfolio, 1200x630 (el rótulo es
 * "BLOG" o "PROYECTO"). La plantilla es la de las imágenes de
 * public/blog/*-og.jpg: fondo #0a0f1c con brillo naranja arriba a la derecha, raya y "BLOG ·
 * CATEGORÍA" en mono naranja, título en blanco y pie con el nombre y la especialidad. Sin zona
 * geográfica. No sabe nada de la base de datos, así se puede probar con un título cualquiera.
 */

export const TAMANO_IMAGEN_SOCIAL = { width: 1200, height: 630 };

// Las fuentes se leen una vez, de archivo local (next/og no admite woff2, solo ttf, otf y woff).
// Space Grotesk Medium (el peso de las imágenes actuales) y JetBrains Mono SemiBold, ambas OFL.
const RAIZ_FUENTES = path.join(process.cwd(), "assets", "fonts");
const fuenteTitulo = readFile(path.join(RAIZ_FUENTES, "SpaceGrotesk-Medium.ttf"));
const fuenteMono = readFile(path.join(RAIZ_FUENTES, "JetBrainsMono-SemiBold.ttf"));

export async function crearImagenSocial(
  titulo: string,
  categoria: string,
  rotulo: "BLOG" | "PROYECTO" = "BLOG",
): Promise<ImageResponse> {
  const { texto, tamano } = ajustarTitulo(titulo.trim());
  const etiqueta = `${rotulo} · ${ETIQUETA_CATEGORIA[categoria] ?? categoria.toUpperCase()}`;
  const [datosTitulo, datosMono] = await Promise.all([fuenteTitulo, fuenteMono]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          backgroundColor: "#0a0f1c",
          backgroundImage:
            "radial-gradient(circle at 82% 6%, rgba(251,146,60,0.19) 0%, rgba(251,146,60,0.06) 30%, rgba(10,15,28,0) 55%)",
          fontFamily: "Space Grotesk",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 80,
            top: 87,
            width: 48,
            height: 3,
            backgroundColor: "#fb923c",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 80,
            top: 120,
            display: "flex",
            fontFamily: "JetBrains Mono",
            fontSize: 24,
            letterSpacing: 1.7,
            color: "#fb923c",
          }}
        >
          {etiqueta}
        </div>
        <div
          style={{
            position: "absolute",
            left: 80,
            top: 190,
            width: ANCHO_TITULO,
            display: "flex",
            fontSize: tamano,
            lineHeight: 1.12,
            letterSpacing: -1.5,
          }}
        >
          {texto}
        </div>
        <div
          style={{
            position: "absolute",
            left: 80,
            right: 80,
            bottom: 67,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
          }}
        >
          <div style={{ display: "flex" }}>
            <span>Ángel Fernández</span>
            <span style={{ color: "#fb923c" }}>.</span>
          </div>
          <div style={{ display: "flex", color: "#8a94b0" }}>Sistemas y desarrollo web</div>
        </div>
      </div>
    ),
    {
      ...TAMANO_IMAGEN_SOCIAL,
      fonts: [
        { name: "Space Grotesk", data: datosTitulo, weight: 500, style: "normal" },
        { name: "JetBrains Mono", data: datosMono, weight: 600, style: "normal" },
      ],
    },
  );
}
