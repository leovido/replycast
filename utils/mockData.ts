import type { UnrepliedDetail, FarcasterRepliesResponse } from "@/types/types";
import type { QuotientScore } from "@/hooks/useQuotient";

export const mockReplies: FarcasterRepliesResponse = {
  unrepliedCount: 6,
  unrepliedDetails: [
    {
      avatarUrl: "https://randomuser.me/api/portraits/women/68.jpg",
      username: "sophia",
      text: "Check out this amazing video! https://youtu.be/avjI3_GIZBw It's absolutely incredible what they've accomplished.",
      timeAgo: "2h",
      timestamp: 1716666666,
      authorFid: 123,
      castUrl: "https://farcaster.xyz/cast/123",
      castHash: "123",
      originalCastText: "Original text",
      originalCastHash: "123",
      originalAuthorUsername: "original_author",
      replyCount: 5,
      likesCount: 12,
      recastsCount: 3,
    },
    {
      avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
      username: "alex",
      text: "Here's a beautiful photo I took: https://picsum.photos/800/600 and also check out this website: https://example.com",
      timeAgo: "1h",
      timestamp: 1716666666,
      authorFid: 124,
      castUrl: "https://farcaster.xyz/cast/124",
      castHash: "124",
      originalCastText: "Original text",
      originalCastHash: "124",
      originalAuthorUsername: "original_author",
      replyCount: 2,
      likesCount: 8,
      recastsCount: 1,
    },
    {
      avatarUrl: "https://randomuser.me/api/portraits/women/65.jpg",
      username: "olivia",
      text: "Just watched this incredible performance: https://youtu.be/dQw4w9WgXcQ and here's a cool image: https://picsum.photos/400/300",
      timeAgo: "5m",
      timestamp: 1716666666,
      authorFid: 125,
      castUrl: "https://farcaster.xyz/cast/125",
      castHash: "125",
      originalCastText: "Original text",
      originalCastHash: "125",
      originalAuthorUsername: "original_author",
      replyCount: 7,
      likesCount: 15,
      recastsCount: 4,
      userLiked: true,
      hasUserInteraction: true,
    },
    {
      avatarUrl: "https://randomuser.me/api/portraits/men/45.jpg",
      username: "mike",
      text: "Found this interesting article: https://farcaster.xyz and some great photos: https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
      timeAgo: "30m",
      timestamp: 1716666666,
      authorFid: 126,
      castUrl: "https://farcaster.xyz/cast/126",
      castHash: "126",
      originalCastText: "Original text",
      originalCastHash: "126",
      originalAuthorUsername: "original_author",
      replyCount: 3,
      likesCount: 6,
      recastsCount: 2,
    },
    {
      avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
      username: "sarah",
      text: "Check out this amazing song: https://open.spotify.com/track/5VP1yXviUwA0KA0ewit5pe?si=4ad99b84f89a461a It's absolutely beautiful!",
      timeAgo: "20m",
      timestamp: 1716666666,
      authorFid: 128,
      castUrl: "https://farcaster.xyz/cast/128",
      castHash: "128",
      originalCastText: "Original text",
      originalCastHash: "128",
      originalAuthorUsername: "original_author",
      replyCount: 4,
      likesCount: 9,
      recastsCount: 3,
    },
    {
      avatarUrl: "https://randomuser.me/api/portraits/women/23.jpg",
      username: "emma",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. No links in this one, just plain text.",
      timeAgo: "15m",
      timestamp: 1716666666,
      authorFid: 127,
      castUrl: "https://farcaster.xyz/cast/127",
      castHash: "127",
      originalCastText: "Original text",
      originalCastHash: "127",
      originalAuthorUsername: "original_author",
      replyCount: 7,
      likesCount: 15,
      recastsCount: 4,
      userLiked: true,
      hasUserInteraction: true,
    },
    {
      avatarUrl: "https://randomuser.me/api/portraits/men/45.jpg",
      username: "mike",
      text: "Found this interesting article: https://farcaster.xyz and some great photos: https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
      timeAgo: "30m",
      timestamp: 1716666666,
      authorFid: 126,
      castUrl: "https://farcaster.xyz/cast/126",
      castHash: "126",
      originalCastText: "Original text",
      originalCastHash: "126",
      originalAuthorUsername: "original_author",
      replyCount: 3,
      likesCount: 6,
      recastsCount: 2,
    },
    {
      avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
      username: "sarah",
      text: "Check out this amazing song: https://open.spotify.com/track/5VP1yXviUwA0KA0ewit5pe?si=4ad99b84f89a461a It's absolutely beautiful!",
      timeAgo: "20m",
      timestamp: 1716666666,
      authorFid: 128,
      castUrl: "https://farcaster.xyz/cast/128",
      castHash: "128",
      originalCastText: "Original text",
      originalCastHash: "128",
      originalAuthorUsername: "original_author",
      replyCount: 4,
      likesCount: 9,
      recastsCount: 3,
    },
    {
      avatarUrl: "https://randomuser.me/api/portraits/women/23.jpg",
      username: "emma",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. No links in this one, just plain text.",
      timeAgo: "15m",
      timestamp: 1716666666,
      authorFid: 127,
      castUrl: "https://farcaster.xyz/cast/127",
      castHash: "127",
      originalCastText: "Original text",
      originalCastHash: "127",
      originalAuthorUsername: "original_author",
      replyCount: 1,
      likesCount: 3,
      recastsCount: 0,
      userRecasted: true,
      hasUserInteraction: true,
    },
  ],
  message: "Success",
};

// Mock Quotient scores with various tiers for testing
export const mockQuotientScores: Record<number, QuotientScore> = {
  123: {
    fid: 123,
    username: "alice",
    quotientScore: 0.95,
    quotientScoreRaw: 0.95,
    quotientRank: 50,
    quotientProfileUrl: "https://quotient.social/user/123",
  },
  456: {
    fid: 456,
    username: "bob",
    quotientScore: 0.82,
    quotientScoreRaw: 0.82,
    quotientRank: 500,
    quotientProfileUrl: "https://quotient.social/user/456",
  },
  789: {
    fid: 789,
    username: "charlie",
    quotientScore: 0.65,
    quotientScoreRaw: 0.65,
    quotientRank: 2500,
    quotientProfileUrl: "https://quotient.social/user/789",
  },
  101: {
    fid: 101,
    username: "diana",
    quotientScore: 0.72,
    quotientScoreRaw: 0.72,
    quotientRank: 1200,
    quotientProfileUrl: "https://quotient.social/user/101",
  },
  202: {
    fid: 202,
    username: "eve",
    quotientScore: 0.88,
    quotientScoreRaw: 0.88,
    quotientRank: 300,
    quotientProfileUrl: "https://quotient.social/user/202",
  },
  303: {
    fid: 303,
    username: "frank",
    quotientScore: 0.55,
    quotientScoreRaw: 0.55,
    quotientRank: 5000,
    quotientProfileUrl: "https://quotient.social/user/303",
  },
  404: {
    fid: 404,
    username: "grace",
    quotientScore: 0.91,
    quotientScoreRaw: 0.91,
    quotientRank: 100,
    quotientProfileUrl: "https://quotient.social/user/404",
  },
  505: {
    fid: 505,
    username: "henry",
    quotientScore: 0.78,
    quotientScoreRaw: 0.78,
    quotientRank: 800,
    quotientProfileUrl: "https://quotient.social/user/505",
  },
};

// Mock OpenRank scores
export const mockOpenRankScores: Record<number, number> = {
  123: 1500,
  456: 5000,
  789: 15000,
  101: 8000,
  202: 2500,
  303: 25000,
  404: 1200,
  505: 3500,
};

// Mock conversation data
export const mockConversations: UnrepliedDetail[] = [
  {
    username: "alice",
    timeAgo: "2 hours ago",
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    castUrl: "https://warpcast.com/alice/0x123",
    text: "This is a really interesting conversation about Farcaster!",
    avatarUrl: "https://i.imgur.com/avatar1.jpg",
    castHash: "0x1234567890abcdef",
    authorFid: 123,
    originalCastText: "What do you think about the new features?",
    originalCastHash: "0xabcdef1234567890",
    originalAuthorUsername: "bob",
    replyCount: 5,
    userLiked: false,
    userRecasted: false,
    hasUserInteraction: false,
    likesCount: 12,
    recastsCount: 3,
  },
  {
    username: "bob",
    timeAgo: "4 hours ago",
    timestamp: Date.now() - 4 * 60 * 60 * 1000,
    castUrl: "https://warpcast.com/bob/0x456",
    text: "Short reply here",
    avatarUrl: "https://i.imgur.com/avatar2.jpg",
    castHash: "0x4567890abcdef123",
    authorFid: 456,
    originalCastText: "The ecosystem is growing rapidly",
    originalCastHash: "0x1234567890abcdef",
    originalAuthorUsername: "charlie",
    replyCount: 3,
    userLiked: true,
    userRecasted: false,
    hasUserInteraction: true,
    likesCount: 8,
    recastsCount: 1,
  },
  {
    username: "charlie",
    timeAgo: "6 hours ago",
    timestamp: Date.now() - 6 * 60 * 60 * 1000,
    castUrl: "https://warpcast.com/charlie/0x789",
    text: "This is a much longer conversation that spans multiple lines and contains a lot of interesting content about the future of decentralized social media platforms and how they might evolve over time.",
    avatarUrl: "https://i.imgur.com/avatar3.jpg",
    castHash: "0x7890abcdef123456",
    authorFid: 789,
    originalCastText: "Long-form content is important",
    originalCastHash: "0xabcdef1234567890",
    originalAuthorUsername: "diana",
    replyCount: 7,
    userLiked: false,
    userRecasted: true,
    hasUserInteraction: true,
    likesCount: 25,
    recastsCount: 8,
  },
  {
    username: "diana",
    timeAgo: "1 day ago",
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    castUrl: "https://warpcast.com/diana/0x101",
    text: "Medium length response",
    avatarUrl: "https://i.imgur.com/avatar4.jpg",
    castHash: "0x1011121314151617",
    authorFid: 101,
    originalCastText: "Community building takes time",
    originalCastHash: "0x1716151413121110",
    originalAuthorUsername: "eve",
    replyCount: 4,
    userLiked: false,
    userRecasted: false,
    hasUserInteraction: false,
    likesCount: 15,
    recastsCount: 2,
  },
  {
    username: "eve",
    timeAgo: "2 days ago",
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    castUrl: "https://warpcast.com/eve/0x202",
    text: "Another interesting point",
    avatarUrl: "https://i.imgur.com/avatar5.jpg",
    castHash: "0x2021222324252627",
    authorFid: 202,
    originalCastText: "Innovation happens at the edges",
    originalCastHash: "0x2726252423222120",
    originalAuthorUsername: "frank",
    replyCount: 6,
    userLiked: true,
    userRecasted: false,
    hasUserInteraction: true,
    likesCount: 18,
    recastsCount: 4,
  },
];

// Mock Farcaster replies response
export const mockFarcasterRepliesResponse: FarcasterRepliesResponse = {
  unrepliedCount: mockConversations.length,
  unrepliedDetails: mockConversations,
  message: "Successfully retrieved unreplied conversations",
  nextCursor: "mock-cursor-123",
};

// Mock user data
export const mockUser = {
  fid: 12345,
  username: "devuser",
  displayName: "Developer User",
  pfpUrl: "https://i.imgur.com/dev-avatar.jpg",
};

// Mock Quotient API response
export const mockQuotientResponse = {
  data: Object.values(mockQuotientScores),
  count: Object.keys(mockQuotientScores).length,
};

// Mock OpenRank API response
export const mockOpenRankResponse = {
  ranks: mockOpenRankScores,
};

// Helper function to get mock data for specific FIDs
export function getMockQuotientScores(
  fids: number[]
): typeof mockQuotientResponse {
  const filteredData = fids
    .map((fid) => mockQuotientScores[fid])
    .filter(Boolean);

  return {
    data: filteredData,
    count: filteredData.length,
  };
}

export function getMockOpenRankScores(
  fids: number[]
): typeof mockOpenRankResponse {
  const filteredRanks: Record<string, number> = {};

  fids.forEach((fid) => {
    if (mockOpenRankScores[fid] !== undefined) {
      filteredRanks[fid.toString()] = mockOpenRankScores[fid];
    }
  });

  return {
    ranks: filteredRanks,
  };
}

// Mock delay function to simulate network latency
export function mockDelay(ms: number = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Environment check for mocking
export const shouldUseMocks = () => {
  if (typeof window === "undefined") return false; // Server-side
  return process.env.NEXT_PUBLIC_USE_MOCKS === "true";
};
