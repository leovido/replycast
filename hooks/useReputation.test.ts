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
    openRankData: {
      123: { following: { rank: 1500 }, engagement: { rank: 1400 } },
      456: { following: { rank: 5000 }, engagement: { rank: 4800 } },
    },
    fetchOpenRankData: jest.fn(),
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

  it("should fetch both quotient and openrank data", async () => {
    const { result } = renderHook(() => useReputation());

    await act(async () => {
      await result.current.fetchReputationData([123, 456]);
    });

    expect(mockQuotientData.fetchQuotientScores).toHaveBeenCalledWith([
      123, 456,
    ]);
    expect(mockOpenRankData.fetchOpenRankData).toHaveBeenCalledWith([123, 456]);
  });

  it("should get correct reputation values for both types", () => {
    const { result } = renderHook(() => useReputation());

    const value = result.current.getReputationValue(123);
    expect(value).toEqual({
      quotient: 0.95,
      openRank: { following: { rank: 1500 }, engagement: { rank: 1400 } },
    });
  });

  it("should return null for non-existent FID", () => {
    const { result } = renderHook(() => useReputation());

    const value = result.current.getReputationValue(999);
    expect(value).toEqual({
      quotient: null,
      openRank: null,
    });
  });

  it("should get correct reputation ranks for both types", () => {
    const { result } = renderHook(() => useReputation());

    const rank = result.current.getReputationRank(123);
    expect(rank).toEqual({
      quotient: 50,
      openRank: { following: { rank: 1500 }, engagement: { rank: 1400 } },
    });
  });

  it("should get correct reputation display for both types", () => {
    const { result } = renderHook(() => useReputation());

    const display = result.current.getReputationDisplay(123);
    expect(display).toEqual({
      quotient: "Exceptional", // 0.95
      openRank: "#1,400",
    });

    const display2 = result.current.getReputationDisplay(456);
    expect(display2).toEqual({
      quotient: "Elite", // 0.82
      openRank: "#4,800",
    });
  });

  it("should get correct reputation colors for both types", () => {
    const { result } = renderHook(() => useReputation());

    const color = result.current.getReputationColor(123);
    expect(color).toEqual({
      quotient: "text-purple-600", // 0.95 - Exceptional
      openRank: "text-blue-600", // 1400 - between 1000 and 10000
    });

    const color2 = result.current.getReputationColor(456);
    expect(color2).toEqual({
      quotient: "text-blue-600", // 0.82 - Elite
      openRank: "text-blue-600", // 4800 - between 1000 and 10000
    });
  });

  it("should clear both caches", () => {
    const { result } = renderHook(() => useReputation());

    act(() => {
      result.current.clearCache();
    });

    expect(mockQuotientData.clearCache).toHaveBeenCalled();
    expect(mockOpenRankData.clearCache).toHaveBeenCalled();
  });

  it("should return raw data access", () => {
    const { result } = renderHook(() => useReputation());

    expect(result.current.openRankData).toEqual(mockOpenRankData.openRankData);
    expect(result.current.quotientScores).toEqual(
      mockQuotientData.quotientScores
    );
  });

  it("should return individual fetch functions", () => {
    const { result } = renderHook(() => useReputation());

    expect(result.current.fetchOpenRankData).toBe(
      mockOpenRankData.fetchOpenRankData
    );
    expect(result.current.fetchQuotientScores).toBe(
      mockQuotientData.fetchQuotientScores
    );
  });
});
