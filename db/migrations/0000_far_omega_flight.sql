CREATE TABLE "archivos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proyecto_id" uuid NOT NULL,
	"empresa_id" uuid NOT NULL,
	"nombre" text NOT NULL,
	"tipo_mime" text NOT NULL,
	"tamanio_bytes" integer NOT NULL,
	"storage_path" text NOT NULL,
	"subido_por" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "archivos_storage_path_unique" UNIQUE("storage_path")
);
--> statement-breakpoint
CREATE TABLE "bolsa_horas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"horas_contratadas" integer NOT NULL,
	"horas_consumidas" integer DEFAULT 0 NOT NULL,
	"periodo_inicio" date NOT NULL,
	"periodo_fin" date NOT NULL,
	CONSTRAINT "bolsa_horas_no_negativas" CHECK ("bolsa_horas"."horas_consumidas" >= 0 and "bolsa_horas"."horas_contratadas" >= 0)
);
--> statement-breakpoint
CREATE TABLE "documentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"proyecto_id" uuid,
	"tipo" text NOT NULL,
	"storage_path" text NOT NULL,
	"nombre" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "documentos_tipo_check" CHECK ("documentos"."tipo" in ('presupuesto', 'justificante', 'factura'))
);
--> statement-breakpoint
CREATE TABLE "empresas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"slug" text NOT NULL,
	"config_fiscal" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "empresas_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "hitos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proyecto_id" uuid NOT NULL,
	"titulo" text NOT NULL,
	"descripcion" text,
	"orden" integer DEFAULT 0 NOT NULL,
	"completado" boolean DEFAULT false NOT NULL,
	"pelota_en" text DEFAULT 'equipo' NOT NULL,
	"fecha_objetivo" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hitos_pelota_check" CHECK ("hitos"."pelota_en" in ('cliente', 'equipo'))
);
--> statement-breakpoint
CREATE TABLE "incidencias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proyecto_id" uuid NOT NULL,
	"empresa_id" uuid NOT NULL,
	"titulo" text NOT NULL,
	"descripcion" text NOT NULL,
	"estado" text DEFAULT 'abierta' NOT NULL,
	"prioridad" text DEFAULT 'media' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "incidencias_estado_check" CHECK ("incidencias"."estado" in ('abierta', 'en_progreso', 'resuelta')),
	CONSTRAINT "incidencias_prioridad_check" CHECK ("incidencias"."prioridad" in ('baja', 'media', 'alta'))
);
--> statement-breakpoint
CREATE TABLE "mensajes_incidencia" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"incidencia_id" uuid NOT NULL,
	"autor_id" uuid,
	"contenido" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proyectos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"titulo" text NOT NULL,
	"descripcion" text,
	"estado" text DEFAULT 'activo' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "proyectos_estado_check" CHECK ("proyectos"."estado" in ('activo', 'pausado', 'completado'))
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" uuid PRIMARY KEY NOT NULL,
	"empresa_id" uuid,
	"role" text DEFAULT 'cliente' NOT NULL,
	"nombre" text NOT NULL,
	"email" text NOT NULL,
	"avatar_url" text,
	CONSTRAINT "usuarios_role_check" CHECK ("usuarios"."role" in ('admin', 'cliente'))
);
--> statement-breakpoint
ALTER TABLE "archivos" ADD CONSTRAINT "archivos_proyecto_id_proyectos_id_fk" FOREIGN KEY ("proyecto_id") REFERENCES "public"."proyectos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archivos" ADD CONSTRAINT "archivos_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archivos" ADD CONSTRAINT "archivos_subido_por_usuarios_id_fk" FOREIGN KEY ("subido_por") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bolsa_horas" ADD CONSTRAINT "bolsa_horas_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_proyecto_id_proyectos_id_fk" FOREIGN KEY ("proyecto_id") REFERENCES "public"."proyectos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hitos" ADD CONSTRAINT "hitos_proyecto_id_proyectos_id_fk" FOREIGN KEY ("proyecto_id") REFERENCES "public"."proyectos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidencias" ADD CONSTRAINT "incidencias_proyecto_id_proyectos_id_fk" FOREIGN KEY ("proyecto_id") REFERENCES "public"."proyectos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidencias" ADD CONSTRAINT "incidencias_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mensajes_incidencia" ADD CONSTRAINT "mensajes_incidencia_incidencia_id_incidencias_id_fk" FOREIGN KEY ("incidencia_id") REFERENCES "public"."incidencias"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mensajes_incidencia" ADD CONSTRAINT "mensajes_incidencia_autor_id_usuarios_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proyectos" ADD CONSTRAINT "proyectos_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "archivos_proyecto_idx" ON "archivos" USING btree ("proyecto_id");--> statement-breakpoint
CREATE INDEX "archivos_empresa_idx" ON "archivos" USING btree ("empresa_id");--> statement-breakpoint
CREATE INDEX "bolsa_horas_empresa_idx" ON "bolsa_horas" USING btree ("empresa_id");--> statement-breakpoint
CREATE INDEX "documentos_empresa_idx" ON "documentos" USING btree ("empresa_id");--> statement-breakpoint
CREATE INDEX "hitos_proyecto_idx" ON "hitos" USING btree ("proyecto_id","orden");--> statement-breakpoint
CREATE INDEX "incidencias_proyecto_idx" ON "incidencias" USING btree ("proyecto_id");--> statement-breakpoint
CREATE INDEX "incidencias_empresa_idx" ON "incidencias" USING btree ("empresa_id");--> statement-breakpoint
CREATE INDEX "mensajes_incidencia_idx" ON "mensajes_incidencia" USING btree ("incidencia_id","created_at");--> statement-breakpoint
CREATE INDEX "proyectos_empresa_idx" ON "proyectos" USING btree ("empresa_id");--> statement-breakpoint
CREATE INDEX "usuarios_empresa_idx" ON "usuarios" USING btree ("empresa_id");