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
  periodo_inicio: string;
  periodo_fin: string;
};
