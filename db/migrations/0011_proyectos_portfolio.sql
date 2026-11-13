CREATE TABLE "portfolio_project_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"content" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"status" text DEFAULT 'borrador' NOT NULL,
	"published_at" timestamp with time zone,
	"orden" integer NOT NULL,
	"service" text NOT NULL,
	"tech" text[] NOT NULL,
	"cover" text NOT NULL,
	"tint" integer NOT NULL,
	"url" text,
	"image" text,
	"image_dark" text,
	"og_image" text,
	"cover_position" text,
	"ejemplo" boolean DEFAULT false NOT NULL,
	"datos_provisionales" boolean DEFAULT false NOT NULL,
	"content" jsonb NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "portfolio_projects_slug_unique" UNIQUE("slug"),
	CONSTRAINT "portfolio_projects_slug_check" CHECK ("portfolio_projects"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "portfolio_projects_status_check" CHECK ("portfolio_projects"."status" in ('borrador', 'publicado')),
	CONSTRAINT "portfolio_projects_service_check" CHECK ("portfolio_projects"."service" in ('web', 'sistemas')),
	CONSTRAINT "portfolio_projects_cover_position_check" CHECK ("portfolio_projects"."cover_position" is null or "portfolio_projects"."cover_position" in ('top', 'center')),
	CONSTRAINT "portfolio_projects_publicado_fecha_check" CHECK ("portfolio_projects"."status" <> 'publicado' or "portfolio_projects"."published_at" is not null)
);
--> statement-breakpoint
ALTER TABLE "portfolio_project_versions" ADD CONSTRAINT "portfolio_project_versions_project_id_portfolio_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."portfolio_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "portfolio_project_versions_project_idx" ON "portfolio_project_versions" USING btree ("project_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "portfolio_projects_status_orden_idx" ON "portfolio_projects" USING btree ("status","orden");