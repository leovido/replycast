export interface User {
  pfpUrl?: string;
  username?: string;
  displayName?: string;
  fid: number;
}

export type Cursor = string | null | undefined;

export type ThemeMode = "dark" | "light" | "Farcaster" | "neon";

export interface UnrepliedDetail {
  username: string;
  timeAgo: string;
  timestamp: number;
  castUrl: string;
  text: string;
  avatarUrl: string;
  castHash: string;
  authorFid: number;
  originalCastText: string;
  originalCastHash: string;
  originalAuthorUsername: string;
  replyCount: number;
  // User interaction data
  userLiked?: boolean;
  userRecasted?: boolean;
  hasUserInteraction?: boolean;
  // Reaction counts
  likesCount?: number;
  recastsCount?: number;
  // Embeds data
  embeds?: Array<{
    url?: string;
    cast_id?: {
      fid: number;
      hash: string;
    };
    metadata?: {
      content_type?: string;
      content_length?: number;
      image?: {
        width_px: number;
        height_px: number;
      };
    };
  }>;
}

export interface FarcasterRepliesResponse {
  unrepliedCount: number;
  unrepliedDetails: UnrepliedDetail[];
  message: string;
  nextCursor?: string | null;
}

export interface OpenRankScore {
  rank: number | null;
  score: number | null;
  percentile: number | null;
}

export interface OpenRankData {
  following: OpenRankScore;
  engagement: OpenRankScore;
}
