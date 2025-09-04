import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db/config";
import { sql } from "drizzle-orm";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log(
      "Running SQL query: select max(timestamp) from casts where timestamp < '2026-01-01'"
    );

    // Run the SQL query directly
    const result = await db.execute(sql`
      SELECT max(timestamp) as max_timestamp 
      FROM casts 
      WHERE timestamp < '2026-01-01'
    `);

    console.log("Query result:", result);

    return res.status(200).json({
      success: true,
      query: "select max(timestamp) from casts where timestamp < '2026-01-01'",
      result: result.rows,
      maxTimestamp: result.rows[0]?.max_timestamp,
    });
  } catch (error) {
    console.error("SQL query error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
