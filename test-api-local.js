const http = require('http');
const url = require('url');
import dotenv from 'dotenv';
dotenv.config();

// === CONFIG ===
const API_KEY = process.env.NEYNAR_API_KEY;

const timeAgo = (dateString) => {
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

const flattenReplies = (replies) => {
  let all = [];
  for (const reply of replies) {
    all.push(reply);
    if (reply.direct_replies && reply.direct_replies.length > 0) {
      all = all.concat(flattenReplies(reply.direct_replies));
    }
  }
  return all;
}

async function handleFarcasterReplies(fid) {
  if (!fid || typeof fid !== 'string') {
    return { status: 400, data: { error: 'FID parameter is required' } };
  }

  if (!API_KEY) {
    return { status: 500, data: { error: 'API key not configured' } };
  }

  try {
    // === Step 1: Fetch your recent casts ===
    const userCastsRes = await fetch(
      `https://api.neynar.com/v2/farcaster/feed/user/casts?limit=25&fid=${fid}`,
      { headers: { "x-api-key": API_KEY } }
    ).then((res) => {
      if (!res || typeof res.json !== 'function') {
        throw new Error('Invalid response from fetch');
      }
      return res.json();
    });

    if (!userCastsRes || !Array.isArray(userCastsRes.casts)) {
      return {
        status: 200,
        data: {
          unrepliedCount: 0,
          unrepliedDetails: [],
          message: "No recent casts found."
        }
      };
    }

    let unrepliedCount = 0;
    const unrepliedDetails = [];

    for (const cast of userCastsRes.casts) {
      const hash = cast.hash;
      // === Step 2: Fetch the conversation for each cast ===
      const convoRes = await fetch(
        `https://api.neynar.com/v2/farcaster/cast/conversation?identifier=${hash}&type=hash&reply_depth=2&limit=50`,
        { headers: { "x-api-key": API_KEY } }
      ).then((res) => {
        if (!res || typeof res.json !== 'function') {
          throw new Error('Invalid response from fetch');
        }
        return res.json();
      });

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
        const username = replies[0]?.author?.username || "(unknown)";
        const timeAgoStr = timeAgo(replies[0]?.timestamp || cast.timestamp);
        const castUrl = `https://farcaster.xyz/${cast.author?.username || 'unknown'}/${cast.hash}`;
        unrepliedDetails.push({ username, timeAgo: timeAgoStr, castUrl });
      }
    }

    return {
      status: 200,
      data: {
        unrepliedCount,
        unrepliedDetails,
        message: `You have ${unrepliedCount} unreplied comments today.`
      }
    };

  } catch (error) {
    return {
      status: 500,
      data: {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
        details: error.stack
      }
    };
  }
}

// Create a simple HTTP server
const server = http.createServer(async (req, res) => {
  // Parse the URL
  const parsedUrl = url.parse(req.url, true);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const { fid } = parsedUrl.query;
  const result = await handleFarcasterReplies(fid);
  
  res.writeHead(result.status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(result.data));
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Local API server running on http://localhost:${PORT}`);
  console.log(`📝 Test with: curl "http://localhost:${PORT}/?fid=203666"`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Export functions for testing
module.exports = {
  timeAgo,
  flattenReplies,
  handleFarcasterReplies
}; 