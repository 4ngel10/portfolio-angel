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
    // Precio mensual de la bolsa en euros. Lo ven el admin y el cliente.
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
 * Meses ya cerrados de cada bolsa. Lo escribe el cron del día 1 y solo lo lee el admin:
 * sirve para sumar lo que lleva gastado cada cliente. Sin política de lectura para clientes.
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
