CREATE TABLE "blog_api_uso" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_id" uuid NOT NULL,
	"tipo" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blog_api_uso_tipo_check" CHECK ("blog_api_uso"."tipo" in ('articulo', 'imagen'))
);
--> statement-breakpoint
ALTER TABLE "blog_api_uso" ADD CONSTRAINT "blog_api_uso_token_id_blog_api_tokens_id_fk" FOREIGN KEY ("token_id") REFERENCES "public"."blog_api_tokens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blog_api_uso_token_idx" ON "blog_api_uso" USING btree ("token_id","tipo","created_at" DESC NULLS LAST);