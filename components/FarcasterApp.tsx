import React, { useState, useEffect, useRef } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useFarcasterAuth } from "../hooks/useFarcasterAuth";
import { useOpenRank } from "../hooks/useOpenRank";
import { useFarcasterData } from "../hooks/useFarcasterData";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { ConversationList } from "./ConversationList";
import { LoadingScreen } from "./LoadingScreen";
import { FarcasterSignIn } from "./FarcasterSignIn";
import { SettingsMenu } from "./SettingsMenu";
import { TabBar, type TabType } from "./TabBar";
import { FocusTab } from "./FocusTab";
import { AnalyticsTab } from "./AnalyticsTab";
import { sortDetails } from "../utils/farcaster";
import Image from "next/image";

// Local storage keys
const STORAGE_KEYS = {
  THEME_MODE: "farcaster-widget-theme-mode",
  VIEW_MODE: "farcaster-widget-view-mode",
  SORT_OPTION: "farcaster-widget-sort-option",
  DAY_FILTER: "farcaster-widget-day-filter",
  ACTIVE_TAB: "farcaster-widget-active-tab",
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

export default function FarcasterApp() {
  // Initialize state from local storage
  const [themeMode, setThemeMode] = useState<"dark" | "light" | "Farcaster">(
    () => {
      const storedValue = getStoredValue(STORAGE_KEYS.THEME_MODE, "Farcaster");
      // Migration: Convert "glass" to "Farcaster"
      if (storedValue === ("glass" as any)) {
        setStoredValue(STORAGE_KEYS.THEME_MODE, "Farcaster");
        return "Farcaster";
      }
      return storedValue;
    }
  );
  const [activeTab, setActiveTab] = useState<TabType>(() =>
    getStoredValue(STORAGE_KEYS.ACTIVE_TAB, "inbox")
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
  >(() => getStoredValue(STORAGE_KEYS.DAY_FILTER, "today"));

  // Update local storage when settings change
  useEffect(() => {
    setStoredValue(STORAGE_KEYS.THEME_MODE, themeMode);
  }, [themeMode]);

  useEffect(() => {
    setStoredValue(STORAGE_KEYS.ACTIVE_TAB, activeTab);
  }, [activeTab]);

  useEffect(() => {
    setStoredValue(STORAGE_KEYS.VIEW_MODE, viewMode);
  }, [viewMode]);

  useEffect(() => {
    setStoredValue(STORAGE_KEYS.SORT_OPTION, sortOption);
  }, [sortOption]);

  useEffect(() => {
    setStoredValue(STORAGE_KEYS.DAY_FILTER, dayFilter);
  }, [dayFilter]);

  const isDarkTheme = themeMode === "dark" || themeMode === "Farcaster";

  const handleThemeChange = (newTheme: "dark" | "light" | "Farcaster") => {
    setThemeMode(newTheme);
  };

  const getBackgroundClass = () => {
    switch (themeMode) {
      case "dark":
        return "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900";
      case "light":
        return "bg-gradient-to-br from-gray-50 via-white to-gray-100";
      case "Farcaster":
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

  const { fetchOpenRankRanks, clearCache, openRankRanks } = useOpenRank();

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

  // Sort conversations with interaction prioritization
  const sortedConversations = sortDetails(
    allConversations,
    sortOption,
    openRankRanks
  );

  // State for marked as read conversations
  const [markedAsReadConversations, setMarkedAsReadConversations] = useState<
    any[]
  >(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("farcaster-widget-marked-as-read");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Swipe to refresh state
  const [isRefreshingPull, setIsRefreshingPull] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);

  const handleMarkAsRead = (detail: any) => {
    console.log("Marking as read:", detail);
    setMarkedAsReadConversations((prev) => {
      const newList = [...prev, detail];
      // Store in localStorage
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(
            "farcaster-widget-marked-as-read",
            JSON.stringify(newList)
          );
        } catch {
          // Ignore storage errors
        }
      }
      return newList;
    });
  };

  // Swipe to refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    setPullDistance(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartY.current) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;

    // Only allow pull down when at the top
    if (deltaY > 0 && window.scrollY === 0) {
      const pullDistance = Math.min(deltaY * 0.5, 100); // Limit pull distance
      setPullDistance(pullDistance);
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartY.current) return;

    const currentY = e.changedTouches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    const deltaTime = Date.now() - touchStartTime.current;

    // Trigger refresh if pulled down enough and fast enough
    if (deltaY > 80 && deltaTime < 1000 && window.scrollY === 0) {
      setIsRefreshingPull(true);
      handleRefresh().finally(() => {
        setIsRefreshingPull(false);
        setPullDistance(0);
      });
    } else {
      setPullDistance(0);
    }

    touchStartY.current = 0;
    touchStartTime.current = 0;
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

  return (
    <div
      className={`min-h-screen ${getBackgroundClass()} transition-all duration-300`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Pull to refresh indicator */}
        {pullDistance > 0 && (
          <div
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center py-4"
            style={{ transform: `translateY(${pullDistance}px)` }}
          >
            <div
              className={`px-4 py-2 rounded-full ${
                isDarkTheme
                  ? "bg-white/20 backdrop-blur-md text-white"
                  : "bg-gray-800/20 backdrop-blur-md text-gray-800"
              }`}
            >
              {isRefreshingPull ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                  <span className="text-sm">Refreshing...</span>
                </div>
              ) : (
                <span className="text-sm">Pull to refresh</span>
              )}
            </div>
          </div>
        )}

        {/* Header */}
        <div
          className={`sticky top-0 z-40 backdrop-blur-md border-b mb-6 -mx-4 px-4 py-4 ${
            themeMode === "Farcaster"
              ? "bg-purple-900/95 border-white/10"
              : themeMode === "light"
              ? "bg-white/95 border-gray-200 text-gray-900"
              : "bg-black/80 border-white/10"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1
                className={`text-2xl font-bold mb-2 ${
                  themeMode === "light" ? "text-gray-900" : "text-white"
                }`}
              >
                ReplyCast
              </h1>
              <div
                className={`${
                  themeMode === "light" ? "text-gray-600" : "text-white/70"
                }`}
              >
                {activeTab === "inbox" && (
                  <>
                    <span className="font-semibold">
                      {allConversations.length}
                    </span>{" "}
                    unreplied conversation
                    {allConversations.length !== 1 ? "s" : ""}
                  </>
                )}
                {activeTab === "focus" && (
                  <>
                    <span className="font-semibold">
                      {markedAsReadConversations.length}
                    </span>{" "}
                    focus conversation
                    {markedAsReadConversations.length !== 1 ? "s" : ""}
                  </>
                )}
                {activeTab === "analytics" && (
                  <>
                    <span className="font-semibold">
                      {allConversations.length}
                    </span>{" "}
                    total conversations analyzed
                  </>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                sdk.haptics?.impactOccurred?.("light");
                setIsSettingsOpen(true);
              }}
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
                {user.pfpUrl ? (
                  <Image
                    src={`/api/image-proxy?url=${user.pfpUrl}`}
                    alt={`${user.displayName || user.username}'s avatar`}
                    className="w-12 h-12 rounded-full border-2 border-white/20"
                    width={48}
                    height={48}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {user.displayName?.charAt(0) ||
                      user.username?.charAt(0) ||
                      "?"}
                  </div>
                )}
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

        {/* Tab Content */}
        {activeTab === "inbox" && (
          <>
            {console.log(
              "Inbox tab - hasMore:",
              hasMore,
              "isLoadingMore:",
              isLoadingMore,
              "conversations:",
              sortedConversations.length
            )}
            <ConversationList
              conversations={sortedConversations}
              viewMode={viewMode}
              loading={dataLoading}
              observerRef={observerRef}
              isDarkTheme={isDarkTheme}
              useOldDesign={false}
              onMarkAsRead={handleMarkAsRead}
              openRankRanks={openRankRanks}
              isLoadingMore={isLoadingMore}
              hasMore={hasMore}
              onReply={async (detail) => {
                try {
                  await sdk.actions.viewCast({ hash: detail.castHash });
                } catch (error) {
                  console.error("Failed to open cast:", error);
                }
              }}
              dayFilter={dayFilter}
            />
          </>
        )}

        {activeTab === "focus" && (
          <FocusTab
            markedAsReadConversations={markedAsReadConversations}
            viewMode={viewMode}
            openRankRanks={openRankRanks}
            loading={dataLoading}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            observerRef={observerRef}
            onReply={async (detail) => {
              console.log("Opening cast from focus:", detail);
              try {
                await sdk.actions.viewCast({ hash: detail.castHash });
              } catch (error) {
                console.error("Failed to open cast:", error);
              }
            }}
            isDarkTheme={isDarkTheme}
            onMarkAsRead={handleMarkAsRead}
            dayFilter={dayFilter}
          />
        )}

        {activeTab === "analytics" && (
          <AnalyticsTab
            allConversations={allConversations}
            userOpenRank={userOpenRank}
            openRankRanks={openRankRanks}
            isDarkTheme={isDarkTheme}
            themeMode={themeMode}
          />
        )}
      </div>

      {/* Tab Bar */}
      <TabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isDarkTheme={isDarkTheme}
        themeMode={themeMode}
      />

      {/* Settings Menu */}
      <SettingsMenu
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
        }}
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
