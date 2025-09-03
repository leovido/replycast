import { useState, useCallback, useRef } from "react";
import { MockOpenRankService } from "@/utils/mockService";
import type { OpenRankData } from "@/types/types";

// Constants
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export function useOpenRank() {
  const [openRankData, setOpenRankData] = useState<
    Record<number, OpenRankData>
  >({});

  // Cache for OpenRank data with TTL (5 minutes)
  const openRankCache = useRef<{
    data: Record<number, OpenRankData>;
    timestamp: number;
  }>({ data: {}, timestamp: 0 });

  const getCacheStatus = useCallback(() => {
    const now = Date.now();
    const isCacheValid = now - openRankCache.current.timestamp < CACHE_TTL;
    const cacheAge = Math.round((now - openRankCache.current.timestamp) / 1000);
    const cachedFids = Object.keys(openRankCache.current.data).length;

    return {
      isValid: isCacheValid,
      age: cacheAge,
      cachedFids,
      ttl: Math.round(CACHE_TTL / 1000),
    };
  }, []);

  // Helper to fetch OpenRank data with caching (optimized)
  const fetchOpenRankData = useCallback(async (fids: number[]) => {
    if (fids.length === 0) return;

    // Check if mocks are enabled
    const useMocks =
      process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
      (typeof window !== "undefined" && (window as any).__FORCE_MOCKS__);

    if (useMocks) {
      try {
        console.log("Mock: Using mock OpenRank data in hook");
        const mockData = await MockOpenRankService.fetchRanks(fids);

        if (mockData.ranks) {
          // Convert string keys to numbers for consistency
          const newRankMap: Record<number, number | null> = {};

          Object.entries(mockData.ranks).forEach(([fid, rank]) => {
            newRankMap[parseInt(fid)] = rank as number | null;
          });

          // Update cache with new data
          openRankCache.current.data = {
            ...openRankCache.current.data,
            ...newRankMap,
          };
          openRankCache.current.timestamp = Date.now();

          // Update state with new data
          setOpenRankRanks((prev) => ({ ...prev, ...newRankMap }));
        }
        return;
      } catch (error) {
        console.error("Mock service error:", error);
        // Fall back to real API if mock fails
      }
    }

    const now = Date.now();
    const uniqueFids = Array.from(new Set(fids)); // More efficient Set conversion

    // Check if cache is still valid
    const isCacheValid = now - openRankCache.current.timestamp < CACHE_TTL;

    // Filter out FIDs that are already cached and valid
    const fidsToFetch = uniqueFids.filter(
      (fid) => !isCacheValid || !openRankCache.current.data.hasOwnProperty(fid)
    );

    // If we have cached data, use it immediately
    if (isCacheValid) {
      const cachedData: Record<number, OpenRankData> = {};
      uniqueFids.forEach((fid) => {
        if (openRankCache.current.data.hasOwnProperty(fid)) {
          cachedData[fid] = openRankCache.current.data[fid];
        }
      });

      if (Object.keys(cachedData).length > 0) {
        setOpenRankData((prev) => ({ ...prev, ...cachedData }));
      }
    }

    // If no FIDs need fetching, we're done
    if (fidsToFetch.length === 0) return;

    try {
      const response = await fetch(
        `/api/openRank?fids=${fidsToFetch.join(",")}`,
        {
          signal: AbortSignal.timeout(10000), // 10 second timeout
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      if (data.scores) {
        // Convert string keys to numbers for consistency
        const newDataMap: Record<number, OpenRankData> = {};

        Object.entries(data.scores).forEach(([fid, scores]) => {
          newDataMap[parseInt(fid)] = scores as OpenRankData;
        });

        // Update cache with new data
        openRankCache.current.data = {
          ...openRankCache.current.data,
          ...newDataMap,
        };
        openRankCache.current.timestamp = now;

        // Update state with new data
        setOpenRankData((prev) => ({ ...prev, ...newDataMap }));
      }
    } catch (error) {
      console.error("Failed to fetch OpenRank data:", error);
    }
  }, []);

  const clearCache = useCallback(() => {
    openRankCache.current = { data: {}, timestamp: 0 };
    setOpenRankData({});
  }, []);

  return {
    openRankData,
    fetchOpenRankData,
    getCacheStatus,
    clearCache,
  };
}
