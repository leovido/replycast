export interface User {
  pfpUrl?: string;
  username?: string;
  displayName?: string;
  fid: number;
}

export type Cursor = string | null | undefined;

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
}

export interface FarcasterRepliesResponse {
  unrepliedCount: number;
  unrepliedDetails: UnrepliedDetail[];
  message: string;
  nextCursor?: string | null;
}
