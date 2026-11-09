ALTER TABLE "empresas" ADD COLUMN "archivada_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "empresas" ADD COLUMN "archivo_desactivadas" uuid[];