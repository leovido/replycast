import React, { useState } from "react";
import type { UnrepliedDetail } from "@/types/types";
import { sdk } from "@farcaster/miniapp-sdk";

interface SpeedModeTabProps {
  conversations: UnrepliedDetail[];
  openRankRanks: Record<number, number | null>;
  loading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  observerRef: React.RefObject<HTMLDivElement>;
  onReply: (detail: UnrepliedDetail) => void;
  isDarkTheme: boolean;
  themeMode: "dark" | "light" | "Farcaster";
  onMarkAsRead?: (detail: UnrepliedDetail) => void;
  onDiscard?: (detail: UnrepliedDetail) => void;
  dayFilter?: string;
}

export function SpeedModeTab({
  conversations,
  openRankRanks,
  loading,
  isLoadingMore,
  hasMore,
  observerRef,
  onReply,
  isDarkTheme,
  themeMode,
  onMarkAsRead,
  onDiscard,
}: SpeedModeTabProps) {
  const [processedCount, setProcessedCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime] = useState(Date.now());

  const isDarkThemeMode =
    themeMode === "dark" || (themeMode === "Farcaster" && isDarkTheme);

  const handleMarkAsRead = (detail: UnrepliedDetail) => {
    onMarkAsRead?.(detail);
    setProcessedCount((prev) => prev + 1);
    moveToNext();
  };

  const handleDiscard = (detail: UnrepliedDetail) => {
    onDiscard?.(detail);
    setProcessedCount((prev) => prev + 1);
    moveToNext();
  };

  const handleReply = (detail: UnrepliedDetail) => {
    onReply(detail);
    setProcessedCount((prev) => prev + 1);
    moveToNext();
  };

  // Keyboard shortcuts for faster processing
  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (conversations.length === 0) return;

      switch (event.key.toLowerCase()) {
        case "arrowleft":
        case "a":
          event.preventDefault();
          moveToPrevious();
          break;
        case "arrowright":
        case "d":
          event.preventDefault();
          moveToNext();
          break;
        case "r":
          event.preventDefault();
          if (conversations[currentIndex]) {
            handleReply(conversations[currentIndex]);
          }
          break;
        case "m":
          event.preventDefault();
          if (conversations[currentIndex]) {
            handleMarkAsRead(conversations[currentIndex]);
          }
          break;
        case "x":
          event.preventDefault();
          if (conversations[currentIndex]) {
            handleDiscard(conversations[currentIndex]);
          }
          break;
        case " ":
          event.preventDefault();
          moveToNext();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentIndex, conversations.length]);

  const moveToNext = () => {
    if (currentIndex < conversations.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const moveToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const resetProgress = () => {
    setCurrentIndex(0);
    setProcessedCount(0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        <p className="ml-3 text-gray-600">Loading conversations...</p>
      </div>
    );
  }

  // Show loading state while conversations are being fetched
  if (conversations.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 px-6 text-center">
        <div className="text-6xl mb-4 text-gray-300">📭</div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900">
          No Conversations Found
        </h3>
        <p className="text-sm text-gray-600">
          Loading your unreplied conversations...
        </p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 px-6 text-center">
        <div
          className={`text-6xl mb-4 ${
            isDarkThemeMode ? "text-white/20" : "text-gray-300"
          }`}
        >
          🎯
        </div>
        <h3
          className={`text-lg font-semibold mb-2 ${
            isDarkThemeMode ? "text-white" : "text-gray-900"
          }`}
        >
          All Caught Up!
        </h3>
        <p
          className={`text-sm ${
            isDarkThemeMode ? "text-white/60" : "text-gray-600"
          }`}
        >
          No unreplied conversations found. You&apos;re processing notifications
          at lightning speed!
        </p>
      </div>
    );
  }

  // Safety check - ensure currentIndex is within bounds
  if (currentIndex >= conversations.length) {
    setCurrentIndex(0);
    return (
      <div className="flex flex-col items-center justify-center h-64 px-6 text-center">
        <div className="text-6xl mb-4 text-gray-300">🔄</div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900">
          Resetting to first conversation...
        </h3>
      </div>
    );
  }

  const currentConversation = conversations[currentIndex];

  // Safety check - if currentConversation is undefined, show loading or error
  if (!currentConversation) {
    return (
      <div className="flex flex-col items-center justify-center h-64 px-6 text-center">
        <div className="text-6xl mb-4 text-gray-300">⏳</div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900">
          Loading conversation...
        </h3>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / conversations.length) * 100;
  const remainingCount = conversations.length - currentIndex;

  return (
    <div className="px-6 pb-20">
      {/* Progress Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-lg mb-6 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl">⚡</div>
            <div>
              <h2 className="text-lg font-bold">Speed Mode</h2>
              <p className="text-sm text-white/80">
                Process notifications at lightning speed
              </p>
            </div>
          </div>
          <button
            onClick={resetProgress}
            className="px-3 py-1 bg-white/20 rounded-full text-sm hover:bg-white/30 transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-2 mb-2">
          <div
            className="bg-white h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Stats */}
        <div className="flex justify-between text-sm">
          <span>
            Progress: {currentIndex + 1} of {conversations.length}
          </span>
          <span>Remaining: {remainingCount}</span>
          <span>Processed: {processedCount}</span>
        </div>

        {/* Speed Stats */}
        {processedCount > 0 && (
          <div className="mt-2 text-xs text-white/70">
            <span>
              Speed: ~
              {Math.round(
                (processedCount /
                  Math.max(1, (Date.now() - startTime) / 1000)) *
                  60
              )}{" "}
              notifications/min
            </span>
          </div>
        )}
      </div>

      {/* Current Conversation Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Author Info */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <img
              src={currentConversation.avatarUrl}
              alt={currentConversation.username}
              className="w-10 h-10 rounded-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentConversation.username}`;
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-white truncate">
                  @{currentConversation.username}
                </span>
                {openRankRanks[currentConversation.authorFid] && (
                  <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full">
                    #
                    {openRankRanks[
                      currentConversation.authorFid
                    ]?.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {currentConversation.timeAgo}
              </div>
            </div>
          </div>
        </div>

        {/* Cast Content */}
        <div className="p-4">
          <p className="text-gray-900 dark:text-white text-sm leading-relaxed mb-3">
            {currentConversation.text}
          </p>

          {/* Reply Count */}
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            {currentConversation.replyCount} replies
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleReply(currentConversation)}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Reply
            </button>
            <button
              onClick={() => handleMarkAsRead(currentConversation)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Mark Read
            </button>
            <button
              onClick={() => handleDiscard(currentConversation)}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Discard
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={moveToPrevious}
          disabled={currentIndex === 0}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            currentIndex === 0
              ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          ← Previous
        </button>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          {currentIndex + 1} of {conversations.length}
        </div>

        <button
          onClick={moveToNext}
          disabled={currentIndex === conversations.length - 1}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            currentIndex === conversations.length - 1
              ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          Next →
        </button>
      </div>

      {/* Upcoming Preview */}
      {conversations.length > currentIndex + 1 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Upcoming (
            {conversations.slice(currentIndex + 1, currentIndex + 4).length}{" "}
            next)
          </h4>
          <div className="space-y-2">
            {conversations
              .slice(currentIndex + 1, currentIndex + 4)
              .map((conversation, idx) => (
                <div
                  key={`${conversation.castHash}-${currentIndex + 1 + idx}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <img
                    src={conversation.avatarUrl}
                    alt={conversation.username}
                    className="w-6 h-6 rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.username}`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        @{conversation.username}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {conversation.timeAgo}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {conversation.text}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Quick Actions Bar */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3">
          Quick Actions
        </h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleReply(currentConversation)}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-full transition-colors"
          >
            Reply & Next
          </button>
          <button
            onClick={() => handleMarkAsRead(currentConversation)}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-full transition-colors"
          >
            Mark Read & Next
          </button>
          <button
            onClick={() => handleDiscard(currentConversation)}
            className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium rounded-full transition-colors"
          >
            Discard & Next
          </button>
          <button
            onClick={moveToNext}
            disabled={currentIndex === conversations.length - 1}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-xs font-medium rounded-full transition-colors"
          >
            Skip
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Info */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Keyboard Shortcuts
        </h4>
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">
          <div>
            <kbd className="bg-white dark:bg-gray-700 px-2 py-1 rounded border">
              ←
            </kbd>{" "}
            or{" "}
            <kbd className="bg-white dark:bg-gray-700 px-2 py-1 rounded border">
              A
            </kbd>
            <span className="ml-2">Previous</span>
          </div>
          <div>
            <kbd className="bg-white dark:bg-gray-700 px-2 py-1 rounded border">
              →
            </kbd>{" "}
            or{" "}
            <kbd className="bg-white dark:bg-gray-700 px-2 py-1 rounded border">
              D
            </kbd>
            <span className="ml-2">Next</span>
          </div>
          <div>
            <kbd className="bg-white dark:bg-gray-700 px-2 py-1 rounded border">
              R
            </kbd>
            <span className="ml-2">Reply</span>
          </div>
          <div>
            <kbd className="bg-white dark:bg-gray-700 px-2 py-1 rounded border">
              M
            </kbd>
            <span className="ml-2">Mark Read</span>
          </div>
          <div>
            <kbd className="bg-white dark:bg-gray-700 px-2 py-1 rounded border">
              X
            </kbd>
            <span className="ml-2">Discard</span>
          </div>
          <div>
            <kbd className="bg-white dark:bg-gray-700 px-2 py-1 rounded border">
              Space
            </kbd>
            <span className="ml-2">Skip</span>
          </div>
        </div>
      </div>

      {/* Infinite Scroll Observer */}
      {hasMore && <div ref={observerRef} className="h-4" />}

      {/* Loading More Indicator */}
      {isLoadingMore && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-3 text-gray-500 dark:text-gray-400">
            <svg
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="animate-spin"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
            <span>Loading more conversations...</span>
          </div>
        </div>
      )}
    </div>
  );
}
