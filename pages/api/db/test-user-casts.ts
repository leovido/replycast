import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db/config";
import { sql, eq, and, isNull, desc } from "drizzle-orm";
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

    console.log("Testing user casts for FID:", userFid);

    // Get all user's original casts (not replies)
    const userCasts = await db
      .select({
        hash: casts.hash,
        text: casts.text,
        timestamp: casts.timestamp,
        parentCastHash: casts.parentCastHash,
      })
      .from(casts)
      .where(and(eq(casts.fid, userFid), isNull(casts.parentCastHash)))
      .orderBy(desc(casts.timestamp))
      .limit(10);

    console.log(`Found ${userCasts.length} original casts for user ${userFid}`);

    // For each cast, check if it has replies from OTHER users
    const castsWithReplies = await Promise.all(
      userCasts.map(async (cast) => {
        // Count replies from OTHER users
        const [replyCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(casts)
          .where(
            and(
              eq(casts.parentCastHash, cast.hash),
              sql`${casts.fid} != ${userFid}`
            )
          );

        // Get first reply from OTHER users
        const [firstReply] = await db
          .select({
            fid: casts.fid,
            text: casts.text,
            timestamp: casts.timestamp,
          })
          .from(casts)
          .where(
            and(
              eq(casts.parentCastHash, cast.hash),
              sql`${casts.fid} != ${userFid}`
            )
          )
          .orderBy(casts.timestamp)
          .limit(1);

        return {
          cast,
          replyCount: replyCount?.count || 0,
          firstReply,
        };
      })
    );

    // Filter to only casts with replies from other users
    const unrepliedCasts = castsWithReplies.filter(
      (item) => item.replyCount > 0
    );

    console.log(
      `Found ${unrepliedCasts.length} casts with replies from other users`
    );

    return res.status(200).json({
      success: true,
      userFid,
      totalOriginalCasts: userCasts.length,
      castsWithReplies: unrepliedCasts.length,
      originalCasts: userCasts.map((cast) => ({
        hash: cast.hash,
        text:
          cast.text?.substring(0, 100) +
          (cast.text && cast.text.length > 100 ? "..." : ""),
        timestamp: cast.timestamp,
      })),
      unrepliedCasts: unrepliedCasts.map((item) => ({
        cast: {
          hash: item.cast.hash,
          text:
            item.cast.text?.substring(0, 100) +
            (item.cast.text && item.cast.text.length > 100 ? "..." : ""),
          timestamp: item.cast.timestamp,
        },
        replyCount: item.replyCount,
        firstReply: item.firstReply
          ? {
              fid: item.firstReply.fid,
              text:
                item.firstReply.text?.substring(0, 50) +
                (item.firstReply.text && item.firstReply.text.length > 50
                  ? "..."
                  : ""),
              timestamp: item.firstReply.timestamp,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error("User casts test error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
