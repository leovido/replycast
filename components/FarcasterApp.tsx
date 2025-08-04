import { useState, useEffect, useCallback } from "react";
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
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
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
    "today" | "all" | "3days" | "7days"
  >("today");
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  const {
    user,
    loading: authLoading,
    error: authError,
    isInMiniApp,
    handleSignIn,
    handleSignInError,
  } = useFarcasterAuth();

  const {
    fetchOpenRankRanks,
    clearCache: clearOpenRankCache,
    openRankRanks,
    getCacheStatus,
  } = useOpenRank();

  const {
    data,
    loading: dataLoading,
    error: dataError,
    isRefreshing,
    allConversations,
    hasMore,
    isLoadingMore,
    userOpenRank,
    loadMoreConversations,
    handleRefresh,
    resetPagination,
  } = useFarcasterData({
    user,
    fetchOpenRankRanks,
    clearOpenRankCache,
    dayFilter,
  });

  const { observerRef } = useInfiniteScroll({
    hasMore,
    isLoadingMore,
    loading: dataLoading,
    loadMoreConversations,
  });

  // Sort conversations based on current sort option
  const sortedConversations = sortDetails(
    allConversations,
    sortOption,
    openRankRanks
  );

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
      sdk.actions.ready();
    }
  }, [user, authLoading]);

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <div
        className={`min-h-screen ${
          isDarkTheme
            ? "bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900"
            : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
        }`}
      >
        <div className="flex items-center justify-center min-h-screen p-6">
          <div
            className={`max-w-md w-full ${
              isDarkTheme
                ? "bg-zinc-800/50 backdrop-blur-sm"
                : "bg-white/80 backdrop-blur-sm"
            } rounded-2xl p-8 border ${
              isDarkTheme ? "border-white/20" : "border-gray-200"
            } shadow-xl`}
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

  // Render old design if feature flag is disabled
  if (!USE_NEW_DESIGN) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 font-sans">
        {/* Header Section */}
        <AppHeader
          user={user}
          conversationCount={allConversations.length}
          userOpenRank={userOpenRank}
          error={dataError}
          isRefreshing={isRefreshing}
          getCacheStatus={getCacheStatus}
          onRefresh={handleRefresh}
          isDarkTheme={true}
          useOldDesign={true}
        />

        {/* Filter Section */}
        <div className="px-6 pb-4">
          <div className="max-w-3xl mx-auto">
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
          </div>
        </div>

        {/* Legend Section */}
        <div className="px-6 pb-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <svg
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-yellow-400"
                  >
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                  <span>OpenRank (user influence score)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-zinc-900 flex items-center justify-center">
                    <svg
                      width={8}
                      height={8}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-white"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <span>You interacted with this cast</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    width={12}
                    height={12}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-red-400"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span>Likes</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    width={12}
                    height={12}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-green-400"
                  >
                    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Recasts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

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
    );
  }

  // Render new design with theme toggle
  return (
    <div
      className={`min-h-screen ${
        isDarkTheme
          ? "bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
      }`}
    >
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsDarkTheme(!isDarkTheme)}
          className={`p-3 rounded-full ${
            isDarkTheme
              ? "bg-zinc-800/50 backdrop-blur-sm border border-white/20"
              : "bg-white/80 backdrop-blur-sm border border-gray-200"
          } shadow-lg transition-all hover:scale-105`}
          aria-label="Toggle theme"
        >
          {isDarkTheme ? (
            <svg
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="text-yellow-400"
            >
              <circle cx={12} cy={12} r={5} />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            <svg
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="text-gray-700"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>

      <div className="pt-16">
        <AppHeader
          user={user}
          conversationCount={allConversations.length}
          userOpenRank={userOpenRank}
          error={dataError}
          isRefreshing={isRefreshing}
          getCacheStatus={getCacheStatus}
          onRefresh={handleRefresh}
          isDarkTheme={isDarkTheme}
          useOldDesign={false}
        />

        <Filters
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortOption={sortOption}
          onSortOptionChange={setSortOption}
          dayFilter={dayFilter}
          onDayFilterChange={setDayFilter}
          isDarkTheme={isDarkTheme}
          useOldDesign={false}
        />

        {/* Legend Section */}
        <div className="px-6 pb-4">
          <div className="max-w-3xl mx-auto">
            <div
              className={`${
                isDarkTheme
                  ? "bg-white/10 backdrop-blur-sm border border-white/20"
                  : "bg-white/60 backdrop-blur-sm border border-gray-200"
              } rounded-xl p-4`}
            >
              <div
                className={`flex flex-wrap items-center gap-4 text-sm ${
                  isDarkTheme ? "text-white/80" : "text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-yellow-400"
                  >
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                  <span>OpenRank (user influence score)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-zinc-900 flex items-center justify-center">
                    <svg
                      width={8}
                      height={8}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-white"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <span>You interacted with this cast</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    width={12}
                    height={12}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-red-400"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span>Likes</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    width={12}
                    height={12}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-green-400"
                  >
                    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Recasts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

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
          useOldDesign={false}
          onMarkAsRead={handleMarkAsRead}
        />
      </div>
    </div>
  );
}
