/**
 * Script bloqueante del <head> (app/layout.tsx): aplica el tema antes de pintar y crea la meta
 * theme-color. Vive aquí para que lib/csp.ts calcule su hash con el mismo texto exacto.
 */
export const THEME_SCRIPT = `(function(){var d=document.documentElement,dark=true;try{dark=localStorage.getItem('theme')!=='light';}catch(e){}if(dark)d.classList.add('dark');var m=document.createElement('meta');m.name='theme-color';m.content=dark?'#0a0f1c':'#fbfaf7';document.head.appendChild(m);})();`;
