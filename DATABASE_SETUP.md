# PostgreSQL Database Setup Guide

This guide will help you set up PostgreSQL for your Farcaster ReplyCast Widget application.

## Prerequisites

- PostgreSQL 12 or higher installed
- Node.js 18+ and pnpm
- Access to create databases and users

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in your project root:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=replycast_widget

# Neynar API Key (existing)
NEYNAR_API_KEY=your_neynar_api_key_here

# Node Environment
NODE_ENV=development
```

### 3. Create Database

Connect to PostgreSQL and create the database:

```sql
CREATE DATABASE replycast_widget;
CREATE USER replycast_user WITH PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE replycast_widget TO replycast_user;
```

### 4. Generate and Run Migrations

```bash
# Generate migration files
pnpm run db:generate

# Push schema to database (for development)
pnpm run db:push

# Or run migrations (for production)
pnpm run db:migrate
```

### 5. Initialize Database

```bash
# Run the initialization script
pnpm tsx scripts/init-db.ts

# Or with sample data
CREATE_SAMPLE_DATA=true pnpm tsx scripts/init-db.ts
```

## Database Schema

The application uses the following main tables:

### Users Table

- Stores Farcaster user information (FID, username, display name, etc.)
- Indexed by FID for fast lookups
- Supports user settings and preferences

### Casts Table

- Stores all cast data including replies
- Indexed by hash, author FID, and timestamp
- Supports nested reply structures

### Conversations Table

- Tracks conversation threads
- Monitors reply counts and activity
- Tracks whether conversations have been replied to

### Analytics Table

- User interaction tracking
- Event logging for insights
- Performance monitoring

### User Settings Table

- User preferences (theme, notifications, privacy)
- Custom filter configurations
- Personalization data

## Available Commands

```bash
# Database management
pnpm run db:generate    # Generate migration files
pnpm run db:migrate     # Run migrations
pnpm run db:push        # Push schema changes (dev only)
pnpm run db:studio      # Open Drizzle Studio
pnpm run db:drop        # Drop all tables (⚠️ destructive)

# Database health check
curl http://localhost:3000/api/db/health
```

## Development Workflow

### 1. Schema Changes

When you modify the schema in `lib/db/schema.ts`:

```bash
# Generate migration files
pnpm run db:generate

# Review generated files in ./drizzle folder
# Apply changes
pnpm run db:push
```

### 2. Testing Database

The application includes database repositories that can be easily mocked for testing:

```typescript
import { userRepository } from "@/lib/db/repositories/userRepository";

// Mock the repository in tests
jest.mock("@/lib/db/repositories/userRepository");
```

### 3. Database Studio

View and edit your data visually:

```bash
pnpm run db:studio
```

This opens Drizzle Studio in your browser for easy data management.

## Production Considerations

### 1. Environment Variables

Ensure all database credentials are properly set in production:

```bash
DB_HOST=your_production_host
DB_PORT=5432
DB_USER=your_production_user
DB_PASSWORD=your_secure_password
DB_NAME=replycast_widget_prod
NODE_ENV=production
```

### 2. SSL Configuration

For production databases, enable SSL:

```typescript
// In lib/db/config.ts
ssl: process.env.NODE_ENV === "production"
  ? { rejectUnauthorized: false }
  : false;
```

### 3. Connection Pooling

The configuration includes connection pooling:

```typescript
max: 20,                    // Maximum connections
idleTimeoutMillis: 30000,   // Close idle connections after 30s
connectionTimeoutMillis: 2000, // Connection timeout
```

### 4. Migrations

Always run migrations in production:

```bash
pnpm run db:migrate
```

## Troubleshooting

### Connection Issues

1. **Check PostgreSQL service:**

   ```bash
   sudo systemctl status postgresql
   ```

2. **Verify credentials:**

   ```bash
   psql -h localhost -U postgres -d replycast_widget
   ```

3. **Check firewall settings:**
   Ensure port 5432 is accessible

### Migration Issues

1. **Reset database:**

   ```bash
   pnpm run db:drop
   pnpm run db:push
   ```

2. **Check migration files:**
   Review generated files in `./drizzle` folder

3. **Manual schema creation:**
   ```sql
   -- Run schema manually if needed
   \i lib/db/schema.sql
   ```

### Performance Issues

1. **Check indexes:**

   ```sql
   SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
   FROM pg_stat_user_indexes;
   ```

2. **Analyze query performance:**

   ```sql
   EXPLAIN ANALYZE SELECT * FROM users WHERE fid = 12345;
   ```

3. **Connection pool monitoring:**
   Check the health endpoint: `/api/db/health`

## API Integration

The database is integrated with your existing API endpoints:

- **`/api/farcaster-replies-db`** - Enhanced version with database caching
- **`/api/db/health`** - Database health check
- **Repository pattern** - Clean separation of concerns

## Next Steps

1. **Customize schema** - Add fields specific to your needs
2. **Implement caching** - Add Redis for session storage
3. **Add monitoring** - Integrate with your logging system
4. **Scale horizontally** - Consider read replicas for high traffic

## Support

For database-related issues:

1. Check the logs for detailed error messages
2. Verify environment variables are set correctly
3. Test database connection manually
4. Review PostgreSQL logs for connection issues

## Security Notes

- Never commit `.env` files to version control
- Use strong, unique passwords for database users
- Limit database user permissions to only what's needed
- Enable SSL in production environments
- Regularly update PostgreSQL and dependencies
