import type { NextApiRequest, NextApiResponse } from "next";

const HUB_API_BASE = "https://hub-api.neynar.com/v1";
const API_KEY = process.env.NEYNAR_API_KEY;

// Helper to fetch a cast by FID and hash
async function fetchCastById(fid: string, hash: string) {
  const url = `${HUB_API_BASE}/castById?fid=${fid}&hash=${hash}`;
  const res = await fetch(url, {
    headers: API_KEY ? { api_key: API_KEY } : undefined,
  });
  if (!res.ok) throw new Error(`Failed to fetch cast: ${res.status}`);
  const data = await res.json();
  return data.cast || data;
}

// Helper to fetch direct replies to a cast
async function fetchReplies(fid: string, hash: string) {
  const url = `${HUB_API_BASE}/castsByParent?fid=${fid}&hash=${hash}`;
  const res = await fetch(url, {
    headers: API_KEY ? { api_key: API_KEY } : undefined,
  });
  if (!res.ok) throw new Error(`Failed to fetch replies: ${res.status}`);
  const data = await res.json();
  return data.messages || [];
}

// Recursively fetch all replies (nested)
async function fetchConversationTree(fid: string, hash: string) {
  const rootCast = await fetchCastById(fid, hash);
  const replies = await fetchReplies(fid, hash);
  const nestedReplies = await Promise.all(
    replies.map(async (reply: any) => {
      const child = await fetchConversationTree(
        reply.data.fid.toString(),
        reply.hash
      );
      return child;
    })
  );
  rootCast.replies = nestedReplies;
  return rootCast;
}

// Flatten all replies into a single array
function flattenReplies(cast: any): any[] {
  if (!cast.replies || !Array.isArray(cast.replies)) return [];
  let all: any[] = [];
  for (const reply of cast.replies) {
    all.push(reply);
    all = all.concat(flattenReplies(reply));
  }
  return all;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { fid, hash } = req.query;
  if (!fid || !hash || typeof fid !== "string" || typeof hash !== "string") {
    return res
      .status(400)
      .json({ error: "fid and hash are required as query parameters" });
  }
  try {
    const conversation = await fetchConversationTree(fid, hash);
    const allReplies = flattenReplies(conversation);
    return res.status(200).json({
      root: conversation,
      replies: allReplies,
      replyCount: allReplies.length,
    });
  } catch (error) {
    console.error("Hub conversation API error:", error);
    return res
      .status(500)
      .json({
        error: "Failed to fetch conversation",
        message: error instanceof Error ? error.message : String(error),
      });
  }
}
