import React, { useState, useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useFarcasterAuth } from "../hooks/useFarcasterAuth";
import { useOpenRank } from "../hooks/useOpenRank";
import { useFarcasterData } from "../hooks/useFarcasterData";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { AppHeader } from "./AppHeader";
import { Filters } from "./Filters";
import { ConversationList } from "./ConversationList";
import { LoadingScreen } from "./LoadingScreen";
import { FarcasterSignIn } from "./FarcasterSignIn";

// Feature flag to switch between old and new designs
const USE_NEW_DESIGN = process.env.NEXT_PUBLIC_USE_NEW_DESIGN === "true";

// Local storage keys
const STORAGE_KEYS = {
  THEME_MODE: "farcaster-widget-theme-mode",
  VIEW_MODE: "farcaster-widget-view-mode",
  SORT_OPTION: "farcaster-widget-sort-option",
  DAY_FILTER: "farcaster-widget-day-filter",
} as const;

// Helper functions for local storage
const getStoredValue = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setStoredValue = <T,>(key: string, value: T): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors
  }
};

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
  // Initialize state from local storage
  const [themeMode, setThemeMode] = useState<"dark" | "light" | "glass">(() =>
    getStoredValue(STORAGE_KEYS.THEME_MODE, "dark")
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">(() =>
    getStoredValue(STORAGE_KEYS.VIEW_MODE, "list")
  );
  const [sortOption, setSortOption] = useState<
    | "newest"
    | "oldest"
    | "fid-asc"
    | "fid-desc"
    | "openrank-asc"
    | "openrank-desc"
  >(() => getStoredValue(STORAGE_KEYS.SORT_OPTION, "newest"));
  const [dayFilter, setDayFilter] = useState<
    "all" | "today" | "3days" | "7days"
  >(() => getStoredValue(STORAGE_KEYS.DAY_FILTER, "all"));

  // Update local storage when settings change
  useEffect(() => {
    setStoredValue(STORAGE_KEYS.THEME_MODE, themeMode);
  }, [themeMode]);

  useEffect(() => {
    setStoredValue(STORAGE_KEYS.VIEW_MODE, viewMode);
  }, [viewMode]);

  useEffect(() => {
    setStoredValue(STORAGE_KEYS.SORT_OPTION, sortOption);
  }, [sortOption]);

  useEffect(() => {
    setStoredValue(STORAGE_KEYS.DAY_FILTER, dayFilter);
  }, [dayFilter]);

  const isDarkTheme = themeMode === "dark" || themeMode === "glass";

  const handleThemeChange = (newTheme: "dark" | "light" | "glass") => {
    setThemeMode(newTheme);
  };

  const getBackgroundClass = () => {
    switch (themeMode) {
      case "dark":
        return "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900";
      case "light":
        return "bg-gradient-to-br from-gray-50 via-white to-gray-100";
      case "glass":
        return "bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20 backdrop-blur-sm";
      default:
        return "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900";
    }
  };

  const {
    user,
    loading: authLoading,
    handleSignIn,
    isInMiniApp,
  } = useFarcasterAuth();

  const { fetchOpenRankRanks, clearCache } = useOpenRank();

  const {
    allConversations,
    userOpenRank,
    loading: dataLoading,
    error,
    handleRefresh,
    hasMore,
    loadMoreConversations,
    isLoadingMore,
    isRefreshing,
  } = useFarcasterData({
    user,
    fetchOpenRankRanks,
    clearOpenRankCache: clearCache,
    dayFilter,
  });

  // Mock getCacheStatus function since it's not available in the hook
  const getCacheStatus = () => ({
    isValid: true,
    age: 0,
    cachedFids: 0,
    ttl: 300,
  });

  const { observerRef } = useInfiniteScroll({
    hasMore,
    isLoadingMore,
    loading: dataLoading,
    loadMoreConversations,
  });

  const handleMarkAsRead = (detail: any) => {
    console.log("Marking as read:", detail);
    // TODO: Implement actual removal logic
  };

  // Call ready when app is loaded
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  // Show loading screen while auth is loading
  if (authLoading) {
    return <LoadingScreen />;
  }

  // Show sign-in if not authenticated
  if (!user) {
    return <FarcasterSignIn onSignIn={handleSignIn} onError={() => {}} />;
  }

  if (USE_NEW_DESIGN) {
    return (
      <div
        className={`min-h-screen ${getBackgroundClass()} transition-all duration-300`}
      >
        {/* New Design */}
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">ReplyCast</h1>
              <p className="text-white/70">
                {allConversations.length} conversation
                {allConversations.length !== 1 ? "s" : ""} to reply to
              </p>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className={`p-3 rounded-xl transition-all duration-200 ${
                isDarkTheme
                  ? "bg-white/10 hover:bg-white/20 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
              aria-label="Settings"
            >
              <svg
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
              </svg>
            </button>
          </div>

          {/* User Info Card */}
          {user && (
            <div
              className={`mb-6 p-4 rounded-2xl ${
                isDarkTheme
                  ? "bg-white/10 backdrop-blur-md border border-white/20"
                  : "bg-white/80 backdrop-blur-md border border-gray-200"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {user.displayName?.charAt(0) ||
                      user.username?.charAt(0) ||
                      "?"}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`font-semibold truncate ${
                        isDarkTheme ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {user.displayName || user.username}
                    </span>
                    <span
                      className={`text-sm ${
                        isDarkTheme ? "text-white/60" : "text-gray-600"
                      }`}
                    >
                      FID: {user.fid}
                    </span>
                  </div>
                  {userOpenRank !== null && userOpenRank !== undefined && (
                    <div className="flex items-center gap-1">
                      <svg
                        width={14}
                        height={14}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className="text-yellow-400"
                      >
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                      </svg>
                      <span
                        className={`font-bold ${
                          isDarkTheme ? "text-yellow-400" : "text-purple-700"
                        }`}
                      >
                        #{userOpenRank.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={dataLoading}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    dataLoading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-white/20"
                  } ${isDarkTheme ? "text-white" : "text-gray-700"}`}
                  aria-label="Refresh data"
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
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                    <path d="M3 21v-5h5" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Conversation List */}
          <ConversationList
            conversations={allConversations}
            viewMode={viewMode}
            loading={dataLoading}
            observerRef={observerRef}
            isDarkTheme={isDarkTheme}
            useOldDesign={false}
            onMarkAsRead={handleMarkAsRead}
            openRankRanks={{}}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            onReply={() => {}}
          />
        </div>

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
    );
  }

  // Original Design
  return (
    <div
      className={`min-h-screen ${getBackgroundClass()} transition-all duration-300`}
    >
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <AppHeader
          user={user}
          userOpenRank={userOpenRank}
          conversationCount={allConversations.length}
          onRefresh={handleRefresh}
          error={error}
          isRefreshing={isRefreshing}
          getCacheStatus={getCacheStatus}
          isDarkTheme={isDarkTheme}
          useOldDesign={themeMode === "glass"}
        />

        <Filters
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortOption={sortOption}
          onSortOptionChange={(option) => setSortOption(option as any)}
          dayFilter={dayFilter}
          onDayFilterChange={setDayFilter}
          isDarkTheme={isDarkTheme}
          useOldDesign={themeMode === "glass"}
        />

        <ConversationList
          conversations={allConversations}
          viewMode={viewMode}
          loading={dataLoading}
          observerRef={observerRef}
          isDarkTheme={isDarkTheme}
          useOldDesign={themeMode === "glass"}
          onMarkAsRead={handleMarkAsRead}
          openRankRanks={{}}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          onReply={() => {}}
        />
      </div>

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
  );
}
