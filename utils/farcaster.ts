import type { Cursor, FarcasterRepliesResponse, UnrepliedDetail } from "@/types/types";

// Constants
export const MAX_CHARACTERS = 320; // Farcaster cast limit

// Utility function to check if a timestamp is from today
export function isToday(timestamp: number): boolean {
  const replyDate = new Date(timestamp);
  const now = new Date();
  return (
    replyDate.getFullYear() === now.getFullYear() &&
    replyDate.getMonth() === now.getMonth() &&
    replyDate.getDate() === now.getDate()
  );
}

// API function to fetch today's replies
export async function fetchTodaysReplies(
  fid: number,
  limit = 25,
  cursor: Cursor
): Promise<FarcasterRepliesResponse> {
  let allReplies = [];
  let keepGoing = true;

  while (keepGoing) {
    let url = `/api/farcaster-notification-replies?fid=${fid}&limit=${limit}`;

    if (cursor) {
      url += `&cursor=${cursor}`;
    }

    const res = await fetch(url);
    const data: FarcasterRepliesResponse = await res.json();

    if (!res.ok || !data.unrepliedDetails) {
      return {
        unrepliedCount: 0,
        unrepliedDetails: [],
        message: "No unreplied comments found",
      };
    }

    for (const reply of data.unrepliedDetails) {
      if (!isToday(reply.timestamp)) {
        keepGoing = false;
        break;
      }
      allReplies.push(reply);
    }

    cursor = data.nextCursor;
    if (!cursor) break;
  }

  const unrepliedDetails = allReplies.map((reply) => ({
    username: reply.username,
    timeAgo: reply.timeAgo,
    timestamp: reply.timestamp,
    castUrl: reply.castUrl,
    text: reply.text,
    avatarUrl: reply.avatarUrl,
    castHash: reply.castHash,
    authorFid: reply.authorFid,
    originalCastText: reply.originalCastText,
    originalCastHash: reply.originalCastHash,
    originalAuthorUsername: reply.originalAuthorUsername,
    replyCount: reply.replyCount,
  }));

  const response: FarcasterRepliesResponse = {
    unrepliedCount: unrepliedDetails.length,
    unrepliedDetails: unrepliedDetails,
    message: `You have ${unrepliedDetails.length} unreplied comments today.`,
  };
  return response;
}

// Utility function to convert time ago to minutes
export function getMinutesAgo(timeAgo: string): number {
  const match = timeAgo.match(/(\d+)([mhd])/);
  if (!match) return 0;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  if (unit === "m") return value;
  if (unit === "h") return value * 60;
  if (unit === "d") return value * 60 * 24;
  return 0;
}

// Sort function for unreplied details
export function sortDetails(
  details: UnrepliedDetail[],
  sortOption: string,
  openRankRanks: Record<number, number | null>
): UnrepliedDetail[] {
  const arr = [...details]; // Create copy to avoid mutation
  switch (sortOption) {
    case "newest":
      arr.sort((a, b) => getMinutesAgo(a.timeAgo) - getMinutesAgo(b.timeAgo));
      break;
    case "oldest":
      arr.sort((a, b) => getMinutesAgo(b.timeAgo) - getMinutesAgo(a.timeAgo));
      break;
    case "fid-asc":
      arr.sort((a, b) => a.authorFid - b.authorFid);
      break;
    case "fid-desc":
      arr.sort((a, b) => b.authorFid - a.authorFid);
      break;
    case "openrank-asc":
      arr.sort((a, b) => {
        const rankA = openRankRanks[a.authorFid] || Infinity;
        const rankB = openRankRanks[b.authorFid] || Infinity;
        return rankA - rankB;
      });
      break;
    case "openrank-desc":
      arr.sort((a, b) => {
        const rankA = openRankRanks[a.authorFid] || 0;
        const rankB = openRankRanks[b.authorFid] || 0;
        return rankB - rankA;
      });
      break;
    case "short":
      return arr.filter((d) => d.text.length < 20);
    case "medium":
      return arr.filter((d) => d.text.length >= 20 && d.text.length <= 50);
    case "long":
      return arr.filter((d) => d.text.length > 50);
    default:
      break;
  }
  return arr;
}