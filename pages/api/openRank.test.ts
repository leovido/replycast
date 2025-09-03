import { createMocks } from "node-mocks-http";
import handler from "./openRank";

// Mock fetch globally
global.fetch = jest.fn();

// Mock environment variables
const originalEnv = process.env;
beforeAll(() => {
  process.env.OPENRANK_URL = "https://api.openrank.xyz/";
});

afterAll(() => {
  process.env = originalEnv;
});

describe("/api/openRank", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET requests", () => {
    it("should return 405 for non-GET requests", async () => {
      const { req, res } = createMocks({
        method: "POST",
        query: { fids: "123,456" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Method not allowed",
      });
    });

    it("should return 400 when fids parameter is missing", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: {},
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: "FIDs parameter is required",
      });
    });

    it("should return 400 when fids parameter is undefined", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: { fids: undefined },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: "FIDs parameter is required",
      });
    });

    it("should return 400 when fids parameter is null", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: { fids: null },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: "FIDs parameter is required",
      });
    });
  });

  describe("Parameter validation", () => {
    it("should handle whitespace in FIDs", async () => {
      const mockFollowingResponse = {
        ok: true,
        json: async () => ({
          result: [
            {
              fid: 123,
              username: "user1",
              rank: 100,
              score: 0.5,
              percentile: 99,
            },
            {
              fid: 456,
              username: "user2",
              rank: 200,
              score: 0.4,
              percentile: 98,
            },
          ],
        }),
      };
      const mockEngagementResponse = {
        ok: true,
        json: async () => ({
          result: [
            {
              fid: 123,
              username: "user1",
              rank: 150,
              score: 0.6,
              percentile: 99,
            },
            {
              fid: 456,
              username: "user2",
              rank: 250,
              score: 0.5,
              percentile: 98,
            },
          ],
        }),
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockFollowingResponse)
        .mockResolvedValueOnce(mockEngagementResponse);

      const { req, res } = createMocks({
        method: "GET",
        query: { fids: " 123 , 456 " },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.scores).toHaveProperty("123");
      expect(data.scores).toHaveProperty("456");
    });

    it("should handle mixed valid and invalid FIDs", async () => {
      const mockFollowingResponse = {
        ok: true,
        json: async () => ({
          result: [
            {
              fid: 123,
              username: "user1",
              rank: 100,
              score: 0.5,
              percentile: 99,
            },
            {
              fid: 456,
              username: "user2",
              rank: 200,
              score: 0.4,
              percentile: 98,
            },
          ],
        }),
      };
      const mockEngagementResponse = {
        ok: true,
        json: async () => ({
          result: [
            {
              fid: 123,
              username: "user1",
              rank: 150,
              score: 0.6,
              percentile: 99,
            },
            {
              fid: 456,
              username: "user2",
              rank: 250,
              score: 0.5,
              percentile: 98,
            },
          ],
        }),
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockFollowingResponse)
        .mockResolvedValueOnce(mockEngagementResponse);

      const { req, res } = createMocks({
        method: "GET",
        query: { fids: "123,invalid,456,not-a-number" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.scores).toHaveProperty("123");
      expect(data.scores).toHaveProperty("456");
      // Invalid FIDs should be filtered out
      expect(data.scores).not.toHaveProperty("invalid");
      expect(data.scores).not.toHaveProperty("not-a-number");
    });

    it("should handle large FID numbers", async () => {
      const mockFollowingResponse = {
        ok: true,
        json: async () => ({
          result: [
            {
              fid: 999999999,
              username: "user1",
              rank: 100,
              score: 0.5,
              percentile: 99,
            },
          ],
        }),
      };
      const mockEngagementResponse = {
        ok: true,
        json: async () => ({
          result: [
            {
              fid: 999999999,
              username: "user1",
              rank: 150,
              score: 0.6,
              percentile: 99,
            },
          ],
        }),
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockFollowingResponse)
        .mockResolvedValueOnce(mockEngagementResponse);

      const { req, res } = createMocks({
        method: "GET",
        query: { fids: "999999999" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.scores).toHaveProperty("999999999");
    });
  });

  describe("Error handling", () => {
    it("should handle API fetch errors", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      const { req, res } = createMocks({
        method: "GET",
        query: { fids: "123" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());

      expect(data.error).toBe("Failed to fetch OpenRank data");
    });

    it("should handle non-ok API responses", async () => {
      const mockFollowingResponse = { ok: false, status: 500 };
      const mockEngagementResponse = { ok: false, status: 500 };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockFollowingResponse)
        .mockResolvedValueOnce(mockEngagementResponse);

      const { req, res } = createMocks({
        method: "GET",
        query: { fids: "123" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());

      expect(data.error).toBe("Failed to fetch OpenRank data");
    });

    it("should handle partial API failures", async () => {
      const mockFollowingResponse = {
        ok: true,
        json: async () => ({
          result: [
            {
              fid: 123,
              username: "user1",
              rank: 100,
              score: 0.5,
              percentile: 99,
            },
          ],
        }),
      };
      const mockEngagementResponse = { ok: false, status: 500 };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockFollowingResponse)
        .mockResolvedValueOnce(mockEngagementResponse);

      const { req, res } = createMocks({
        method: "GET",
        query: { fids: "123" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());

      expect(data.error).toBe("Failed to fetch OpenRank data");
    });
  });

  describe("Input format handling", () => {
    it("should handle single FID as string", async () => {
      const mockFollowingResponse = {
        ok: true,
        json: async () => ({
          result: [
            {
              fid: 123,
              username: "user1",
              rank: 100,
              score: 0.5,
              percentile: 99,
            },
          ],
        }),
      };
      const mockEngagementResponse = {
        ok: true,
        json: async () => ({
          result: [
            {
              fid: 123,
              username: "user1",
              rank: 150,
              score: 0.6,
              percentile: 99,
            },
          ],
        }),
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockFollowingResponse)
        .mockResolvedValueOnce(mockEngagementResponse);

      const { req, res } = createMocks({
        method: "GET",
        query: { fids: "123" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.scores).toHaveProperty("123");
      expect(data.scores["123"].following.rank).toBe(100);
      expect(data.scores["123"].engagement.rank).toBe(150);
    });

    it("should handle comma-separated FIDs", async () => {
      const mockFollowingResponse = {
        ok: true,
        json: async () => ({
          result: [
            {
              fid: 123,
              username: "user1",
              rank: 100,
              score: 0.5,
              percentile: 99,
            },
            {
              fid: 456,
              username: "user2",
              rank: 200,
              score: 0.4,
              percentile: 98,
            },
            {
              fid: 789,
              username: "user3",
              rank: 300,
              score: 0.3,
              percentile: 97,
            },
          ],
        }),
      };
      const mockEngagementResponse = {
        ok: true,
        json: async () => ({
          result: [
            {
              fid: 123,
              username: "user1",
              rank: 150,
              score: 0.6,
              percentile: 99,
            },
            {
              fid: 456,
              username: "user2",
              rank: 250,
              score: 0.5,
              percentile: 98,
            },
            {
              fid: 789,
              username: "user3",
              rank: 350,
              score: 0.4,
              percentile: 97,
            },
          ],
        }),
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockFollowingResponse)
        .mockResolvedValueOnce(mockEngagementResponse);

      const { req, res } = createMocks({
        method: "GET",
        query: { fids: "123,456,789" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.scores).toHaveProperty("123");
      expect(data.scores).toHaveProperty("456");
      expect(data.scores).toHaveProperty("789");
    });

    it("should handle array of FIDs", async () => {
      const mockFollowingResponse = {
        ok: true,
        json: async () => ({
          result: [
            {
              fid: 123,
              username: "user1",
              rank: 100,
              score: 0.5,
              percentile: 99,
            },
            {
              fid: 456,
              username: "user2",
              rank: 200,
              score: 0.4,
              percentile: 98,
            },
          ],
        }),
      };
      const mockEngagementResponse = {
        ok: true,
        json: async () => ({
          result: [
            {
              fid: 123,
              username: "user1",
              rank: 150,
              score: 0.6,
              percentile: 99,
            },
            {
              fid: 456,
              username: "user2",
              rank: 250,
              score: 0.5,
              percentile: 98,
            },
          ],
        }),
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockFollowingResponse)
        .mockResolvedValueOnce(mockEngagementResponse);

      const { req, res } = createMocks({
        method: "GET",
        query: { fids: ["123", "456"] },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.scores).toHaveProperty("123");
      expect(data.scores).toHaveProperty("456");
    });
  });

  describe("Response format", () => {
    it("should return both following and engagement scores", async () => {
      const mockFollowingResponse = {
        ok: true,
        json: async () => ({
          result: [
            {
              fid: 123,
              username: "user1",
              rank: 100,
              score: 0.5,
              percentile: 99,
            },
          ],
        }),
      };
      const mockEngagementResponse = {
        ok: true,
        json: async () => ({
          result: [
            {
              fid: 123,
              username: "user1",
              rank: 150,
              score: 0.6,
              percentile: 99,
            },
          ],
        }),
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockFollowingResponse)
        .mockResolvedValueOnce(mockEngagementResponse);

      const { req, res } = createMocks({
        method: "GET",
        query: { fids: "123" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());

      expect(data.scores["123"]).toEqual({
        following: {
          rank: 100,
          score: 0.5,
          percentile: 99,
        },
        engagement: {
          rank: 150,
          score: 0.6,
          percentile: 99,
        },
      });
    });

    it("should handle missing FIDs in API response", async () => {
      const mockFollowingResponse = {
        ok: true,
        json: async () => ({
          result: [
            {
              fid: 123,
              username: "user1",
              rank: 100,
              score: 0.5,
              percentile: 99,
            },
          ],
        }),
      };
      const mockEngagementResponse = {
        ok: true,
        json: async () => ({
          result: [
            {
              fid: 123,
              username: "user1",
              rank: 150,
              score: 0.6,
              percentile: 99,
            },
          ],
        }),
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(mockFollowingResponse)
        .mockResolvedValueOnce(mockEngagementResponse);

      const { req, res } = createMocks({
        method: "GET",
        query: { fids: "123,456" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());

      // FID 123 should have data
      expect(data.scores["123"].following.rank).toBe(100);
      expect(data.scores["123"].engagement.rank).toBe(150);

      // FID 456 should have null values since it wasn't in the API response
      expect(data.scores["456"].following.rank).toBeNull();
      expect(data.scores["456"].engagement.rank).toBeNull();
    });
  });
});
