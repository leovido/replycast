import { createMocks } from "node-mocks-http";
import handler, {
  clearReplyCheckCache,
} from "./farcaster-notification-replies";

// Mock the database repository
jest.mock("../../lib/db/repositories/readOnlyRepository", () => ({
  readOnlyRepository: {
    getUnrepliedConversations: jest.fn(),
  },
}));

// Import the mocked repository
import { readOnlyRepository } from "../../lib/db/repositories/readOnlyRepository";
const mockRepository = readOnlyRepository as jest.Mocked<
  typeof readOnlyRepository
>;

describe("/api/farcaster-notification-replies", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository.getUnrepliedConversations.mockReset();
    clearReplyCheckCache();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET requests", () => {
    it("should return 405 for non-GET requests", async () => {
      const { req, res } = createMocks({
        method: "POST",
        query: { fid: "123" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Method not allowed",
      });
    });

    it("should return 400 when fid is missing", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: {},
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: "fid query parameter is required",
      });
    });

    it("should return 400 when fid is invalid", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: { fid: "invalid" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Invalid FID parameter",
      });
    });

    it("should successfully fetch and process notifications", async () => {
      const mockConversations = [
        {
          cast: {
            fid: 123,
            hash: "0x123",
            timestamp: new Date("2024-01-01T10:00:00Z"),
            text: "Original cast",
            embeds: [],
            parentCastUrl: null,
            parentCastFid: null,
            parentCastHash: null,
            mentions: [],
            mentionsPositions: [],
            deletedAt: null,
          },
          replyCount: 1,
          firstReplyTime: new Date("2024-01-01T10:30:00Z"),
          firstReplyAuthor: 456,
          username: "testuser",
          displayName: "Test User",
          pfpUrl: "https://example.com/avatar.jpg",
        },
        {
          cast: {
            fid: 123,
            hash: "0x456",
            timestamp: new Date("2024-01-01T11:00:00Z"),
            text: "Another original cast",
            embeds: [],
            parentCastUrl: null,
            parentCastFid: null,
            parentCastHash: null,
            mentions: [],
            mentionsPositions: [],
            deletedAt: null,
          },
          replyCount: 1,
          firstReplyTime: new Date("2024-01-01T11:30:00Z"),
          firstReplyAuthor: 789,
          username: "anotheruser",
          displayName: "Another User",
          pfpUrl: "https://example.com/avatar2.jpg",
        },
      ];

      mockRepository.getUnrepliedConversations.mockResolvedValue({
        conversations: mockConversations,
        totalCount: 2,
      });

      const { req, res } = createMocks({
        method: "GET",
        query: { fid: "123", limit: "25" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());

      expect(data.unrepliedCount).toBe(2);
      expect(data.unrepliedDetails).toHaveLength(2);
      expect(data.message).toBe(
        "You have 2 unreplied comments in the last 7 days."
      );

      // Check first notification details
      const firstDetail = data.unrepliedDetails[0];
      expect(firstDetail.username).toBe("testuser");
      expect(firstDetail.authorFid).toBe(123);
      expect(firstDetail.text).toBe("Original cast");
      expect(firstDetail.avatarUrl).toBe("https://example.com/avatar.jpg");
      expect(firstDetail.castUrl).toContain("0x123");
    });

    it("should handle empty results", async () => {
      mockRepository.getUnrepliedConversations.mockResolvedValue({
        conversations: [],
        totalCount: 0,
      });

      const { req, res } = createMocks({
        method: "GET",
        query: { fid: "123", limit: "25" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());

      expect(data.unrepliedCount).toBe(0);
      expect(data.unrepliedDetails).toHaveLength(0);
      expect(data.message).toBe("No unreplied conversations found.");
    });

    it("should handle database errors gracefully", async () => {
      mockRepository.getUnrepliedConversations.mockRejectedValue(
        new Error("Database connection failed")
      );

      const { req, res } = createMocks({
        method: "GET",
        query: { fid: "123", limit: "25" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("Internal server error");
    });

    it("should handle limit parameter correctly", async () => {
      mockRepository.getUnrepliedConversations.mockResolvedValue({
        conversations: [],
        totalCount: 0,
      });

      const { req, res } = createMocks({
        method: "GET",
        query: { fid: "123", limit: "10" },
      });

      await handler(req, res);

      expect(mockRepository.getUnrepliedConversations).toHaveBeenCalledWith(
        123,
        10
      );
    });

    it("should use default limit when not provided", async () => {
      mockRepository.getUnrepliedConversations.mockResolvedValue({
        conversations: [],
        totalCount: 0,
      });

      const { req, res } = createMocks({
        method: "GET",
        query: { fid: "123" },
      });

      await handler(req, res);

      expect(mockRepository.getUnrepliedConversations).toHaveBeenCalledWith(
        123,
        25
      );
    });
  });
});
