// === CONFIG ===
const API_KEY = "3624240B-BD17-43E9-B412-333A77ADE5FE";
const FID = "203666";
const fetch = require("node-fetch");
const today = new Date().toISOString().split("T")[0];

function timeAgo(dateString) {
  const now = new Date();
  const then = new Date(dateString);
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

function flattenReplies(replies) {
  let all = [];
  for (const reply of replies) {
    all.push(reply);
    if (reply.direct_replies && reply.direct_replies.length > 0) {
      all = all.concat(flattenReplies(reply.direct_replies));
    }
  }
  return all;
}

(async () => {
  try {
    console.log("🔍 Starting script...");
    console.log(`📅 Today's date: ${today}`);

    // === Step 1: Fetch your recent casts ===
    const userCastsRes = await fetch(
      `https://api.neynar.com/v2/farcaster/feed/user/casts?limit=25&fid=${FID}`,
      { headers: { "x-api-key": API_KEY } }
    ).then((res) => res.json());

    if (!userCastsRes || !Array.isArray(userCastsRes.casts)) {
      console.log("No recent casts found.");
      return;
    }

    let unrepliedCount = 0;
    const unrepliedDetails = [];

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
        const username = replies[0]?.author?.username || "(unknown)";
        const timeAgoStr = timeAgo(replies[0]?.timestamp || cast.timestamp);
        unrepliedDetails.push({ username, timeAgo: timeAgoStr });
      }
    }

    console.log(`\n📬 You have ${unrepliedCount} unreplied comments today.`);
    if (unrepliedDetails.length > 0) {
      console.log("\nUnreplied comments:");
      unrepliedDetails.forEach((item, idx) => {
        console.log(`  ${idx + 1}. @${item.username} — ${item.timeAgo}`);
      });
    }
  } catch (error) {
    console.error("💥 Script crashed with error:", error);
    console.error("📍 Error stack:", error.stack);
  }
})();
