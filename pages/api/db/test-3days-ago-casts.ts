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

    // Get 3 days ago date range
    const today = new Date();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);

    const startOfDay = new Date(
      threeDaysAgo.getFullYear(),
      threeDaysAgo.getMonth(),
      threeDaysAgo.getDate()
    );
    const endOfDay = new Date(
      threeDaysAgo.getFullYear(),
      threeDaysAgo.getMonth(),
      threeDaysAgo.getDate() + 1
    );

    console.log("Fetching casts for FID:", userFid);
    console.log("3 days ago date range:", { startOfDay, endOfDay });
    console.log("Today is:", today.toISOString());

    // Query 1: Using Drizzle ORM
    const drizzleResult = await db
      .select({
        hash: casts.hash,
        text: casts.text,
        timestamp: casts.timestamp,
        parentCastHash: casts.parentCastHash,
        embeds: casts.embeds,
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
      SELECT hash, text, timestamp, parent_cast_hash, embeds
      FROM casts 
      WHERE fid = ${userFid}
        AND timestamp >= ${startOfDay}
        AND timestamp < ${endOfDay}
      ORDER BY timestamp
    `);

    // Query 3: Get count of casts from 3 days ago
    const countResult = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM casts 
      WHERE fid = ${userFid}
        AND timestamp >= ${startOfDay}
        AND timestamp < ${endOfDay}
    `);

    // Query 4: Get all casts from that day (not just this user)
    const allCastsFromDay = await db.execute(sql`
      SELECT fid, hash, text, timestamp, parent_cast_hash
      FROM casts 
      WHERE timestamp >= ${startOfDay}
        AND timestamp < ${endOfDay}
      ORDER BY timestamp
      LIMIT 10
    `);

    return res.status(200).json({
      success: true,
      userFid,
      dateRange: {
        startOfDay: startOfDay.toISOString(),
        endOfDay: endOfDay.toISOString(),
        threeDaysAgo: threeDaysAgo.toISOString(),
        today: today.toISOString(),
      },
      userCasts: {
        count: drizzleResult.length,
        casts: drizzleResult.map((cast) => ({
          hash: cast.hash,
          text:
            cast.text?.substring(0, 150) +
            (cast.text && cast.text.length > 150 ? "..." : ""),
          timestamp: cast.timestamp,
          parentCastHash: cast.parentCastHash,
          isReply: !!cast.parentCastHash,
          embeds: cast.embeds,
        })),
      },
      rawSqlResult: {
        count: rawSqlResult.rows.length,
        casts: rawSqlResult.rows,
      },
      totalCount: countResult.rows[0]?.count || 0,
      allCastsFromDay: {
        count: allCastsFromDay.rows.length,
        casts: allCastsFromDay.rows.map((cast: any) => ({
          fid: cast.fid,
          hash: cast.hash,
          text:
            cast.text?.substring(0, 100) +
            (cast.text && cast.text.length > 100 ? "..." : ""),
          timestamp: cast.timestamp,
          isReply: !!cast.parent_cast_hash,
        })),
      },
    });
  } catch (error) {
    console.error("3 days ago casts query error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
