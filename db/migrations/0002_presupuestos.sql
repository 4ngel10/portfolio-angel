CREATE TABLE "presupuesto_lineas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"presupuesto_id" uuid NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL,
	"concepto" text NOT NULL,
	"detalle" text,
	"cantidad" numeric(10, 2) NOT NULL,
	"precio_unitario" numeric(10, 2) NOT NULL,
	CONSTRAINT "presupuesto_lineas_no_negativas" CHECK ("presupuesto_lineas"."cantidad" >= 0 and "presupuesto_lineas"."precio_unitario" >= 0)
);
--> statement-breakpoint
CREATE TABLE "presupuestos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"numero" text NOT NULL,
	"titulo" text NOT NULL,
	"estado" text DEFAULT 'borrador' NOT NULL,
	"fecha_emision" date NOT NULL,
	"valido_hasta" date,
	"iva" numeric(5, 2) DEFAULT 21 NOT NULL,
	"descuento" numeric(5, 2) DEFAULT 0 NOT NULL,
	"notas" text,
	"firma_nombre" text,
	"firma_usuario_id" uuid,
	"firma_fecha" timestamp with time zone,
	"firma_ip" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "presupuestos_numero_unique" UNIQUE("numero"),
	CONSTRAINT "presupuestos_estado_check" CHECK ("presupuestos"."estado" in ('borrador', 'enviado', 'aceptado', 'rechazado')),
	CONSTRAINT "presupuestos_porcentajes_check" CHECK ("presupuestos"."iva" between 0 and 100 and "presupuestos"."descuento" between 0 and 100)
);
--> statement-breakpoint
ALTER TABLE "presupuesto_lineas" ADD CONSTRAINT "presupuesto_lineas_presupuesto_id_presupuestos_id_fk" FOREIGN KEY ("presupuesto_id") REFERENCES "public"."presupuestos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presupuestos" ADD CONSTRAINT "presupuestos_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presupuestos" ADD CONSTRAINT "presupuestos_firma_usuario_id_usuarios_id_fk" FOREIGN KEY ("firma_usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "presupuesto_lineas_idx" ON "presupuesto_lineas" USING btree ("presupuesto_id","orden");--> statement-breakpoint
CREATE INDEX "presupuestos_empresa_idx" ON "presupuestos" USING btree ("empresa_id");