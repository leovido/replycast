#!/usr/bin/env tsx

const OPENRANK_URL = process.env.OPENRANK_URL || "https://api.openrank.xyz/";

interface OpenRankScore {
  rank: number | null;
  score: number | null;
  percentile: number | null;
}

interface OpenRankResult {
  fid: number;
  following: OpenRankScore;
  engagement: OpenRankScore;
}

async function checkOpenRank(fids: number[]): Promise<OpenRankResult[]> {
  try {
    console.log(
      `🔍 Checking OpenRank for ${fids.length} FID(s): ${fids.join(", ")}`
    );

    const followingURL = OPENRANK_URL + "scores/global/following/fids";
    const engagementURL = OPENRANK_URL + "scores/global/engagement/fids";

    // Filter out invalid FIDs and convert to strings for API
    const validFids = fids
      .filter((fid) => !isNaN(fid))
      .map((fid) => fid.toString());

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

    const followingData = await followingResponse.json();
    const engagementData = await engagementResponse.json();

    // Create result objects with both following and engagement data
    const results: OpenRankResult[] = [];

    fids.forEach((fid) => {
      const followingItem = followingData.result?.find(
        (item: any) => item.fid === fid
      );
      const engagementItem = engagementData.result?.find(
        (item: any) => item.fid === fid
      );

      results.push({
        fid,
        following: {
          rank: followingItem?.rank || null,
          score: followingItem?.score || null,
          percentile: followingItem?.percentile || null,
        },
        engagement: {
          rank: engagementItem?.rank || null,
          score: engagementItem?.score || null,
          percentile: engagementItem?.percentile || null,
        },
      });
    });

    return results;
  } catch (error) {
    console.error("❌ Error fetching OpenRank data:", error);
    throw error;
  }
}

function displayResults(results: OpenRankResult[]): void {
  console.log("\n📊 OpenRank Results:");
  console.log("=".repeat(80));

  results.forEach(({ fid, following, engagement }) => {
    const followingRankDisplay = following.rank
      ? `#${following.rank.toLocaleString()}`
      : "N/A";
    const engagementRankDisplay = engagement.rank
      ? `#${engagement.rank.toLocaleString()}`
      : "N/A";
    const followingScoreDisplay = following.score
      ? following.score.toFixed(6)
      : "N/A";
    const engagementScoreDisplay = engagement.score
      ? engagement.score.toFixed(6)
      : "N/A";

    console.log(
      `FID ${fid
        .toString()
        .padStart(8)} | Following: ${followingRankDisplay.padStart(
        8
      )} (${followingScoreDisplay}) | Engagement: ${engagementRankDisplay.padStart(
        8
      )} (${engagementScoreDisplay})`
    );
  });

  console.log("=".repeat(80));

  // Summary for engagement ranks (primary metric)
  const validEngagementRanks = results.filter(
    (r) => r.engagement.rank !== null
  );
  if (validEngagementRanks.length > 0) {
    const avgEngagementRank = Math.round(
      validEngagementRanks.reduce(
        (sum, r) => sum + (r.engagement.rank || 0),
        0
      ) / validEngagementRanks.length
    );
    const minEngagementRank = Math.min(
      ...validEngagementRanks.map((r) => r.engagement.rank || 0)
    );
    const maxEngagementRank = Math.max(
      ...validEngagementRanks.map((r) => r.engagement.rank || 0)
    );

    console.log(`\n📈 Engagement Rank Summary:`);
    console.log(`   Average Rank: #${avgEngagementRank.toLocaleString()}`);
    console.log(`   Best Rank: #${minEngagementRank.toLocaleString()}`);
    console.log(`   Worst Rank: #${maxEngagementRank.toLocaleString()}`);
  }

  // Summary for following ranks
  const validFollowingRanks = results.filter((r) => r.following.rank !== null);
  if (validFollowingRanks.length > 0) {
    const avgFollowingRank = Math.round(
      validFollowingRanks.reduce((sum, r) => sum + (r.following.rank || 0), 0) /
        validFollowingRanks.length
    );
    const minFollowingRank = Math.min(
      ...validFollowingRanks.map((r) => r.following.rank || 0)
    );
    const maxFollowingRank = Math.max(
      ...validFollowingRanks.map((r) => r.following.rank || 0)
    );

    console.log(`\n👥 Following Rank Summary:`);
    console.log(`   Average Rank: #${avgFollowingRank.toLocaleString()}`);
    console.log(`   Best Rank: #${minFollowingRank.toLocaleString()}`);
    console.log(`   Worst Rank: #${maxFollowingRank.toLocaleString()}`);
  }
}

async function main() {
  // Get FIDs from command line arguments
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Usage: npm run check-openrank <fid1> [fid2] [fid3] ...");
    console.log("Example: npm run check-openrank 203666 5406 196957");
    process.exit(1);
  }

  // Parse FIDs
  const fids = args.map((arg) => {
    const fid = parseInt(arg);
    if (isNaN(fid)) {
      console.error(`❌ Invalid FID: ${arg}`);
      process.exit(1);
    }
    return fid;
  });

  try {
    const results = await checkOpenRank(fids);
    displayResults(results);
  } catch (error) {
    console.error("❌ Failed to check OpenRank:", error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}
