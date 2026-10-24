CREATE TABLE "bolsa_historial" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"periodo_inicio" date NOT NULL,
	"periodo_fin" date NOT NULL,
	"horas_contratadas" integer NOT NULL,
	"horas_consumidas" integer NOT NULL,
	"precio" numeric(10, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bolsa_historial_empresa_periodo" UNIQUE("empresa_id","periodo_inicio")
);
--> statement-breakpoint
ALTER TABLE "bolsa_horas" ADD COLUMN "precio" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "empresas" ADD COLUMN "sector" text;--> statement-breakpoint
ALTER TABLE "empresas" ADD COLUMN "actividad" text;--> statement-breakpoint
ALTER TABLE "empresas" ADD COLUMN "ubicacion" text;--> statement-breakpoint
ALTER TABLE "empresas" ADD COLUMN "telefono" text;--> statement-breakpoint
ALTER TABLE "empresas" ADD COLUMN "web" text;--> statement-breakpoint
ALTER TABLE "bolsa_historial" ADD CONSTRAINT "bolsa_historial_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bolsa_historial_empresa_idx" ON "bolsa_historial" USING btree ("empresa_id");