import { useState, useEffect, useCallback } from "react";
import type {
  FarcasterRepliesResponse,
  UnrepliedDetail,
  User,
  Cursor,
} from "@/types/types";
import { MockFarcasterService } from "@/utils/mockService";

interface UseFarcasterDataProps {
  user: User | null;
  fetchOpenRankRanks: (fids: number[]) => Promise<void>;
  clearOpenRankCache: () => void;
  dayFilter?: string;
  reputationType?: "quotient" | "openrank";
}

export function useFarcasterData({
  user,
  fetchOpenRankRanks,
  clearOpenRankCache,
  dayFilter = "today",
  reputationType = "quotient",
}: UseFarcasterDataProps) {
  const [data, setData] = useState<FarcasterRepliesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userOpenRank, setUserOpenRank] = useState<number | null>(null);

  // Pagination state
  const [cursor, setCursor] = useState<Cursor>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allConversations, setAllConversations] = useState<UnrepliedDetail[]>(
    []
  );

  // Fetch user's reputation score
  const fetchUserReputation = useCallback(
    async (userFid: number) => {
      try {
        // Check if mocks are enabled
        const useMocks =
          process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
          (typeof window !== "undefined" && (window as any).__FORCE_MOCKS__);

        if (useMocks) {
          console.log("Mock: Using mock user reputation data in hook");
          const mockScore = await MockFarcasterService.fetchUserReputation(
            userFid,
            reputationType
          );
          setUserOpenRank(mockScore);
          return;
        }

        if (reputationType === "quotient") {
          const response = await fetch(`/api/quotient`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ fids: [userFid] }),
            signal: AbortSignal.timeout(10000), // 10 second timeout
          });

          if (!response.ok) throw new Error(`HTTP ${response.status}`);

          const data = await response.json();

          if (data.data && data.data[0]) {
            setUserOpenRank(data.data[0].quotientScore);
          }
        } else {
          const response = await fetch(`/api/openRank?fids=${userFid}`, {
            signal: AbortSignal.timeout(10000), // 10 second timeout
          });

          if (!response.ok) throw new Error(`HTTP ${response.status}`);

          const data = await response.json();

          if (data.ranks && data.ranks[userFid]) {
            setUserOpenRank(data.ranks[userFid] as number);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user reputation:", error);
        // Don't set error state for user reputation as it's not critical
      }
    },
    [reputationType]
  );

  // Fetch data when user is set
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch user's reputation score first
        await fetchUserReputation(user.fid);

        // Check if mocks are enabled
        const useMocks =
          process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
          (typeof window !== "undefined" && (window as any).__FORCE_MOCKS__);

        let responseData;

        if (useMocks) {
          console.log("Mock: Using mock Farcaster data in hook");
          responseData = await MockFarcasterService.fetchReplies(
            user.fid,
            dayFilter,
            25
          );
        } else {
          // Use the same API endpoint as infinite scroll for consistency
          const url = new URL(
            "/api/farcaster-notification-replies",
            window.location.origin
          );
          url.searchParams.set("fid", user.fid.toString());
          url.searchParams.set("limit", "25");
          if (dayFilter !== "all") {
            url.searchParams.set("dayFilter", dayFilter);
          }

          const res = await fetch(url.toString());
          responseData = await res.json();
        }

        if (responseData) {
          setData(responseData);
          setLoading(false);
          setIsLoadingMore(false);

          // Deduplicate conversations using castHash
          const uniqueConversations = (
            responseData.unrepliedDetails || []
          ).reduce((acc: UnrepliedDetail[], item: UnrepliedDetail) => {
            const isDuplicate = acc.some(
              (existing) => existing.castHash === item.castHash
            );
            if (!isDuplicate) {
              acc.push(item);
            }
            return acc;
          }, []);

          setAllConversations(uniqueConversations);
          setCursor(responseData.nextCursor || null);

          // Set hasMore based on nextCursor availability
          setHasMore(!!responseData.nextCursor);

          // Fetch OpenRank ranks for all FIDs in the response
          if (responseData.unrepliedDetails?.length > 0) {
            const fids = responseData.unrepliedDetails.map(
              (detail: UnrepliedDetail) => detail.authorFid
            );
            await fetchOpenRankRanks(fids);
          }
        }
      } catch (err) {
        setHasMore(false);
        setError(
          err instanceof Error ? err.message : "Failed to load conversations"
        );
        setLoading(false);
      }
    };

    fetchData();
  }, [user, fetchOpenRankRanks, fetchUserReputation, dayFilter]);

  const loadMoreConversations = useCallback(async () => {
    if (!hasMore || isLoadingMore || loading) return;

    setIsLoadingMore(true);
    try {
      // Check if mocks are enabled
      const useMocks =
        process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
        (typeof window !== "undefined" && (window as any).__FORCE_MOCKS__);

      let responseData;

      if (useMocks) {
        console.log("Mock: Using mock Farcaster data for load more in hook");
        responseData = await MockFarcasterService.fetchReplies(
          user?.fid || 0,
          dayFilter,
          25,
          cursor || undefined
        );
      } else {
        const url = new URL(
          "/api/farcaster-notification-replies",
          window.location.origin
        );
        if (!user?.fid) {
          throw new Error("User FID is required to load conversations");
        }
        url.searchParams.set("fid", user.fid.toString());
        if (cursor) {
          url.searchParams.set("cursor", cursor);
        }
        if (dayFilter !== "all") {
          url.searchParams.set("dayFilter", dayFilter);
        }

        const res = await fetch(url.toString());
        responseData = await res.json();
      }

      // Append new conversations with deduplication
      setAllConversations((prev) => {
        const existingHashes = new Set(prev.map((item) => item.castHash));
        const newConversations = (responseData.unrepliedDetails || []).filter(
          (item: UnrepliedDetail) => !existingHashes.has(item.castHash)
        );

        return [...prev, ...newConversations];
      });

      setCursor(responseData.nextCursor || null);

      // Fetch OpenRank ranks for new FIDs in the response
      if (responseData.unrepliedDetails?.length > 0) {
        const fids = responseData.unrepliedDetails.map(
          (detail: UnrepliedDetail) => detail.authorFid
        );
        // Don't await this to prevent blocking the UI update
        fetchOpenRankRanks(fids).catch((error) => {
          console.error(
            "Failed to fetch OpenRank for new conversations:",
            error
          );
        });
      }

      // If no more data, stop loading more
      if (!responseData.nextCursor || !responseData.unrepliedDetails?.length) {
        setHasMore(false);
      }
    } catch (e) {
      setHasMore(false); // Stop trying if error
    }
    setIsLoadingMore(false); // Always reset spinner
  }, [
    hasMore,
    isLoadingMore,
    loading,
    user,
    cursor,
    dayFilter,
    fetchOpenRankRanks,
  ]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);

    // Clear OpenRank cache to force fresh data
    clearOpenRankCache();

    // Reset pagination state for fresh start
    setCursor(null);
    setHasMore(true);
    setIsLoadingMore(false);

    // Force refresh by bypassing cache
    if (!user?.fid) {
      throw new Error("User FID is required to refresh conversations");
    }
    const userFid = user.fid;
    try {
      // Refresh user's OpenRank score
      await fetchUserReputation(userFid);

      const url = new URL(
        "/api/farcaster-notification-replies",
        window.location.origin
      );
      url.searchParams.set("fid", userFid.toString());
      url.searchParams.set("limit", "50");
      if (dayFilter !== "all") {
        url.searchParams.set("dayFilter", dayFilter);
      }

      const res = await fetch(url.toString(), {
        cache: "no-store",
      });
      const responseData = await res.json();
      if (responseData) {
        console.log("Refresh - nextCursor", responseData.nextCursor);
        setData(responseData);
        setAllConversations(responseData.unrepliedDetails || []);
        setCursor(responseData.nextCursor || null);
        setHasMore(!!responseData.nextCursor);

        // Fetch OpenRank ranks for all FIDs in the response
        if (responseData.unrepliedDetails?.length > 0) {
          const fids = responseData.unrepliedDetails.map(
            (detail: UnrepliedDetail) => detail.authorFid
          );
          await fetchOpenRankRanks(fids);
        }
      } else {
        setError(responseData.error || "Failed to fetch data");
      }
    } catch (err) {
      setError("Failed to load conversations");
    }
    setIsRefreshing(false);
  }, [
    user?.fid,
    fetchOpenRankRanks,
    fetchUserReputation,
    clearOpenRankCache,
    dayFilter,
  ]);

  const resetPagination = useCallback(() => {
    setCursor(null);
    setHasMore(true);
    setIsLoadingMore(false);
    setAllConversations([]);
  }, []);

  return {
    data,
    loading,
    error,
    isRefreshing,
    allConversations,
    hasMore,
    isLoadingMore,
    cursor,
    userOpenRank,
    loadMoreConversations,
    handleRefresh,
    resetPagination,
  };
}
