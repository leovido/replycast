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

    console.log("Testing performance for FID:", userFid);

    // Test the optimized query
    const startTime = Date.now();

    const result = await readOnlyRepository.getUnrepliedConversations(
      userFid,
      10
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`Query completed in ${duration}ms`);

    return res.status(200).json({
      success: true,
      userFid,
      performance: {
        durationMs: duration,
        durationSeconds: (duration / 1000).toFixed(2),
      },
      result: {
        totalCount: result.totalCount,
        conversationsCount: result.conversations.length,
        conversations: result.conversations.map((conv) => ({
          castHash: conv.cast.hash,
          text: conv.cast.text?.substring(0, 50) + "...",
          replyCount: conv.replyCount,
          firstReplyAuthor: conv.firstReplyAuthor,
          firstReplyTime: conv.firstReplyTime,
        })),
      },
    });
  } catch (error) {
    console.error("Performance test error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
