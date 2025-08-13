import React, { useState, useEffect } from "react";
import type { UnrepliedDetail } from "@/types/types";
import { ConversationList } from "./ConversationList";
import { FocusTutorial } from "./FocusTutorial";
import { EmptyState } from "./EmptyState";
import type { RefObject } from "react";
import { isToday, isWithinLastDays } from "@/utils/farcaster";

interface FocusTabProps {
  markedAsReadConversations: UnrepliedDetail[];
  viewMode: "list" | "grid";
  openRankRanks: Record<number, number | null>;
  loading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  observerRef: RefObject<HTMLDivElement>;
  onReply: (detail: UnrepliedDetail) => void;
  isDarkTheme: boolean;
  themeMode?: "dark" | "light" | "Farcaster";
  onMarkAsRead?: (detail: UnrepliedDetail) => void;
  onDiscard?: (detail: UnrepliedDetail) => void;
  dayFilter?: string;
}

export function FocusTab({
  markedAsReadConversations,
  viewMode,
  openRankRanks,
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
}: FocusTabProps) {
  const [showTutorial, setShowTutorial] = useState(false);

  // Apply date filter to focus items
  const filteredMarkedAsRead = React.useMemo(() => {
    // Filter out items with invalid timestamps first
    const validConversations = markedAsReadConversations.filter(
      (c) =>
        c.timestamp && typeof c.timestamp === "number" && !isNaN(c.timestamp)
    );

    if (!dayFilter || dayFilter === "all") return validConversations;
    if (dayFilter === "today") {
      return validConversations.filter((c) => isToday(c.timestamp));
    }
    if (dayFilter === "3days") {
      return validConversations.filter((c) => isWithinLastDays(c.timestamp, 3));
    }
    if (dayFilter === "7days") {
      return validConversations.filter((c) => isWithinLastDays(c.timestamp, 7));
    }
    return validConversations;
  }, [markedAsReadConversations, dayFilter]);

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

  if (filteredMarkedAsRead.length === 0) {
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
            Focus ({filteredMarkedAsRead.length})
          </h2>
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              isDarkTheme
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                : "bg-blue-100 text-blue-700 border border-blue-200"
            }`}
          >
            {filteredMarkedAsRead.reduce(
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
          conversations={filteredMarkedAsRead}
          viewMode={viewMode}
          loading={loading}
          observerRef={observerRef}
          isDarkTheme={isDarkTheme}
          useOldDesign={false}
          openRankRanks={openRankRanks}
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
