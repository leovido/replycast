import { NextApiRequest, NextApiResponse } from "next";
import { FetchAllNotificationsTypeEnum } from "@neynar/nodejs-sdk/build/api/apis/notifications-api";
import { client } from "@/client";
import { FarcasterRepliesResponse } from "@/types/types";

const API_KEY = process.env.NEYNAR_API_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { fid, limit = "25", cursor, type = "replies" } = req.query;
  if (!fid) {
    return res.status(400).json({ error: "fid query parameter is required" });
  }
  if (!API_KEY) {
    return res.status(500).json({ error: "Neynar API key not configured" });
  }

  try {
    const request = await client.fetchAllNotifications({
      fid: parseInt(fid as string, 10),
      limit: parseInt(limit as string),
      type: [type as FetchAllNotificationsTypeEnum],
      cursor: cursor as string | undefined,
    });
    const replies = request.notifications;

    const response: FarcasterRepliesResponse = {
      unrepliedCount: replies.length,
      unrepliedDetails: replies.map((reply) => ({
        username: reply.cast?.author?.username || "",
        timeAgo: reply.cast?.timestamp || "",
        castUrl: `https://farcaster.xyz/${reply.cast?.author?.username}/${reply.cast?.hash}`,
        text: reply.cast?.text || "",
        avatarUrl: reply.cast?.author?.pfp_url || "",
        castHash: reply.cast?.hash || "",
        authorFid: reply.cast?.author?.fid || 0,
        originalCastText: reply.cast?.text || "",
        originalCastHash: reply.cast?.hash || "",
        originalAuthorUsername: reply.cast?.author?.username || "",
        replyCount: reply.cast?.replies?.count || 0,
      })),
      message: `You have ${replies.length} unreplied comments today.`,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Notification replies API error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
