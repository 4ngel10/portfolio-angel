/**
 * Esquema de la zona de clientes (Drizzle).
 *
 * Las tablas con datos de cliente llevan `empresa_id`: es la columna sobre la que
 * se aplica Row-Level Security (ver db/rls.sql). `usuarios.id` es el mismo uuid que
 * `auth.users.id`; la clave foránea hacia `auth.users` se declara en rls.sql porque
 * ese esquema lo gestiona Supabase.
 */
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import {
  CATEGORIAS_GASTO,
  METODOS_PAGO,
  ORIGENES_COBRO,
  PERIODICIDADES,
} from "../lib/portal/finanzas";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

export const empresas = pgTable("empresas", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: text("nombre").notNull(),
  slug: text("slug").notNull().unique(),
  // Módulos fiscales (fases posteriores). La UI queda oculta mientras sea false.
  configFiscal: boolean("config_fiscal").notNull().default(false),
  // Datos básicos que se piden al dar de alta la empresa. El sector sirve para filtrar proyectos.
  sector: text("sector"),
  actividad: text("actividad"),
  ubicacion: text("ubicacion"),
  telefono: text("telefono"),
  web: text("web"),
  createdAt: createdAt(),
});

export const usuarios = pgTable(
  "usuarios",
  {
    id: uuid("id").primaryKey(), // = auth.users.id
    empresaId: uuid("empresa_id").references(() => empresas.id, { onDelete: "set null" }),
    role: text("role", { enum: ["admin", "cliente"] })
      .notNull()
      .default("cliente"),
    nombre: text("nombre").notNull(),
    email: text("email").notNull(),
    avatarUrl: text("avatar_url"),
  },
  (t) => [
    index("usuarios_empresa_idx").on(t.empresaId),
    check("usuarios_role_check", sql`${t.role} in ('admin', 'cliente')`),
  ],
);

export const proyectos = pgTable(
  "proyectos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    empresaId: uuid("empresa_id")
      .notNull()
      .references(() => empresas.id, { onDelete: "cascade" }),
    titulo: text("titulo").notNull(),
    descripcion: text("descripcion"),
    estado: text("estado", { enum: ["activo", "pausado", "completado"] })
      .notNull()
      .default("activo"),
    createdAt: createdAt(),
  },
  (t) => [
    index("proyectos_empresa_idx").on(t.empresaId),
    check("proyectos_estado_check", sql`${t.estado} in ('activo', 'pausado', 'completado')`),
  ],
);

export const hitos = pgTable(
  "hitos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    proyectoId: uuid("proyecto_id")
      .notNull()
      .references(() => proyectos.id, { onDelete: "cascade" }),
    titulo: text("titulo").notNull(),
    descripcion: text("descripcion"),
    orden: integer("orden").notNull().default(0),
    completado: boolean("completado").notNull().default(false),
    // Quién tiene la pelota: lo que falta por hacer depende del cliente o del equipo.
    pelotaEn: text("pelota_en", { enum: ["cliente", "equipo"] })
      .notNull()
      .default("equipo"),
    fechaObjetivo: date("fecha_objetivo"),
    createdAt: createdAt(),
  },
  (t) => [
    index("hitos_proyecto_idx").on(t.proyectoId, t.orden),
    check("hitos_pelota_check", sql`${t.pelotaEn} in ('cliente', 'equipo')`),
  ],
);

export const archivos = pgTable(
  "archivos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    proyectoId: uuid("proyecto_id")
      .notNull()
      .references(() => proyectos.id, { onDelete: "cascade" }),
    empresaId: uuid("empresa_id")
      .notNull()
      .references(() => empresas.id, { onDelete: "cascade" }),
    nombre: text("nombre").notNull(),
    tipoMime: text("tipo_mime").notNull(),
    tamanioBytes: integer("tamanio_bytes").notNull(),
    storagePath: text("storage_path").notNull().unique(),
    subidoPor: uuid("subido_por").references(() => usuarios.id, { onDelete: "set null" }),
    createdAt: createdAt(),
  },
  (t) => [
    index("archivos_proyecto_idx").on(t.proyectoId),
    index("archivos_empresa_idx").on(t.empresaId),
  ],
);

export const incidencias = pgTable(
  "incidencias",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    proyectoId: uuid("proyecto_id")
      .notNull()
      .references(() => proyectos.id, { onDelete: "cascade" }),
    empresaId: uuid("empresa_id")
      .notNull()
      .references(() => empresas.id, { onDelete: "cascade" }),
    titulo: text("titulo").notNull(),
    descripcion: text("descripcion").notNull(),
    estado: text("estado", { enum: ["abierta", "en_progreso", "resuelta"] })
      .notNull()
      .default("abierta"),
    prioridad: text("prioridad", { enum: ["baja", "media", "alta"] })
      .notNull()
      .default("media"),
    createdAt: createdAt(),
  },
  (t) => [
    index("incidencias_proyecto_idx").on(t.proyectoId),
    index("incidencias_empresa_idx").on(t.empresaId),
    check("incidencias_estado_check", sql`${t.estado} in ('abierta', 'en_progreso', 'resuelta')`),
    check("incidencias_prioridad_check", sql`${t.prioridad} in ('baja', 'media', 'alta')`),
  ],
);

export const mensajesIncidencia = pgTable(
  "mensajes_incidencia",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    incidenciaId: uuid("incidencia_id")
      .notNull()
      .references(() => incidencias.id, { onDelete: "cascade" }),
    autorId: uuid("autor_id").references(() => usuarios.id, { onDelete: "set null" }),
    contenido: text("contenido").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("mensajes_incidencia_idx").on(t.incidenciaId, t.createdAt)],
);

export const bolsaHoras = pgTable(
  "bolsa_horas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    empresaId: uuid("empresa_id")
      .notNull()
      .references(() => empresas.id, { onDelete: "cascade" }),
    horasContratadas: integer("horas_contratadas").notNull(),
    horasConsumidas: integer("horas_consumidas").notNull().default(0),
    // Precio de la bolsa en euros (pago único, no mensual). Lo ven el admin y el cliente.
    precio: numeric("precio", { precision: 10, scale: 2, mode: "number" }),
    periodoInicio: date("periodo_inicio").notNull(),
    periodoFin: date("periodo_fin").notNull(),
  },
  (t) => [
    index("bolsa_horas_empresa_idx").on(t.empresaId),
    check(
      "bolsa_horas_no_negativas",
      sql`${t.horasConsumidas} >= 0 and ${t.horasContratadas} >= 0`,
    ),
  ],
);

/**
 * Meses archivados de cuando la bolsa se reiniciaba cada mes (ya no se escribe) y solo lo lee
 * el admin: sirve para sumar lo que lleva gastado cada cliente. Sin política de lectura para clientes.
 */
export const bolsaHistorial = pgTable(
  "bolsa_historial",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    empresaId: uuid("empresa_id")
      .notNull()
      .references(() => empresas.id, { onDelete: "cascade" }),
    periodoInicio: date("periodo_inicio").notNull(),
    periodoFin: date("periodo_fin").notNull(),
    horasContratadas: integer("horas_contratadas").notNull(),
    horasConsumidas: integer("horas_consumidas").notNull(),
    precio: numeric("precio", { precision: 10, scale: 2, mode: "number" }),
    createdAt: createdAt(),
  },
  (t) => [
    unique("bolsa_historial_empresa_periodo").on(t.empresaId, t.periodoInicio),
    index("bolsa_historial_empresa_idx").on(t.empresaId),
  ],
);

export const documentos = pgTable(
  "documentos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    empresaId: uuid("empresa_id")
      .notNull()
      .references(() => empresas.id, { onDelete: "cascade" }),
    proyectoId: uuid("proyecto_id").references(() => proyectos.id, { onDelete: "set null" }),
    tipo: text("tipo", { enum: ["presupuesto", "justificante", "factura"] }).notNull(),
    storagePath: text("storage_path").notNull(),
    nombre: text("nombre").notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    index("documentos_empresa_idx").on(t.empresaId),
    check("documentos_tipo_check", sql`${t.tipo} in ('presupuesto', 'justificante', 'factura')`),
  ],
);

/**
 * Presupuestos que prepara el admin para una empresa. El cliente solo ve los que ya no
 * están en borrador (ver db/rls.sql). `iva` y `descuento` son porcentajes.
 */
export const presupuestos = pgTable(
  "presupuestos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    empresaId: uuid("empresa_id")
      .notNull()
      .references(() => empresas.id, { onDelete: "cascade" }),
    numero: text("numero").notNull().unique(),
    titulo: text("titulo").notNull(),
    estado: text("estado", { enum: ["borrador", "enviado", "aceptado", "rechazado"] })
      .notNull()
      .default("borrador"),
    fechaEmision: date("fecha_emision").notNull(),
    validoHasta: date("valido_hasta"),
    iva: numeric("iva", { precision: 5, scale: 2, mode: "number" }).notNull().default(21),
    descuento: numeric("descuento", { precision: 5, scale: 2, mode: "number" })
      .notNull()
      .default(0),
    notas: text("notas"),
    // Firma electrónica sencilla al aceptar: nombre escrito, quién la hizo, cuándo y desde qué IP.
    firmaNombre: text("firma_nombre"),
    firmaUsuarioId: uuid("firma_usuario_id").references(() => usuarios.id, {
      onDelete: "set null",
    }),
    firmaFecha: timestamp("firma_fecha", { withTimezone: true }),
    firmaIp: text("firma_ip"),
    createdAt: createdAt(),
  },
  (t) => [
    index("presupuestos_empresa_idx").on(t.empresaId),
    check(
      "presupuestos_estado_check",
      sql`${t.estado} in ('borrador', 'enviado', 'aceptado', 'rechazado')`,
    ),
    check(
      "presupuestos_porcentajes_check",
      sql`${t.iva} between 0 and 100 and ${t.descuento} between 0 and 100`,
    ),
  ],
);

export const presupuestoLineas = pgTable(
  "presupuesto_lineas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    presupuestoId: uuid("presupuesto_id")
      .notNull()
      .references(() => presupuestos.id, { onDelete: "cascade" }),
    orden: integer("orden").notNull().default(0),
    concepto: text("concepto").notNull(),
    detalle: text("detalle"),
    cantidad: numeric("cantidad", { precision: 10, scale: 2, mode: "number" }).notNull(),
    precioUnitario: numeric("precio_unitario", {
      precision: 10,
      scale: 2,
      mode: "number",
    }).notNull(),
  },
  (t) => [
    index("presupuesto_lineas_idx").on(t.presupuestoId, t.orden),
    check("presupuesto_lineas_no_negativas", sql`${t.cantidad} >= 0 and ${t.precioUnitario} >= 0`),
  ],
);

/**
 * Finanzas (solo admin, ver db/rls.sql). Todo el dinero va en euros. Sin facturas: un cobro
 * es lo que debe un cliente y un pago es lo que ya se ha recibido contra ese cobro.
 */
const enLista = (columna: unknown, valores: readonly string[]) =>
  sql`${columna} in (${sql.raw(valores.map((v) => `'${v}'`).join(", "))})`;

const dinero = (nombre: string) => numeric(nombre, { precision: 10, scale: 2, mode: "number" });

/** Fila única (id = 1) con los ajustes del negocio. */
export const ajustes = pgTable(
  "ajustes",
  {
    id: integer("id").primaryKey().default(1),
    // Muestra los campos fiscales (IVA, deducible) cuando Ángel se dé de alta como autónomo.
    configFiscal: boolean("config_fiscal").notNull().default(false),
    nombreComercial: text("nombre_comercial"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [check("ajustes_fila_unica", sql`${t.id} = 1`)],
);

export const cobros = pgTable(
  "cobros",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    numero: text("numero").notNull().unique(),
    empresaId: uuid("empresa_id")
      .notNull()
      .references(() => empresas.id, { onDelete: "cascade" }),
    proyectoId: uuid("proyecto_id").references(() => proyectos.id, { onDelete: "set null" }),
    presupuestoId: uuid("presupuesto_id").references(() => presupuestos.id, {
      onDelete: "set null",
    }),
    origen: text("origen", { enum: ORIGENES_COBRO }).notNull().default("manual"),
    concepto: text("concepto").notNull(),
    importe: dinero("importe").notNull(),
    fechaEmision: date("fecha_emision").notNull(),
    fechaVencimiento: date("fecha_vencimiento"),
    anulado: boolean("anulado").notNull().default(false),
    notas: text("notas"),
    createdAt: createdAt(),
  },
  (t) => [
    index("cobros_empresa_idx").on(t.empresaId),
    index("cobros_proyecto_idx").on(t.proyectoId),
    index("cobros_presupuesto_idx").on(t.presupuestoId),
    index("cobros_vencimiento_idx").on(t.fechaVencimiento),
    check("cobros_origen_check", enLista(t.origen, ORIGENES_COBRO)),
    check("cobros_importe_positivo", sql`${t.importe} > 0`),
  ],
);

export const pagos = pgTable(
  "pagos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cobroId: uuid("cobro_id")
      .notNull()
      .references(() => cobros.id, { onDelete: "cascade" }),
    fecha: date("fecha").notNull(),
    importe: dinero("importe").notNull(),
    metodo: text("metodo", { enum: METODOS_PAGO }).notNull().default("transferencia"),
    referencia: text("referencia"),
    notas: text("notas"),
    createdAt: createdAt(),
  },
  (t) => [
    index("pagos_cobro_idx").on(t.cobroId),
    index("pagos_fecha_idx").on(t.fecha),
    check("pagos_metodo_check", enLista(t.metodo, METODOS_PAGO)),
    check("pagos_importe_positivo", sql`${t.importe} > 0`),
  ],
);

/** Costes recurrentes del negocio. Cada renovación se convierte en un gasto (cron diario). */
export const suscripciones = pgTable(
  "suscripciones",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nombre: text("nombre").notNull(),
    proveedor: text("proveedor"),
    categoria: text("categoria", { enum: CATEGORIAS_GASTO }).notNull().default("software"),
    importe: dinero("importe").notNull(),
    periodicidad: text("periodicidad", { enum: PERIODICIDADES }).notNull().default("mensual"),
    proximaRenovacion: date("proxima_renovacion").notNull(),
    activa: boolean("activa").notNull().default(true),
    fechaAlta: date("fecha_alta").notNull(),
    fechaBaja: date("fecha_baja"),
    metodoPago: text("metodo_pago", { enum: METODOS_PAGO }),
    urlGestion: text("url_gestion"),
    avisoDias: integer("aviso_dias").notNull().default(7),
    // Fiscal: oculto mientras ajustes.config_fiscal sea false.
    ivaPct: numeric("iva_pct", { precision: 5, scale: 2, mode: "number" }),
    notas: text("notas"),
    createdAt: createdAt(),
  },
  (t) => [
    index("suscripciones_activa_renovacion_idx").on(t.activa, t.proximaRenovacion),
    check("suscripciones_categoria_check", enLista(t.categoria, CATEGORIAS_GASTO)),
    check("suscripciones_periodicidad_check", enLista(t.periodicidad, PERIODICIDADES)),
    check(
      "suscripciones_metodo_check",
      sql`${t.metodoPago} is null or ${enLista(t.metodoPago, METODOS_PAGO)}`,
    ),
    check("suscripciones_importe_check", sql`${t.importe} >= 0`),
    check("suscripciones_aviso_check", sql`${t.avisoDias} between 0 and 60`),
  ],
);

/** Gastos puntuales, incluidos los que genera el cron a partir de una suscripción. */
export const gastos = pgTable(
  "gastos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fecha: date("fecha").notNull(),
    concepto: text("concepto").notNull(),
    proveedor: text("proveedor"),
    categoria: text("categoria", { enum: CATEGORIAS_GASTO }).notNull().default("otros"),
    importe: dinero("importe").notNull(),
    metodoPago: text("metodo_pago", { enum: METODOS_PAGO }),
    suscripcionId: uuid("suscripcion_id").references(() => suscripciones.id, {
      onDelete: "set null",
    }),
    // Imputación opcional del coste a un proyecto o a un cliente.
    proyectoId: uuid("proyecto_id").references(() => proyectos.id, { onDelete: "set null" }),
    empresaId: uuid("empresa_id").references(() => empresas.id, { onDelete: "set null" }),
    // Ruta en el bucket privado "finanzas".
    justificantePath: text("justificante_path"),
    // Fiscal: oculto mientras ajustes.config_fiscal sea false.
    ivaPct: numeric("iva_pct", { precision: 5, scale: 2, mode: "number" }),
    deducible: boolean("deducible"),
    notas: text("notas"),
    createdAt: createdAt(),
  },
  (t) => [
    index("gastos_fecha_idx").on(t.fecha),
    index("gastos_categoria_idx").on(t.categoria),
    index("gastos_proyecto_idx").on(t.proyectoId),
    index("gastos_empresa_idx").on(t.empresaId),
    // Hace idempotente el cron de renovaciones: una renovación, un gasto.
    unique("gastos_suscripcion_fecha").on(t.suscripcionId, t.fecha),
    check("gastos_categoria_check", enLista(t.categoria, CATEGORIAS_GASTO)),
    check(
      "gastos_metodo_check",
      sql`${t.metodoPago} is null or ${enLista(t.metodoPago, METODOS_PAGO)}`,
    ),
    check("gastos_importe_positivo", sql`${t.importe} > 0`),
  ],
);
