import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from "ethers";

const openRankAddress = "0xaC1EBa9e86740e38F0aCbE016d32b3B015206cd8";
const openRankAbi = [
  "function getRanksAndScoresForFIDs(uint256[] fids) view returns (uint256[] ranks, uint256[] scores)"
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fids } = req.query;
  
  if (!fids) {
    return res.status(400).json({ error: 'FIDs parameter is required' });
  }

  try {
    const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
    const contract = new ethers.Contract(openRankAddress, openRankAbi, provider);
    
    // Handle both single FID and comma-separated FIDs
    let fidArray: string[];
    if (Array.isArray(fids)) {
      fidArray = fids;
    } else {
      // Split by comma if it's a string
      fidArray = fids.split(',').map(fid => fid.trim());
    }
    
    const numericFids = fidArray.map(fid => parseInt(fid)).filter(fid => !isNaN(fid));
    
    if (numericFids.length === 0) {
      return res.status(400).json({ error: 'No valid FIDs provided' });
    }
    
    // Call the batch method
    const [ranks] = await contract.getRanksAndScoresForFIDs(numericFids);
    
    // Create result objects
    const rankMap: Record<string, number | null> = {};
    
    numericFids.forEach((fid, index) => {
      const rank = ranks[index] ? parseInt(ranks[index].toString()) : null;
      
      rankMap[fid.toString()] = rank;
    });
    
    res.status(200).json({ 
      ranks: rankMap,
    });
  } catch (error) {
    console.error("Error fetching OpenRank data:", error);
    res.status(500).json({ error: 'Failed to fetch OpenRank data' });
  }
}