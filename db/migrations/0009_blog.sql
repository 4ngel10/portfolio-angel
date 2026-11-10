CREATE TABLE "blog_api_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"token_hash" text NOT NULL,
	"scope" text DEFAULT 'borrador' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	CONSTRAINT "blog_api_tokens_token_hash_unique" UNIQUE("token_hash"),
	CONSTRAINT "blog_api_tokens_scope_check" CHECK ("blog_api_tokens"."scope" in ('borrador'))
);
--> statement-breakpoint
CREATE TABLE "blog_post_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"content" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"category" text NOT NULL,
	"status" text DEFAULT 'borrador' NOT NULL,
	"published_at" timestamp with time zone,
	"content" jsonb NOT NULL,
	"og_image" text,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug"),
	CONSTRAINT "blog_posts_slug_check" CHECK ("blog_posts"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "blog_posts_category_check" CHECK ("blog_posts"."category" in ('sistemas', 'desarrollo', 'automatizacion')),
	CONSTRAINT "blog_posts_status_check" CHECK ("blog_posts"."status" in ('borrador', 'publicado')),
	CONSTRAINT "blog_posts_publicado_fecha_check" CHECK ("blog_posts"."status" <> 'publicado' or "blog_posts"."published_at" is not null)
);
--> statement-breakpoint
ALTER TABLE "blog_post_versions" ADD CONSTRAINT "blog_post_versions_post_id_blog_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blog_post_versions_post_idx" ON "blog_post_versions" USING btree ("post_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "blog_posts_status_published_idx" ON "blog_posts" USING btree ("status","published_at" DESC NULLS LAST);