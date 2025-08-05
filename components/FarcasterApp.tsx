import { useState, useEffect, useCallback, useMemo } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { AppHeader } from "./AppHeader";
import { Filters } from "./Filters";
import { ConversationList } from "./ConversationList";
import { LoadingScreen } from "./LoadingScreen";
import { useFarcasterAuth } from "@/hooks/useFarcasterAuth";
import { useOpenRank } from "@/hooks/useOpenRank";
import { useFarcasterData } from "@/hooks/useFarcasterData";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { sortDetails } from "@/utils/farcaster";
import type { UnrepliedDetail } from "@/types/types";

const USE_NEW_DESIGN = process.env.NEXT_PUBLIC_USE_NEW_DESIGN === "true";

// Settings Menu Component
function SettingsMenu({
  isOpen,
  onClose,
  themeMode,
  onThemeChange,
  viewMode,
  onViewModeChange,
  sortOption,
  onSortChange,
  dayFilter,
  onDayFilterChange,
  isDarkTheme,
}: {
  isOpen: boolean;
  onClose: () => void;
  themeMode: "dark" | "light" | "glass";
  onThemeChange: (theme: "dark" | "light" | "glass") => void;
  viewMode: "list" | "grid";
  onViewModeChange: (mode: "list" | "grid") => void;
  sortOption: string;
  onSortChange: (option: string) => void;
  dayFilter: string;
  onDayFilterChange: (filter: string) => void;
  isDarkTheme: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center pt-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Menu */}
      <div
        className={`relative w-full max-w-md rounded-2xl p-6 shadow-2xl ${
          isDarkTheme
            ? "bg-gradient-to-br from-gray-800/95 to-gray-900/95 border border-white/20"
            : "bg-white/95 border border-gray-200"
        } backdrop-blur-md transform transition-all duration-300 ease-out max-h-[90vh] overflow-y-auto`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className={`text-xl font-bold ${
              isDarkTheme ? "text-white" : "text-gray-900"
            }`}
          >
            Settings
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-white/10 transition-colors ${
              isDarkTheme ? "text-white/70" : "text-gray-600"
            }`}
          >
            <svg
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Theme Section */}
        <div className="mb-6">
          <h3
            className={`text-sm font-semibold mb-3 ${
              isDarkTheme ? "text-white/80" : "text-gray-700"
            }`}
          >
            Theme
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {(["dark", "light", "glass"] as const).map((theme) => (
              <button
                key={theme}
                onClick={() => onThemeChange(theme)}
                className={`p-3 rounded-xl transition-all ${
                  themeMode === theme
                    ? "bg-blue-500 text-white shadow-lg"
                    : isDarkTheme
                    ? "bg-white/10 hover:bg-white/20 text-white/70"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                <div className="text-center">
                  <div className="text-lg mb-1">
                    {theme === "dark" ? "🌙" : theme === "light" ? "☀️" : "💎"}
                  </div>
                  <div className="text-xs capitalize">{theme}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Section */}
        <div className="mb-6">
          <h3
            className={`text-sm font-semibold mb-3 ${
              isDarkTheme ? "text-white/80" : "text-gray-700"
            }`}
          >
            View Mode
          </h3>
          <div className="flex gap-2">
            {(["list", "grid"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`flex-1 p-3 rounded-xl transition-all ${
                  viewMode === mode
                    ? "bg-blue-500 text-white shadow-lg"
                    : isDarkTheme
                    ? "bg-white/10 hover:bg-white/20 text-white/70"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                <div className="text-center">
                  <div className="text-lg mb-1">
                    {mode === "list" ? "📋" : "📊"}
                  </div>
                  <div className="text-xs capitalize">{mode}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="mb-6">
          <h3
            className={`text-sm font-semibold mb-3 ${
              isDarkTheme ? "text-white/80" : "text-gray-700"
            }`}
          >
            Sort By
          </h3>
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value)}
            className={`w-full p-3 rounded-xl border transition-colors ${
              isDarkTheme
                ? "bg-white/10 border-white/20 text-white focus:border-blue-400"
                : "bg-white border-gray-200 text-gray-900 focus:border-blue-400"
            }`}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="openrank-desc">Highest OpenRank</option>
            <option value="openrank-asc">Lowest OpenRank</option>
            <option value="fid-asc">FID (Low to High)</option>
            <option value="fid-desc">FID (High to Low)</option>
          </select>
        </div>

        {/* Day Filter */}
        <div className="mb-6">
          <h3
            className={`text-sm font-semibold mb-3 ${
              isDarkTheme ? "text-white/80" : "text-gray-700"
            }`}
          >
            Time Filter
          </h3>
          <select
            value={dayFilter}
            onChange={(e) => onDayFilterChange(e.target.value)}
            className={`w-full p-3 rounded-xl border transition-colors ${
              isDarkTheme
                ? "bg-white/10 border-white/20 text-white focus:border-blue-400"
                : "bg-white border-gray-200 text-gray-900 focus:border-blue-400"
            }`}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="3days">Last 3 Days</option>
            <option value="7days">Last 7 Days</option>
          </select>
        </div>
      </div>
    </div>
  );
}

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

  const handleThemeChange = (theme: "dark" | "light" | "glass") => {
    setThemeMode(theme);
    setIsDarkTheme(theme !== "light");
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
      <div className="container mx-auto px-4 py-6">
        {/* Header with Settings Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1
              className={`text-2xl font-bold ${
                isDarkTheme ? "text-white" : "text-gray-900"
              }`}
            >
              ReplyCast
            </h1>
            <div
              className={`px-3 py-1 rounded-full text-sm ${
                isDarkTheme
                  ? "bg-white/10 text-white/70"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {allConversations.length} conversations
            </div>
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`p-3 rounded-full transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              themeMode === "glass"
                ? "bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
                : themeMode === "dark"
                ? "bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
                : "bg-gray-800/10 backdrop-blur-sm border border-gray-300/20 hover:bg-gray-800/20"
            }`}
            aria-label="Open settings"
          >
            <svg
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>

        {/* User Info Card */}
        <div
          className={`mb-6 p-4 rounded-2xl ${
            isDarkTheme
              ? "bg-white/10 backdrop-blur-sm border border-white/20"
              : "bg-white/80 backdrop-blur-sm border border-gray-200"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={user.pfpUrl || "https://via.placeholder.com/48"}
                alt={`${user.displayName}'s avatar`}
                className="w-12 h-12 rounded-full border-2 border-white/20"
              />
              {userOpenRank && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {userOpenRank.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2
                className={`font-semibold ${
                  isDarkTheme ? "text-white" : "text-gray-900"
                }`}
              >
                {user.displayName}
              </h2>
              <p
                className={`text-sm ${
                  isDarkTheme ? "text-white/70" : "text-gray-600"
                }`}
              >
                @{user.username} • FID: {user.fid}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={dataLoading}
              className={`p-2 rounded-full transition-colors ${
                dataLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-white/10"
              }`}
            >
              <svg
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className={dataLoading ? "animate-spin" : ""}
              >
                <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
              </svg>
            </button>
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
          useOldDesign={themeMode === "glass"}
          onMarkAsRead={handleMarkAsRead}
        />

        {/* Settings Menu */}
        <SettingsMenu
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          themeMode={themeMode}
          onThemeChange={handleThemeChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortOption={sortOption}
          onSortChange={(option) => setSortOption(option as any)}
          dayFilter={dayFilter}
          onDayFilterChange={(filter) => setDayFilter(filter as any)}
          isDarkTheme={isDarkTheme}
        />
      </div>
    </div>
  );
}
