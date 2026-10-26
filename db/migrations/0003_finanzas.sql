CREATE TABLE "ajustes" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"config_fiscal" boolean DEFAULT false NOT NULL,
	"nombre_comercial" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ajustes_fila_unica" CHECK ("ajustes"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE "cobros" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"numero" text NOT NULL,
	"empresa_id" uuid NOT NULL,
	"proyecto_id" uuid,
	"presupuesto_id" uuid,
	"origen" text DEFAULT 'manual' NOT NULL,
	"concepto" text NOT NULL,
	"importe" numeric(10, 2) NOT NULL,
	"fecha_emision" date NOT NULL,
	"fecha_vencimiento" date,
	"anulado" boolean DEFAULT false NOT NULL,
	"notas" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cobros_numero_unique" UNIQUE("numero"),
	CONSTRAINT "cobros_origen_check" CHECK ("cobros"."origen" in ('presupuesto', 'bolsa', 'mantenimiento', 'manual')),
	CONSTRAINT "cobros_importe_positivo" CHECK ("cobros"."importe" > 0)
);
--> statement-breakpoint
CREATE TABLE "gastos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fecha" date NOT NULL,
	"concepto" text NOT NULL,
	"proveedor" text,
	"categoria" text DEFAULT 'otros' NOT NULL,
	"importe" numeric(10, 2) NOT NULL,
	"metodo_pago" text,
	"suscripcion_id" uuid,
	"proyecto_id" uuid,
	"empresa_id" uuid,
	"justificante_path" text,
	"iva_pct" numeric(5, 2),
	"deducible" boolean,
	"notas" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gastos_suscripcion_fecha" UNIQUE("suscripcion_id","fecha"),
	CONSTRAINT "gastos_categoria_check" CHECK ("gastos"."categoria" in ('software', 'hosting', 'dominios', 'hardware', 'formacion', 'marketing', 'oficina', 'transporte', 'servicios_profesionales', 'comisiones', 'otros')),
	CONSTRAINT "gastos_metodo_check" CHECK ("gastos"."metodo_pago" is null or "gastos"."metodo_pago" in ('transferencia', 'bizum', 'efectivo', 'tarjeta', 'paypal', 'otro')),
	CONSTRAINT "gastos_importe_positivo" CHECK ("gastos"."importe" > 0)
);
--> statement-breakpoint
CREATE TABLE "pagos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cobro_id" uuid NOT NULL,
	"fecha" date NOT NULL,
	"importe" numeric(10, 2) NOT NULL,
	"metodo" text DEFAULT 'transferencia' NOT NULL,
	"referencia" text,
	"notas" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pagos_metodo_check" CHECK ("pagos"."metodo" in ('transferencia', 'bizum', 'efectivo', 'tarjeta', 'paypal', 'otro')),
	CONSTRAINT "pagos_importe_positivo" CHECK ("pagos"."importe" > 0)
);
--> statement-breakpoint
CREATE TABLE "suscripciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"proveedor" text,
	"categoria" text DEFAULT 'software' NOT NULL,
	"importe" numeric(10, 2) NOT NULL,
	"periodicidad" text DEFAULT 'mensual' NOT NULL,
	"proxima_renovacion" date NOT NULL,
	"activa" boolean DEFAULT true NOT NULL,
	"fecha_alta" date NOT NULL,
	"fecha_baja" date,
	"metodo_pago" text,
	"url_gestion" text,
	"aviso_dias" integer DEFAULT 7 NOT NULL,
	"iva_pct" numeric(5, 2),
	"notas" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "suscripciones_categoria_check" CHECK ("suscripciones"."categoria" in ('software', 'hosting', 'dominios', 'hardware', 'formacion', 'marketing', 'oficina', 'transporte', 'servicios_profesionales', 'comisiones', 'otros')),
	CONSTRAINT "suscripciones_periodicidad_check" CHECK ("suscripciones"."periodicidad" in ('mensual', 'trimestral', 'anual')),
	CONSTRAINT "suscripciones_metodo_check" CHECK ("suscripciones"."metodo_pago" is null or "suscripciones"."metodo_pago" in ('transferencia', 'bizum', 'efectivo', 'tarjeta', 'paypal', 'otro')),
	CONSTRAINT "suscripciones_importe_check" CHECK ("suscripciones"."importe" >= 0),
	CONSTRAINT "suscripciones_aviso_check" CHECK ("suscripciones"."aviso_dias" between 0 and 60)
);
--> statement-breakpoint
ALTER TABLE "cobros" ADD CONSTRAINT "cobros_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cobros" ADD CONSTRAINT "cobros_proyecto_id_proyectos_id_fk" FOREIGN KEY ("proyecto_id") REFERENCES "public"."proyectos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cobros" ADD CONSTRAINT "cobros_presupuesto_id_presupuestos_id_fk" FOREIGN KEY ("presupuesto_id") REFERENCES "public"."presupuestos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_suscripcion_id_suscripciones_id_fk" FOREIGN KEY ("suscripcion_id") REFERENCES "public"."suscripciones"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_proyecto_id_proyectos_id_fk" FOREIGN KEY ("proyecto_id") REFERENCES "public"."proyectos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_cobro_id_cobros_id_fk" FOREIGN KEY ("cobro_id") REFERENCES "public"."cobros"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cobros_empresa_idx" ON "cobros" USING btree ("empresa_id");--> statement-breakpoint
CREATE INDEX "cobros_proyecto_idx" ON "cobros" USING btree ("proyecto_id");--> statement-breakpoint
CREATE INDEX "cobros_presupuesto_idx" ON "cobros" USING btree ("presupuesto_id");--> statement-breakpoint
CREATE INDEX "cobros_vencimiento_idx" ON "cobros" USING btree ("fecha_vencimiento");--> statement-breakpoint
CREATE INDEX "gastos_fecha_idx" ON "gastos" USING btree ("fecha");--> statement-breakpoint
CREATE INDEX "gastos_categoria_idx" ON "gastos" USING btree ("categoria");--> statement-breakpoint
CREATE INDEX "gastos_proyecto_idx" ON "gastos" USING btree ("proyecto_id");--> statement-breakpoint
CREATE INDEX "gastos_empresa_idx" ON "gastos" USING btree ("empresa_id");--> statement-breakpoint
CREATE INDEX "pagos_cobro_idx" ON "pagos" USING btree ("cobro_id");--> statement-breakpoint
CREATE INDEX "pagos_fecha_idx" ON "pagos" USING btree ("fecha");--> statement-breakpoint
CREATE INDEX "suscripciones_activa_renovacion_idx" ON "suscripciones" USING btree ("activa","proxima_renovacion");
--> statement-breakpoint
INSERT INTO "ajustes" ("id") VALUES (1) ON CONFLICT DO NOTHING;
