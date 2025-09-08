// Set environment variable before importing the handler
process.env.NEYNAR_API_KEY = "test-api-key";

import { createMocks } from "node-mocks-http";
import handler from "./farcaster-replies";

// Mock the Neynar client
jest.mock("@/client", () => ({
  client: {
    fetchCastsForUser: jest.fn(),
    lookupCastConversation: jest.fn(),
  },
}));

import { client } from "@/client";

const mockClient = client as jest.Mocked<typeof client>;

describe("/api/farcaster-replies", () => {
  beforeAll(() => {
    process.env.NEYNAR_API_KEY = "test-api-key";
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEYNAR_API_KEY = "test-api-key";
  });

  afterEach(() => {
    // Keep the API key for all tests
  });

  it("returns 405 for non-GET requests", async () => {
    const { req, res } = createMocks({
      method: "POST",
      query: { fid: "123" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({ error: "Method not allowed" });
  });

  it("returns 400 when FID is missing", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: "FID parameter is required",
    });
  });

  it("returns 500 when API key is missing", async () => {
    // Temporarily clear the API key and re-import the handler
    const originalApiKey = process.env.NEYNAR_API_KEY;
    delete process.env.NEYNAR_API_KEY;

    jest.resetModules();
    const handlerWithoutKey = require("./farcaster-replies").default;

    const { req, res } = createMocks({
      method: "GET",
      query: { fid: "123" },
    });

    await handlerWithoutKey(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      error: "API key not configured",
    });

    // Restore the API key and re-import the original handler
    process.env.NEYNAR_API_KEY = originalApiKey;
    jest.resetModules();
    require("./farcaster-replies");
  });

  it("returns empty result when no casts found", async () => {
    mockClient.fetchCastsForUser.mockResolvedValue({
      casts: [],
    });

    const { req, res } = createMocks({
      method: "GET",
      query: { fid: "123" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data).toEqual({
      unrepliedCount: 0,
      unrepliedDetails: [],
      message: "You have 0 unreplied comments today.",
      nextCursor: null,
    });
  });

  it("processes casts with embeds correctly", async () => {
    const mockCasts = [
      {
        hash: "cast1",
        text: "Original cast with image",
        author: { username: "user1" },
        timestamp: "2024-01-01T00:00:00Z",
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
      },
    ];

    const mockConversation = {
      cast: {
        author: { fid: 123 },
        direct_replies: [
          {
            author: {
              fid: 456,
              username: "replier1",
              pfp_url: "https://example.com/avatar.jpg",
            },
            text: "Reply text",
            timestamp: "2024-01-01T01:00:00Z",
            parent_hash: "cast1",
          },
        ],
      },
    };

    mockClient.fetchCastsForUser.mockResolvedValue({
      casts: mockCasts,
      next: null,
    });

    mockClient.lookupCastConversation.mockResolvedValue({
      conversation: mockConversation,
    });

    const { req, res } = createMocks({
      method: "GET",
      query: { fid: "123" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());

    expect(data.unrepliedCount).toBe(1);
    expect(data.unrepliedDetails).toHaveLength(1);

    const detail = data.unrepliedDetails[0];
    expect(detail.embeds).toEqual([
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
    ]);
  });

  it("handles casts with cast_id embeds", async () => {
    const mockCasts = [
      {
        hash: "cast1",
        text: "Original cast with embedded cast",
        author: { username: "user1" },
        timestamp: "2024-01-01T00:00:00Z",
        embeds: [
          {
            cast_id: {
              fid: 789,
              hash: "embedded_cast_hash",
            },
          },
        ],
      },
    ];

    const mockConversation = {
      cast: {
        author: { fid: 123 },
        direct_replies: [
          {
            author: {
              fid: 456,
              username: "replier1",
              pfp_url: "https://example.com/avatar.jpg",
            },
            text: "Reply text",
            timestamp: "2024-01-01T01:00:00Z",
            parent_hash: "cast1",
          },
        ],
      },
    };

    mockClient.fetchCastsForUser.mockResolvedValue({
      casts: mockCasts,
      next: null,
    });

    mockClient.lookupCastConversation.mockResolvedValue({
      conversation: mockConversation,
    });

    const { req, res } = createMocks({
      method: "GET",
      query: { fid: "123" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());

    expect(data.unrepliedCount).toBe(1);
    expect(data.unrepliedDetails).toHaveLength(1);

    const detail = data.unrepliedDetails[0];
    expect(detail.embeds).toEqual([
      {
        cast_id: {
          fid: 789,
          hash: "embedded_cast_hash",
        },
      },
    ]);
  });

  it("handles casts with mixed embeds", async () => {
    const mockCasts = [
      {
        hash: "cast1",
        text: "Original cast with mixed embeds",
        author: { username: "user1" },
        timestamp: "2024-01-01T00:00:00Z",
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
              hash: "embedded_cast_hash",
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
      },
    ];

    const mockConversation = {
      cast: {
        author: { fid: 123 },
        direct_replies: [
          {
            author: {
              fid: 456,
              username: "replier1",
              pfp_url: "https://example.com/avatar.jpg",
            },
            text: "Reply text",
            timestamp: "2024-01-01T01:00:00Z",
            parent_hash: "cast1",
          },
        ],
      },
    };

    mockClient.fetchCastsForUser.mockResolvedValue({
      casts: mockCasts,
      next: null,
    });

    mockClient.lookupCastConversation.mockResolvedValue({
      conversation: mockConversation,
    });

    const { req, res } = createMocks({
      method: "GET",
      query: { fid: "123" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());

    expect(data.unrepliedCount).toBe(1);
    expect(data.unrepliedDetails).toHaveLength(1);

    const detail = data.unrepliedDetails[0];
    expect(detail.embeds).toHaveLength(3);
    expect(detail.embeds[0]).toHaveProperty(
      "url",
      "https://example.com/image.jpg"
    );
    expect(detail.embeds[1]).toHaveProperty("cast_id");
    expect(detail.embeds[2]).toHaveProperty(
      "url",
      "https://youtube.com/watch?v=abc123"
    );
  });

  it("handles casts without embeds", async () => {
    const mockCasts = [
      {
        hash: "cast1",
        text: "Original cast without embeds",
        author: { username: "user1" },
        timestamp: "2024-01-01T00:00:00Z",
        embeds: [],
      },
    ];

    const mockConversation = {
      cast: {
        author: { fid: 123 },
        direct_replies: [
          {
            author: {
              fid: 456,
              username: "replier1",
              pfp_url: "https://example.com/avatar.jpg",
            },
            text: "Reply text",
            timestamp: "2024-01-01T01:00:00Z",
            parent_hash: "cast1",
          },
        ],
      },
    };

    mockClient.fetchCastsForUser.mockResolvedValue({
      casts: mockCasts,
      next: null,
    });

    mockClient.lookupCastConversation.mockResolvedValue({
      conversation: mockConversation,
    });

    const { req, res } = createMocks({
      method: "GET",
      query: { fid: "123" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());

    expect(data.unrepliedCount).toBe(1);
    expect(data.unrepliedDetails).toHaveLength(1);

    const detail = data.unrepliedDetails[0];
    expect(detail.embeds).toEqual([]);
  });

  it("handles API errors gracefully", async () => {
    mockClient.fetchCastsForUser.mockRejectedValue(new Error("API Error"));

    const { req, res } = createMocks({
      method: "GET",
      query: { fid: "123" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe("Internal server error");
    expect(data.message).toBe("API Error");
  });

  it("respects limit parameter", async () => {
    const mockCasts = Array.from({ length: 5 }, (_, i) => ({
      hash: `cast${i}`,
      text: `Cast ${i}`,
      author: { username: `user${i}` },
      timestamp: "2024-01-01T00:00:00Z",
      embeds: [],
    }));

    mockClient.fetchCastsForUser.mockResolvedValue({
      casts: mockCasts,
      next: null,
    });

    mockClient.lookupCastConversation.mockResolvedValue({
      conversation: {
        cast: {
          author: { fid: 123 },
          direct_replies: [
            {
              author: {
                fid: 456,
                username: "replier1",
                pfp_url: "https://example.com/avatar.jpg",
              },
              text: "Reply text",
              timestamp: "2024-01-01T01:00:00Z",
              parent_hash: "cast0",
            },
          ],
        },
      },
    });

    const { req, res } = createMocks({
      method: "GET",
      query: { fid: "123", limit: "2" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.unrepliedDetails).toHaveLength(2);
  });
});
