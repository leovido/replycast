import { renderHook, act, waitFor } from "@testing-library/react";
import { useQuotient } from "./useQuotient";

// Mock fetch globally
global.fetch = jest.fn();

describe("useQuotient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variable
    delete process.env.NEXT_PUBLIC_USE_MOCKS;
  });

  it("should initialize with empty scores", () => {
    const { result } = renderHook(() => useQuotient());

    expect(result.current.quotientScores).toEqual({});
    expect(typeof result.current.fetchQuotientScores).toBe("function");
    expect(typeof result.current.clearCache).toBe("function");
  });

  it("should fetch quotient scores successfully", async () => {
    const mockResponse = {
      data: [
        {
          fid: 123,
          username: "alice",
          quotientScore: 0.95,
          quotientScoreRaw: 0.95,
          quotientRank: 50,
          quotientProfileUrl: "https://quotient.social/user/123",
        },
      ],
      count: 1,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useQuotient());

    await act(async () => {
      await result.current.fetchQuotientScores([123]);
    });

    await waitFor(() => {
      expect(result.current.quotientScores[123]).toEqual(mockResponse.data[0]);
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/quotient", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fids: [123] }),
      signal: expect.any(AbortSignal),
    });
  });

  it("should handle fetch errors gracefully", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error")
    );

    const { result } = renderHook(() => useQuotient());
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await act(async () => {
      await result.current.fetchQuotientScores([123]);
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to fetch Quotient scores:",
      expect.any(Error)
    );
    expect(result.current.quotientScores).toEqual({});

    consoleSpy.mockRestore();
  });

  it("should handle HTTP error responses", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useQuotient());
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await act(async () => {
      await result.current.fetchQuotientScores([123]);
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to fetch Quotient scores:",
      expect.any(Error)
    );
    expect(result.current.quotientScores).toEqual({});

    consoleSpy.mockRestore();
  });

  it("should clear cache successfully", () => {
    const { result } = renderHook(() => useQuotient());

    // First fetch some data
    act(() => {
      result.current.quotientScores = {
        123: {
          fid: 123,
          username: "test",
          quotientScore: 0.8,
          quotientScoreRaw: 0.8,
          quotientRank: 100,
          quotientProfileUrl: "test",
        },
      };
    });

    expect(Object.keys(result.current.quotientScores)).toHaveLength(1);

    // Clear cache
    act(() => {
      result.current.clearCache();
    });

    expect(result.current.quotientScores).toEqual({});
  });

  it("should get cache status correctly", () => {
    const { result } = renderHook(() => useQuotient());

    const cacheStatus = result.current.getCacheStatus();

    expect(cacheStatus).toHaveProperty("isValid");
    expect(cacheStatus).toHaveProperty("age");
    expect(cacheStatus).toHaveProperty("cachedFids");
    expect(cacheStatus).toHaveProperty("ttl");
    expect(cacheStatus.ttl).toBe(300); // 5 minutes in seconds
  });

  it("should not fetch if no FIDs provided", async () => {
    const { result } = renderHook(() => useQuotient());

    await act(async () => {
      await result.current.fetchQuotientScores([]);
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should handle timeout correctly", async () => {
    // Mock AbortSignal.timeout to throw an error
    const originalAbortSignal = global.AbortSignal;
    global.AbortSignal = {
      ...originalAbortSignal,
      timeout: jest.fn().mockImplementation(() => {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 10);
        return controller.signal;
      }),
    } as any;

    const { result } = renderHook(() => useQuotient());
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await act(async () => {
      await result.current.fetchQuotientScores([123]);
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to fetch Quotient scores:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
    global.AbortSignal = originalAbortSignal;
  });
});
