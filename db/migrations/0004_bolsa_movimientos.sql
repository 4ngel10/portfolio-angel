CREATE TABLE "bolsa_movimientos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"empresa_id" uuid NOT NULL,
	"bolsa_id" uuid NOT NULL,
	"proyecto_id" uuid,
	"fecha" date DEFAULT current_date NOT NULL,
	"horas" numeric(6, 2) NOT NULL,
	"concepto" text NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bolsa_movimientos_horas_check" CHECK ("bolsa_movimientos"."horas" <> 0),
	CONSTRAINT "bolsa_movimientos_concepto_check" CHECK (char_length("bolsa_movimientos"."concepto") between 1 and 200)
);
--> statement-breakpoint
ALTER TABLE "bolsa_historial" ALTER COLUMN "horas_contratadas" SET DATA TYPE numeric(7, 2);--> statement-breakpoint
ALTER TABLE "bolsa_historial" ALTER COLUMN "horas_consumidas" SET DATA TYPE numeric(7, 2);--> statement-breakpoint
ALTER TABLE "bolsa_horas" ALTER COLUMN "horas_contratadas" SET DATA TYPE numeric(7, 2);--> statement-breakpoint
ALTER TABLE "bolsa_horas" ALTER COLUMN "horas_consumidas" SET DATA TYPE numeric(7, 2);--> statement-breakpoint
ALTER TABLE "bolsa_horas" ADD COLUMN "ultimo_aviso_bajo" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "bolsa_movimientos" ADD CONSTRAINT "bolsa_movimientos_empresa_id_empresas_id_fk" FOREIGN KEY ("empresa_id") REFERENCES "public"."empresas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bolsa_movimientos" ADD CONSTRAINT "bolsa_movimientos_bolsa_id_bolsa_horas_id_fk" FOREIGN KEY ("bolsa_id") REFERENCES "public"."bolsa_horas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bolsa_movimientos" ADD CONSTRAINT "bolsa_movimientos_proyecto_id_proyectos_id_fk" FOREIGN KEY ("proyecto_id") REFERENCES "public"."proyectos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bolsa_movimientos" ADD CONSTRAINT "bolsa_movimientos_created_by_usuarios_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bolsa_movimientos_empresa_fecha_idx" ON "bolsa_movimientos" USING btree ("empresa_id","fecha");--> statement-breakpoint
-- Saldo inicial: un movimiento por cada bolsa que ya tiene horas consumidas, para que la suma
-- de movimientos cuadre con el contador. No modifica ninguna cifra existente.
INSERT INTO "bolsa_movimientos" ("empresa_id", "bolsa_id", "fecha", "horas", "concepto")
SELECT "empresa_id", "id", current_date, "horas_consumidas", 'Saldo inicial'
FROM "bolsa_horas"
WHERE "horas_consumidas" > 0;
