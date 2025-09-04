import { NextApiRequest, NextApiResponse } from "next";
import { readOnlyRepository } from "../../../lib/db/repositories/readOnlyRepository";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const userFid = 203666;
    const limit = 2;

    console.log("Testing profile data for FID:", userFid);

    // Get unreplied conversations with profile data
    const result = await readOnlyRepository.getUnrepliedConversations(
      userFid,
      limit
    );

    console.log("Found conversations:", result.conversations.length);

    // Show the raw profile data for the first conversation
    if (result.conversations.length > 0) {
      const firstConv = result.conversations[0] as any;
      console.log("First conversation profile data:", {
        username: firstConv.username,
        displayName: firstConv.displayName,
        pfpUrl: firstConv.pfpUrl,
        fid: firstConv.cast.fid,
      });
    }

    return res.status(200).json({
      success: true,
      totalCount: result.totalCount,
      conversations: result.conversations.map((conv: any) => ({
        fid: conv.cast.fid,
        username: conv.username,
        displayName: conv.displayName,
        pfpUrl: conv.pfpUrl,
        text: conv.cast.text?.substring(0, 50) + "...",
      })),
    });
  } catch (error) {
    console.error("Error testing profile data:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
