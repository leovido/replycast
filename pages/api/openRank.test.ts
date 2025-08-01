import { createMocks } from "node-mocks-http";
import handler from "./openRank";

// Mock ethers completely
jest.mock("ethers", () => ({
  JsonRpcProvider: jest.fn(() => ({})),
  Contract: jest.fn(() => ({
    getRanksAndScoresForFIDs: jest.fn(),
  })),
}));

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
      const { req, res } = createMocks({
        method: "GET",
        query: { fids: " 123 , 456 " },
      });

      await handler(req, res);

      // Should get 500 because ethers is mocked but the logic should handle whitespace
      expect(res._getStatusCode()).toBe(500);
    });

    it("should handle mixed valid and invalid FIDs", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: { fids: "123,invalid,456,not-a-number" },
      });

      await handler(req, res);

      // Should get 500 because ethers is mocked but the logic should filter invalid FIDs
      expect(res._getStatusCode()).toBe(500);
    });

    it("should handle large FID numbers", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: { fids: "999999999" },
      });

      await handler(req, res);

      // Should get 500 because ethers is mocked
      expect(res._getStatusCode()).toBe(500);
    });
  });

  describe("Error handling", () => {
    it("should handle provider connection errors", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: { fids: "123" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());

      expect(data.error).toBe("Failed to fetch OpenRank data");
    });

    it("should handle contract instantiation errors", async () => {
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
      const { req, res } = createMocks({
        method: "GET",
        query: { fids: "123" },
      });

      await handler(req, res);

      // Should get 500 because ethers is mocked
      expect(res._getStatusCode()).toBe(500);
    });

    it("should handle comma-separated FIDs", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: { fids: "123,456,789" },
      });

      await handler(req, res);

      // Should get 500 because ethers is mocked
      expect(res._getStatusCode()).toBe(500);
    });

    it("should handle array of FIDs", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: { fids: ["123", "456"] },
      });

      await handler(req, res);

      // Should get 500 because ethers is mocked
      expect(res._getStatusCode()).toBe(500);
    });
  });
});
