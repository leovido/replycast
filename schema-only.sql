-- =====================================================
-- Farcaster ReplyCast Widget - Schema Only
-- =====================================================
-- This script creates only the table structure
-- Use this if you want to start fresh or don't have existing data
-- =====================================================

-- Users table - store Farcaster user information
CREATE TABLE IF NOT EXISTS "users" (
    "id" serial PRIMARY KEY NOT NULL,
    "fid" integer NOT NULL UNIQUE,
    "username" text,
    "display_name" text,
    "pfp_url" text,
    "bio" text,
    "location" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Casts table - store cast information
CREATE TABLE IF NOT EXISTS "casts" (
    "id" serial PRIMARY KEY NOT NULL,
    "hash" text NOT NULL UNIQUE,
    "author_fid" integer NOT NULL,
    "text" text NOT NULL,
    "parent_hash" text,
    "parent_fid" integer,
    "timestamp" timestamp NOT NULL,
    "embeds" jsonb,
    "mentions" jsonb,
    "channel_key" text,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- Conversations table - track conversation threads
CREATE TABLE IF NOT EXISTS "conversations" (
    "id" serial PRIMARY KEY NOT NULL,
    "root_cast_hash" text NOT NULL,
    "root_author_fid" integer NOT NULL,
    "last_activity" timestamp NOT NULL,
    "reply_count" integer DEFAULT 0,
    "is_replied" boolean DEFAULT false,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- User sessions table - store user authentication sessions
CREATE TABLE IF NOT EXISTS "user_sessions" (
    "id" serial PRIMARY KEY NOT NULL,
    "fid" integer NOT NULL,
    "session_token" text NOT NULL UNIQUE,
    "expires_at" timestamp NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- Analytics table - store user interaction analytics
CREATE TABLE IF NOT EXISTS "analytics" (
    "id" serial PRIMARY KEY NOT NULL,
    "fid" integer NOT NULL,
    "event_type" text NOT NULL,
    "event_data" jsonb,
    "timestamp" timestamp DEFAULT now() NOT NULL,
    "user_agent" text,
    "ip_address" text
);

-- User settings table - store user preferences
CREATE TABLE IF NOT EXISTS "user_settings" (
    "id" serial PRIMARY KEY NOT NULL,
    "fid" integer NOT NULL UNIQUE,
    "theme" text DEFAULT 'dark',
    "notifications" boolean DEFAULT true,
    "privacy_level" text DEFAULT 'public',
    "custom_filters" jsonb,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS "users_fid_idx" ON "users" USING btree ("fid");
CREATE INDEX IF NOT EXISTS "username_idx" ON "users" USING btree ("username");

-- Casts table indexes
CREATE INDEX IF NOT EXISTS "casts_hash_idx" ON "casts" USING btree ("hash");
CREATE INDEX IF NOT EXISTS "casts_author_fid_idx" ON "casts" USING btree ("author_fid");
CREATE INDEX IF NOT EXISTS "casts_parent_hash_idx" ON "casts" USING btree ("parent_hash");
CREATE INDEX IF NOT EXISTS "casts_timestamp_idx" ON "casts" USING btree ("timestamp");

-- Conversations table indexes
CREATE INDEX IF NOT EXISTS "conversations_root_cast_hash_idx" ON "conversations" USING btree ("root_cast_hash");
CREATE INDEX IF NOT EXISTS "conversations_root_author_fid_idx" ON "conversations" USING btree ("root_author_fid");
CREATE INDEX IF NOT EXISTS "conversations_is_replied_idx" ON "conversations" USING btree ("is_replied");

-- User sessions table indexes
CREATE INDEX IF NOT EXISTS "user_sessions_fid_idx" ON "user_sessions" USING btree ("fid");
CREATE INDEX IF NOT EXISTS "user_sessions_session_token_idx" ON "user_sessions" USING btree ("session_token");
CREATE INDEX IF NOT EXISTS "user_sessions_expires_at_idx" ON "user_sessions" USING btree ("expires_at");

-- Analytics table indexes
CREATE INDEX IF NOT EXISTS "analytics_fid_idx" ON "analytics" USING btree ("fid");
CREATE INDEX IF NOT EXISTS "analytics_event_type_idx" ON "analytics" USING btree ("event_type");
CREATE INDEX IF NOT EXISTS "analytics_timestamp_idx" ON "analytics" USING btree ("timestamp");

-- User settings table indexes
CREATE INDEX IF NOT EXISTS "user_settings_fid_idx" ON "user_settings" USING btree ("fid");

-- =====================================================
-- Foreign Key Constraints
-- =====================================================

-- Analytics table foreign keys
ALTER TABLE "analytics" ADD CONSTRAINT IF NOT EXISTS "analytics_fid_users_fid_fk" 
    FOREIGN KEY ("fid") REFERENCES "users"("fid") ON DELETE CASCADE ON UPDATE CASCADE;

-- Casts table foreign keys
ALTER TABLE "casts" ADD CONSTRAINT IF NOT EXISTS "casts_author_fid_users_fid_fk" 
    FOREIGN KEY ("author_fid") REFERENCES "users"("fid") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "casts" ADD CONSTRAINT IF NOT EXISTS "casts_parent_fid_users_fid_fk" 
    FOREIGN KEY ("parent_fid") REFERENCES "users"("fid") ON DELETE SET NULL ON UPDATE CASCADE;

-- Conversations table foreign keys
ALTER TABLE "conversations" ADD CONSTRAINT IF NOT EXISTS "conversations_root_cast_hash_casts_hash_fk" 
    FOREIGN KEY ("root_cast_hash") REFERENCES "casts"("hash") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversations" ADD CONSTRAINT IF NOT EXISTS "conversations_root_author_fid_users_fid_fk" 
    FOREIGN KEY ("root_author_fid") REFERENCES "users"("fid") ON DELETE CASCADE ON UPDATE CASCADE;

-- User sessions table foreign keys
ALTER TABLE "user_sessions" ADD CONSTRAINT IF NOT EXISTS "user_sessions_fid_users_fid_fk" 
    FOREIGN KEY ("fid") REFERENCES "users"("fid") ON DELETE CASCADE ON UPDATE CASCADE;

-- User settings table foreign keys
ALTER TABLE "user_settings" ADD CONSTRAINT IF NOT EXISTS "user_settings_fid_users_fid_fk" 
    FOREIGN KEY ("fid") REFERENCES "users"("fid") ON DELETE CASCADE ON UPDATE CASCADE;

-- =====================================================
-- Schema Creation Complete! 🎉
-- =====================================================
