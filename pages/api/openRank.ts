import type { NextApiRequest, NextApiResponse } from "next";
import { MockOpenRankService } from "@/utils/mockService";

const followingURL = process.env.OPENRANK_URL + "scores/global/following/fids";
const engagementURL =
  process.env.OPENRANK_URL + "scores/global/engagement/fids";

interface OpenRankResponse {
  result: Array<{
    fid: number;
    username: string;
    rank: number;
    score: number;
    percentile: number;
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { fids } = req.query;

  if (!fids) {
    return res.status(400).json({ error: "FIDs parameter is required" });
  }

  // Handle both single FID and comma-separated FIDs
  let fidArray: string[];
  if (Array.isArray(fids)) {
    fidArray = fids;
  } else {
    // Split by comma if it's a string
    fidArray = fids.split(",").map((fid) => fid.trim());
  }

  const numericFids = fidArray
    .map((fid) => parseInt(fid))
    .filter((fid) => !isNaN(fid));

  if (numericFids.length === 0) {
    return res.status(400).json({ error: "No valid FIDs provided" });
  }

  // Check if mocks are enabled
  const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

  if (useMocks) {
    try {
      console.log("Mock: Using mock OpenRank data");
      const mockData = await MockOpenRankService.fetchRanks(numericFids);
      return res.status(200).json(mockData);
    } catch (error) {
      console.error("Mock service error:", error);
      return res.status(500).json({ error: "Mock service failed" });
    }
  }

  // Real API call
  try {
    // Handle both single FID and comma-separated FIDs
    let fidArray: string[];
    if (Array.isArray(fids)) {
      fidArray = fids;
    } else {
      // Split by comma if it's a string
      fidArray = fids.split(",").map((fid) => fid.trim());
    }

    // Filter out invalid FIDs but keep them as strings
    const validFids = fidArray.filter((fid) => !isNaN(parseInt(fid)));

    if (validFids.length === 0) {
      return res.status(400).json({ error: "No valid FIDs provided" });
    }

    // Fetch both following and engagement scores
    const [followingResponse, engagementResponse] = await Promise.all([
      fetch(followingURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validFids),
      }),
      fetch(engagementURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validFids),
      }),
    ]);

    if (!followingResponse.ok || !engagementResponse.ok) {
      throw new Error("Failed to fetch OpenRank data from API");
    }

    const followingData: OpenRankResponse = await followingResponse.json();
    const engagementData: OpenRankResponse = await engagementResponse.json();

    // Create result objects with both following and engagement data
    const result: Record<
      string,
      {
        following: {
          rank: number | null;
          score: number | null;
          percentile: number | null;
        };
        engagement: {
          rank: number | null;
          score: number | null;
          percentile: number | null;
        };
      }
    > = {};

    // Initialize all FIDs with null values
    validFids.forEach((fid) => {
      result[fid] = {
        following: { rank: null, score: null, percentile: null },
        engagement: { rank: null, score: null, percentile: null },
      };
    });

    // Populate following data
    followingData.result.forEach((item) => {
      const returnedFid = item.fid.toString();

      // Since we're using /fids endpoint, the returned FID should match our requested FID
      if (result[returnedFid]) {
        result[returnedFid].following = {
          rank: item.rank,
          score: item.score,
          percentile: item.percentile,
        };
        console.log(`Following: Successfully set data for FID ${returnedFid}`);
      } else {
        console.log(
          `Following: No result found for returned FID ${returnedFid}`
        );
      }
    });

    // Populate engagement data
    engagementData.result.forEach((item) => {
      const returnedFid = item.fid.toString();

      // Since we're using /fids endpoint, the returned FID should match our requested FID
      if (result[returnedFid]) {
        result[returnedFid].engagement = {
          rank: item.rank,
          score: item.score,
          percentile: item.percentile,
        };
        console.log(`Engagement: Successfully set data for FID ${returnedFid}`);
      } else {
        console.log(
          `Engagement: No result found for returned FID ${returnedFid}`
        );
      }
    });

    res.status(200).json({
      scores: result,
    });
  } catch (error) {
    console.error("Error fetching OpenRank data:", error);
    res.status(500).json({ error: "Failed to fetch OpenRank data" });
  }
}
