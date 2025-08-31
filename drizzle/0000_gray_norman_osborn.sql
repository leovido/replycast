CREATE TABLE "analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"fid" integer NOT NULL,
	"event_type" text NOT NULL,
	"event_data" jsonb,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"user_agent" text,
	"ip_address" text
);
--> statement-breakpoint
CREATE TABLE "casts" (
	"id" serial PRIMARY KEY NOT NULL,
	"hash" text NOT NULL,
	"author_fid" integer NOT NULL,
	"text" text NOT NULL,
	"parent_hash" text,
	"parent_fid" integer,
	"timestamp" timestamp NOT NULL,
	"embeds" jsonb,
	"mentions" jsonb,
	"channel_key" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "casts_hash_unique" UNIQUE("hash")
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"root_cast_hash" text NOT NULL,
	"root_author_fid" integer NOT NULL,
	"last_activity" timestamp NOT NULL,
	"reply_count" integer DEFAULT 0,
	"is_replied" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"fid" integer NOT NULL,
	"session_token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"fid" integer NOT NULL,
	"theme" text DEFAULT 'dark',
	"notifications" boolean DEFAULT true,
	"privacy_level" text DEFAULT 'public',
	"custom_filters" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_settings_fid_unique" UNIQUE("fid")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"fid" integer NOT NULL,
	"username" text,
	"display_name" text,
	"pfp_url" text,
	"bio" text,
	"location" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_fid_unique" UNIQUE("fid")
);
--> statement-breakpoint
ALTER TABLE "analytics" ADD CONSTRAINT "analytics_fid_users_fid_fk" FOREIGN KEY ("fid") REFERENCES "public"."users"("fid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "casts" ADD CONSTRAINT "casts_author_fid_users_fid_fk" FOREIGN KEY ("author_fid") REFERENCES "public"."users"("fid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "casts" ADD CONSTRAINT "casts_parent_fid_users_fid_fk" FOREIGN KEY ("parent_fid") REFERENCES "public"."users"("fid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_root_cast_hash_casts_hash_fk" FOREIGN KEY ("root_cast_hash") REFERENCES "public"."casts"("hash") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_root_author_fid_users_fid_fk" FOREIGN KEY ("root_author_fid") REFERENCES "public"."users"("fid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_fid_users_fid_fk" FOREIGN KEY ("fid") REFERENCES "public"."users"("fid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_fid_users_fid_fk" FOREIGN KEY ("fid") REFERENCES "public"."users"("fid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "analytics_fid_idx" ON "analytics" USING btree ("fid");--> statement-breakpoint
CREATE INDEX "analytics_event_type_idx" ON "analytics" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "analytics_timestamp_idx" ON "analytics" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "casts_hash_idx" ON "casts" USING btree ("hash");--> statement-breakpoint
CREATE INDEX "casts_author_fid_idx" ON "casts" USING btree ("author_fid");--> statement-breakpoint
CREATE INDEX "casts_parent_hash_idx" ON "casts" USING btree ("parent_hash");--> statement-breakpoint
CREATE INDEX "casts_timestamp_idx" ON "casts" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "conversations_root_cast_hash_idx" ON "conversations" USING btree ("root_cast_hash");--> statement-breakpoint
CREATE INDEX "conversations_root_author_fid_idx" ON "conversations" USING btree ("root_author_fid");--> statement-breakpoint
CREATE INDEX "conversations_is_replied_idx" ON "conversations" USING btree ("is_replied");--> statement-breakpoint
CREATE INDEX "user_sessions_fid_idx" ON "user_sessions" USING btree ("fid");--> statement-breakpoint
CREATE INDEX "user_sessions_session_token_idx" ON "user_sessions" USING btree ("session_token");--> statement-breakpoint
CREATE INDEX "user_sessions_expires_at_idx" ON "user_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "user_settings_fid_idx" ON "user_settings" USING btree ("fid");--> statement-breakpoint
CREATE INDEX "users_fid_idx" ON "users" USING btree ("fid");--> statement-breakpoint
CREATE INDEX "username_idx" ON "users" USING btree ("username");