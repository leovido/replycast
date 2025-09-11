import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER || "guest",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "replycast_widget",
  },
  verbose: true,
  strict: true,
  // Note: This is a read-only database, so migrations are not supported
  // The schema file is for type safety and query building only
} satisfies Config;
