ALTER TABLE "proyectos" ADD COLUMN "presupuesto_id" uuid;--> statement-breakpoint
ALTER TABLE "proyectos" ADD CONSTRAINT "proyectos_presupuesto_id_presupuestos_id_fk" FOREIGN KEY ("presupuesto_id") REFERENCES "public"."presupuestos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "proyectos_presupuesto_uniq" ON "proyectos" USING btree ("presupuesto_id");