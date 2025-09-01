import type { NextApiRequest, NextApiResponse } from "next";
import type { ReplyTipsResponse, ReplyTip } from "@/types/types";

// Helper function to extract $REPLY amounts from cast text
function extractReplyTips(text: string): number[] {
  // Match patterns like "100 $REPLY", "1000 $REPLY", etc.
  // The number should be a whole number without commas or dots
  const replyTipRegex = /(\d+)\s*\$\s*REPLY/gi;
  const matches = text.match(replyTipRegex);

  if (!matches) return [];

  return matches
    .map((match) => {
      // Extract just the number part
      const numberMatch = match.match(/(\d+)/);
      return numberMatch ? parseInt(numberMatch[1], 10) : 0;
    })
    .filter((amount) => amount > 0);
}

// Helper function to check if a cast is from today
function isToday(timestamp: number): boolean {
  const today = new Date();
  const castDate = new Date(timestamp * 1000); // Convert from seconds to milliseconds

  return (
    castDate.getDate() === today.getDate() &&
    castDate.getMonth() === today.getMonth() &&
    castDate.getFullYear() === today.getFullYear()
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReplyTipsResponse | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { fid, pageSize = "50", reverse = "true" } = req.query;

  if (!fid || typeof fid !== "string") {
    return res.status(400).json({ error: "FID is required" });
  }

  try {
    // Fetch casts from Snap Hub API
    const snapHubUrl = `https://snap-hub.basedframes.com/v1/castsByFid?fid=${fid}&pageSize=${pageSize}&reverse=${reverse}`;

    const response = await fetch(snapHubUrl, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Snap Hub API responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.messages || !Array.isArray(data.messages)) {
      return res
        .status(500)
        .json({ error: "Invalid response from Snap Hub API" });
    }

    const tipsReceived: ReplyTip[] = [];
    const tipsGiven: ReplyTip[] = [];
    let totalReceived = 0;
    let totalGiven = 0;
    let totalReceivedToday = 0;
    let totalGivenToday = 0;

    // Process each cast
    for (const message of data.messages) {
      if (message.data?.type !== "MESSAGE_TYPE_CAST_ADD") continue;

      const castData = message.data;
      const castText = castData.castAddBody?.text || "";
      const timestamp = castData.timestamp;
      const castHash = message.hash;
      const authorFid = castData.fid;

      // Extract $REPLY tips from the cast text
      const replyAmounts = extractReplyTips(castText);

      if (replyAmounts.length > 0) {
        // This cast contains $REPLY tips
        const totalAmount = replyAmounts.reduce(
          (sum, amount) => sum + amount,
          0
        );
        const isFromToday = isToday(timestamp);

        // Create tip object
        const tip: ReplyTip = {
          amount: totalAmount,
          timestamp,
          castHash,
          castText,
          castUrl: `https://farcaster.xyz/cast/${castHash}`,
          authorFid,
          authorUsername: "user", // We'll need to fetch this separately if needed
          isTipGiven: false, // We'll determine this based on context
        };

        // For now, we'll assume all tips in user's casts are tips given
        // In a more sophisticated implementation, we'd need to analyze the context
        // to determine if it's a tip given or received
        tipsGiven.push(tip);
        totalGiven += totalAmount;
        if (isFromToday) {
          totalGivenToday += totalAmount;
        }
      }
    }

    // For tips received, we'd need to analyze casts that mention the user
    // This would require additional API calls to search for casts mentioning the user
    // For now, we'll return empty arrays for received tips

    const responseData: ReplyTipsResponse = {
      tipsReceived,
      tipsGiven,
      totalReceived,
      totalGiven,
      totalReceivedToday,
      totalGivenToday,
      message: "Successfully fetched $REPLY tips",
      nextCursor: data.nextPageToken || null,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching $REPLY tips:", error);
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to fetch $REPLY tips",
    });
  }
}
