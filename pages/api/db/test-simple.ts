import type { NextApiRequest, NextApiResponse } from "next";
import { readOnlyRepository } from "@/lib/db/repositories/readOnlyRepository";

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

    console.log("Testing database connection for FID:", userFid);

    // Test 1: Get user's recent casts
    const userCasts = await readOnlyRepository.getCastsByAuthor(userFid, 5);
    console.log("User casts found:", userCasts.casts.length);

    // Test 2: Get unreplied conversations
    const unreplied = await readOnlyRepository.getUnrepliedConversations(
      userFid,
      5
    );
    console.log(
      "Unreplied conversations found:",
      unreplied.conversations.length
    );

    // Test 3: Get user stats
    const stats = await readOnlyRepository.getUserStats(userFid);
    console.log("User stats:", stats);

    return res.status(200).json({
      success: true,
      userCasts: userCasts.casts.length,
      unrepliedConversations: unreplied.conversations.length,
      userStats: stats,
      debug: {
        userCasts: userCasts.casts.map((cast) => ({
          hash: cast.hash,
          text: cast.text?.substring(0, 50) + "...",
          timestamp: cast.timestamp,
          parentCastHash: cast.parentCastHash,
        })),
        unreplied: unreplied.conversations.map((conv) => ({
          castHash: conv.cast.hash,
          replyCount: conv.replyCount,
          firstReplyTime: conv.firstReplyTime,
          firstReplyAuthor: conv.firstReplyAuthor,
        })),
      },
    });
  } catch (error) {
    console.error("Database test error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
