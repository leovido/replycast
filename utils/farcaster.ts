import type {
  Cursor,
  FarcasterRepliesResponse,
  UnrepliedDetail,
} from "@/types/types";

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

// Check if timestamp is within the last N calendar days, including today
export function isWithinLastDays(timestamp: number, days: number): boolean {
  if (days <= 1) {
    return isToday(timestamp);
  }
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const windowStartMs = startOfToday.getTime() - (days - 1) * 24 * 60 * 60 * 1000;
  return timestamp >= windowStartMs;
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

  // First, sort by user interactions (likes/recasts) - these get priority
  arr.sort((a, b) => {
    const aHasInteraction = a.hasUserInteraction || false;
    const bHasInteraction = b.hasUserInteraction || false;

    if (aHasInteraction && !bHasInteraction) return -1;
    if (!aHasInteraction && bHasInteraction) return 1;

    // If both have interactions or both don't, continue with normal sorting
    return 0;
  });

  // Apply secondary sorting within each group (interacted vs non-interacted)
  const interactedCasts = arr.filter((d) => d.hasUserInteraction);
  const nonInteractedCasts = arr.filter((d) => !d.hasUserInteraction);

  // Sort each group separately
  const sortGroup = (group: UnrepliedDetail[]) => {
    switch (sortOption) {
      case "newest":
        return group.sort(
          (a, b) => getMinutesAgo(a.timeAgo) - getMinutesAgo(b.timeAgo)
        );
      case "oldest":
        return group.sort(
          (a, b) => getMinutesAgo(b.timeAgo) - getMinutesAgo(a.timeAgo)
        );
      case "fid-asc":
        return group.sort((a, b) => a.authorFid - b.authorFid);
      case "fid-desc":
        return group.sort((a, b) => b.authorFid - a.authorFid);
      case "openrank-asc":
        return group.sort((a, b) => {
          const rankA = openRankRanks[a.authorFid] || Infinity;
          const rankB = openRankRanks[b.authorFid] || Infinity;
          return rankA - rankB;
        });
      case "openrank-desc":
        return group.sort((a, b) => {
          const rankA = openRankRanks[a.authorFid] || 0;
          const rankB = openRankRanks[b.authorFid] || 0;
          return rankB - rankA;
        });
      case "short":
        return group.filter((d) => d.text.length < 20);
      case "medium":
        return group.filter((d) => d.text.length >= 20 && d.text.length <= 50);
      case "long":
        return group.filter((d) => d.text.length > 50);
      default:
        return group;
    }
  };

  // Sort each group and combine them
  const sortedInteracted = sortGroup(interactedCasts);
  const sortedNonInteracted = sortGroup(nonInteractedCasts);

  // Combine with interacted casts first
  const finalResult = [...sortedInteracted, ...sortedNonInteracted];

  return finalResult;
}
