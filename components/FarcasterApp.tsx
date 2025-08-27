import React, { useState, useEffect, useRef } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useFarcasterAuth } from "../hooks/useFarcasterAuth";
import { useOpenRank } from "../hooks/useOpenRank";
import { useFarcasterData } from "../hooks/useFarcasterData";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useAppAnalytics, ANALYTICS_ACTIONS } from "../hooks/useAnalytics";
import { ConversationList } from "./ConversationList";
import { LoadingScreen } from "./LoadingScreen";
import { FarcasterSignIn } from "./FarcasterSignIn";
import { SettingsMenu } from "./SettingsMenu";
import { TabBar, type TabType } from "./TabBar";
import { FocusTab } from "./FocusTab";
import { SpeedModeTab } from "./SpeedModeTab";
import { AnalyticsTab } from "./AnalyticsTab";
import { ToastNotification } from "./ToastNotification";
import { EmptyState } from "./EmptyState";
import { sortDetails } from "../utils/farcaster";
import Image from "next/image";
import { isToday, isWithinLastDays } from "@/utils/farcaster";
import { SpeedModeAlt } from "./SpeedModeAlt";
import { mockSpeedModeConversations } from "@/utils/speedModeMockData";

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
  // Initialize analytics
  const {
    trackAppOpened,
    trackTabChanged,
    trackThemeChanged,
    trackSettingsOpened,
    trackMarkAsRead,
    trackDiscardCast,
    trackRefreshData,
    trackAppError,
    trackCastViewed,
  } = useAppAnalytics();

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

  // Track app opened
  useEffect(() => {
    trackAppOpened({
      theme: themeMode,
      activeTab,
      isInMiniApp:
        typeof window !== "undefined" &&
        window.location.href.includes("farcaster"),
    });
  }, []); // Only run once on mount

  // Update local storage when settings change
  useEffect(() => {
    setStoredValue(STORAGE_KEYS.THEME_MODE, themeMode);
  }, [themeMode]);

  useEffect(() => {
    setStoredValue(STORAGE_KEYS.ACTIVE_TAB, activeTab);
    // Track tab changes
    trackTabChanged(activeTab, {
      previousTab: activeTab,
      theme: themeMode,
    });
  }, [activeTab, trackTabChanged, themeMode]);

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
    trackThemeChanged(newTheme, {
      previousTheme: themeMode,
      activeTab,
    });
  };

  const getBackgroundClass = () => {
    switch (themeMode) {
      case "dark":
        return "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900";
      case "light":
        return "bg-gradient-to-br from-gray-50 via-white to-gray-100";
      case "Farcaster":
        return "bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900";
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

      if (!stored) return [];

      const parsed = JSON.parse(stored);

      // Deduplicate using castHash as unique identifier
      const uniqueConversations = parsed.reduce((acc: any[], item: any) => {
        const isDuplicate = acc.some(
          (existing) => existing.castHash === item.castHash
        );
        if (!isDuplicate) {
          acc.push(item);
        }
        return acc;
      }, []);

      // Update localStorage with deduplicated data
      if (uniqueConversations.length !== parsed.length) {
        localStorage.setItem(
          "farcaster-widget-marked-as-read",
          JSON.stringify(uniqueConversations)
        );
      }

      return uniqueConversations;
    } catch (error) {
      console.error("Error loading marked-as-read:", error);
      return [];
    }
  });

  // Focus header count should respect day filter
  const filteredFocusCount = React.useMemo(() => {
    // Filter out items with invalid timestamps first
    const validConversations = markedAsReadConversations.filter(
      (c: any) =>
        c.timestamp && typeof c.timestamp === "number" && !isNaN(c.timestamp)
    );

    if (dayFilter === "today") {
      return validConversations.filter((c: any) => isToday(c.timestamp)).length;
    }
    if (dayFilter === "3days") {
      return validConversations.filter((c: any) =>
        isWithinLastDays(c.timestamp, 3)
      ).length;
    }
    if (dayFilter === "7days") {
      return validConversations.filter((c: any) =>
        isWithinLastDays(c.timestamp, 7)
      ).length;
    }
    return validConversations.length;
  }, [markedAsReadConversations, dayFilter]);

  // State for discarded conversations
  const [discardedConversations, setDiscardedConversations] = useState<any[]>(
    () => {
      if (typeof window === "undefined") return [];
      try {
        const stored = localStorage.getItem("farcaster-widget-discarded");
        if (!stored) return [];

        const parsed = JSON.parse(stored);

        // Deduplicate using castHash as unique identifier
        const uniqueDiscarded = parsed.reduce((acc: any[], item: any) => {
          const isDuplicate = acc.some(
            (existing) => existing.castHash === item.castHash
          );
          if (!isDuplicate) {
            acc.push(item);
          }
          return acc;
        }, []);

        // Update localStorage with deduplicated data
        if (uniqueDiscarded.length !== parsed.length) {
          localStorage.setItem(
            "farcaster-widget-discarded",
            JSON.stringify(uniqueDiscarded)
          );
        }

        return uniqueDiscarded;
      } catch {
        return [];
      }
    }
  );

  // Toast notification state
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
    isVisible: boolean;
  }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setToast({
      message,
      type,
      isVisible: true,
    });
  };

  // Handle sharing the app via composeCast
  const handleShareApp = async () => {
    try {
      // Trigger haptic feedback
      sdk.haptics?.impactOccurred?.("light");

      // Show loading toast
      showToast("Opening cast composer...", "info");

      // Compose a cast with app information
      const result = await sdk.actions.composeCast({
        text: `Just discovered ReplyCast - a powerful tool to track unreplied conversations on Farcaster! 🚀\n\nTrack important conversations, and never miss a reply again.\n\nCheck it out:`,
        embeds: ["https://farcaster.xyz/miniapps/5HKCCpZykEuD/replycast"], // You can update this to your specific app URL
      });

      // Handle the result
      if (result?.cast) {
        showToast("Cast shared successfully! 🎉", "success");
        // Track analytics for successful share
        // You can add analytics tracking here if needed
      } else {
        // User cancelled the cast
        showToast("Cast cancelled", "info");
      }
    } catch (error) {
      console.error("Failed to compose cast:", error);
      showToast("Failed to share app", "error");
    }
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  // Filter out discarded and marked as read conversations from the main list
  const filteredConversations = sortedConversations.filter(
    (conversation) =>
      !discardedConversations.some(
        (discarded) => discarded.castHash === conversation.castHash
      ) &&
      !markedAsReadConversations.some(
        (marked) => marked.castHash === conversation.castHash
      )
  );

  // Swipe to refresh state
  const [isRefreshingPull, setIsRefreshingPull] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);

  const handleMarkAsRead = (detail: any) => {
    setMarkedAsReadConversations((prev) => {
      // Check if this cast is already marked as read using castHash as unique identifier
      const isDuplicate = prev.some(
        (item) => item.castHash === detail.castHash
      );

      if (isDuplicate) {
        showToast("Cast already marked as read", "info");
        return prev; // Return existing list without adding duplicate
      }

      // Ensure timestamp is set properly
      const detailWithTimestamp = {
        ...detail,
        timestamp: detail.timestamp || Date.now(),
      };

      const newList = [...prev, detailWithTimestamp];

      // Store in localStorage
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(
            "farcaster-widget-marked-as-read",
            JSON.stringify(newList)
          );
        } catch (error) {
          console.error("Error saving to localStorage:", error);
        }
      }

      // Show success toast
      showToast("Marked as read", "success");

      // Track analytics
      trackMarkAsRead(detail.castHash, {
        username: detail.username,
        activeTab,
        theme: themeMode,
      });

      return newList;
    });
  };

  const handleDiscard = (detail: any) => {
    // Add to discarded list
    setDiscardedConversations((prev) => {
      // Check if this cast is already discarded using castHash as unique identifier
      const isDuplicate = prev.some(
        (item) => item.castHash === detail.castHash
      );

      if (isDuplicate) {
        showToast("Cast already discarded", "info");
        return prev; // Return existing list without adding duplicate
      }

      const newList = [...prev, detail];
      // Store in localStorage
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(
            "farcaster-widget-discarded",
            JSON.stringify(newList)
          );
        } catch {
          // Ignore storage errors
        }
      }

      // Track analytics
      trackDiscardCast(detail.castHash, {
        username: detail.username,
        activeTab,
        theme: themeMode,
      });

      return newList;
    });

    // Remove from marked-as-read list (for Focus tab)
    setMarkedAsReadConversations((prev) => {
      const filtered = prev.filter((item) => item.castHash !== detail.castHash);

      // Update localStorage
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(
            "farcaster-widget-marked-as-read",
            JSON.stringify(filtered)
          );
        } catch {
          // Ignore storage errors
        }
      }

      return filtered;
    });

    // Show success toast
    showToast("Cast discarded", "success");
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

    // Only allow pull down when at the top and only prevent default when actually pulling
    if (deltaY > 0 && window.scrollY === 0) {
      const pullDistance = Math.min(deltaY * 0.5, 100); // Limit pull distance
      setPullDistance(pullDistance);

      // Only prevent default if we're actually pulling down significantly
      // This allows normal scrolling to work
      if (deltaY > 10) {
        e.preventDefault();
      }
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
      // Track refresh analytics
      trackRefreshData({
        method: ANALYTICS_ACTIONS.REFRESH.PULL_TO_REFRESH,
        activeTab,
        theme: themeMode,
      });
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

  // Call ready when app is loaded and data is ready
  useEffect(() => {
    // Only call ready when we have user and data is not loading
    if (user && !dataLoading && !authLoading) {
      sdk.actions.ready();
    }
  }, [user, dataLoading, authLoading]);

  // Fix for iframe/WebView touch events in production
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Detect if we're in an iframe or WebView environment
      const isInIframe =
        window !== window.parent || window.frameElement !== null;
      const isWebView = /WebView|wv/.test(navigator.userAgent);

      if (isInIframe || isWebView) {
        // Create a more aggressive touch event handler for iframe environments
        const enhanceTouchEvents = () => {
          const swipeElements = document.querySelectorAll(".swipe-enabled");
          swipeElements.forEach((element) => {
            // Force hardware acceleration for better touch performance
            (element as HTMLElement).style.willChange = "transform";
            (element as HTMLElement).style.webkitTransform = "translateZ(0)";
          });
        };

        // Apply enhancements immediately and on DOM changes
        enhanceTouchEvents();

        // Set up a MutationObserver to enhance new swipe elements
        const observer = new MutationObserver(() => {
          enhanceTouchEvents();
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });

        return () => {
          observer.disconnect();
        };
      }
    }
  }, []);

  // Show loading screen while auth is loading
  if (authLoading) {
    return <LoadingScreen themeMode={themeMode} />;
  }

  // Show sign-in if not authenticated
  if (!user) {
    return <FarcasterSignIn onSignIn={handleSignIn} onError={() => {}} />;
  }

  // Show loading screen while data is loading (first load)
  if (dataLoading && allConversations.length === 0) {
    return <LoadingScreen themeMode={themeMode} />;
  }

  // Show error state if data loading failed
  if (error && allConversations.length === 0) {
    const getErrorBackgroundClass = () => {
      switch (themeMode) {
        case "dark":
          return "bg-gradient-to-br from-red-900 via-red-800 to-red-900";
        case "light":
          return "bg-gradient-to-br from-red-50 via-red-100 to-red-200";
        case "Farcaster":
          return "bg-gradient-to-br from-red-600 via-red-500 to-red-400";
        default:
          return "bg-gradient-to-br from-red-600 via-red-500 to-red-400";
      }
    };

    const getErrorTextClass = () => {
      switch (themeMode) {
        case "light":
          return "text-gray-900";
        default:
          return "text-white";
      }
    };

    return (
      <div
        className={`min-h-screen ${getErrorBackgroundClass()} flex items-center justify-center`}
      >
        <div className={`text-center ${getErrorTextClass()}`}>
          <h1 className="text-2xl font-bold mb-4">Failed to load data</h1>
          <p className="mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className={`px-4 py-2 rounded-lg backdrop-blur-sm transition-colors ${
              themeMode === "light"
                ? "bg-gray-800/20 hover:bg-gray-800/30 text-gray-900"
                : "bg-white/20 hover:bg-white/30 text-white"
            }`}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${getBackgroundClass()} transition-all duration-300 flex flex-col`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
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
        className={`sticky top-0 z-40 backdrop-blur-md border-b mb-6 ${
          themeMode === "Farcaster"
            ? "bg-purple-900/95 border-white/10"
            : themeMode === "light"
            ? "bg-white/95 border-gray-200 text-gray-900"
            : "bg-black/80 border-white/10"
        }`}
      >
        <div className="container mx-auto px-4 max-w-6xl flex items-center justify-between py-4">
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
                  <span className="font-semibold">{filteredFocusCount}</span>{" "}
                  focus conversation
                  {filteredFocusCount !== 1 ? "s" : ""}
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
          <div className="flex items-center gap-2">
            {/* Share Cast Button */}
            <button
              onClick={handleShareApp}
              className={`p-3 rounded-xl transition-all duration-200 ${
                isDarkTheme
                  ? "bg-white/10 hover:bg-white/20 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
              aria-label="Share ReplyCast"
              title="Share ReplyCast with your followers"
            >
              <svg
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16,6 12,2 8,6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </button>

            {/* Settings Button */}
            <button
              onClick={() => {
                sdk.haptics?.impactOccurred?.("light");
                setIsSettingsOpen(true);
                trackSettingsOpened({
                  activeTab,
                  theme: themeMode,
                });
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
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl flex-1 flex flex-col">
        {/* User Info Card */}
        {user && (
          <div
            className={`mb-6 p-4 rounded-2xl ${
              isDarkTheme
                ? "bg-white/10 backdrop-blur-md border border-white/20"
                : "bg-white/80 backdrop-blur-md border border-gray-200"
            }`}
          >
            <div className="flex items-center gap-2">
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
                <div className="flex items-center mb-0">
                  <span
                    className={`font-semibold truncate ${
                      isDarkTheme ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {user.displayName || user.username}
                  </span>
                </div>
                <span
                  className={`text-sm mb-0 ${
                    isDarkTheme ? "text-white/60" : "text-gray-600"
                  }`}
                  style={{ marginTop: "-5px" }}
                >
                  FID: {user.fid}
                </span>
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
        <div className="flex-1 overflow-y-auto pb-20">
          {activeTab === "inbox" && (
            <>
              {filteredConversations.length === 0 && !dataLoading ? (
                <EmptyState
                  title="No Conversations"
                  description="You're all caught up! No unreplied conversations found. Check back later or try adjusting your filters."
                  themeMode={themeMode}
                  icon={
                    <svg
                      width={32}
                      height={32}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={
                        isDarkTheme ? "text-white/40" : "text-gray-400"
                      }
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      <path d="M9 10h.01" />
                      <path d="M15 10h.01" />
                    </svg>
                  }
                  action={{
                    label: "Refresh",
                    onClick: handleRefresh,
                  }}
                />
              ) : (
                <ConversationList
                  conversations={filteredConversations}
                  viewMode={viewMode}
                  loading={dataLoading}
                  observerRef={observerRef}
                  isDarkTheme={isDarkTheme}
                  useOldDesign={false}
                  onMarkAsRead={handleMarkAsRead}
                  onDiscard={handleDiscard}
                  openRankRanks={openRankRanks}
                  isLoadingMore={isLoadingMore}
                  hasMore={hasMore}
                  onReply={async (detail) => {
                    try {
                      await sdk.actions.viewCast({ hash: detail.castHash });
                      // Track cast viewed
                      trackCastViewed(detail.castHash, {
                        username: detail.username,
                        activeTab,
                        theme: themeMode,
                      });
                    } catch (error) {
                      console.error("Failed to open cast:", error);
                      trackAppError(error as Error, {
                        action: "view_cast",
                        castHash: detail.castHash,
                        activeTab,
                      });
                    }
                  }}
                  dayFilter={dayFilter}
                />
              )}
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
                try {
                  await sdk.actions.viewCast({ hash: detail.castHash });
                  // Track cast viewed
                  trackCastViewed(detail.castHash, {
                    username: detail.username,
                    activeTab,
                    theme: themeMode,
                  });
                } catch (error) {
                  console.error("Failed to open cast:", error);
                  trackAppError(error as Error, {
                    action: "view_cast",
                    castHash: detail.castHash,
                    activeTab,
                  });
                }
              }}
              isDarkTheme={isDarkTheme}
              themeMode={themeMode}
              onMarkAsRead={handleMarkAsRead}
              onDiscard={handleDiscard}
              dayFilter={dayFilter}
            />
          )}

          {activeTab === "speed" && (
            <SpeedModeAlt
              conversations={filteredConversations}
              openRankRanks={openRankRanks}
              isDarkThemeMode={isDarkTheme}
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
      {/* Toast Notification */}
      <ToastNotification
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onHide={hideToast}
        themeMode={themeMode}
      />
    </div>
  );
}
