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

export type MetodoPago = "transferencia" | "bizum" | "efectivo" | "tarjeta" | "paypal" | "otro";
export type CategoriaGasto =
  | "software"
  | "hosting"
  | "dominios"
  | "hardware"
  | "formacion"
  | "marketing"
  | "oficina"
  | "transporte"
  | "servicios_profesionales"
  | "comisiones"
  | "otros";
export type Periodicidad = "mensual" | "trimestral" | "anual";
export type OrigenCobro = "presupuesto" | "bolsa" | "mantenimiento" | "manual";

/** Se deriva de los pagos y de la fecha, nunca se guarda. */
export type EstadoCobro = "pendiente" | "parcial" | "pagado" | "vencido" | "anulado";

export type Ajustes = {
  id: number;
  config_fiscal: boolean;
  nombre_comercial: string | null;
  updated_at: string;
};

export type Cobro = {
  id: string;
  numero: string;
  empresa_id: string;
  proyecto_id: string | null;
  presupuesto_id: string | null;
  origen: OrigenCobro;
  concepto: string;
  importe: number;
  fecha_emision: string;
  fecha_vencimiento: string | null;
  anulado: boolean;
  notas: string | null;
  created_at: string;
};

export type Pago = {
  id: string;
  cobro_id: string;
  fecha: string;
  importe: number;
  metodo: MetodoPago;
  referencia: string | null;
  notas: string | null;
  created_at: string;
};

export type Suscripcion = {
  id: string;
  nombre: string;
  proveedor: string | null;
  categoria: CategoriaGasto;
  importe: number;
  periodicidad: Periodicidad;
  proxima_renovacion: string;
  activa: boolean;
  fecha_alta: string;
  fecha_baja: string | null;
  metodo_pago: MetodoPago | null;
  url_gestion: string | null;
  aviso_dias: number;
  iva_pct: number | null;
  notas: string | null;
  created_at: string;
};

export type Gasto = {
  id: string;
  fecha: string;
  concepto: string;
  proveedor: string | null;
  categoria: CategoriaGasto;
  importe: number;
  metodo_pago: MetodoPago | null;
  suscripcion_id: string | null;
  proyecto_id: string | null;
  empresa_id: string | null;
  justificante_path: string | null;
  iva_pct: number | null;
  deducible: boolean | null;
  notas: string | null;
  created_at: string;
};
