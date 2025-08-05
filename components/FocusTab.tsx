import React from "react";
import type { UnrepliedDetail } from "@/types/types";
import { ConversationList } from "./ConversationList";
import type { RefObject } from "react";

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
  onMarkAsRead?: (detail: UnrepliedDetail) => void;
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
  onMarkAsRead,
  dayFilter,
}: FocusTabProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current mx-auto mb-4"></div>
          <p className={isDarkTheme ? "text-white/60" : "text-gray-600"}>
            Loading focus items...
          </p>
        </div>
      </div>
    );
  }

  if (markedAsReadConversations.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isDarkTheme ? "bg-white/10" : "bg-gray-100"
            }`}
          >
            <svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6m0 6v6" />
              <path d="M3.6 3.6l4.2 4.2m8.4 8.4 4.2 4.2" />
              <path d="M1 12h6m6 0h6" />
              <path d="M3.6 20.4l4.2-4.2m8.4-8.4 4.2-4.2" />
            </svg>
          </div>
          <h3
            className={`text-lg font-semibold mb-2 ${
              isDarkTheme ? "text-white" : "text-gray-900"
            }`}
          >
            No Focus Items
          </h3>
          <p className={`${isDarkTheme ? "text-white/60" : "text-gray-600"}`}>
            Conversations you mark as read will appear here for easy reference.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col">
      <div className="mb-4">
        <h2
          className={`text-lg font-semibold ${
            isDarkTheme ? "text-white" : "text-gray-900"
          }`}
        >
          Focus ({markedAsReadConversations.length})
        </h2>
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
          conversations={markedAsReadConversations}
          viewMode={viewMode}
          loading={loading}
          observerRef={observerRef}
          isDarkTheme={isDarkTheme}
          useOldDesign={false}
          onMarkAsRead={onMarkAsRead}
          openRankRanks={openRankRanks}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          onReply={onReply}
          dayFilter={dayFilter}
        />
      </div>
    </div>
  );
}
