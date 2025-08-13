import { useState, useCallback } from "react";
import { useOpenRank } from "./useOpenRank";
import { useQuotient } from "./useQuotient";

export type ReputationType = "quotient" | "openrank";

export function useReputation() {
  const [reputationType, setReputationType] =
    useState<ReputationType>("quotient");

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
      if (reputationType === "quotient") {
        await fetchQuotientScores(fids);
      } else {
        await fetchOpenRankRanks(fids);
      }
    },
    [reputationType, fetchQuotientScores, fetchOpenRankRanks]
  );

  const clearCache = useCallback(() => {
    if (reputationType === "quotient") {
      clearQuotientCache();
    } else {
      clearOpenRankCache();
    }
  }, [reputationType, clearQuotientCache, clearOpenRankCache]);

  const getReputationValue = useCallback(
    (fid: number) => {
      if (reputationType === "quotient") {
        const score = quotientScores[fid];
        return score ? score.quotientScore : null;
      } else {
        return openRankRanks[fid] || null;
      }
    },
    [reputationType, quotientScores, openRankRanks]
  );

  const getReputationRank = useCallback(
    (fid: number) => {
      if (reputationType === "quotient") {
        const score = quotientScores[fid];
        return score ? score.quotientRank : null;
      } else {
        return openRankRanks[fid] || null;
      }
    },
    [reputationType, quotientScores, openRankRanks]
  );

  const getReputationDisplay = useCallback(
    (fid: number) => {
      if (reputationType === "quotient") {
        const score = quotientScores[fid];
        if (!score) return null;

        // Format Quotient score based on tiers
        if (score.quotientScore >= 0.9) return "Exceptional";
        if (score.quotientScore >= 0.8) return "Elite";
        if (score.quotientScore >= 0.75) return "Influential";
        if (score.quotientScore >= 0.6) return "Active";
        if (score.quotientScore >= 0.5) return "Casual";
        return "Inactive";
      } else {
        const rank = openRankRanks[fid];
        return rank ? `#${rank.toLocaleString()}` : null;
      }
    },
    [reputationType, quotientScores, openRankRanks]
  );

  const getReputationColor = useCallback(
    (fid: number) => {
      if (reputationType === "quotient") {
        const score = quotientScores[fid];
        if (!score) return "text-gray-500";

        if (score.quotientScore >= 0.9) return "text-purple-600";
        if (score.quotientScore >= 0.8) return "text-blue-600";
        if (score.quotientScore >= 0.75) return "text-green-600";
        if (score.quotientScore >= 0.6) return "text-yellow-600";
        if (score.quotientScore >= 0.5) return "text-orange-600";
        return "text-red-600";
      } else {
        const rank = openRankRanks[fid];
        if (!rank) return "text-gray-500";

        if (rank <= 1000) return "text-purple-600";
        if (rank <= 10000) return "text-blue-600";
        if (rank <= 100000) return "text-green-600";
        if (rank <= 1000000) return "text-yellow-600";
        return "text-orange-600";
      }
    },
    [reputationType, quotientScores, openRankRanks]
  );

  return {
    reputationType,
    setReputationType,
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
