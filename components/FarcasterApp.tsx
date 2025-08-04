import { useState, useEffect, useCallback, useMemo } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { AppHeader } from "./AppHeader";
import { ConversationList } from "./ConversationList";
import { Filters } from "./Filters";
import { LoadingScreen } from "./LoadingScreen";
import { useFarcasterAuth } from "@/hooks/useFarcasterAuth";
import { useFarcasterData } from "@/hooks/useFarcasterData";
import { useOpenRank } from "@/hooks/useOpenRank";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { sortDetails } from "@/utils/farcaster";
import type { UnrepliedDetail } from "@/types/types";

// Feature flag for the new design
const USE_NEW_DESIGN = process.env.NEXT_PUBLIC_USE_NEW_DESIGN === "true";

export default function FarcasterApp() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [themeMode, setThemeMode] = useState<"dark" | "light" | "glass">(
    "dark"
  );
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortOption, setSortOption] = useState<
    | "newest"
    | "oldest"
    | "fid-asc"
    | "fid-desc"
    | "short"
    | "medium"
    | "long"
    | "openrank-asc"
    | "openrank-desc"
  >("newest");
  const [dayFilter, setDayFilter] = useState<
    "all" | "today" | "3days" | "7days"
  >("all");

  const {
    user,
    loading: authLoading,
    error: authError,
    isInMiniApp,
    handleSignIn,
    handleSignInError,
  } = useFarcasterAuth();
  const { openRankRanks, fetchOpenRankRanks, getCacheStatus, clearCache } =
    useOpenRank();
  const {
    allConversations,
    loading: dataLoading,
    error: dataError,
    isRefreshing,
    hasMore,
    isLoadingMore,
    userOpenRank,
    loadMoreConversations,
    handleRefresh,
    resetPagination,
  } = useFarcasterData({
    user,
    fetchOpenRankRanks,
    clearOpenRankCache: clearCache,
    dayFilter,
  });
  const { observerRef } = useInfiniteScroll({
    hasMore,
    isLoadingMore,
    loading: dataLoading,
    loadMoreConversations,
  });

  const handleReply = useCallback(async (detail: UnrepliedDetail) => {
    try {
      await sdk.actions.composeCast({
        text: `@${detail.username} `,
        embeds: [detail.castUrl],
      });
    } catch (error) {
      console.error("Failed to compose cast:", error);
    }
  }, []);

  const handleMarkAsRead = useCallback((detail: UnrepliedDetail) => {
    // For now, just log the action
    // In a real implementation, you would:
    // 1. Send to an API to mark as read
    // 2. Update the conversation list
    // 3. Store in localStorage
    console.log(`Marked as read: ${detail.username}'s cast`);

    // You could implement a more sophisticated state management here
    // For example, filter out the marked conversation from the display
  }, []);

  useEffect(() => {
    if (user && !authLoading) {
      fetchOpenRankRanks([user.fid]);
    }
  }, [user, authLoading, fetchOpenRankRanks]);

  useEffect(() => {
    if (user && !authLoading) {
      sdk.actions.ready();
    }
  }, [user, authLoading]);

  const sortedConversations = useMemo(() => {
    return sortDetails(allConversations, sortOption, openRankRanks);
  }, [allConversations, sortOption, openRankRanks]);

  const handleThemeToggle = () => {
    if (themeMode === "dark") {
      setThemeMode("light");
      setIsDarkTheme(false);
    } else if (themeMode === "light") {
      setThemeMode("glass");
      setIsDarkTheme(true); // Glass theme uses dark background
    } else {
      setThemeMode("dark");
      setIsDarkTheme(true);
    }
  };

  const getThemeButtonText = () => {
    switch (themeMode) {
      case "dark":
        return "🌙";
      case "light":
        return "☀️";
      case "glass":
        return "💎";
      default:
        return "🌙";
    }
  };

  const getBackgroundClass = () => {
    switch (themeMode) {
      case "dark":
        return "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900";
      case "light":
        return "bg-gradient-to-br from-gray-50 via-white to-gray-100";
      case "glass":
        return "bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900";
      default:
        return "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900";
    }
  };

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <div className={`min-h-screen ${getBackgroundClass()}`}>
        <div className="flex items-center justify-center min-h-screen p-6">
          <div
            className={`max-w-md w-full ${
              themeMode === "glass"
                ? "bg-white/10 backdrop-blur-sm border border-white/20"
                : isDarkTheme
                ? "bg-zinc-800/50 backdrop-blur-sm border border-white/20"
                : "bg-white/80 backdrop-blur-sm border border-gray-200"
            } rounded-2xl p-8 shadow-xl`}
          >
            <div className="text-center">
              <h1
                className={`text-2xl font-bold mb-4 ${
                  isDarkTheme ? "text-white" : "text-gray-900"
                }`}
              >
                ReplyCast Widget
              </h1>
              <p
                className={`mb-6 ${
                  isDarkTheme ? "text-white/70" : "text-gray-600"
                }`}
              >
                Track your unreplied conversations on Farcaster
              </p>
              <button
                onClick={() =>
                  handleSignIn({
                    fid: 203666,
                    username: "leovido",
                    displayName: "Leovido",
                    pfpUrl: "https://example.com/avatar.jpg",
                  })
                }
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Sign in with Farcaster
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!USE_NEW_DESIGN) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <AppHeader
            user={user}
            conversationCount={allConversations.length}
            onRefresh={handleRefresh}
            userOpenRank={userOpenRank}
            error={dataError}
            isRefreshing={isRefreshing}
            getCacheStatus={getCacheStatus}
            isDarkTheme={true}
            useOldDesign={true}
          />
          <Filters
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortOption={sortOption}
            onSortOptionChange={setSortOption}
            dayFilter={dayFilter}
            onDayFilterChange={setDayFilter}
            isDarkTheme={true}
            useOldDesign={true}
          />
          <ConversationList
            conversations={sortedConversations}
            viewMode={viewMode}
            openRankRanks={openRankRanks}
            loading={dataLoading}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            observerRef={observerRef}
            onReply={handleReply}
            isDarkTheme={true}
            useOldDesign={true}
            onMarkAsRead={handleMarkAsRead}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${getBackgroundClass()} transition-colors duration-300`}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Theme Toggle Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleThemeToggle}
            className={`p-3 rounded-full text-2xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              themeMode === "glass"
                ? "bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
                : themeMode === "dark"
                ? "bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
                : "bg-gray-800/10 backdrop-blur-sm border border-gray-300/20 hover:bg-gray-800/20"
            }`}
            aria-label={`Switch to ${
              themeMode === "dark"
                ? "light"
                : themeMode === "light"
                ? "glass"
                : "dark"
            } theme`}
          >
            {getThemeButtonText()}
          </button>
        </div>

        <AppHeader
          user={user}
          conversationCount={allConversations.length}
          onRefresh={handleRefresh}
          userOpenRank={userOpenRank}
          error={dataError}
          isRefreshing={isRefreshing}
          getCacheStatus={getCacheStatus}
          isDarkTheme={isDarkTheme}
          useOldDesign={themeMode === "glass"}
        />
        <Filters
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortOption={sortOption}
          onSortOptionChange={setSortOption}
          dayFilter={dayFilter}
          onDayFilterChange={setDayFilter}
          isDarkTheme={isDarkTheme}
          useOldDesign={themeMode === "glass"}
        />
        <ConversationList
          conversations={sortedConversations}
          viewMode={viewMode}
          openRankRanks={openRankRanks}
          loading={dataLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          observerRef={observerRef}
          onReply={handleReply}
          isDarkTheme={isDarkTheme}
          useOldDesign={themeMode === "glass"}
          onMarkAsRead={handleMarkAsRead}
        />
      </div>
    </div>
  );
}
