import { useState, useCallback, useRef } from "react";
import { MockQuotientService } from "@/utils/mockService";

// Constants
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export interface QuotientScore {
  fid: number;
  username: string;
  quotientScore: number;
  quotientScoreRaw: number;
  quotientRank: number;
  quotientProfileUrl: string;
}

export interface QuotientResponse {
  data: QuotientScore[];
  count: number;
}

export function useQuotient() {
  const [quotientScores, setQuotientScores] = useState<
    Record<number, QuotientScore | null>
  >({});

  // Cache for Quotient data with TTL (5 minutes)
  const quotientCache = useRef<{
    data: Record<number, QuotientScore | null>;
    timestamp: number;
  }>({ data: {}, timestamp: 0 });

  const getCacheStatus = useCallback(() => {
    const now = Date.now();
    const isCacheValid = now - quotientCache.current.timestamp < CACHE_TTL;
    const cacheAge = Math.round((now - quotientCache.current.timestamp) / 1000);
    const cachedFids = Object.keys(quotientCache.current.data).length;

    return {
      isValid: isCacheValid,
      age: cacheAge,
      cachedFids,
      ttl: Math.round(CACHE_TTL / 1000),
    };
  }, []);

  // Helper to fetch Quotient scores with caching (optimized)
  const fetchQuotientScores = useCallback(async (fids: number[]) => {
    if (fids.length === 0) return;

    // Check if mocks are enabled
    const useMocks =
      process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
      (typeof window !== "undefined" && (window as any).__FORCE_MOCKS__);

    if (useMocks) {
      try {
        const mockData = await MockQuotientService.fetchScores(fids);

        if (mockData.data) {
          // Create a map of FID to QuotientScore
          const newScoreMap: Record<number, QuotientScore | null> = {};

          mockData.data.forEach((score) => {
            newScoreMap[score.fid] = score;
          });

          // Update cache with new data
          quotientCache.current.data = {
            ...quotientCache.current.data,
            ...newScoreMap,
          };
          quotientCache.current.timestamp = Date.now();

          // Update state with new data
          setQuotientScores((prev) => ({ ...prev, ...newScoreMap }));
        }
        return;
      } catch (error) {
        console.error("Mock service error:", error);
        // Fall back to real API if mock fails
      }
    }

    const now = Date.now();
    const fidsToFetch: number[] = [];

    // Check which FIDs need to be fetched
    fids.forEach((fid) => {
      const cached = quotientCache.current.data[fid];
      if (!cached || now - quotientCache.current.timestamp >= CACHE_TTL) {
        fidsToFetch.push(fid);
      }
    });

    // If no FIDs need fetching, we're done
    if (fidsToFetch.length === 0) return;

    try {
      const response = await fetch(`/api/quotient`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fids: fidsToFetch }),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data: QuotientResponse = await response.json();

      if (data.data) {
        // Create a map of FID to QuotientScore
        const newScoreMap: Record<number, QuotientScore | null> = {};

        data.data.forEach((score) => {
          newScoreMap[score.fid] = score;
        });

        // Update cache with new data
        quotientCache.current.data = {
          ...quotientCache.current.data,
          ...newScoreMap,
        };
        quotientCache.current.timestamp = now;

        // Update state with new data
        setQuotientScores((prev) => ({ ...prev, ...newScoreMap }));
      }
    } catch (error) {
      console.error("Failed to fetch Quotient scores:", error);
    }
  }, []);

  const clearCache = useCallback(() => {
    quotientCache.current = { data: {}, timestamp: 0 };
    setQuotientScores({});
  }, []);

  return {
    quotientScores,
    fetchQuotientScores,
    getCacheStatus,
    clearCache,
  };
}
