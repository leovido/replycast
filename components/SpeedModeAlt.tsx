import React, { useState } from "react";
import type { UnrepliedDetail } from "@/types/types";
import { LinkContent } from "./LinkContent";

interface SpeedModeAltProps {
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

export function SpeedModeAlt({
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
}: SpeedModeAltProps) {
  const [expandedCast, setExpandedCast] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyError, setReplyError] = useState("");

  const isDarkThemeMode =
    themeMode === "dark" || (themeMode === "Farcaster" && isDarkTheme);

  const handleMarkAsRead = (detail: UnrepliedDetail) => {
    onMarkAsRead?.(detail);
    setExpandedCast(null);
    setReplyText("");
    setReplyError("");
  };

  const handleDiscard = (detail: UnrepliedDetail) => {
    onDiscard?.(detail);
    setExpandedCast(null);
    setReplyText("");
    setReplyError("");
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
    setExpandedCast(null);

    // Process the conversation
    onReply(detail);
  };

  const toggleCastExpansion = (castHash: string) => {
    if (expandedCast === castHash) {
      setExpandedCast(null);
      setReplyText("");
      setReplyError("");
    } else {
      setExpandedCast(castHash);
      setReplyText("");
      setReplyError("");
    }
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

  return (
    <div className="px-4 pb-20">
      {/* Casts List */}
      <div className="space-y-3">
        {conversations.map((conversation, index) => (
          <div
            key={conversation.castHash}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Cast Header - Always Visible */}
            <div
              className="p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={() => toggleCastExpansion(conversation.castHash)}
            >
              <div className="flex items-center gap-3">
                <img
                  src={conversation.avatarUrl}
                  alt={`@${conversation.username}`}
                  className="w-8 h-8 rounded-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.username}`;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white truncate text-sm">
                      @{conversation.username}
                    </span>
                    {openRankRanks[conversation.authorFid] && (
                      <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-1.5 py-0.5 rounded-full">
                        #
                        {openRankRanks[
                          conversation.authorFid
                        ]?.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {conversation.timeAgo} • {conversation.replyCount} replies
                  </div>
                  {/* Cast Preview - One line */}
                  {conversation.text.trim() && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-1">
                      {conversation.text
                        .replace(/(https?:\/\/[^\s]+)/g, "")
                        .trim()}
                    </p>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {expandedCast === conversation.castHash ? "▼" : "▶"}
                </div>
              </div>
            </div>

            {/* Expanded Content - Only visible when cast is expanded */}
            {expandedCast === conversation.castHash && (
              <>
                {/* Cast Content */}
                {conversation.text.trim() ? (
                  <div className="px-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {conversation.text.replace(/(https?:\/\/[^\s]+)/g, "")}
                    </p>
                  </div>
                ) : (
                  <div className="px-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                      📎 Cast contains embedded media only
                    </div>
                  </div>
                )}

                {/* Embedded Media */}
                <div className="px-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <LinkContent
                    text={conversation.originalCastText}
                    isDarkTheme={isDarkThemeMode}
                    className="mb-0"
                  />
                </div>

                {/* Reply Text Field */}
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor={`reply-text-${conversation.castHash}`}
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
                    id={`reply-text-${conversation.castHash}`}
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
                      onClick={() => handleMarkAsRead(conversation)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Mark Read
                    </button>
                    <button
                      onClick={() => handleDiscard(conversation)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Skip
                    </button>
                    <button
                      onClick={() => handleReply(conversation)}
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
              </>
            )}
          </div>
        ))}
      </div>

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
