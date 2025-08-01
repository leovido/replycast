import { createMocks } from "node-mocks-http";
import handler from "./image-proxy";

// Mock fetch globally
global.fetch = jest.fn();

describe("/api/image-proxy", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("URL validation", () => {
    it("should return 400 when url parameter is missing", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: {},
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Missing or invalid url parameter",
      });
    });

    it("should return 400 when url parameter is undefined", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: { url: undefined },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Missing or invalid url parameter",
      });
    });

    it("should return 400 when url parameter is null", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: { url: null },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Missing or invalid url parameter",
      });
    });

    it("should return 400 when url parameter is not a string", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: { url: 123 },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Missing or invalid url parameter",
      });
    });

    it("should return 400 when url parameter is an array", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: { url: ["https://example.com/image.jpg"] },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Missing or invalid url parameter",
      });
    });

    it("should return 400 for non-http(s) URLs", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: { url: "ftp://example.com/image.jpg" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Only http(s) URLs are allowed",
      });
    });

    it("should return 400 for relative URLs", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: { url: "/image.jpg" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Only http(s) URLs are allowed",
      });
    });

    it("should return 400 for file:// URLs", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: { url: "file:///path/to/image.jpg" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Only http(s) URLs are allowed",
      });
    });
  });

  describe("Successful image proxying", () => {
    it("should proxy image successfully with proper headers", async () => {
      const mockImageBuffer = Buffer.from("fake-image-data");
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue("image/jpeg"),
        },
        arrayBuffer: jest.fn().mockResolvedValue(mockImageBuffer),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const { req, res } = createMocks({
        method: "GET",
        query: { url: "https://example.com/image.jpg" },
      });

      await handler(req, res);

      expect(global.fetch).toHaveBeenCalledWith(
        "https://example.com/image.jpg"
      );
      expect(res._getStatusCode()).toBe(200);
      expect(res._getHeaders()).toEqual({
        "content-type": "image/jpeg",
        "cache-control": "public, max-age=3600",
      });
    });

    it("should handle image with default content type", async () => {
      const mockImageBuffer = Buffer.from("fake-image-data");
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue(null),
        },
        arrayBuffer: jest.fn().mockResolvedValue(mockImageBuffer),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const { req, res } = createMocks({
        method: "GET",
        query: { url: "https://example.com/image.png" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getHeaders()).toEqual({
        "content-type": "application/octet-stream",
        "cache-control": "public, max-age=3600",
      });
    });

    it("should handle different image types", async () => {
      const mockImageBuffer = Buffer.from("fake-png-data");
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue("image/png"),
        },
        arrayBuffer: jest.fn().mockResolvedValue(mockImageBuffer),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const { req, res } = createMocks({
        method: "GET",
        query: { url: "https://example.com/image.png" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getHeaders()).toEqual({
        "content-type": "image/png",
        "cache-control": "public, max-age=3600",
      });
    });

    it("should handle gif images", async () => {
      const mockImageBuffer = Buffer.from("fake-gif-data");
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue("image/gif"),
        },
        arrayBuffer: jest.fn().mockResolvedValue(mockImageBuffer),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const { req, res } = createMocks({
        method: "GET",
        query: { url: "https://example.com/image.gif" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getHeaders()).toEqual({
        "content-type": "image/gif",
        "cache-control": "public, max-age=3600",
      });
    });
  });

  describe("Error handling", () => {
    it("should return 400 when fetch response is not ok", async () => {
      const mockResponse = {
        ok: false,
        status: 404,
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const { req, res } = createMocks({
        method: "GET",
        query: { url: "https://example.com/nonexistent.jpg" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Failed to fetch image",
      });
    });

    it("should return 500 when fetch throws an error", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      const { req, res } = createMocks({
        method: "GET",
        query: { url: "https://example.com/image.jpg" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Error fetching image",
      });
    });

    it("should return 500 when arrayBuffer throws an error", async () => {
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue("image/jpeg"),
        },
        arrayBuffer: jest.fn().mockRejectedValue(new Error("Read error")),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const { req, res } = createMocks({
        method: "GET",
        query: { url: "https://example.com/image.jpg" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Error fetching image",
      });
    });
  });

  describe("URL format handling", () => {
    it("should accept http URLs", async () => {
      const mockImageBuffer = Buffer.from("fake-image-data");
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue("image/jpeg"),
        },
        arrayBuffer: jest.fn().mockResolvedValue(mockImageBuffer),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const { req, res } = createMocks({
        method: "GET",
        query: { url: "http://example.com/image.jpg" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(global.fetch).toHaveBeenCalledWith("http://example.com/image.jpg");
    });

    it("should accept https URLs", async () => {
      const mockImageBuffer = Buffer.from("fake-image-data");
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue("image/jpeg"),
        },
        arrayBuffer: jest.fn().mockResolvedValue(mockImageBuffer),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const { req, res } = createMocks({
        method: "GET",
        query: { url: "https://example.com/image.jpg" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://example.com/image.jpg"
      );
    });

    it("should handle URLs with query parameters", async () => {
      const mockImageBuffer = Buffer.from("fake-image-data");
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue("image/jpeg"),
        },
        arrayBuffer: jest.fn().mockResolvedValue(mockImageBuffer),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const { req, res } = createMocks({
        method: "GET",
        query: { url: "https://example.com/image.jpg?size=large&format=jpg" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://example.com/image.jpg?size=large&format=jpg"
      );
    });

    it("should handle URLs with special characters", async () => {
      const mockImageBuffer = Buffer.from("fake-image-data");
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue("image/jpeg"),
        },
        arrayBuffer: jest.fn().mockResolvedValue(mockImageBuffer),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const { req, res } = createMocks({
        method: "GET",
        query: { url: "https://example.com/image%20with%20spaces.jpg" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://example.com/image%20with%20spaces.jpg"
      );
    });
  });
});
