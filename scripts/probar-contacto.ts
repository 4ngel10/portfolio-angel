/**
 * Pruebas de la validación y el límite de uso del formulario de contacto (lib/contact-validate.ts).
 *
 *   npm test        (o: npx tsx scripts/probar-contacto.ts)
 */
import { TIEMPO_MINIMO_MS, crearLimitador, validarContacto } from "../lib/contact-validate";

let fallos = 0;
function comprobar(ok: boolean, texto: string) {
  console.log(`  ${ok ? "ok  " : "FALLO"} ${texto}`);
  if (!ok) fallos++;
}

const AHORA = 1_800_000_000_000;
const base: Record<string, string> = {
  name: "Marta Ruiz",
  email: "marta@ejemplo.es",
  service: "Desarrollo web",
  message: "Necesito una web para mi hotel.",
  web: "",
  t: String(AHORA - 10_000),
};
const con = (cambios: Record<string, string>) => {
  const d = { ...base, ...cambios };
  return validarContacto((k) => d[k] ?? "", AHORA);
};

comprobar(con({}).tipo === "ok", "mensaje correcto");
comprobar(con({ service: "" }).tipo === "ok", "servicio opcional");
comprobar(con({ t: "" }).tipo === "ok", "sin hora de apertura (sin JS) se acepta");
comprobar(con({ web: "http://spam.example" }).tipo === "bot", "honeypot relleno es bot");
comprobar(
  con({ t: String(AHORA - (TIEMPO_MINIMO_MS - 1)) }).tipo === "bot",
  "envío en menos de 3 s es bot",
);
comprobar(con({ name: "" }).tipo === "invalido", "nombre vacío");
comprobar(con({ name: "A\nBcc: x@y.es" }).tipo === "invalido", "salto de línea en el nombre");
comprobar(con({ email: "no-es-un-correo" }).tipo === "invalido", "correo sin arroba");
comprobar(con({ email: "a@b" }).tipo === "invalido", "correo sin dominio");
comprobar(con({ email: "a@b.es\nBcc: x@y.es" }).tipo === "invalido", "salto de línea en el correo");
comprobar(con({ service: "Otra cosa" }).tipo === "invalido", "servicio fuera de la lista");
comprobar(con({ message: "hola" }).tipo === "invalido", "mensaje de menos de 5 caracteres");
comprobar(con({ message: "x".repeat(4001) }).tipo === "invalido", "mensaje de más de 4000");

const permitir = crearLimitador({
  ventanaMs: 600_000,
  maxVentana: 3,
  maxHora: 5,
  maxGlobalHora: 6,
});
comprobar(
  [0, 1, 2].every((i) => permitir("1.1.1.1", AHORA + i)) && !permitir("1.1.1.1", AHORA + 3),
  "máximo 3 envíos por IP en 10 minutos",
);
comprobar(permitir("2.2.2.2", AHORA + 4), "otra IP no se ve afectada");
comprobar(permitir("1.1.1.1", AHORA + 601_000), "pasada la ventana vuelve a dejar enviar");
comprobar(
  (() => {
    const l = crearLimitador({ ventanaMs: 600_000, maxVentana: 9, maxHora: 9, maxGlobalHora: 2 });
    return l("a", AHORA) && l("b", AHORA) && !l("c", AHORA);
  })(),
  "tope global por hora",
);

if (fallos > 0) process.exit(1);
