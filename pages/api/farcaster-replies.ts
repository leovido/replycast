import { NextApiRequest, NextApiResponse } from 'next';

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
}

const flattenReplies = (replies: any[]): any[] => {
  let all: any[] = [];
  for (const reply of replies) {
    all.push(reply);
    if (reply.direct_replies && reply.direct_replies.length > 0) {
      all = all.concat(flattenReplies(reply.direct_replies));
    }
  }
  return all;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Add cache headers - cache for 5 minutes
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

  const { fid } = req.query;
  
  if (!fid || typeof fid !== 'string') {
    return res.status(400).json({ error: 'FID parameter is required' });
  }

  if (!API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    // === Step 1: Fetch your recent casts ===
    const userCastsRes = await fetch(
      `https://api.neynar.com/v2/farcaster/feed/user/casts?limit=100&fid=${fid}`,
      { headers: { "x-api-key": API_KEY } }
    ).then((res) => res.json());

    if (!userCastsRes || !Array.isArray(userCastsRes.casts)) {
      return res.status(200).json({
        unrepliedCount: 0,
        unrepliedDetails: [],
        message: "No recent casts found."
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

    for (const cast of userCastsRes.casts) {
      const hash = cast.hash;
      // === Step 2: Fetch the conversation for each cast ===
      const convoRes = await fetch(
        `https://api.neynar.com/v2/farcaster/cast/conversation?identifier=${hash}&type=hash&reply_depth=2&limit=50`,
        { headers: { "x-api-key": API_KEY } }
      ).then((res) => res.json());

      const convo = convoRes.conversation?.cast;
      if (!convo) continue;
      const rootAuthor = convo.author.fid;

      const replies = flattenReplies(convo.direct_replies ?? []);

      // Check 1: does the cast have (any) replies?
      const hasReplies = replies.length > 0;
      // Check 2: did the original author reply to *someone else*?
      const authorReplies = replies.filter(
        (c) => c.author.fid === rootAuthor && c.parent_hash !== hash
      );
      const authorResponded = authorReplies.length > 0;

      if (hasReplies && !authorResponded) {
        unrepliedCount++;
        const firstReply = replies[0];
        const username = firstReply?.author?.username || "(unknown)";
        const timeAgoStr = timeAgo(firstReply?.timestamp || cast.timestamp);
        const castUrl = `https://farcaster.xyz/${cast.author?.username || 'unknown'}/${cast.hash}`;
        const text = firstReply?.text || '';
        const avatarUrl = firstReply?.author?.pfp_url || '';
        const castHash = cast.hash;
        const authorFid = firstReply?.author?.fid || 0;
        const originalCastText = cast.text || '';
        const originalCastHash = cast.hash;
        const originalAuthorUsername = cast.author?.username || 'unknown';
        const replyCount = replies.length;
        
        unrepliedDetails.push({ 
          username, 
          timeAgo: timeAgoStr, 
          castUrl, 
          text, 
          avatarUrl, 
          castHash, 
          authorFid,
          originalCastText,
          originalCastHash,
          originalAuthorUsername,
          replyCount
        });
      }
    }

    return res.status(200).json({
      unrepliedCount,
      unrepliedDetails,
      message: `You have ${unrepliedCount} unreplied comments today.`
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
} 