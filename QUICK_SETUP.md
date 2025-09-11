# 🚀 Quick Database Setup Guide

## 📋 What You Need

- PostgreSQL running locally or remotely
- Access to create databases and tables
- Your database connection details

## 🔧 Setup Options

### Option 1: Fresh Start (Recommended for new projects)

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE replycast_widget;

# Connect to the database
\c replycast_widget

# Run the schema-only script
\i schema-only.sql
```

### Option 2: Migrate Existing Data

```bash
# Connect to PostgreSQL
psql -U postgres

# Connect to your existing database
\c replycast_widget

# Run the full setup script (includes migration)
\i database-setup.sql
```

### Option 3: Use Drizzle Commands

```bash
# Generate migration files
pnpm run db:generate

# Push schema to database (dev only)
pnpm run db:push

# Or run migrations properly
pnpm run db:migrate
```

## 🗄️ Database Structure

Your database will have **6 tables**:

| Table           | Purpose                   | Key Fields                                    |
| --------------- | ------------------------- | --------------------------------------------- |
| `users`         | Farcaster user profiles   | `fid`, `username`, `display_name`             |
| `casts`         | All cast data & replies   | `hash`, `author_fid`, `parent_hash`           |
| `conversations` | Thread tracking           | `root_cast_hash`, `reply_count`, `is_replied` |
| `analytics`     | User interaction tracking | `fid`, `event_type`, `timestamp`              |
| `user_settings` | User preferences          | `fid`, `theme`, `notifications`               |
| `user_sessions` | Authentication sessions   | `fid`, `session_token`, `expires_at`          |

## 🔍 Verify Setup

After running the setup script, verify everything worked:

```sql
-- List all tables
\dt

-- Check table structures
\d users
\d casts

-- Count records (should be 0 for new tables)
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'casts', COUNT(*) FROM casts
UNION ALL
SELECT 'conversations', COUNT(*) FROM conversations;
```

## 🚨 Important Notes

1. **Backup First**: If you have existing data, always backup before running migrations
2. **Test Environment**: Test the setup in a development environment first
3. **Permissions**: Ensure your database user has CREATE, ALTER, and INDEX permissions
4. **Connections**: Update your `.env.local` with correct database credentials

## 🔗 Environment Variables

Make sure your `.env.local` has:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=replycast_widget
```

## ✅ Success Indicators

- All 6 tables created successfully
- No error messages during setup
- Indexes created without conflicts
- Foreign key constraints established
- Can connect via your application

## 🆘 Troubleshooting

### Common Issues:

1. **Connection Failed**: Check if PostgreSQL is running
2. **Permission Denied**: Verify user has proper privileges
3. **Table Already Exists**: Use `IF NOT EXISTS` or drop existing tables first
4. **Index Conflicts**: Ensure no duplicate index names

### Get Help:

- Check PostgreSQL logs: `tail -f /var/log/postgresql/postgresql-*.log`
- Verify service status: `sudo systemctl status postgresql`
- Test connection: `psql -U postgres -d replycast_widget -c "SELECT version();"`

---

## 🎯 Next Steps

After successful setup:

1. **Test Connection**: Run your app and check database health endpoint
2. **Verify API**: Test `/api/farcaster-replies-db` endpoint
3. **Monitor Logs**: Watch for any database-related errors
4. **Performance**: Check query performance with your data

Your database is now ready to power your Farcaster ReplyCast Widget! 🚀
