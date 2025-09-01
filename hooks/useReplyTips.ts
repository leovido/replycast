import { useState, useEffect, useCallback } from "react";
import type { ReplyTipsResponse, ReplyTip } from "@/types/types";
import { mockReplyTips } from "@/utils/mockData";

interface UseReplyTipsProps {
  user: { fid: number } | null;
  useMockData?: boolean;
}

export function useReplyTips({ user, useMockData = false }: UseReplyTipsProps) {
  const [data, setData] = useState<ReplyTipsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch $REPLY tips data
  const fetchReplyTips = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      if (useMockData) {
        // Use mock data for testing
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        setData(mockReplyTips);
        setLoading(false);
        return;
      }

      // Fetch from real API
      const url = new URL("/api/farcaster-reply-tips", window.location.origin);
      url.searchParams.set("fid", user.fid.toString());
      url.searchParams.set("pageSize", "50");
      url.searchParams.set("reverse", "true");

      const response = await fetch(url.toString(), {
        signal: AbortSignal.timeout(15000), // 15 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      setData(responseData);
    } catch (error) {
      console.error("Error fetching $REPLY tips:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch $REPLY tips");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user, useMockData]);

  // Refresh data
  const refreshData = useCallback(async () => {
    if (!user) return;
    
    setIsRefreshing(true);
    await fetchReplyTips();
  }, [user, fetchReplyTips]);

  // Fetch data when user changes
  useEffect(() => {
    if (user) {
      fetchReplyTips();
    } else {
      setData(null);
      setLoading(false);
      setError(null);
    }
  }, [user, fetchReplyTips]);

  // Helper functions for calculating totals
  const getTotalReceived = useCallback(() => {
    return data?.totalReceived || 0;
  }, [data]);

  const getTotalGiven = useCallback(() => {
    return data?.totalGiven || 0;
  }, [data]);

  const getTotalReceivedToday = useCallback(() => {
    return data?.totalReceivedToday || 0;
  }, [data]);

  const getTotalGivenToday = useCallback(() => {
    return data?.totalGivenToday || 0;
  }, [data]);

  const getTipsReceived = useCallback(() => {
    return data?.tipsReceived || [];
  }, [data]);

  const getTipsGiven = useCallback(() => {
    return data?.tipsGiven || [];
  }, [data]);

  return {
    data,
    loading,
    error,
    isRefreshing,
    refreshData,
    getTotalReceived,
    getTotalGiven,
    getTotalReceivedToday,
    getTotalGivenToday,
    getTipsReceived,
    getTipsGiven,
  };
}
