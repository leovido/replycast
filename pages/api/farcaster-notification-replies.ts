import { NextApiRequest, NextApiResponse } from "next";
import { FetchAllNotificationsTypeEnum } from "@neynar/nodejs-sdk/build/api/apis/notifications-api";
import { FarcasterRepliesResponse, UnrepliedDetail } from "@/types/types";
import { client } from "@/client";

const timeAgo = (dateString: string): string => {
  const now = new Date();
  const then = new Date(dateString);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
};

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

  try {
    const request = await client.fetchAllNotifications({
      fid: parseInt(fid as string, 10),
      limit: parseInt(limit as string),
      type: [type as FetchAllNotificationsTypeEnum],
      cursor: cursor ? (cursor as string) : undefined,
    });
    const replies = request.notifications;
    const nextCursor = request.next;

    const unrepliedDetails: UnrepliedDetail[] = replies.map((reply) => ({
      username: reply.cast?.author?.username || "",
      timeAgo: reply.cast?.timestamp ? timeAgo(reply.cast.timestamp) : "",
      timestamp: reply.cast?.timestamp ? Number(reply.cast.timestamp) : 0,
      castUrl: `https://farcaster.xyz/${reply.cast?.author?.username}/${reply.cast?.hash}`,
      text: reply.cast?.text || "",
      avatarUrl: reply.cast?.author?.pfp_url || "",
      castHash: reply.cast?.hash || "",
      authorFid: reply.cast?.author?.fid || 0,
      originalCastText: reply.cast?.text || "",
      originalCastHash: reply.cast?.hash || "",
      originalAuthorUsername: reply.cast?.author?.username || "",
      replyCount: reply.cast?.replies?.count || 0,
    }));

    const response: FarcasterRepliesResponse = {
      unrepliedCount: replies.length,
      unrepliedDetails: unrepliedDetails,
      message: `You have ${replies.length} unreplied comments today.`,
      nextCursor: nextCursor ? nextCursor.cursor : null,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Notification replies API error:", error);
    return res.status(500).json({
      error: "Internal server error: " + error,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
