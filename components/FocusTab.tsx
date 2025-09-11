import React, { useState, useEffect } from "react";
import type { UnrepliedDetail, OpenRankData } from "@/types/types";
import { ConversationList } from "./ConversationList";
import { FocusTutorial } from "./FocusTutorial";
import { EmptyState } from "./EmptyState";
import type { RefObject } from "react";
import { isToday, isWithinLastDays } from "@/utils/farcaster";
import type { ThemeMode } from "@/types/types";

interface FocusTabProps {
  markedAsReadConversations: UnrepliedDetail[];
  viewMode: "list" | "grid";
  quotientScores: Record<number, { quotientScore: number } | null>;
  openRankData: Record<number, OpenRankData>;
  loading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  observerRef: RefObject<HTMLDivElement>;
  onReply: (detail: UnrepliedDetail) => void;
  isDarkTheme: boolean;
  themeMode?: ThemeMode;
  onMarkAsRead?: (detail: UnrepliedDetail) => void;
  onDiscard?: (detail: UnrepliedDetail) => void;
  dayFilter?: string;
  searchQuery?: string;
  isSearching?: boolean;
  sortOption?: string;
}

export function FocusTab({
  markedAsReadConversations,
  viewMode,
  quotientScores,
  openRankData,
  loading,
  isLoadingMore,
  hasMore,
  observerRef,
  onReply,
  isDarkTheme,
  themeMode = "Farcaster",
  onMarkAsRead,
  onDiscard,
  dayFilter,
  searchQuery,
  isSearching,
  sortOption = "newest",
}: FocusTabProps) {
  const [showTutorial, setShowTutorial] = useState(false);

  // Apply date filter and sorting to focus items
  const filteredAndSortedMarkedAsRead = React.useMemo(() => {
    // Filter out items with invalid timestamps first
    const validConversations = markedAsReadConversations.filter(
      (c) =>
        c.timestamp && typeof c.timestamp === "number" && !isNaN(c.timestamp)
    );

    let filtered = validConversations;
    if (dayFilter && dayFilter !== "all") {
      if (dayFilter === "today") {
        filtered = validConversations.filter((c) => isToday(c.timestamp));
      } else if (dayFilter === "3days") {
        filtered = validConversations.filter((c) =>
          isWithinLastDays(c.timestamp, 3)
        );
      } else if (dayFilter === "7days") {
        filtered = validConversations.filter((c) =>
          isWithinLastDays(c.timestamp, 7)
        );
      }
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return (b.timestamp || 0) - (a.timestamp || 0);
        case "oldest":
          return (a.timestamp || 0) - (b.timestamp || 0);
        case "fid-asc":
          return a.authorFid - b.authorFid;
        case "fid-desc":
          return b.authorFid - a.authorFid;
        case "quotient-asc":
          const quotientA = quotientScores[a.authorFid]?.quotientScore || 0;
          const quotientB = quotientScores[b.authorFid]?.quotientScore || 0;
          return quotientA - quotientB;
        case "quotient-desc":
          const quotientDescA = quotientScores[a.authorFid]?.quotientScore || 0;
          const quotientDescB = quotientScores[b.authorFid]?.quotientScore || 0;
          return quotientDescB - quotientDescA;
        case "openrank-asc":
          const openRankA = openRankData[a.authorFid]?.engagement?.score || 0;
          const openRankB = openRankData[b.authorFid]?.engagement?.score || 0;
          return openRankA - openRankB;
        case "openrank-desc":
          const openRankDescA =
            openRankData[a.authorFid]?.engagement?.score || 0;
          const openRankDescB =
            openRankData[b.authorFid]?.engagement?.score || 0;
          return openRankDescB - openRankDescA;
        default:
          return 0;
      }
    });
  }, [
    markedAsReadConversations,
    dayFilter,
    sortOption,
    quotientScores,
    openRankData,
  ]);

  // Check if tutorial has been completed
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const tutorialCompleted = localStorage.getItem(
          "farcaster-widget-focus-tutorial-completed"
        );
        if (!tutorialCompleted) {
          setShowTutorial(true);
        }
      } catch {
        // If localStorage fails, show tutorial
        setShowTutorial(true);
      }
    }
  }, []);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

  // Show tutorial if it hasn't been completed
  if (showTutorial) {
    return (
      <FocusTutorial
        isDarkTheme={isDarkTheme}
        onComplete={handleTutorialComplete}
        themeMode={themeMode}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current mx-auto mb-4"></div>
          <p className={isDarkTheme ? "text-white/60" : "text-gray-600"}>
            Loading focus items...
          </p>
        </div>
      </div>
    );
  }

  if (filteredAndSortedMarkedAsRead.length === 0) {
    return (
      <EmptyState
        title="No Focus Items"
        description="Conversations you mark as read will appear here for easy reference."
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
            className={isDarkTheme ? "text-white/40" : "text-gray-400"}
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <path d="M9 10h.01" />
            <path d="M15 10h.01" />
          </svg>
        }
        themeMode={themeMode}
        action={{
          label: "Refresh",
          onClick: () => window.location.reload(),
        }}
      />
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col">
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <h2
            className={`text-lg font-semibold ${
              isDarkTheme ? "text-white" : "text-gray-900"
            }`}
          >
            Focus ({filteredAndSortedMarkedAsRead.length})
          </h2>
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              isDarkTheme
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                : "bg-blue-100 text-blue-700 border border-blue-200"
            }`}
          >
            {filteredAndSortedMarkedAsRead.reduce(
              (total, conversation) => total + (conversation.replyCount || 0),
              0
            )}{" "}
            replies
          </div>
        </div>
        <p
          className={`text-sm ${
            isDarkTheme ? "text-white/60" : "text-gray-600"
          }`}
        >
          Conversations you&apos;ve marked as read for easy reference
        </p>
      </div>

      <div className="flex-1">
        <ConversationList
          conversations={filteredAndSortedMarkedAsRead}
          viewMode={viewMode}
          loading={loading}
          observerRef={observerRef}
          isDarkTheme={isDarkTheme}
          quotientScores={quotientScores}
          openRankData={openRankData}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          onReply={onReply}
          onDiscard={onDiscard}
          dayFilter={dayFilter}
        />
      </div>
    </div>
  );
}
