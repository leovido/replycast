import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db/config";
import { sql, eq, desc } from "drizzle-orm";
import { casts } from "@/lib/db/schema";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fid = "203666", limit = "10" } = req.query;
    const userFid = parseInt(fid as string, 10);
    const limitNum = parseInt(limit as string, 10);

    console.log("Fetching recent casts for FID:", userFid, "limit:", limitNum);

    // Get the most recent casts for this user
    const recentCasts = await db
      .select({
        hash: casts.hash,
        text: casts.text,
        timestamp: casts.timestamp,
        parentCastHash: casts.parentCastHash,
      })
      .from(casts)
      .where(eq(casts.fid, userFid))
      .orderBy(desc(casts.timestamp))
      .limit(limitNum);

    // Get the date range of their casts
    const dateRange = await db.execute(sql`
      SELECT 
        MIN(timestamp) as earliest_cast,
        MAX(timestamp) as latest_cast,
        COUNT(*) as total_casts
      FROM casts 
      WHERE fid = ${userFid}
    `);

    return res.status(200).json({
      success: true,
      userFid,
      limit: limitNum,
      recentCasts: {
        count: recentCasts.length,
        casts: recentCasts.map((cast) => ({
          hash: cast.hash,
          text:
            cast.text?.substring(0, 100) +
            (cast.text && cast.text.length > 100 ? "..." : ""),
          timestamp: cast.timestamp,
          parentCastHash: cast.parentCastHash,
          isReply: !!cast.parentCastHash,
        })),
      },
      dateRange: dateRange.rows[0],
    });
  } catch (error) {
    console.error("Recent casts query error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
