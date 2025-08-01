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
  return data.messages || data;
}

// Helper to fetch direct replies to a cast
async function fetchReplies(fid: string, hash: string) {
  const url = `${HUB_API_BASE}/castsByParent?fid=${fid}&hash=${hash}&pageSize=3`;
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

// Helper: Check if the author has replied in a subtree
function authorHasReplied(subtree: any, authorFid: number): boolean {
  if (!subtree) return false;
  if (subtree.data && subtree.data.fid === authorFid) return true;
  if (subtree.replies && Array.isArray(subtree.replies)) {
    return subtree.replies.some((child: any) =>
      authorHasReplied(child, authorFid)
    );
  }
  return false;
}

// Collect all replies where the author has not replied in the sub-thread
function collectUnrepliedReplies(
  subtree: any,
  authorFid: number,
  parentIsAuthor: boolean
): any[] {
  if (!subtree.replies || !Array.isArray(subtree.replies)) return [];
  let unreplied: any[] = [];
  for (const reply of subtree.replies) {
    // If the author has replied anywhere in this sub-thread, skip this reply
    if (authorHasReplied(reply, authorFid)) {
      continue;
    }
    // If the reply itself is not by the author, add it
    if (reply.data && reply.data.fid !== authorFid) {
      unreplied.push(reply);
    }
    // Recurse into children
    unreplied = unreplied.concat(
      collectUnrepliedReplies(reply, authorFid, false)
    );
  }
  return unreplied;
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
    const authorFid = conversation.data?.fid;
    if (!authorFid) {
      return res
        .status(400)
        .json({ error: "Could not determine author FID from root cast" });
    }
    const unrepliedReplies = collectUnrepliedReplies(
      conversation,
      authorFid,
      true
    );
    return res.status(200).json({
      root: conversation,
      unrepliedReplies,
      unrepliedCount: unrepliedReplies.length,
    });
  } catch (error) {
    console.error("Hub unreplied API error:", error);
    return res
      .status(500)
      .json({
        error: "Failed to fetch unreplied replies",
        message: error instanceof Error ? error.message : String(error),
      });
  }
}
