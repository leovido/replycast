-- =====================================================
-- Farcaster ReplyCast Widget Database Setup Script
-- =====================================================
-- This script will:
-- 1. Create new tables for the enhanced schema
-- 2. Migrate data from existing casts table if needed
-- 3. Set up proper indexes and constraints
-- =====================================================

-- Start a transaction
BEGIN;

-- =====================================================
-- Step 1: Create the new schema tables
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

-- User sessions table - store user authentication sessions
CREATE TABLE IF NOT EXISTS "user_sessions" (
    "id" serial PRIMARY KEY NOT NULL,
    "fid" integer NOT NULL,
    "session_token" text NOT NULL UNIQUE,
    "expires_at" timestamp NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
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

-- =====================================================
-- Step 2: Handle the existing casts table
-- =====================================================

-- Check if we need to migrate the existing casts table
DO $$
BEGIN
    -- If the existing casts table has the old structure, we'll need to migrate it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'casts' 
        AND column_name = 'parent_cast_url'
    ) THEN
        -- Create a backup of the old table
        CREATE TABLE IF NOT EXISTS "casts_backup" AS SELECT * FROM "casts";
        
        -- Drop the old table
        DROP TABLE "casts";
        
        -- Create the new casts table with proper structure
        CREATE TABLE "casts" (
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
        
        -- Migrate data from backup (basic migration - you may need to adjust based on your data)
        INSERT INTO "casts" (
            "hash", "author_fid", "text", "parent_hash", "parent_fid", 
            "timestamp", "embeds", "mentions", "created_at"
        )
        SELECT 
            "hash",
            "fid",
            COALESCE("text", ''),
            "parent_cast_hash",
            "parent_cast_fid",
            COALESCE("timestamp", now()),
            "embeds",
            "mentions",
            now()
        FROM "casts_backup";
        
        RAISE NOTICE 'Migrated existing casts table to new schema';
    ELSE
        -- Create the new casts table if it doesn't exist
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
        
        RAISE NOTICE 'Created new casts table';
    END IF;
END $$;

-- =====================================================
-- Step 3: Create indexes for performance
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
-- Step 4: Create foreign key constraints
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
-- Step 5: Create sample data (optional)
-- =====================================================

-- Insert a sample user for testing
INSERT INTO "users" ("fid", "username", "display_name", "bio") 
VALUES (12345, 'sample_user', 'Sample User', 'This is a sample user for testing purposes')
ON CONFLICT ("fid") DO NOTHING;

-- Insert sample user settings
INSERT INTO "user_settings" ("fid", "theme", "notifications", "privacy_level") 
VALUES (12345, 'dark', true, 'public')
ON CONFLICT ("fid") DO NOTHING;

-- Track a sample event
INSERT INTO "analytics" ("fid", "event_type", "event_data") 
VALUES (12345, 'user_created', '{"source": "setup_script"}');

-- =====================================================
-- Step 6: Verify the setup
-- =====================================================

-- Show all tables
\dt

-- Show table structures
\d users
\d casts
\d conversations
\d analytics
\d user_settings
\d user_sessions

-- Show sample data
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'casts', COUNT(*) FROM casts
UNION ALL
SELECT 'conversations', COUNT(*) FROM conversations
UNION ALL
SELECT 'analytics', COUNT(*) FROM analytics
UNION ALL
SELECT 'user_settings', COUNT(*) FROM user_settings
UNION ALL
SELECT 'user_sessions', COUNT(*) FROM user_sessions;

-- Commit the transaction
COMMIT;

-- =====================================================
-- Setup Complete! 🎉
-- =====================================================
-- Your database is now ready with:
-- ✅ 6 tables with proper relationships
-- ✅ Optimized indexes for performance
-- ✅ Foreign key constraints for data integrity
-- ✅ Sample data for testing
-- =====================================================
