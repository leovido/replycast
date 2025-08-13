import { renderHook, act, waitFor } from "@testing-library/react";
import { useReputation } from "./useReputation";
import { useOpenRank } from "./useOpenRank";
import { useQuotient } from "./useQuotient";

// Mock the dependent hooks
jest.mock("./useOpenRank");
jest.mock("./useQuotient");

const mockUseOpenRank = useOpenRank as jest.MockedFunction<typeof useOpenRank>;
const mockUseQuotient = useQuotient as jest.MockedFunction<typeof useQuotient>;

describe("useReputation", () => {
  const mockOpenRankData = {
    openRankRanks: { 123: 1500, 456: 5000 },
    fetchOpenRankRanks: jest.fn(),
    clearCache: jest.fn(),
    getCacheStatus: jest.fn(),
  };

  const mockQuotientData = {
    quotientScores: {
      123: {
        fid: 123,
        username: "alice",
        quotientScore: 0.95,
        quotientScoreRaw: 0.95,
        quotientRank: 50,
        quotientProfileUrl: "test",
      },
      456: {
        fid: 456,
        username: "bob",
        quotientScore: 0.82,
        quotientScoreRaw: 0.82,
        quotientRank: 500,
        quotientProfileUrl: "test",
      },
    },
    fetchQuotientScores: jest.fn(),
    clearCache: jest.fn(),
    getCacheStatus: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseOpenRank.mockReturnValue(mockOpenRankData);
    mockUseQuotient.mockReturnValue(mockQuotientData);
  });

  it("should initialize with quotient as default reputation type", () => {
    const { result } = renderHook(() => useReputation());

    expect(result.current.reputationType).toBe("quotient");
  });

  it("should change reputation type when setReputationType is called", () => {
    const { result } = renderHook(() => useReputation());

    act(() => {
      result.current.setReputationType("openrank");
    });

    expect(result.current.reputationType).toBe("openrank");
  });

  it("should fetch quotient scores when reputation type is quotient", async () => {
    const { result } = renderHook(() => useReputation());

    await act(async () => {
      await result.current.fetchReputationData([123, 456]);
    });

    expect(mockQuotientData.fetchQuotientScores).toHaveBeenCalledWith([
      123, 456,
    ]);
    expect(mockOpenRankData.fetchOpenRankRanks).not.toHaveBeenCalled();
  });

  it("should fetch openrank scores when reputation type is openrank", async () => {
    const { result } = renderHook(() => useReputation());

    act(() => {
      result.current.setReputationType("openrank");
    });

    await act(async () => {
      await result.current.fetchReputationData([123, 456]);
    });

    expect(mockOpenRankData.fetchOpenRankRanks).toHaveBeenCalledWith([
      123, 456,
    ]);
    expect(mockQuotientData.fetchQuotientScores).not.toHaveBeenCalled();
  });

  it("should get correct reputation value for quotient", () => {
    const { result } = renderHook(() => useReputation());

    const value = result.current.getReputationValue(123);
    expect(value).toBe(0.95);
  });

  it("should get correct reputation value for openrank", () => {
    const { result } = renderHook(() => useReputation());

    act(() => {
      result.current.setReputationType("openrank");
    });

    const value = result.current.getReputationValue(123);
    expect(value).toBe(1500);
  });

  it("should return null for non-existent FID", () => {
    const { result } = renderHook(() => useReputation());

    const value = result.current.getReputationValue(999);
    expect(value).toBeNull();
  });

  it("should get correct reputation rank for quotient", () => {
    const { result } = renderHook(() => useReputation());

    const rank = result.current.getReputationRank(123);
    expect(rank).toBe(50);
  });

  it("should get correct reputation rank for openrank", () => {
    const { result } = renderHook(() => useReputation());

    act(() => {
      result.current.setReputationType("openrank");
    });

    const rank = result.current.getReputationRank(123);
    expect(rank).toBe(1500);
  });

  it("should get correct reputation display for quotient tiers", () => {
    const { result } = renderHook(() => useReputation());

    // Test different tiers
    expect(result.current.getReputationDisplay(123)).toBe("Exceptional"); // 0.95
    expect(result.current.getReputationDisplay(456)).toBe("Elite"); // 0.82
  });

  it("should get correct reputation display for openrank", () => {
    const { result } = renderHook(() => useReputation());

    act(() => {
      result.current.setReputationType("openrank");
    });

    const display = result.current.getReputationDisplay(123);
    expect(display).toBe("#1,500");
  });

  it("should get correct reputation color for quotient tiers", () => {
    const { result } = renderHook(() => useReputation());

    // Test different tiers
    expect(result.current.getReputationColor(123)).toBe("text-purple-600"); // 0.95 - Exceptional
    expect(result.current.getReputationColor(456)).toBe("text-blue-600"); // 0.82 - Elite
  });

  it("should get correct reputation color for openrank", () => {
    const { result } = renderHook(() => useReputation());

    act(() => {
      result.current.setReputationType("openrank");
    });

    const color = result.current.getReputationColor(123);
    expect(color).toBe("text-blue-600"); // 1500 - between 1000 and 10000
  });

  it("should clear correct cache based on reputation type", () => {
    const { result } = renderHook(() => useReputation());

    // Clear cache for quotient
    act(() => {
      result.current.clearCache();
    });

    expect(mockQuotientData.clearCache).toHaveBeenCalled();
    expect(mockOpenRankData.clearCache).not.toHaveBeenCalled();

    // Change to openrank and clear cache
    act(() => {
      result.current.setReputationType("openrank");
    });

    act(() => {
      result.current.clearCache();
    });

    expect(mockOpenRankData.clearCache).toHaveBeenCalled();
  });

  it("should return raw data access", () => {
    const { result } = renderHook(() => useReputation());

    expect(result.current.openRankRanks).toEqual(
      mockOpenRankData.openRankRanks
    );
    expect(result.current.quotientScores).toEqual(
      mockQuotientData.quotientScores
    );
  });

  it("should return individual fetch functions", () => {
    const { result } = renderHook(() => useReputation());

    expect(result.current.fetchOpenRankRanks).toBe(
      mockOpenRankData.fetchOpenRankRanks
    );
    expect(result.current.fetchQuotientScores).toBe(
      mockQuotientData.fetchQuotientScores
    );
  });
});
