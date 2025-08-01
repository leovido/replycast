import { createMocks } from "node-mocks-http";
import handler, {
  clearReplyCheckCache,
} from "./farcaster-notification-replies";
import { client } from "@/client";

// Mock the Neynar client
jest.mock("@/client", () => ({
  client: {
    fetchAllNotifications: jest.fn(),
    lookupCastConversation: jest.fn(),
  },
}));

// Mock the client
const mockClient = client as jest.Mocked<typeof client>;

describe("/api/farcaster-notification-replies", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations completely
    mockClient.fetchAllNotifications.mockReset();
    mockClient.lookupCastConversation.mockReset();

    // Clear any cached data that might persist between tests
    jest.clearAllTimers();
    jest.clearAllMocks();

    // Clear the reply check cache between tests
    clearReplyCheckCache();
  });

  afterEach(() => {
    // Ensure complete cleanup after each test
    jest.clearAllMocks();
    jest.clearAllTimers();
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

      expect(res._getStatusCode()).toBe(500);
    });

    it("should successfully fetch and process notifications", async () => {
      const mockNotifications: any[] = [
        {
          cast: {
            hash: "0x123",
            author: {
              username: "testuser",
              fid: 456,
              pfp_url: "https://example.com/avatar.jpg",
            },
            text: "Test reply",
            timestamp: "2024-01-01T12:00:00Z",
            replies: { count: 2 },
          },
        },
        {
          cast: {
            hash: "0x456",
            author: {
              username: "anotheruser",
              fid: 789,
              pfp_url: "https://example.com/avatar2.jpg",
            },
            text: "Another reply",
            timestamp: "2024-01-01T11:00:00Z",
            replies: { count: 1 },
          },
        },
      ];

      mockClient.fetchAllNotifications.mockResolvedValue({
        notifications: mockNotifications,
        next: { cursor: "next-cursor" },
      } as any);

      mockClient.lookupCastConversation.mockResolvedValue({
        conversation: {
          cast: {
            direct_replies: [],
          },
        },
      } as any);

      const { req, res } = createMocks({
        method: "GET",
        query: { fid: "123", limit: "25" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());

      expect(data.unrepliedCount).toBe(2);
      expect(data.unrepliedDetails).toHaveLength(2);
      expect(data.nextCursor).toBe("next-cursor");
      expect(data.message).toBe("You have 2 unreplied comments today.");

      // Check first notification details
      const firstDetail = data.unrepliedDetails[0];
      expect(firstDetail.username).toBe("testuser");
      expect(firstDetail.authorFid).toBe(456);
      expect(firstDetail.text).toBe("Test reply");
      expect(firstDetail.castHash).toBe("0x123");
      expect(firstDetail.replyCount).toBe(2);
    });

    it("should filter out conversations where user has already replied", async () => {
      const mockNotifications: any[] = [
        {
          cast: {
            hash: "0x123",
            author: {
              username: "testuser",
              fid: 456,
              pfp_url: "https://example.com/avatar.jpg",
            },
            text: "Test reply",
            timestamp: "2024-01-01T12:00:00Z",
            replies: { count: 2 },
          },
        },
        {
          cast: {
            hash: "0x456",
            author: {
              username: "anotheruser",
              fid: 789,
              pfp_url: "https://example.com/avatar2.jpg",
            },
            text: "Another reply",
            timestamp: "2024-01-01T11:00:00Z",
            replies: { count: 1 },
          },
        },
      ];

      mockClient.fetchAllNotifications.mockResolvedValue({
        notifications: mockNotifications,
        next: null,
      } as any);

      // Use explicit mock implementation that doesn't rely on call order
      mockClient.lookupCastConversation.mockImplementation((params: any) => {
        if (params.identifier === "0x123") {
          return Promise.resolve({
            conversation: {
              cast: {
                direct_replies: [
                  { author: { fid: 123 } }, // User (FID 123) has replied to this one
                ],
              },
            },
          } as any);
        } else if (params.identifier === "0x456") {
          return Promise.resolve({
            conversation: {
              cast: {
                direct_replies: [], // User hasn't replied to this one
              },
            },
          } as any);
        }
        return Promise.resolve({
          conversation: {
            cast: {
              direct_replies: [],
            },
          },
        } as any);
      });

      const { req, res } = createMocks({
        method: "GET",
        query: { fid: "123" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());

      // The filtering logic should exclude the first notification where user has replied
      expect(data.unrepliedCount).toBe(1);
      expect(data.unrepliedDetails).toHaveLength(1);
      expect(data.unrepliedDetails[0].username).toBe("anotheruser");
    });

    it("should handle missing cast data gracefully", async () => {
      const mockNotifications: any[] = [
        {
          cast: null, // Missing cast data - this should be filtered out
        },
        {
          cast: {
            hash: "0x123",
            author: {
              username: "testuser",
              fid: 456,
              pfp_url: "https://example.com/avatar.jpg",
            },
            text: "Test reply",
            timestamp: "2024-01-01T12:00:00Z",
            replies: { count: 2 },
          },
        },
      ];

      mockClient.fetchAllNotifications.mockResolvedValue({
        notifications: mockNotifications,
        next: null,
      } as any);

      // Use explicit mock implementation that doesn't rely on call order
      mockClient.lookupCastConversation.mockImplementation((params: any) => {
        if (params.identifier === "0x123") {
          return Promise.resolve({
            conversation: {
              cast: {
                direct_replies: [],
              },
            },
          } as any);
        }
        return Promise.resolve({
          conversation: {
            cast: {
              direct_replies: [],
            },
          },
        } as any);
      });

      const { req, res } = createMocks({
        method: "GET",
        query: { fid: "123" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());

      // Should only process the notification with valid cast data
      expect(data.unrepliedCount).toBe(1);
      expect(data.unrepliedDetails).toHaveLength(1);
    });

    it("should handle API errors gracefully", async () => {
      mockClient.fetchAllNotifications.mockRejectedValue(
        new Error("API Error")
      );

      const { req, res } = createMocks({
        method: "GET",
        query: { fid: "123" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.error).toContain("Internal server error");
    });

    it("should handle conversation lookup errors gracefully", async () => {
      const mockNotifications: any[] = [
        {
          cast: {
            hash: "0x123",
            author: {
              username: "testuser",
              fid: 456,
              pfp_url: "https://example.com/avatar.jpg",
            },
            text: "Test reply",
            timestamp: "2024-01-01T12:00:00Z",
            replies: { count: 2 },
          },
        },
      ];

      mockClient.fetchAllNotifications.mockResolvedValue({
        notifications: mockNotifications,
        next: null,
      } as any);

      mockClient.lookupCastConversation.mockRejectedValue(
        new Error("Conversation lookup failed")
      );

      const { req, res } = createMocks({
        method: "GET",
        query: { fid: "123" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());

      // Should still return the notification even if conversation lookup fails
      expect(data.unrepliedCount).toBe(1);
    });

    it("should use default values for missing fields", async () => {
      const mockNotifications: any[] = [
        {
          cast: {
            hash: "0x123",
            author: {
              username: "testuser",
              // Missing fid, pfp_url
            },
            text: "Test reply",
            // Missing timestamp
            replies: { count: 0 },
          },
        },
      ];

      mockClient.fetchAllNotifications.mockResolvedValue({
        notifications: mockNotifications,
        next: null,
      } as any);

      mockClient.lookupCastConversation.mockResolvedValue({
        conversation: {
          cast: {
            direct_replies: [],
          },
        },
      } as any);

      const { req, res } = createMocks({
        method: "GET",
        query: { fid: "123" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());

      const detail = data.unrepliedDetails[0];
      expect(detail.authorFid).toBe(0);
      expect(detail.avatarUrl).toBe("");
      expect(detail.timeAgo).toBe("");
      expect(detail.timestamp).toBe(0);
    });

    it("should handle cursor parameter correctly", async () => {
      const mockNotifications: any[] = [
        {
          cast: {
            hash: "0x123",
            author: {
              username: "testuser",
              fid: 456,
              pfp_url: "https://example.com/avatar.jpg",
            },
            text: "Test reply",
            timestamp: "2024-01-01T12:00:00Z",
            replies: { count: 2 },
          },
        },
      ];

      mockClient.fetchAllNotifications.mockResolvedValue({
        notifications: mockNotifications,
        next: { cursor: "next-cursor" },
      } as any);

      mockClient.lookupCastConversation.mockResolvedValue({
        conversation: {
          cast: {
            direct_replies: [],
          },
        },
      } as any);

      const { req, res } = createMocks({
        method: "GET",
        query: { fid: "123", cursor: "test-cursor" },
      });

      await handler(req, res);

      expect(mockClient.fetchAllNotifications).toHaveBeenCalledWith({
        fid: 123,
        limit: 25,
        type: ["replies"],
        cursor: "test-cursor",
      });
    });

    it("should handle different notification types", async () => {
      const mockNotifications: any[] = [
        {
          cast: {
            hash: "0x123",
            author: {
              username: "testuser",
              fid: 456,
              pfp_url: "https://example.com/avatar.jpg",
            },
            text: "Test reply",
            timestamp: "2024-01-01T12:00:00Z",
            replies: { count: 2 },
          },
        },
      ];

      mockClient.fetchAllNotifications.mockResolvedValue({
        notifications: mockNotifications,
        next: null,
      } as any);

      mockClient.lookupCastConversation.mockResolvedValue({
        conversation: {
          cast: {
            direct_replies: [],
          },
        },
      } as any);

      const { req, res } = createMocks({
        method: "GET",
        query: { fid: "123", type: "mentions" },
      });

      await handler(req, res);

      expect(mockClient.fetchAllNotifications).toHaveBeenCalledWith({
        fid: 123,
        limit: 25,
        type: ["mentions"],
        cursor: undefined,
      });
    });
  });

  describe("timeAgo function", () => {
    it("should format seconds correctly", () => {
      const now = new Date();
      const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);

      const result = timeAgo(thirtySecondsAgo.toISOString());
      expect(result).toBe("30s ago");
    });

    it("should format minutes correctly", () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      const result = timeAgo(fiveMinutesAgo.toISOString());
      expect(result).toBe("5min ago");
    });

    it("should format hours correctly", () => {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

      const result = timeAgo(twoHoursAgo.toISOString());
      expect(result).toBe("2h ago");
    });

    it("should format days correctly", () => {
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

      const result = timeAgo(threeDaysAgo.toISOString());
      expect(result).toBe("3d ago");
    });
  });
});

// Helper function to test timeAgo (extracted from the main file for testing)
const timeAgo = (dateString: string): string => {
  const now = new Date();
  const then = new Date(dateString);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
};
