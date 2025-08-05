#!/usr/bin/env tsx

import { ethers } from "ethers";

const openRankAddress = "0xaC1EBa9e86740e38F0aCbE016d32b3B015206cd8";
const openRankAbi = [
  "function getRanksAndScoresForFIDs(uint256[] fids) view returns (uint256[] ranks, uint256[] scores)",
];

interface OpenRankResult {
  fid: number;
  rank: number | null;
  score?: number | null;
}

async function checkOpenRank(fids: number[]): Promise<OpenRankResult[]> {
  try {
    console.log(
      `🔍 Checking OpenRank for ${fids.length} FID(s): ${fids.join(", ")}`
    );

    const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
    const contract = new ethers.Contract(
      openRankAddress,
      openRankAbi,
      provider
    );

    // Call the batch method
    const [ranks, scores] = await contract.getRanksAndScoresForFIDs(fids);

    const results: OpenRankResult[] = [];

    fids.forEach((fid, index) => {
      const rank = ranks[index] ? parseInt(ranks[index].toString()) : null;
      const score = scores[index] ? parseInt(scores[index].toString()) : null;

      results.push({
        fid,
        rank,
        score,
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
  console.log("=".repeat(50));

  results.forEach(({ fid, rank, score }) => {
    const rankDisplay = rank ? `#${rank.toLocaleString()}` : "N/A";
    const scoreDisplay = score ? score.toLocaleString() : "N/A";

    console.log(
      `FID ${fid.toString().padStart(8)} | Rank: ${rankDisplay.padStart(
        10
      )} | Score: ${scoreDisplay.padStart(12)}`
    );
  });

  console.log("=".repeat(50));

  // Summary
  const validRanks = results.filter((r) => r.rank !== null);
  if (validRanks.length > 0) {
    const avgRank = Math.round(
      validRanks.reduce((sum, r) => sum + (r.rank || 0), 0) / validRanks.length
    );
    const minRank = Math.min(...validRanks.map((r) => r.rank || 0));
    const maxRank = Math.max(...validRanks.map((r) => r.rank || 0));

    console.log(`\n📈 Summary:`);
    console.log(`   Average Rank: #${avgRank.toLocaleString()}`);
    console.log(`   Best Rank: #${minRank.toLocaleString()}`);
    console.log(`   Worst Rank: #${maxRank.toLocaleString()}`);
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
