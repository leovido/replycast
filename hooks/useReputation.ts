import { useState, useCallback } from "react";
import { useOpenRank } from "./useOpenRank";
import { useQuotient } from "./useQuotient";

export type ReputationType = "quotient" | "openrank";

export function useReputation() {
  const {
    openRankRanks,
    fetchOpenRankRanks,
    clearCache: clearOpenRankCache,
  } = useOpenRank();

  const {
    quotientScores,
    fetchQuotientScores,
    clearCache: clearQuotientCache,
  } = useQuotient();

  const fetchReputationData = useCallback(
    async (fids: number[]) => {
      // Always fetch both types of data
      await Promise.all([fetchQuotientScores(fids), fetchOpenRankRanks(fids)]);
    },
    [fetchQuotientScores, fetchOpenRankRanks]
  );

  const clearCache = useCallback(() => {
    // Always clear both caches
    clearQuotientCache();
    clearOpenRankCache();
  }, [clearQuotientCache, clearOpenRankCache]);

  const getReputationValue = useCallback(
    (fid: number) => {
      // Return both values as an object
      const quotientScore = quotientScores[fid];
      return {
        quotient: quotientScore ? quotientScore.quotientScore : null,
        openRank: openRankRanks[fid] || null,
      };
    },
    [quotientScores, openRankRanks]
  );

  const getReputationRank = useCallback(
    (fid: number) => {
      // Return both ranks as an object
      const quotientScore = quotientScores[fid];
      return {
        quotient: quotientScore ? quotientScore.quotientRank : null,
        openRank: openRankRanks[fid] || null,
      };
    },
    [quotientScores, openRankRanks]
  );

  const getReputationDisplay = useCallback(
    (fid: number) => {
      const quotientScore = quotientScores[fid];
      const openRank = openRankRanks[fid];

      return {
        quotient: quotientScore
          ? (() => {
              // Format Quotient score based on tiers
              if (quotientScore.quotientScore >= 0.9) return "Exceptional";
              if (quotientScore.quotientScore >= 0.8) return "Elite";
              if (quotientScore.quotientScore >= 0.75) return "Influential";
              if (quotientScore.quotientScore >= 0.6) return "Active";
              if (quotientScore.quotientScore >= 0.5) return "Casual";
              return "Inactive";
            })()
          : null,
        openRank: openRank ? `#${openRank.toLocaleString()}` : null,
      };
    },
    [quotientScores, openRankRanks]
  );

  const getReputationColor = useCallback(
    (fid: number) => {
      const quotientScore = quotientScores[fid];
      const openRank = openRankRanks[fid];

      return {
        quotient: quotientScore
          ? (() => {
              if (quotientScore.quotientScore >= 0.9) return "text-purple-600";
              if (quotientScore.quotientScore >= 0.8) return "text-blue-600";
              if (quotientScore.quotientScore >= 0.75) return "text-green-600";
              if (quotientScore.quotientScore >= 0.6) return "text-yellow-600";
              if (quotientScore.quotientScore >= 0.5) return "text-orange-600";
              return "text-red-600";
            })()
          : "text-gray-500",
        openRank: openRank
          ? (() => {
              if (openRank <= 1000) return "text-purple-600";
              if (openRank <= 10000) return "text-blue-600";
              if (openRank <= 100000) return "text-green-600";
              if (openRank <= 1000000) return "text-yellow-600";
              return "text-orange-600";
            })()
          : "text-gray-500",
      };
    },
    [quotientScores, openRankRanks]
  );

  return {
    fetchReputationData,
    clearCache,
    getReputationValue,
    getReputationRank,
    getReputationDisplay,
    getReputationColor,
    // Raw data access
    openRankRanks,
    quotientScores,
    // Individual fetch functions
    fetchOpenRankRanks,
    fetchQuotientScores,
  };
}
