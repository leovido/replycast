import type { NextApiRequest, NextApiResponse } from "next";
import { FetchAllNotificationsTypeEnum } from "@neynar/nodejs-sdk/build/api/apis/notifications-api";
import type { FarcasterRepliesResponse, UnrepliedDetail } from "@/types/types";
import { client } from "@/client";

// Cache for user reply checks to avoid repeated API calls
export const replyCheckCache = new Map<string, boolean>();

// Add a function to clear cache for testing
export function clearReplyCheckCache() {
  replyCheckCache.clear();
}

// Helper function to check if user has replied to a conversation
async function hasUserReplied(
  userFid: number,
  castHash: string
): Promise<boolean> {
  const cacheKey = `${userFid}-${castHash}`;

  // Check cache first
  if (replyCheckCache.has(cacheKey)) {
    return replyCheckCache.get(cacheKey)!;
  }

  try {
    // Fetch the conversation to check if user has replied
    const conversation = await client.lookupCastConversation({
      identifier: castHash,
      type: "hash",
      replyDepth: 1, // Only check direct replies for efficiency
      limit: 5, // Reduced limit for faster response
    });

    if (!conversation.conversation?.cast?.direct_replies) {
      replyCheckCache.set(cacheKey, false);
      return false;
    }

    // Check if any of the direct replies are from the user
    const userReplies = conversation.conversation.cast.direct_replies.filter(
      (reply: any) => reply.author.fid === userFid
    );

    const hasReplied = userReplies.length > 0;
    replyCheckCache.set(cacheKey, hasReplied);
    return hasReplied;
  } catch (error) {
    console.error("Error checking if user replied:", error);
    replyCheckCache.set(cacheKey, false);
    return false; // Default to false if we can't check
  }
}

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

  const {
    fid,
    limit = "25",
    cursor,
    type = "replies",
    dayFilter = "today",
  } = req.query;

  if (!fid) {
    return res.status(400).json({ error: "fid query parameter is required" });
  }

  // Cache control is handled by Next.js config for this endpoint

  try {
    const userFid = parseInt(fid as string, 10);
    const request = await client.fetchAllNotifications({
      fid: userFid,
      limit: parseInt(limit as string),
      type: [type as FetchAllNotificationsTypeEnum],
      cursor: cursor ? (cursor as string) : undefined,
    });
    const replies = request.notifications;
    const nextCursor = request.next;

    // Filter out conversations where the user has already replied
    // First, filter out notifications with null/undefined cast data
    const validReplies = replies.filter((reply) => reply.cast?.hash);

    // Process in parallel for better performance
    const replyChecks = await Promise.all(
      validReplies.map(async (reply) => {
        const userHasReplied = await hasUserReplied(
          userFid,
          reply.cast?.hash || ""
        );
        return { reply, hasReplied: userHasReplied };
      })
    );

    const unrepliedReplies = replyChecks
      .filter(({ hasReplied }) => !hasReplied)
      .map(({ reply }) => reply);

    // Apply day filtering if specified
    let filteredReplies = unrepliedReplies;
    if (dayFilter !== "all") {
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;

      filteredReplies = unrepliedReplies.filter((reply) => {
        const replyTime = reply.cast?.timestamp
          ? new Date(reply.cast.timestamp).getTime()
          : 0;
        const timeDiff = now - replyTime;

        switch (dayFilter) {
          case "today":
            return timeDiff < oneDayMs;
          case "3days":
            return timeDiff < 3 * oneDayMs;
          case "7days":
            return timeDiff < 7 * oneDayMs;
          default:
            return true;
        }
      });
    }

    const unrepliedDetails: UnrepliedDetail[] = filteredReplies.map(
      (reply) => ({
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
      })
    );

    const response: FarcasterRepliesResponse = {
      unrepliedCount: unrepliedDetails.length,
      unrepliedDetails: unrepliedDetails,
      message: `You have ${unrepliedDetails.length} unreplied comments${
        dayFilter !== "all"
          ? ` in the last ${
              dayFilter === "today"
                ? "day"
                : dayFilter === "3days"
                ? "3 days"
                : "7 days"
            }`
          : ""
      }.`,
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
