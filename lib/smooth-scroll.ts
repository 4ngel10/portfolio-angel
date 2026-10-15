/**
 * Scroll suave propio. No usamos scroll-behavior: smooth ni scrollTo({ behavior: "smooth" })
 * porque Chrome en Windows los desactiva cuando los "Efectos de animación" del sistema
 * están apagados, y Ángel quiere que la navegación interna deslice siempre.
 */

/** Altura de la nav sticky, para que el título de la sección no quede debajo. */
const NAV_OFFSET = 72;

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

let cancelCurrent: (() => void) | null = null;

export function smoothScrollTo(targetY: number) {
  cancelCurrent?.();

  const startY = window.scrollY;
  const maxY = document.documentElement.scrollHeight - window.innerHeight;
  const endY = Math.max(0, Math.min(targetY, maxY));
  const distance = endY - startY;
  if (Math.abs(distance) < 1) return;

  // Más distancia, algo más de duración, entre 450 ms y 1100 ms.
  const duration = Math.min(1100, Math.max(450, Math.abs(distance) * 0.45));
  const start = performance.now();
  let frame = 0;

  // Si el usuario hace scroll a mano durante la animación, se la cedemos.
  const stop = () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("wheel", stop);
    window.removeEventListener("touchstart", stop);
    window.removeEventListener("keydown", stop);
    cancelCurrent = null;
  };
  window.addEventListener("wheel", stop, { passive: true });
  window.addEventListener("touchstart", stop, { passive: true });
  window.addEventListener("keydown", stop);
  cancelCurrent = stop;

  const step = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    // "instant" para que el scroll-behavior: smooth del CSS no se mezcle con cada paso.
    window.scrollTo({ top: startY + distance * easeInOutCubic(t), behavior: "instant" });
    if (t < 1) frame = requestAnimationFrame(step);
    else stop();
  };
  frame = requestAnimationFrame(step);
}

/** Desliza hasta el elemento de un hash (#about, #contact...). "#top" o "#" van al inicio. */
export function smoothScrollToHash(hash: string) {
  if (hash === "#" || hash === "#top") {
    smoothScrollTo(0);
    return true;
  }
  const el = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!el) return false;
  smoothScrollTo(el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET);
  return true;
}

/**
 * Intercepta los clics en enlaces internos (<a href="#...">) de toda la página.
 * Devuelve la función para quitar el listener.
 */
export function installAnchorSmoothScroll() {
  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
      return;
    const link = (e.target as Element | null)?.closest?.("a[href^='#']");
    if (!link) return;
    const hash = link.getAttribute("href") ?? "";
    if (!smoothScrollToHash(hash)) return;
    e.preventDefault();
    history.pushState(null, "", hash === "#" ? location.pathname : hash);
  };
  document.addEventListener("click", onClick);
  return () => document.removeEventListener("click", onClick);
}
