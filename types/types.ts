export interface User {
  pfpUrl?: string;
  username?: string;
  displayName?: string;
  fid: number;
}

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
}

export interface FarcasterRepliesResponse {
  unrepliedCount: number;
  unrepliedDetails: UnrepliedDetail[];
  message: string;
  nextCursor?: string | null;
}
