import { useEffect, useState, useRef, useCallback, useMemo, memo } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import sdk from "@farcaster/miniapp-sdk";
import {
  Cursor,
  FarcasterRepliesResponse,
  UnrepliedDetail,
  User,
} from "@/types/types";

// Lazy load ReplyCard component
const ReplyCard = dynamic(
  () => import("./ReplyCard").then((mod) => ({ default: mod.ReplyCard })),
  {
    loading: () => (
      <div className="animate-pulse bg-white/10 rounded-xl h-32" />
    ),
    ssr: false,
  }
);

async function fetchTodaysReplies(fid: number, limit = 25, cursor: Cursor) {
  let allReplies = [];
  let keepGoing = true;

  while (keepGoing) {
    let url = `/api/farcaster-notification-replies?fid=${fid}&limit=${limit}`;

    if (cursor) {
      url += `&cursor=${cursor}`;
    }

    const res = await fetch(url);
    const data: FarcasterRepliesResponse = await res.json();

    if (!res.ok || !data.unrepliedDetails) {
      return {
        unrepliedCount: 0,
        unrepliedDetails: [],
        message: "No unreplied comments found",
      };
    }

    for (const reply of data.unrepliedDetails) {
      if (!isToday(reply.timestamp)) {
        keepGoing = false;
        break;
      }
      allReplies.push(reply);
    }

    cursor = data.nextCursor;
    if (!cursor) break;
  }

  const unrepliedDetails = allReplies.map((reply) => ({
    username: reply.username,
    timeAgo: reply.timeAgo,
    timestamp: reply.timestamp,
    castUrl: reply.castUrl,
    text: reply.text,
    avatarUrl: reply.avatarUrl,
    castHash: reply.castHash,
    authorFid: reply.authorFid,
    originalCastText: reply.originalCastText,
    originalCastHash: reply.originalCastHash,
    originalAuthorUsername: reply.originalAuthorUsername,
    replyCount: reply.replyCount,
  }));

  const response: FarcasterRepliesResponse = {
    unrepliedCount: unrepliedDetails.length,
    unrepliedDetails: unrepliedDetails,
    message: `You have ${unrepliedDetails.length} unreplied comments today.`,
  };
  return response;
}

function isToday(timestamp: number) {
  const replyDate = new Date(timestamp);
  const now = new Date();
  return (
    replyDate.getFullYear() === now.getFullYear() &&
    replyDate.getMonth() === now.getMonth() &&
    replyDate.getDate() === now.getDate()
  );
}

const mockReplies: FarcasterRepliesResponse = {
  unrepliedCount: 3,
  unrepliedDetails: [
    {
      avatarUrl: "https://randomuser.me/api/portraits/women/68.jpg",
      username: "sophia",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      timeAgo: "2h",
      timestamp: 1716666666,
      authorFid: 123,
      castUrl: "https://farcaster.xyz/cast/123",
      castHash: "123",
      originalCastText: "Original text",
      originalCastHash: "123",
      originalAuthorUsername: "original_author",
      replyCount: 0,
    },
    {
      avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
      username: "alex",
      text: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      timeAgo: "1h",
      timestamp: 1716666666,
      authorFid: 123,
      castUrl: "https://farcaster.xyz/cast/123",
      castHash: "123",
      originalCastText: "Original text",
      originalCastHash: "123",
      originalAuthorUsername: "original_author",
      replyCount: 0,
    },
    {
      avatarUrl: "https://randomuser.me/api/portraits/women/65.jpg",
      username: "olivia",
      text: "Ut enim ad minim veniam, quis nostrud exercitation ullamco.",
      timeAgo: "5m",
      timestamp: 1716666666,
      authorFid: 123,
      castUrl: "https://farcaster.xyz/cast/123",
      castHash: "123",
      originalCastText: "Original text",
      originalCastHash: "123",
      originalAuthorUsername: "original_author",
      replyCount: 0,
    },
  ],
  message: "Success",
};

// Memoized Loading Screen Component
const LoadingScreen = memo(() => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center">
      <div className="text-center">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
            <svg
              width={32}
              height={32}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-center"
              aria-hidden="true"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        </div>

        {/* App Title */}
        <h1
          className="text-3xl font-black text-white mb-2 tracking-tight"
          style={{ fontFamily: "Instrument Sans, Nunito, Inter, sans-serif" }}
        >
          ReplyCast
        </h1>
        <p className="text-white/80 text-lg font-medium mb-8">
          Loading your conversations...
        </p>

        {/* Loading Animation */}
        <div className="flex justify-center space-x-2">
          <div
            className="w-3 h-3 bg-white/60 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-3 h-3 bg-white/60 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-3 h-3 bg-white/60 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>
    </div>
  );
});

LoadingScreen.displayName = "LoadingScreen";

// Constants moved outside component to prevent recreation
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const MAX_CHARACTERS = 320; // Farcaster cast limit

const FarcasterApp = memo(() => {
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<FarcasterRepliesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCast, setSelectedCast] = useState<UnrepliedDetail | null>(
    null
  );
  const [replyText, setReplyText] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [dayFilter, setDayFilter] = useState<
    "all" | "today" | "3days" | "7days"
  >("all");
  const [sortOption, setSortOption] = useState<
    "newest" | "oldest" | "fid-asc" | "fid-desc" | "short" | "medium" | "long"
  >("newest");
  const [openRankRanks, setOpenRankRanks] = useState<
    Record<number, number | null>
  >({});

  // Pagination state
  const [cursor, setCursor] = useState<Cursor>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allConversations, setAllConversations] = useState<UnrepliedDetail[]>(
    []
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  // Cache for OpenRank data with TTL (5 minutes)
  const openRankCache = useRef<{
    data: Record<number, number | null>;
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

  // Helper to fetch OpenRank ranks with caching (optimized)
  const fetchOpenRankRanks = useCallback(async (fids: number[]) => {
    if (fids.length === 0) return;

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
      const cachedRanks: Record<number, number | null> = {};
      uniqueFids.forEach((fid) => {
        if (openRankCache.current.data.hasOwnProperty(fid)) {
          cachedRanks[fid] = openRankCache.current.data[fid];
        }
      });

      if (Object.keys(cachedRanks).length > 0) {
        setOpenRankRanks((prev) => ({ ...prev, ...cachedRanks }));
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

      if (data.ranks) {
        // Convert string keys to numbers for consistency
        const newRankMap: Record<number, number | null> = {};

        Object.entries(data.ranks).forEach(([fid, rank]) => {
          newRankMap[parseInt(fid)] = rank as number | null;
        });

        // Update cache with new data
        openRankCache.current.data = {
          ...openRankCache.current.data,
          ...newRankMap,
        };
        openRankCache.current.timestamp = now;

        // Update state with new data
        setOpenRankRanks((prev) => ({ ...prev, ...newRankMap }));
      }
    } catch (error) {
      console.error("Failed to fetch OpenRank ranks:", error);
    }
  }, []);

  // Memoized filter and sort functions
  const getMinutesAgo = useCallback((timeAgo: string) => {
    const match = timeAgo.match(/(\d+)([mhd])/);
    if (!match) return 0;
    const value = parseInt(match[1], 10);
    const unit = match[2];
    if (unit === "m") return value;
    if (unit === "h") return value * 60;
    if (unit === "d") return value * 60 * 24;
    return 0;
  }, []);

  const sortDetails = useCallback(
    (details: UnrepliedDetail[]) => {
      const arr = [...details]; // Create copy to avoid mutation
      switch (sortOption) {
        case "newest":
          arr.sort(
            (a, b) => getMinutesAgo(a.timeAgo) - getMinutesAgo(b.timeAgo)
          );
          break;
        case "oldest":
          arr.sort(
            (a, b) => getMinutesAgo(b.timeAgo) - getMinutesAgo(a.timeAgo)
          );
          break;
        case "fid-asc":
          arr.sort((a, b) => a.authorFid - b.authorFid);
          break;
        case "fid-desc":
          arr.sort((a, b) => b.authorFid - a.authorFid);
          break;
        case "short":
          return arr.filter((d) => d.text.length < 20);
        case "medium":
          return arr.filter((d) => d.text.length >= 20 && d.text.length <= 50);
        case "long":
          return arr.filter((d) => d.text.length > 50);
        default:
          break;
      }
      return arr;
    },
    [sortOption, getMinutesAgo]
  );

  // Memoized processed data
  const processedData = useMemo(() => {
    if (!data?.unrepliedDetails) return [];

    const filtered = data.unrepliedDetails;
    const sorted = sortDetails(filtered);
    return sorted;
  }, [data?.unrepliedDetails, sortDetails]);

  // 1. Fetch user context once on mount
  useEffect(() => {
    const getUser = async () => {
      await sdk.actions.ready();
      try {
        const ctx = await sdk.context;
        const farUser = ctx?.user ?? {
          fid: 234616,
          username: "leovido",
          displayName: "Leovido",
          pfpUrl:
            "https://wrpcd.net/cdn-cgi/imagedelivery/BXluQx4ige9GuW0Ia56BHw/252c844e-7be7-4dd5-6938-c1affcfd7e00/anim=false,fit=contain,f=auto,w=576",
        };
        setUser(farUser);
      } catch (err) {
        setError("Failed to load user");
        setLoading(false);
      }
    };
    getUser();
  }, []);

  // 2. Fetch data when user is set
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

        console.log("🌐 Initial fetch URL:", url.toString());
        const res = await fetch(url.toString());
        const responseData = await res.json();

        console.log("📦 Initial response data:", {
          unrepliedCount: responseData.unrepliedCount,
          detailsCount: responseData.unrepliedDetails?.length || 0,
          nextCursor: responseData.nextCursor,
          hasMore: !!responseData.nextCursor,
        });

        if (responseData) {
          setData(responseData);
          setLoading(false);
          setIsLoadingMore(false);
          setAllConversations(responseData.unrepliedDetails || []);
          setCursor(responseData.nextCursor || null);

          // Set hasMore based on nextCursor availability
          const hasMoreData = !!responseData.nextCursor;
          console.log(
            "🎯 Setting hasMore to:",
            hasMoreData,
            "because nextCursor:",
            responseData.nextCursor
          );
          setHasMore(hasMoreData);

          // Fetch OpenRank ranks for all FIDs in the response
          if (responseData.unrepliedDetails?.length > 0) {
            const fids = responseData.unrepliedDetails.map(
              (detail: UnrepliedDetail) => detail.authorFid
            );
            await fetchOpenRankRanks(fids);
          }
        }
      } catch (err) {
        console.error("❌ Error in initial fetch:", err);
        setHasMore(false);
        setError(
          err instanceof Error ? err.message : "Failed to load conversations"
        );
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Reset pagination when filters change
  useEffect(() => {
    if (allConversations.length > 0) {
      setCursor(null);
      setHasMore(true);
      setIsLoadingMore(false);
      setAllConversations([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayFilter, sortOption]);

  // Intersection Observer for infinite scroll
  const loadMoreConversations = useCallback(async () => {
    console.log("🔄 Loading more conversations...");
    console.log("📊 Current state:", {
      hasMore,
      isLoadingMore,
      loading,
      cursor,
    });

    if (!hasMore || isLoadingMore || loading) {
      console.log("❌ Skipping load - conditions not met:", {
        hasMore,
        isLoadingMore,
        loading,
      });
      return;
    }

    setIsLoadingMore(true);
    try {
      const url = new URL(
        "/api/farcaster-notification-replies",
        window.location.origin
      );
      url.searchParams.set("fid", user?.fid.toString() || "203666");
      if (cursor) {
        url.searchParams.set("cursor", cursor);
        console.log("📎 Using cursor:", cursor);
      } else {
        console.log("📎 No cursor - first page");
      }

      console.log("🌐 Fetching URL:", url.toString());
      const res = await fetch(url.toString());
      const responseData = await res.json();

      console.log("📦 Response data:", {
        unrepliedCount: responseData.unrepliedCount,
        detailsCount: responseData.unrepliedDetails?.length || 0,
        nextCursor: responseData.nextCursor,
        hasMore: !!responseData.nextCursor,
      });

      // Append new conversations
      setAllConversations((prev) => {
        const newConversations = [
          ...prev,
          ...(responseData.unrepliedDetails || []),
        ];
        console.log("📈 Total conversations now:", newConversations.length);
        return newConversations;
      });

      setCursor(responseData.nextCursor || null);
      console.log("🔄 New cursor set:", responseData.nextCursor);

      // If no more data, stop loading more
      if (!responseData.nextCursor || !responseData.unrepliedDetails?.length) {
        console.log("🏁 No more data - stopping infinite scroll");
        setHasMore(false);
      } else {
        console.log("✅ More data available - continuing infinite scroll");
      }
    } catch (e) {
      console.error("❌ Error loading more conversations:", e);
      setHasMore(false); // Stop trying if error
    }
    setIsLoadingMore(false); // Always reset spinner
    console.log("🏁 Finished loading more conversations");
  }, [hasMore, isLoadingMore, loading, user, cursor]);

  useEffect(() => {
    const current = observerRef.current;
    console.log("🔧 Setting up observer on:", current);
    console.log("🔧 Observer state:", { hasMore, isLoadingMore, loading });

    if (!current) {
      console.log("❌ Observer ref is null - cannot set up observer");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        console.log("👁️ Observer triggered:", {
          isIntersecting: entry.isIntersecting,
          hasMore,
          isLoadingMore,
          loading,
          shouldLoad:
            entry.isIntersecting && hasMore && !isLoadingMore && !loading,
        });

        if (entry.isIntersecting && hasMore && !isLoadingMore && !loading) {
          console.log(
            "🚀 Triggering loadMoreConversations from intersection observer"
          );
          loadMoreConversations();
        } else if (entry.isIntersecting) {
          console.log("⏸️ Observer triggered but conditions not met:", {
            hasMore,
            isLoadingMore,
            loading,
          });
        }
      },
      { rootMargin: "100px", threshold: 0.1 }
    );

    observer.observe(current);

    return () => {
      observer.unobserve(current);
    };
  }, [hasMore, isLoadingMore, loading, loadMoreConversations]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);

    // Clear OpenRank cache to force fresh data
    openRankCache.current = { data: {}, timestamp: 0 };

    // Force refresh by bypassing cache
    const userFid = user?.fid || 203666;
    try {
      const res = await fetch(
        `/api/farcaster-notification-replies?fid=${userFid}&cursor=${cursor}`,
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
  }, [user?.fid, fetchOpenRankRanks]);

  const handleCancelReply = useCallback(() => {
    setSelectedCast(null);
    setReplyText("");
    setReplyError(null);
  }, []);

  const handleComposeCast = useCallback(async () => {
    if (!selectedCast || !replyText.trim()) return;

    setIsComposing(true);
    setReplyError(null);

    try {
      const result = await sdk.actions.composeCast({
        text: replyText,
        parent: {
          type: "cast",
          hash: selectedCast.castHash,
        },
      });

      if (result?.cast) {
        // Success! Clear the form and refresh data
        setSelectedCast(null);
        setReplyText("");
        // Reset pagination and refresh all data
        setCursor(null);
        setHasMore(true);
        setIsLoadingMore(false);
        setAllConversations([]);
        // fetchData(true) // This will now be handled by the new useEffect
      }
    } catch (error) {
      console.error("Failed to compose cast:", error);
      setReplyError("Failed to send reply. Please try again.");
    } finally {
      setIsComposing(false);
    }
  }, [selectedCast, replyText]); // Removed fetchData from dependencies

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleComposeCast();
      } else if (e.key === "Escape") {
        handleCancelReply();
      }
    },
    [handleComposeCast, handleCancelReply]
  );

  const handleReply = async (cast: UnrepliedDetail) => {
    try {
      console.log("viewing cast...");
      await sdk.actions.viewCast({
        hash: cast.castHash,
      });
    } catch (error) {
      console.error("Failed to view cast:", error);
      // Fallback to modal if viewCast fails
      setSelectedCast(cast);
      setReplyText("");
      setReplyError(null);

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  };

  const charactersRemaining = MAX_CHARACTERS - replyText.length;
  const isOverLimit = charactersRemaining < 0;

  let username = "@username";
  if (data && data.unrepliedDetails.length > 0) {
    username = `@${data.unrepliedDetails[0].username}`;
  }

  // Show loading screen when loading is true
  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Filtered and sorted data for rendering
  const filteredDetails =
    allConversations.length > 0 ? sortDetails(allConversations) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 font-sans">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-cyan-500/20"></div>
        <div className="relative px-6 pt-12 pb-8">
          <div className="max-w-3xl mx-auto text-center">
            {/* App Title with Logo */}
            <div className="flex flex-col items-center justify-center mb-2">
              <Image
                src="/logo.png"
                alt="ReplyCast Logo"
                width={75}
                height={75}
                className="mb-2 rounded-xl shadow-lg"
                priority
              />
              <h1
                className="text-5xl font-black text-white tracking-tight"
                style={{
                  fontFamily: "Instrument Sans, Nunito, Inter, sans-serif",
                }}
              >
                ReplyCast
              </h1>
              <p
                className="text-xl md:text-2xl font-medium text-white/90 mb-8"
                style={{
                  fontFamily: "Instrument Sans, Nunito, Inter, sans-serif",
                }}
              >
                Never miss a reply again
              </p>
            </div>

            {/* User Greeting */}
            {user && (
              <div className="mb-6 flex items-center justify-left gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                {user.pfpUrl && (
                  <Image
                    src={`/api/image-proxy?url=${user.pfpUrl}`}
                    alt="Profile picture"
                    width={60}
                    height={60}
                    className="rounded-full border-2 border-white/30"
                  />
                )}
                <div className="text-left">
                  <div className="text-white font-semibold text-lg">
                    {user.displayName} (@{user.username})
                  </div>
                  <div className="text-white/70 text-sm">FID: {user.fid}</div>
                </div>
              </div>
            )}

            {/* Stats Card */}
            <div className="glass rounded-3xl p-10 mb-8 animate-fade-in-up shadow-xl border border-white/30">
              <div className="text-center">
                <div className="text-white/80 text-lg font-medium mb-2">
                  {user?.username} has
                </div>
                <div
                  className="text-7xl md:text-8xl font-extrabold text-white mb-2 tracking-tighter"
                  style={{
                    fontFamily: "Instrument Sans, Nunito, Inter, sans-serif",
                  }}
                >
                  {data ? data.unrepliedCount : "--"}
                </div>
                <div className="text-white text-xl font-semibold mb-2">
                  unreplied conversations
                </div>
                {/* Error Display */}
                {error && (
                  <div className="mt-6 bg-red-500/10 border border-red-400/30 rounded-xl p-4">
                    <div className="text-red-700 text-sm font-medium">
                      {error}
                    </div>
                  </div>
                )}
                {/* Cache Status */}
                {process.env.NODE_ENV === "development" && (
                  <div className="text-xs text-white/60 bg-white/5 px-2 py-1 rounded-lg border border-white/10 mt-4">
                    <span className="font-mono">
                      Cache: {getCacheStatus().cachedFids} FIDs (
                      {getCacheStatus().age}s)
                    </span>
                  </div>
                )}
                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="btn-secondary mt-6 inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-xl px-4 py-2 text-base"
                  aria-label="Refresh"
                >
                  <svg
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`${isRefreshing ? "animate-spin" : ""}`}
                    aria-hidden="true"
                  >
                    <path d="M23 4v6h-6" />
                    <path d="M1 20v-6h6" />
                    <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10" />
                    <path d="M20.49 15A9 9 0 0 1 6.36 18.36L1 14" />
                  </svg>
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>

            {/* Filter Section */}
            <div className="glass rounded-2xl p-4 mt-6 border border-white/20">
              <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6">
                <div className="flex items-center gap-2 mb-2 md:mb-0">
                  <span className="text-white/80 text-sm font-medium mr-2">
                    View:
                  </span>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-xl transition-all duration-200 ${
                      viewMode === "list"
                        ? "bg-white/20 text-white shadow-lg"
                        : "bg-white/10 text-white/60 hover:bg-white/15 hover:text-white/80"
                    }`}
                    aria-label="List view"
                  >
                    <svg
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" />
                      <line x1="3" y1="12" x2="3.01" y2="12" />
                      <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-xl transition-all duration-200 ${
                      viewMode === "grid"
                        ? "bg-white/20 text-white shadow-lg"
                        : "bg-white/10 text-white/60 hover:bg-white/15 hover:text-white/80"
                    }`}
                    aria-label="Grid view"
                  >
                    <svg
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                  </button>
                </div>
                {/* Day Filter Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-white/80 text-sm font-medium mr-2">
                    Day:
                  </span>
                  <select
                    value={dayFilter}
                    onChange={(e) => setDayFilter(e.target.value as any)}
                    className="bg-white/10 text-white/90 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 border border-white/20 shadow-sm"
                    style={{
                      fontFamily: "Instrument Sans, Nunito, Inter, sans-serif",
                    }}
                  >
                    <option value="all" className="bg-gray-800 text-white">
                      All
                    </option>
                    <option value="today" className="bg-gray-800 text-white">
                      Today
                    </option>
                    <option value="3days" className="bg-gray-800 text-white">
                      Last 3 days
                    </option>
                    <option value="7days" className="bg-gray-800 text-white">
                      Last 7 days
                    </option>
                  </select>
                </div>
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-white/80 text-sm font-medium mr-2">
                    Sort:
                  </span>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as any)}
                    className="bg-white/10 text-white/90 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 border border-white/20 shadow-sm"
                    style={{
                      fontFamily: "Instrument Sans, Nunito, Inter, sans-serif",
                    }}
                  >
                    <option value="newest" className="bg-gray-800 text-white">
                      Newest
                    </option>
                    <option value="oldest" className="bg-gray-800 text-white">
                      Oldest
                    </option>
                    <option value="fid-asc" className="bg-gray-800 text-white">
                      FID: Low → High
                    </option>
                    <option value="fid-desc" className="bg-gray-800 text-white">
                      FID: High → Low
                    </option>
                    <option value="short" className="bg-gray-800 text-white">
                      Cast: Short (&lt;20 chars)
                    </option>
                    <option value="medium" className="bg-gray-800 text-white">
                      Cast: Medium (20–50 chars)
                    </option>
                    <option value="long" className="bg-gray-800 text-white">
                      Cast: Long (&gt;50 chars)
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Conversations List */}
      <div className="px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          {viewMode === "list" ? (
            <div className="space-y-6">
              {filteredDetails.map((cast, index) => (
                <ReplyCard
                  key={index}
                  detail={cast}
                  onClick={() => handleReply(cast)}
                  viewMode={viewMode}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDetails.map((cast, index) => (
                <ReplyCard
                  key={index}
                  detail={cast}
                  onClick={() => handleReply(cast)}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}

          {/* Loading More Indicator */}
          {isLoadingMore && (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-3 text-white/80">
                <svg
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-spin"
                  aria-hidden="true"
                >
                  <path d="M23 4v6h-6" />
                  <path d="M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10" />
                  <path d="M20.49 15A9 9 0 0 1 6.36 18.36L1 14" />
                </svg>
                <span className="text-sm font-medium">
                  Loading more conversations...
                </span>
              </div>
            </div>
          )}

          {/* End of Results */}
          {!hasMore && filteredDetails.length > 0 && (
            <div className="text-center py-8">
              <div className="text-white/60 text-sm">
                <span className="font-medium">🎉 All caught up!</span>
                <p className="mt-1">
                  You&apos;ve seen all your unreplied conversations.
                </p>
              </div>
            </div>
          )}

          {/* Intersection Observer Element */}
          <div
            ref={observerRef}
            className="h-4 w-full"
            aria-hidden="true"
            style={{
              backgroundColor: hasMore
                ? "rgba(0,255,0,0.1)"
                : "rgba(255,0,0,0.1)",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          />
          {/* Debug info */}
          <div className="text-xs text-white/60 text-center py-2">
            hasMore: {hasMore.toString()} | isLoadingMore:{" "}
            {isLoadingMore.toString()} | loading: {loading.toString()}
          </div>

          {/* Empty State */}
          {filteredDetails.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="glass rounded-3xl p-12">
                <div className="text-6xl mb-4">🎉</div>
                <h3
                  className="text-2xl font-bold text-white mb-2"
                  style={{
                    fontFamily: "Instrument Sans, Nunito, Inter, sans-serif",
                  }}
                >
                  All caught up!
                </h3>
                <p className="text-gray-700/80 text-lg">
                  You&apos;ve replied to all your conversations.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Reply Modal - Temporarily hidden */}
      {/* {selectedCast && (
        <div className="modal-overlay" onClick={handleCancelReply}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <Image
                src={`/api/image-proxy?url=${selectedCast.avatarUrl}`}
                alt={selectedCast.username}
                width={40}
                height={40}
                className="rounded-full border-2 border-gray-200 object-cover"
                onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
              />
              <div>
                <div
                  className="font-bold text-lg text-gray-900"
                  style={{
                    fontFamily: "Instrument Sans, Nunito, Inter, sans-serif",
                  }}
                >
                  @{selectedCast.username}
                </div>
                <div className="text-xs text-gray-500">
                  {selectedCast.timeAgo}
                </div>
              </div>
            </div>
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-l-4 border-blue-400">
              <div className="text-xs text-blue-600 mb-2 font-semibold">
                Original cast by @{selectedCast.originalAuthorUsername}
              </div>
              <div className="text-sm text-gray-700 leading-relaxed">
                {selectedCast.originalCastText}
              </div>
            </div>
            <div className="mb-6 p-4 bg-gray-50 rounded-xl max-h-32 overflow-y-auto">
              <div className="text-sm text-gray-700 leading-relaxed">
                {selectedCast.text}
              </div>
            </div>
            <div className="relative mb-6">
              <textarea
                ref={textareaRef}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write your reply... (⌘+Enter to send, Esc to cancel)"
                className={`input-field resize-none h-32 ${
                  isOverLimit ? "border-red-300 focus:ring-red-500" : ""
                }`}
                disabled={isComposing}
                maxLength={MAX_CHARACTERS}
                style={{
                  fontFamily: "Instrument Sans, Nunito, Inter, sans-serif",
                }}
              />
              <div
                className={`absolute bottom-4 right-4 text-sm font-medium ${
                  isOverLimit ? "text-red-500" : "text-gray-400"
                }`}
              >
                {charactersRemaining}
              </div>
            </div>
            {replyError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-red-600 text-sm font-medium">
                  {replyError}
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleCancelReply}
                disabled={isComposing}
                className="flex-1 px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 font-semibold transition-all"
                style={{
                  fontFamily: "Instrument Sans, Nunito, Inter, sans-serif",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleComposeCast}
                disabled={isComposing || !replyText.trim() || isOverLimit}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  fontFamily: "Instrument Sans, Nunito, Inter, sans-serif",
                }}
              >
                {isComposing ? (
                  <span className="flex items-center gap-2">
                    <svg
                      width={16}
                      height={16}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="animate-spin"
                      aria-hidden="true"
                    >
                      <path d="M23 4v6h-6" />
                      <path d="M1 20v-6h6" />
                      <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10" />
                      <path d="M20.49 15A9 9 0 0 1 6.36 18.36L1 14" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  "Reply"
                )}
              </button>
            </div>
            <div className="mt-4 text-center text-xs text-gray-500">
              Press ⌘+Enter to send quickly
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
});

FarcasterApp.displayName = "FarcasterApp";

export default FarcasterApp;
