import { useState, useEffect, useCallback } from "react";
import type {
  FarcasterRepliesResponse,
  UnrepliedDetail,
  User,
  Cursor,
} from "@/types/types";

interface UseFarcasterDataProps {
  user: User | null;
  fetchOpenRankRanks: (fids: number[]) => Promise<void>;
  clearOpenRankCache: () => void;
  dayFilter?: string;
}

export function useFarcasterData({
  user,
  fetchOpenRankRanks,
  clearOpenRankCache,
  dayFilter = "today",
}: UseFarcasterDataProps) {
  const [data, setData] = useState<FarcasterRepliesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination state
  const [cursor, setCursor] = useState<Cursor>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allConversations, setAllConversations] = useState<UnrepliedDetail[]>(
    []
  );

  // Fetch data when user is set
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
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
        const responseData = await res.json();

        if (responseData) {
          setData(responseData);
          setLoading(false);
          setIsLoadingMore(false);
          setAllConversations(responseData.unrepliedDetails || []);
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
  }, [user, fetchOpenRankRanks, dayFilter]);

  const loadMoreConversations = useCallback(async () => {
    if (!hasMore || isLoadingMore || loading) return;

    setIsLoadingMore(true);
    try {
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
      const responseData = await res.json();

      // Append new conversations
      setAllConversations((prev) => [
        ...prev,
        ...(responseData.unrepliedDetails || []),
      ]);

      setCursor(responseData.nextCursor || null);

      // Fetch OpenRank ranks for new FIDs in the response
      if (responseData.unrepliedDetails?.length > 0) {
        const fids = responseData.unrepliedDetails.map(
          (detail: UnrepliedDetail) => detail.authorFid
        );
        await fetchOpenRankRanks(fids);
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

    // Force refresh by bypassing cache
    if (!user?.fid) {
      throw new Error("User FID is required to refresh conversations");
    }
    const userFid = user.fid;
    try {
      const res = await fetch(
        `/api/farcaster-notification-replies?fid=${userFid}&cursor=${cursor}&dayFilter=${dayFilter}`,
        {
          cache: "no-store",
        }
      );
      const responseData = await res.json();
      if (responseData) {
        console.log("nextCursor", responseData.nextCursor);
        setData(responseData);
        setAllConversations(responseData.unrepliedDetails);

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
  }, [user?.fid, fetchOpenRankRanks, clearOpenRankCache, cursor, dayFilter]);

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
    loadMoreConversations,
    handleRefresh,
    resetPagination,
  };
}
