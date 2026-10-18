/**
 * Datos estructurados (schema.org) como <script type="application/ld+json">.
 * Es la forma que recomienda Next.js: se pinta desde la page.tsx, en el HTML estático.
 * Se escapa "<" para que ningún texto pueda cerrar la etiqueta <script>.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
