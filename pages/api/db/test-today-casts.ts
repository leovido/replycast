import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db/config";
import { sql, eq, and, gte, lt } from "drizzle-orm";
import { casts } from "@/lib/db/schema";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fid = "203666" } = req.query;
    const userFid = parseInt(fid as string, 10);

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    console.log("Fetching casts for FID:", userFid);
    console.log("Date range:", { startOfDay, endOfDay });

    // Query 1: Using Drizzle ORM
    const drizzleResult = await db
      .select({
        hash: casts.hash,
        text: casts.text,
        timestamp: casts.timestamp,
        parentCastHash: casts.parentCastHash,
      })
      .from(casts)
      .where(
        and(
          eq(casts.fid, userFid),
          gte(casts.timestamp, startOfDay),
          lt(casts.timestamp, endOfDay)
        )
      )
      .orderBy(casts.timestamp);

    // Query 2: Using raw SQL for comparison
    const rawSqlResult = await db.execute(sql`
      SELECT hash, text, timestamp, parent_cast_hash
      FROM casts 
      WHERE fid = ${userFid}
        AND timestamp >= ${startOfDay}
        AND timestamp < ${endOfDay}
      ORDER BY timestamp
    `);

    // Query 3: Get count of today's casts
    const countResult = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM casts 
      WHERE fid = ${userFid}
        AND timestamp >= ${startOfDay}
        AND timestamp < ${endOfDay}
    `);

    return res.status(200).json({
      success: true,
      userFid,
      dateRange: {
        startOfDay: startOfDay.toISOString(),
        endOfDay: endOfDay.toISOString(),
        today: today.toISOString(),
      },
      drizzleResult: {
        count: drizzleResult.length,
        casts: drizzleResult,
      },
      rawSqlResult: {
        count: rawSqlResult.rows.length,
        casts: rawSqlResult.rows,
      },
      totalCount: countResult.rows[0]?.count || 0,
    });
  } catch (error) {
    console.error("Today's casts query error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
