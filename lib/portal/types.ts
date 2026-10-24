/** Filas tal como las devuelve Supabase (snake_case). Reflejan db/schema.ts. */

export type Role = "admin" | "cliente";
export type EstadoProyecto = "activo" | "pausado" | "completado";
export type Pelota = "cliente" | "equipo";
export type EstadoIncidencia = "abierta" | "en_progreso" | "resuelta";
export type Prioridad = "baja" | "media" | "alta";

export type Perfil = {
  id: string;
  empresa_id: string | null;
  role: Role;
  nombre: string;
  email: string;
};

export type Empresa = {
  id: string;
  nombre: string;
  slug: string;
  config_fiscal: boolean;
  sector: string | null;
  actividad: string | null;
  ubicacion: string | null;
  telefono: string | null;
  web: string | null;
  created_at: string;
};

export type Proyecto = {
  id: string;
  empresa_id: string;
  titulo: string;
  descripcion: string | null;
  estado: EstadoProyecto;
  created_at: string;
};

export type Hito = {
  id: string;
  proyecto_id: string;
  titulo: string;
  descripcion: string | null;
  orden: number;
  completado: boolean;
  pelota_en: Pelota;
  fecha_objetivo: string | null;
};

export type Archivo = {
  id: string;
  proyecto_id: string;
  empresa_id: string;
  nombre: string;
  tipo_mime: string;
  tamanio_bytes: number;
  storage_path: string;
  created_at: string;
};

export type Incidencia = {
  id: string;
  proyecto_id: string;
  empresa_id: string;
  titulo: string;
  descripcion: string;
  estado: EstadoIncidencia;
  prioridad: Prioridad;
  created_at: string;
};

export type MensajeIncidencia = {
  id: string;
  incidencia_id: string;
  autor_id: string | null;
  contenido: string;
  created_at: string;
};

export type BolsaHoras = {
  id: string;
  empresa_id: string;
  horas_contratadas: number;
  horas_consumidas: number;
  precio: number | null;
  periodo_inicio: string;
  periodo_fin: string;
};

/** Mes ya cerrado de una bolsa. Solo lo lee el admin. */
export type BolsaMes = {
  empresa_id: string;
  periodo_inicio: string;
  precio: number | null;
};

export type EstadoPresupuesto = "borrador" | "enviado" | "aceptado" | "rechazado";

export type Presupuesto = {
  id: string;
  empresa_id: string;
  numero: string;
  titulo: string;
  estado: EstadoPresupuesto;
  fecha_emision: string;
  valido_hasta: string | null;
  iva: number;
  descuento: number;
  notas: string | null;
  firma_nombre: string | null;
  firma_usuario_id: string | null;
  firma_fecha: string | null;
  firma_ip: string | null;
  created_at: string;
};

export type PresupuestoLinea = {
  id: string;
  presupuesto_id: string;
  orden: number;
  concepto: string;
  detalle: string | null;
  cantidad: number;
  precio_unitario: number;
};
