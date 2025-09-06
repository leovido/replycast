import React, { useState } from "react";
import type { UnrepliedDetail } from "@/types/types";
import { sdk } from "@farcaster/miniapp-sdk";
import { LinkContent } from "./LinkContent";
import Image from "next/image";

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
  const [replyText, setReplyText] = useState("");
  const [replyError, setReplyError] = useState("");

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
    // Validate reply text
    if (!replyText.trim()) {
      setReplyError("Reply cannot be empty");
      return;
    }

    if (replyText.length > 320) {
      setReplyError("Reply cannot exceed 320 characters");
      return;
    }

    // For now, just discard the reply as requested
    console.log("Reply would be sent:", replyText);

    // Clear the reply text and error
    setReplyText("");
    setReplyError("");

    // Process the conversation
    onReply(detail);
    setProcessedCount((prev) => prev + 1);
    moveToNext();
  };

  // Focus management for reply textarea
  React.useEffect(() => {
    if (
      conversations.length > 0 &&
      currentIndex < conversations.length &&
      replyText === ""
    ) {
      const textarea = document.getElementById(
        "reply-text"
      ) as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
      }
    }
  }, [currentIndex, conversations.length, replyText]);

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
            // Focus the text field first if reply is empty
            if (!replyText.trim()) {
              const textarea = document.getElementById(
                "reply-text"
              ) as HTMLTextAreaElement;
              if (textarea) {
                textarea.focus();
                return;
              }
            }
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
        case "enter":
          event.preventDefault();
          if (conversations[currentIndex] && replyText.trim()) {
            handleReply(conversations[currentIndex]);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentIndex, conversations.length]);

  const moveToNext = () => {
    if (currentIndex < conversations.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      // Clear reply text when moving to next conversation
      setReplyText("");
      setReplyError("");
    }
  };

  const moveToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      // Clear reply text when moving to previous conversation
      setReplyText("");
      setReplyError("");
    }
  };

  const resetProgress = () => {
    setCurrentIndex(0);
    setProcessedCount(0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
        <p className="ml-2 text-sm text-gray-600">Loading...</p>
      </div>
    );
  }

  // Show loading state while conversations are being fetched
  if (conversations.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-48 px-4 text-center">
        <div className="text-4xl mb-3 text-gray-300">📭</div>
        <h3 className="text-base font-semibold mb-2 text-gray-900">
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
      <div className="flex flex-col items-center justify-center h-48 px-4 text-center">
        <div
          className={`text-4xl mb-3 ${
            isDarkThemeMode ? "text-white/20" : "text-gray-300"
          }`}
        >
          🎯
        </div>
        <h3
          className={`text-base font-semibold mb-2 ${
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
      <div className="flex flex-col items-center justify-center h-48 px-4 text-center">
        <div className="text-4xl mb-3 text-gray-300">🔄</div>
        <h3 className="text-base font-semibold mb-2 text-gray-900">
          Resetting to first conversation...
        </h3>
      </div>
    );
  }

  const currentConversation = conversations[currentIndex];

  // Safety check - if currentConversation is undefined, show loading or error
  if (!currentConversation) {
    return (
      <div className="flex flex-col items-center justify-center h-48 px-4 text-center">
        <div className="text-4xl mb-3 text-gray-300">⏳</div>
        <h3 className="text-base font-semibold mb-2 text-gray-900">
          Loading conversation...
        </h3>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / conversations.length) * 100;
  const remainingCount = conversations.length - currentIndex;

  return (
    <div className="px-4 pb-20">
      {/* Progress Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="text-lg">⚡</div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Speed Mode
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {currentIndex + 1} of {conversations.length}
              </p>
            </div>
          </div>
          <button
            onClick={resetProgress}
            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs transition-colors"
            aria-label="Reset progress"
          >
            Reset
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div
            className="bg-purple-500 h-1.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={currentIndex + 1}
            aria-valuemin={1}
            aria-valuemax={conversations.length}
          />
        </div>

        {/* Compact Stats */}
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>{remainingCount} left</span>
          <span>{processedCount} done</span>
          {processedCount > 0 && (
            <span>
              ~
              {Math.round(
                (processedCount /
                  Math.max(1, (Date.now() - startTime) / 1000)) *
                  60
              )}
              /min
            </span>
          )}
        </div>
      </div>

      {/* Current Conversation Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-4">
        {/* Author Info */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Image
              src={currentConversation.avatarUrl}
              alt={`@${currentConversation.username}`}
              className="w-8 h-8 rounded-full"
              width={32}
              height={32}
              // Disable optimization to prevent multiple requests
              unoptimized={true}
              // Disable lazy loading for immediate display
              priority={false}
              loading="eager"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentConversation.username}`;
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-white truncate text-sm">
                  @{currentConversation.username}
                </span>
                {openRankRanks[currentConversation.authorFid] && (
                  <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-1.5 py-0.5 rounded-full">
                    #
                    {openRankRanks[
                      currentConversation.authorFid
                    ]?.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {currentConversation.timeAgo} • {currentConversation.replyCount}{" "}
                replies
              </div>
            </div>
          </div>
        </div>

        {/* Cast Content */}
        {currentConversation.text.trim() ? (
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {currentConversation.text}
            </p>
          </div>
        ) : (
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 italic">
              📎 Cast contains embedded media only
            </div>
          </div>
        )}

        {/* Embedded Media */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <LinkContent
            text={currentConversation.text}
            isDarkTheme={isDarkThemeMode}
            className="mb-0"
          />
        </div>

        {/* Reply Text Field */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="reply-text"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Reply
            </label>
            <span
              className={`text-xs ${
                replyText.length > 280
                  ? "text-red-500"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {replyText.length}/320
            </span>
          </div>
          <textarea
            id="reply-text"
            value={replyText}
            onChange={(e) => {
              setReplyText(e.target.value);
              setReplyError(""); // Clear error when user types
            }}
            placeholder="Type your reply..."
            className={`w-full p-2 border rounded-lg resize-none transition-colors text-sm ${
              replyError
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500"
            } ${
              isDarkThemeMode
                ? "bg-gray-700 text-white placeholder-gray-400"
                : "bg-white text-gray-900 placeholder-gray-500"
            }`}
            rows={3}
            maxLength={320}
            style={{ minHeight: "60px" }}
          />
          {replyError && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {replyError}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-3 pt-0">
          <div className="flex gap-2">
            <button
              onClick={() => handleMarkAsRead(currentConversation)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Mark Read
            </button>
            <button
              onClick={() => handleDiscard(currentConversation)}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Skip
            </button>
            <button
              onClick={() => handleReply(currentConversation)}
              disabled={!replyText.trim()}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                replyText.trim()
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "bg-gray-400 dark:bg-gray-600 text-gray-200 dark:text-gray-300 cursor-not-allowed"
              }`}
            >
              Send Reply
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={moveToPrevious}
          disabled={currentIndex === 0}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentIndex === 0
              ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          ← Previous
        </button>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          {currentIndex + 1} of {conversations.length}
        </div>

        <button
          onClick={moveToNext}
          disabled={currentIndex === conversations.length - 1}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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
          <h4 className="text-sm font-medium text-white dark:text-white mb-3">
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
                    {/* Compact embedded media preview */}
                    <div className="mt-1">
                      <LinkContent
                        text={conversation.text}
                        isDarkTheme={isDarkThemeMode}
                        className="scale-75 origin-left"
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Infinite Scroll Observer */}
      {hasMore && <div ref={observerRef} className="h-4" />}

      {/* Loading More Indicator */}
      {isLoadingMore && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
            <svg
              width={16}
              height={16}
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
            <span>Loading more...</span>
          </div>
        </div>
      )}
    </div>
  );
}
