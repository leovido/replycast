import type { NextApiRequest, NextApiResponse } from "next";
import { readOnlyRepository } from "@/lib/db/repositories/readOnlyRepository";
import type { FarcasterRepliesResponse, UnrepliedDetail } from "@/types/types";

// Cache for user reply checks to avoid repeated database calls
export const replyCheckCache = new Map<string, boolean>();

// Add a function to clear cache for testing
export function clearReplyCheckCache() {
  replyCheckCache.clear();
}

// Helper function to check if user has replied to a conversation using database
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
    // Check if user has replied to this cast using database
    const hasReplied = await readOnlyRepository.hasUserRepliedToConversation(
      userFid,
      castHash
    );

    replyCheckCache.set(cacheKey, hasReplied);
    return hasReplied;
  } catch (error) {
    console.error("Error checking if user replied:", error);
    replyCheckCache.set(cacheKey, false);
    return false; // Default to false if we can't check
  }
}

// Helper function to get user interactions from database
async function getUserInteractions(
  userFid: number,
  castHash: string
): Promise<{
  userLiked: boolean;
  userRecasted: boolean;
  likesCount: number;
  recastsCount: number;
}> {
  try {
    // Get reactions for this cast from database
    const reactions = await readOnlyRepository.getCastReactions(castHash, 100);

    // Check if user has liked or recasted
    const userLiked = reactions.some(
      (reaction) => reaction.fid === userFid && reaction.type === "like"
    );

    const userRecasted = reactions.some(
      (reaction) => reaction.fid === userFid && reaction.type === "recast"
    );

    // Count total likes and recasts
    const likesCount = reactions.filter(
      (reaction) => reaction.type === "like"
    ).length;

    const recastsCount = reactions.filter(
      (reaction) => reaction.type === "recast"
    ).length;

    return { userLiked, userRecasted, likesCount, recastsCount };
  } catch (error) {
    console.error("Error checking user interactions:", error);
    return {
      userLiked: false,
      userRecasted: false,
      likesCount: 0,
      recastsCount: 0,
    };
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
    dayFilter = "",
  } = req.query;

  if (!fid) {
    return res.status(400).json({ error: "fid query parameter is required" });
  }

  // Cache control is handled by Next.js config for this endpoint

  try {
    const userFid = parseInt(fid as string, 10);
    const limitNum = parseInt(limit as string, 10);

    // Validate that FID is a valid number
    if (isNaN(userFid)) {
      return res.status(400).json({ error: "Invalid FID parameter" });
    }

    // Get user's casts that have replies (using database instead of Neynar)
    const dbResult = await readOnlyRepository.getUnrepliedConversations(
      userFid,
      limitNum
    );

    if (!dbResult || dbResult.conversations.length === 0) {
      return res.status(200).json({
        unrepliedCount: 0,
        unrepliedDetails: [],
        message: "No unreplied conversations found.",
        nextCursor: null,
      });
    }

    // Apply day filtering if specified
    let filteredConversations = dbResult.conversations;
    if (dayFilter !== "all") {
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;

      filteredConversations = dbResult.conversations.filter((conv) => {
        if (!conv.firstReplyTime) return false;

        const replyTime = new Date(conv.firstReplyTime).getTime();
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

    // Skip expensive interaction checks for now to improve performance
    // TODO: Add these back with proper indexing or caching
    const interactionChecks = filteredConversations.map((conv) => ({
      conv,
      interactions: {
        userLiked: false,
        userRecasted: false,
        likesCount: 0,
        recastsCount: 0,
      },
    }));

    // Transform database results to match API response format
    const unrepliedDetails: UnrepliedDetail[] = interactionChecks.map(
      ({ conv, interactions }) => {
        // Get profile information for the first reply author
        const firstReplyAuthorFid = conv.firstReplyAuthor;
        const username = firstReplyAuthorFid
          ? `User ${firstReplyAuthorFid}`
          : "Unknown User";

        return {
          username,
          timeAgo: conv.firstReplyTime
            ? timeAgo(conv.firstReplyTime.toISOString())
            : "Unknown",
          timestamp: conv.firstReplyTime ? conv.firstReplyTime.getTime() : 0,
          castUrl: `https://warpcast.com/~/conversations/${conv.cast.hash}`,
          text: conv.cast.text || "",
          avatarUrl: "", // Would need to fetch from profiles table if needed
          castHash: conv.cast.hash,
          authorFid: conv.cast.fid, // This is YOUR FID (the original cast author)
          originalCastText: conv.cast.text || "",
          originalCastHash: conv.cast.hash,
          originalAuthorUsername: `User ${conv.cast.fid}`, // This is YOUR username
          replyCount: conv.replyCount,
          userLiked: interactions.userLiked,
          userRecasted: interactions.userRecasted,
          hasUserInteraction:
            interactions.userLiked || interactions.userRecasted,
          likesCount: interactions.likesCount,
          recastsCount: interactions.recastsCount,
        };
      }
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
      nextCursor: null, // Database queries don't support cursors in this implementation
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Database-driven notification replies API error:", error);
    return res.status(500).json({
      error: "Internal server error: " + error,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
