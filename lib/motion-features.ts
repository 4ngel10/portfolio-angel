// Funciones de animación de Framer Motion que carga LazyMotion (lib/motion.tsx). Va en su propio
// archivo para que el empaquetador lo deje en un chunk aparte, que se descarga después de hidratar
// y no forma parte del JS inicial. domAnimation basta: animaciones, variantes, exit, hover, tap,
// foco y whileInView. Si algún día hace falta drag o layout, habría que pasar a domMax.
export { domAnimation as default } from "framer-motion";
