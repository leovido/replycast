import type { NextApiRequest, NextApiResponse } from "next";
import { client } from "@/client";
import { readOnlyRepository } from "@/lib/db/repositories/readOnlyRepository";

// === CONFIG ===
const API_KEY = process.env.NEYNAR_API_KEY;

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

  // Performance optimized cache headers
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=300, stale-while-revalidate=600, max-age=60"
  );
  res.setHeader("CDN-Cache-Control", "s-maxage=300");
  res.setHeader("Vary", "Accept-Encoding");

  // Security and performance headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");

  const { fid, limit = "10", cursor, useCache = "true" } = req.query;

  if (!fid || typeof fid !== "string") {
    return res.status(400).json({ error: "FID parameter is required" });
  }

  const limitNum = parseInt(limit as string, 10) || 10;
  const shouldUseCache = useCache === "true";

  if (!API_KEY) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const userFid = parseInt(fid, 10);

    // Try to get data from database first if caching is enabled
    if (shouldUseCache) {
      try {
        const dbResult = await readOnlyRepository.getUnrepliedConversations(
          userFid,
          limitNum
        );

        if (dbResult.conversations.length > 0) {
          // Transform database results to match API response format
          const unrepliedDetails = dbResult.conversations.map((conv) => ({
            username: `User ${conv.firstReplyAuthor || "Unknown"}`,
            timeAgo: conv.firstReplyTime
              ? timeAgo(conv.firstReplyTime.toISOString())
              : "Unknown",
            castUrl: `https://warpcast.com/~/conversations/${conv.cast.hash}`,
            text: conv.cast.text || "",
            avatarUrl: "", // Would need to fetch from profiles table
            castHash: conv.cast.hash,
            authorFid: conv.cast.fid,
            originalCastText: conv.cast.text || "",
            originalCastHash: conv.cast.hash,
            originalAuthorUsername: `User ${conv.cast.fid}`,
            replyCount: conv.replyCount,
          }));

          return res.status(200).json({
            unrepliedCount: dbResult.totalCount,
            unrepliedDetails,
            message: "Data retrieved from database cache",
            nextCursor: null,
            source: "database",
          });
        }
      } catch (dbError) {
        console.warn("Database query failed, falling back to API:", dbError);
        // Continue to API fallback
      }
    }

    // Fallback to Neynar API
    console.log(`Fetching data from Neynar API for FID: ${userFid}`);

    // === Step 1: Fetch your recent casts with pagination ===
    const userCastsRes = await client.fetchCastsForUser({
      fid: userFid,
      limit: limitNum,
      includeReplies: true,
      cursor: cursor as string,
    });

    if (!userCastsRes || !Array.isArray(userCastsRes.casts)) {
      return res.status(200).json({
        unrepliedCount: 0,
        unrepliedDetails: [],
        message: "No recent casts found.",
        nextCursor: null,
        source: "api",
      });
    }

    let unrepliedCount = 0;
    const unrepliedDetails: Array<{
      username: string;
      timeAgo: string;
      castUrl: string;
      text: string;
      avatarUrl: string;
      castHash: string;
      authorFid: number;
      originalCastText: string;
      originalCastHash: string;
      originalAuthorUsername: string;
      replyCount: number;
    }> = [];

    // Process casts (read-only, no database writes)
    for (const cast of userCastsRes.casts) {
      try {
        // Check if this cast has replies
        if ((cast as any).replies && (cast as any).replies.length > 0) {
          const hasReplied =
            await readOnlyRepository.hasUserRepliedToConversation(
              userFid,
              cast.hash
            );

          if (!hasReplied) {
            unrepliedCount++;

            // Get first reply details
            const firstReply = (cast as any).replies[0];
            const replyAuthor = firstReply.author;

            unrepliedDetails.push({
              username: replyAuthor.username || "Unknown",
              timeAgo: timeAgo(firstReply.timestamp),
              castUrl: `https://warpcast.com/~/conversations/${cast.hash}`,
              text: firstReply.text,
              avatarUrl: replyAuthor.pfp?.url || "",
              castHash: firstReply.hash,
              authorFid: replyAuthor.fid,
              originalCastText: cast.text,
              originalCastHash: cast.hash,
              originalAuthorUsername: cast.author.username || "Unknown",
              replyCount: (cast as any).replies.length,
            });

            // Stop if we have enough items
            if (unrepliedDetails.length >= limitNum) {
              break;
            }
          }
        }
      } catch (error) {
        console.error("Error processing cast:", error);
        // Continue with next cast
      }
    }

    return res.status(200).json({
      unrepliedCount,
      unrepliedDetails,
      message: "Data retrieved from API successfully",
      nextCursor: (userCastsRes as any).nextCursor,
      source: "api",
    });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}
