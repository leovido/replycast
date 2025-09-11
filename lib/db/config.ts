import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { casts } from "./schema";

// Database connection configuration for READ-ONLY access
const pool = new Pool({
  host: process.env.DB_HOST || "postgres.dtechvision.xyz",
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER || "dtechguest",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "farcaster",
  ssl: false, // Disable SSL for now since the server doesn't support it
  max: 10, // Reduced pool size for read-only access
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Create drizzle instance for read-only operations
export const db = drizzle(pool);

// Export pool for direct access if needed
export { pool };

// Health check function for read-only database
export async function checkDatabaseConnection() {
  try {
    const client = await pool.connect();
    await client.query("SELECT NOW()");
    client.release();
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

// Test query function to verify read access
export async function testReadAccess() {
  try {
    const result = await db.select().from(casts).limit(1);
    return result.length > 0;
  } catch (error) {
    console.error("Read access test failed:", error);
    return false;
  }
}
