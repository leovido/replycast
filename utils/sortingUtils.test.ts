import type { UnrepliedDetail } from "@/types/types";
import type { QuotientScore } from "@/hooks/useQuotient";
import type { OpenRankData } from "@/types/types";

// Mock data for testing
const mockConversations: UnrepliedDetail[] = [
  {
    username: "user1",
    timeAgo: "2 hours ago",
    timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    castUrl: "https://example.com/cast1",
    text: "Short message",
    avatarUrl: "https://example.com/avatar1.jpg",
    castHash: "hash1",
    authorFid: 1,
    originalCastText: "Original cast 1",
    originalCastHash: "original1",
    originalAuthorUsername: "author1",
    replyCount: 5,
  },
  {
    username: "user2",
    timeAgo: "1 hour ago",
    timestamp: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
    castUrl: "https://example.com/cast2",
    text: "This is a medium length message that should be categorized as medium",
    avatarUrl: "https://example.com/avatar2.jpg",
    castHash: "hash2",
    authorFid: 2,
    originalCastText: "Original cast 2",
    originalCastHash: "original2",
    originalAuthorUsername: "author2",
    replyCount: 3,
  },
  {
    username: "user3",
    timeAgo: "3 hours ago",
    timestamp: Date.now() - 3 * 60 * 60 * 1000, // 3 hours ago
    castUrl: "https://example.com/cast3",
    text: "This is a very long message that should definitely be categorized as long because it exceeds the fifty character limit",
    avatarUrl: "https://example.com/avatar3.jpg",
    castHash: "hash3",
    authorFid: 3,
    originalCastText: "Original cast 3",
    originalCastHash: "original3",
    originalAuthorUsername: "author3",
    replyCount: 7,
  },
];

const mockQuotientScores: Record<number, QuotientScore | null> = {
  1: {
    fid: 1,
    username: "user1",
    quotientScore: 0.3,
    quotientScoreRaw: 0.3,
    quotientRank: 100,
    quotientProfileUrl: "https://example.com/profile1",
  },
  2: {
    fid: 2,
    username: "user2",
    quotientScore: 0.7,
    quotientScoreRaw: 0.7,
    quotientRank: 50,
    quotientProfileUrl: "https://example.com/profile2",
  },
  3: {
    fid: 3,
    username: "user3",
    quotientScore: 0.5,
    quotientScoreRaw: 0.5,
    quotientRank: 75,
    quotientProfileUrl: "https://example.com/profile3",
  },
};

const mockOpenRankData: Record<number, OpenRankData> = {
  1: {
    following: { rank: 100, score: 0.1, percentile: 10 },
    engagement: { rank: 200, score: 0.2, percentile: 20 },
  },
  2: {
    following: { rank: 50, score: 0.5, percentile: 50 },
    engagement: { rank: 100, score: 0.4, percentile: 40 },
  },
  3: {
    following: { rank: 75, score: 0.3, percentile: 30 },
    engagement: { rank: 150, score: 0.3, percentile: 30 },
  },
};

// Helper function to sort conversations (similar to what's used in components)
function sortConversations(
  conversations: UnrepliedDetail[],
  sortOption: string,
  quotientScores: Record<number, QuotientScore | null>,
  openRankData: Record<number, OpenRankData>
): UnrepliedDetail[] {
  return [...conversations].sort((a, b) => {
    switch (sortOption) {
      case "newest":
        return (b.timestamp || 0) - (a.timestamp || 0);
      case "oldest":
        return (a.timestamp || 0) - (b.timestamp || 0);
      case "fid-asc":
        return a.authorFid - b.authorFid;
      case "fid-desc":
        return b.authorFid - a.authorFid;
      case "quotient-asc":
        const quotientA = quotientScores[a.authorFid]?.quotientScore || 0;
        const quotientB = quotientScores[b.authorFid]?.quotientScore || 0;
        return quotientA - quotientB;
      case "quotient-desc":
        const quotientDescA = quotientScores[a.authorFid]?.quotientScore || 0;
        const quotientDescB = quotientScores[b.authorFid]?.quotientScore || 0;
        return quotientDescB - quotientDescA;
      case "openrank-asc":
        const openRankA = openRankData[a.authorFid]?.engagement?.score || 0;
        const openRankB = openRankData[b.authorFid]?.engagement?.score || 0;
        return openRankA - openRankB;
      case "openrank-desc":
        const openRankDescA = openRankData[a.authorFid]?.engagement?.score || 0;
        const openRankDescB = openRankData[b.authorFid]?.engagement?.score || 0;
        return openRankDescB - openRankDescA;
      default:
        return 0;
    }
  });
}

describe("Sorting Utils", () => {
  describe("sortConversations", () => {
    it("should sort by newest first", () => {
      const sorted = sortConversations(
        mockConversations,
        "newest",
        mockQuotientScores,
        mockOpenRankData
      );
      expect(sorted[0].authorFid).toBe(2); // user2 (1 hour ago)
      expect(sorted[1].authorFid).toBe(1); // user1 (2 hours ago)
      expect(sorted[2].authorFid).toBe(3); // user3 (3 hours ago)
    });

    it("should sort by oldest first", () => {
      const sorted = sortConversations(
        mockConversations,
        "oldest",
        mockQuotientScores,
        mockOpenRankData
      );
      expect(sorted[0].authorFid).toBe(3); // user3 (3 hours ago)
      expect(sorted[1].authorFid).toBe(1); // user1 (2 hours ago)
      expect(sorted[2].authorFid).toBe(2); // user2 (1 hour ago)
    });

    it("should sort by FID ascending", () => {
      const sorted = sortConversations(
        mockConversations,
        "fid-asc",
        mockQuotientScores,
        mockOpenRankData
      );
      expect(sorted[0].authorFid).toBe(1);
      expect(sorted[1].authorFid).toBe(2);
      expect(sorted[2].authorFid).toBe(3);
    });

    it("should sort by FID descending", () => {
      const sorted = sortConversations(
        mockConversations,
        "fid-desc",
        mockQuotientScores,
        mockOpenRankData
      );
      expect(sorted[0].authorFid).toBe(3);
      expect(sorted[1].authorFid).toBe(2);
      expect(sorted[2].authorFid).toBe(1);
    });

    it("should sort by quotient score ascending", () => {
      const sorted = sortConversations(
        mockConversations,
        "quotient-asc",
        mockQuotientScores,
        mockOpenRankData
      );
      expect(sorted[0].authorFid).toBe(1); // quotientScore: 0.3
      expect(sorted[1].authorFid).toBe(3); // quotientScore: 0.5
      expect(sorted[2].authorFid).toBe(2); // quotientScore: 0.7
    });

    it("should sort by quotient score descending", () => {
      const sorted = sortConversations(
        mockConversations,
        "quotient-desc",
        mockQuotientScores,
        mockOpenRankData
      );
      expect(sorted[0].authorFid).toBe(2); // quotientScore: 0.7
      expect(sorted[1].authorFid).toBe(3); // quotientScore: 0.5
      expect(sorted[2].authorFid).toBe(1); // quotientScore: 0.3
    });

    it("should sort by OpenRank engagement score ascending", () => {
      const sorted = sortConversations(
        mockConversations,
        "openrank-asc",
        mockQuotientScores,
        mockOpenRankData
      );
      expect(sorted[0].authorFid).toBe(1); // engagement score: 0.2
      expect(sorted[1].authorFid).toBe(3); // engagement score: 0.3
      expect(sorted[2].authorFid).toBe(2); // engagement score: 0.4
    });

    it("should sort by OpenRank engagement score descending", () => {
      const sorted = sortConversations(
        mockConversations,
        "openrank-desc",
        mockQuotientScores,
        mockOpenRankData
      );
      expect(sorted[0].authorFid).toBe(2); // engagement score: 0.4
      expect(sorted[1].authorFid).toBe(3); // engagement score: 0.3
      expect(sorted[2].authorFid).toBe(1); // engagement score: 0.2
    });

    it("should handle missing quotient scores", () => {
      const conversationsWithoutQuotient = [
        { ...mockConversations[0], authorFid: 999 }, // No quotient score
        mockConversations[1],
      ];
      const sorted = sortConversations(
        conversationsWithoutQuotient,
        "quotient-asc",
        mockQuotientScores,
        mockOpenRankData
      );
      expect(sorted[0].authorFid).toBe(999); // Should be first (score: 0)
      expect(sorted[1].authorFid).toBe(2);
    });

    it("should handle missing OpenRank data", () => {
      const conversationsWithoutOpenRank = [
        { ...mockConversations[0], authorFid: 999 }, // No OpenRank data
        mockConversations[1],
      ];
      const sorted = sortConversations(
        conversationsWithoutOpenRank,
        "openrank-asc",
        mockQuotientScores,
        mockOpenRankData
      );
      expect(sorted[0].authorFid).toBe(999); // Should be first (score: 0)
      expect(sorted[1].authorFid).toBe(2);
    });

    it("should return original order for unknown sort option", () => {
      const sorted = sortConversations(
        mockConversations,
        "unknown",
        mockQuotientScores,
        mockOpenRankData
      );
      expect(sorted).toEqual(mockConversations);
    });
  });
});
