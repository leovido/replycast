import {
  UnrepliedDetail,
  FarcasterRepliesResponse,
  OpenRankScore,
  OpenRankData,
} from "./types";

describe("types", () => {
  describe("UnrepliedDetail", () => {
    it("allows all required fields", () => {
      const detail: UnrepliedDetail = {
        username: "testuser",
        timeAgo: "2h ago",
        timestamp: 1640995200000,
        castUrl: "https://farcaster.xyz/testuser/0x123",
        text: "Test cast text",
        avatarUrl: "https://example.com/avatar.jpg",
        castHash: "0x123",
        authorFid: 123,
        originalCastText: "Original cast text",
        originalCastHash: "0x456",
        originalAuthorUsername: "originaluser",
        replyCount: 5,
      };

      expect(detail.username).toBe("testuser");
      expect(detail.authorFid).toBe(123);
    });

    it("allows optional user interaction fields", () => {
      const detail: UnrepliedDetail = {
        username: "testuser",
        timeAgo: "2h ago",
        timestamp: 1640995200000,
        castUrl: "https://farcaster.xyz/testuser/0x123",
        text: "Test cast text",
        avatarUrl: "https://example.com/avatar.jpg",
        castHash: "0x123",
        authorFid: 123,
        originalCastText: "Original cast text",
        originalCastHash: "0x456",
        originalAuthorUsername: "originaluser",
        replyCount: 5,
        userLiked: true,
        userRecasted: false,
        hasUserInteraction: true,
        likesCount: 10,
        recastsCount: 3,
      };

      expect(detail.userLiked).toBe(true);
      expect(detail.likesCount).toBe(10);
    });

    it("allows embeds with URL", () => {
      const detail: UnrepliedDetail = {
        username: "testuser",
        timeAgo: "2h ago",
        timestamp: 1640995200000,
        castUrl: "https://farcaster.xyz/testuser/0x123",
        text: "Test cast text",
        avatarUrl: "https://example.com/avatar.jpg",
        castHash: "0x123",
        authorFid: 123,
        originalCastText: "Original cast text",
        originalCastHash: "0x456",
        originalAuthorUsername: "originaluser",
        replyCount: 5,
        embeds: [
          {
            url: "https://example.com/image.jpg",
            metadata: {
              content_type: "image/jpeg",
              content_length: 12345,
              image: {
                width_px: 800,
                height_px: 600,
              },
            },
          },
        ],
      };

      expect(detail.embeds).toHaveLength(1);
      expect(detail.embeds![0].url).toBe("https://example.com/image.jpg");
      expect(detail.embeds![0].metadata?.content_type).toBe("image/jpeg");
    });

    it("allows embeds with cast_id", () => {
      const detail: UnrepliedDetail = {
        username: "testuser",
        timeAgo: "2h ago",
        timestamp: 1640995200000,
        castUrl: "https://farcaster.xyz/testuser/0x123",
        text: "Test cast text",
        avatarUrl: "https://example.com/avatar.jpg",
        castHash: "0x123",
        authorFid: 123,
        originalCastText: "Original cast text",
        originalCastHash: "0x456",
        originalAuthorUsername: "originaluser",
        replyCount: 5,
        embeds: [
          {
            cast_id: {
              fid: 789,
              hash: "0xembedded",
            },
          },
        ],
      };

      expect(detail.embeds).toHaveLength(1);
      expect(detail.embeds![0].cast_id?.fid).toBe(789);
      expect(detail.embeds![0].cast_id?.hash).toBe("0xembedded");
    });

    it("allows embeds with null metadata values", () => {
      const detail: UnrepliedDetail = {
        username: "testuser",
        timeAgo: "2h ago",
        timestamp: 1640995200000,
        castUrl: "https://farcaster.xyz/testuser/0x123",
        text: "Test cast text",
        avatarUrl: "https://example.com/avatar.jpg",
        castHash: "0x123",
        authorFid: 123,
        originalCastText: "Original cast text",
        originalCastHash: "0x456",
        originalAuthorUsername: "originaluser",
        replyCount: 5,
        embeds: [
          {
            url: "https://example.com/image.jpg",
            metadata: {
              content_type: null,
              content_length: null,
            },
          },
        ],
      };

      expect(detail.embeds![0].metadata?.content_type).toBeNull();
      expect(detail.embeds![0].metadata?.content_length).toBeNull();
    });

    it("allows mixed embeds array", () => {
      const detail: UnrepliedDetail = {
        username: "testuser",
        timeAgo: "2h ago",
        timestamp: 1640995200000,
        castUrl: "https://farcaster.xyz/testuser/0x123",
        text: "Test cast text",
        avatarUrl: "https://example.com/avatar.jpg",
        castHash: "0x123",
        authorFid: 123,
        originalCastText: "Original cast text",
        originalCastHash: "0x456",
        originalAuthorUsername: "originaluser",
        replyCount: 5,
        embeds: [
          {
            url: "https://example.com/image.jpg",
            metadata: {
              content_type: "image/jpeg",
              content_length: 12345,
            },
          },
          {
            cast_id: {
              fid: 789,
              hash: "0xembedded",
            },
          },
          {
            url: "https://youtube.com/watch?v=abc123",
            metadata: {
              content_type: "text/html",
              content_length: 0,
            },
          },
        ],
      };

      expect(detail.embeds).toHaveLength(3);
      expect(detail.embeds![0]).toHaveProperty("url");
      expect(detail.embeds![1]).toHaveProperty("cast_id");
      expect(detail.embeds![2]).toHaveProperty("url");
    });

    it("allows empty embeds array", () => {
      const detail: UnrepliedDetail = {
        username: "testuser",
        timeAgo: "2h ago",
        timestamp: 1640995200000,
        castUrl: "https://farcaster.xyz/testuser/0x123",
        text: "Test cast text",
        avatarUrl: "https://example.com/avatar.jpg",
        castHash: "0x123",
        authorFid: 123,
        originalCastText: "Original cast text",
        originalCastHash: "0x456",
        originalAuthorUsername: "originaluser",
        replyCount: 5,
        embeds: [],
      };

      expect(detail.embeds).toEqual([]);
    });

    it("allows undefined embeds", () => {
      const detail: UnrepliedDetail = {
        username: "testuser",
        timeAgo: "2h ago",
        timestamp: 1640995200000,
        castUrl: "https://farcaster.xyz/testuser/0x123",
        text: "Test cast text",
        avatarUrl: "https://example.com/avatar.jpg",
        castHash: "0x123",
        authorFid: 123,
        originalCastText: "Original cast text",
        originalCastHash: "0x456",
        originalAuthorUsername: "originaluser",
        replyCount: 5,
      };

      expect(detail.embeds).toBeUndefined();
    });
  });

  describe("FarcasterRepliesResponse", () => {
    it("allows all required fields", () => {
      const response: FarcasterRepliesResponse = {
        unrepliedCount: 5,
        unrepliedDetails: [],
        message: "You have 5 unreplied comments.",
        nextCursor: "cursor123",
      };

      expect(response.unrepliedCount).toBe(5);
      expect(response.nextCursor).toBe("cursor123");
    });

    it("allows null nextCursor", () => {
      const response: FarcasterRepliesResponse = {
        unrepliedCount: 0,
        unrepliedDetails: [],
        message: "No unreplied comments.",
        nextCursor: null,
      };

      expect(response.nextCursor).toBeNull();
    });

    it("allows undefined nextCursor", () => {
      const response: FarcasterRepliesResponse = {
        unrepliedCount: 0,
        unrepliedDetails: [],
        message: "No unreplied comments.",
      };

      expect(response.nextCursor).toBeUndefined();
    });
  });

  describe("OpenRankScore", () => {
    it("allows all fields with numbers", () => {
      const score: OpenRankScore = {
        rank: 100,
        score: 0.85,
        percentile: 75,
      };

      expect(score.rank).toBe(100);
      expect(score.score).toBe(0.85);
      expect(score.percentile).toBe(75);
    });

    it("allows null values", () => {
      const score: OpenRankScore = {
        rank: null,
        score: null,
        percentile: null,
      };

      expect(score.rank).toBeNull();
      expect(score.score).toBeNull();
      expect(score.percentile).toBeNull();
    });
  });

  describe("OpenRankData", () => {
    it("allows following and engagement scores", () => {
      const data: OpenRankData = {
        following: {
          rank: 100,
          score: 0.85,
          percentile: 75,
        },
        engagement: {
          rank: 50,
          score: 0.95,
          percentile: 90,
        },
      };

      expect(data.following.rank).toBe(100);
      expect(data.engagement.rank).toBe(50);
    });
  });
});
