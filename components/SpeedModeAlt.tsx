import React, { useState, useEffect, type RefObject } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import type { UnrepliedDetail, OpenRankData } from "@/types/types";
import type { QuotientScore } from "@/hooks/useQuotient";
import {
  getBackgroundClass,
  getBorderColor,
  getBubbleBgColor,
  getCardBackground,
  getTextColor,
} from "@/utils/themeHelpers";
import type { ThemeMode } from "@/types/types";
import { ReplyCardSimple } from "./ReplyCardSimple";
import { getMinutesAgo } from "@/utils/farcaster";

interface SpeedModeAltProps {
  conversations: UnrepliedDetail[];
  openRankData: Record<number, OpenRankData>;
  quotientScores: Record<number, QuotientScore | null>;
  isDarkThemeMode: boolean;
  themeMode: ThemeMode;
  loading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  observerRef: RefObject<HTMLDivElement>;
  sortOption: string;
  onMarkAsRead?: (conversation: UnrepliedDetail) => void;
  onDiscard?: (conversation: UnrepliedDetail) => void;
}

export function SpeedModeAlt({
  conversations,
  openRankData,
  quotientScores,
  isDarkThemeMode,
  themeMode,
  loading,
  isLoadingMore,
  hasMore,
  observerRef,
  sortOption,
  onMarkAsRead,
  onDiscard,
}: SpeedModeAltProps) {
  const [expandedUser, setExpandedUser] = useState<number | null>(null);
  const [selectedConversation, setSelectedConversation] =
    useState<UnrepliedDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyError, setReplyError] = useState("");

  // Determine the actual theme for styling
  const isDarkTheme =
    themeMode === "dark" || (themeMode === "Farcaster" && isDarkThemeMode);

  // Group conversations by user
  const userGroups = conversations.reduce((groups, conversation) => {
    const userId = conversation.authorFid;
    if (!groups[userId]) {
      groups[userId] = {
        user: {
          fid: conversation.authorFid,
          username: conversation.username,
          avatarUrl: conversation.avatarUrl,
        },
        conversations: [],
      };
    }
    groups[userId].conversations.push(conversation);
    return groups;
  }, {} as Record<number, { user: { fid: number; username: string; avatarUrl: string }; conversations: UnrepliedDetail[] }>);

  // Sort user groups based on sortOption
  const sortedUserGroups = Object.values(userGroups).sort((a, b) => {
    switch (sortOption) {
      case "newest":
        // Sort by most recent conversation in each group
        const newestA = Math.min(
          ...a.conversations.map((c) => getMinutesAgo(c.timeAgo))
        );
        const newestB = Math.min(
          ...b.conversations.map((c) => getMinutesAgo(c.timeAgo))
        );
        return newestA - newestB;
      case "oldest":
        // Sort by oldest conversation in each group
        const oldestA = Math.max(
          ...a.conversations.map((c) => getMinutesAgo(c.timeAgo))
        );
        const oldestB = Math.max(
          ...b.conversations.map((c) => getMinutesAgo(c.timeAgo))
        );
        return oldestB - oldestA;
      case "fid-asc":
        return a.user.fid - b.user.fid;
      case "fid-desc":
        return b.user.fid - a.user.fid;
      case "short":
        // Sort by users who have the most short conversations
        const shortA = a.conversations.filter((c) => c.text.length < 20).length;
        const shortB = b.conversations.filter((c) => c.text.length < 20).length;
        return shortB - shortA;
      case "medium":
        // Sort by users who have the most medium conversations
        const mediumA = a.conversations.filter(
          (c) => c.text.length >= 20 && c.text.length <= 50
        ).length;
        const mediumB = b.conversations.filter(
          (c) => c.text.length >= 20 && c.text.length <= 50
        ).length;
        return mediumB - mediumA;
      case "long":
        // Sort by users who have the most long conversations
        const longA = a.conversations.filter((c) => c.text.length > 50).length;
        const longB = b.conversations.filter((c) => c.text.length > 50).length;
        return longB - longA;
      default:
        return 0;
    }
  });

  const toggleUserExpansion = (userId: number) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
      setReplyText("");
      setReplyError("");
    } else {
      setExpandedUser(userId);
      setReplyText("");
      setReplyError("");
    }
  };

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            All caught up!
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            You have no unreplied conversations at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-20">
      {/* Users List */}
      <div className="space-y-2">
        {sortedUserGroups.map((userGroup) => (
          <div
            key={userGroup.user.fid}
            className={`rounded-lg border ${getBorderColor(
              themeMode
            )} overflow-hidden shadow-lg shadow-purple-900/20`}
          >
            {/* User Header - Always Visible */}
            <div
              className={`${getCardBackground(
                themeMode,
                true,
                false
              )} p-2 cursor-pointer transition-colors`}
              onClick={() => toggleUserExpansion(userGroup.user.fid)}
            >
              <div className="flex items-center gap-2">
                <img
                  src={userGroup.user.avatarUrl}
                  alt={`@${userGroup.user.username}`}
                  className="w-6 h-6 rounded-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userGroup.user.username}`;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-medium truncate text-sm ${
                        isDarkTheme ? "text-white" : "text-gray-900"
                      }`}
                    >
                      @{userGroup.user.username}
                    </span>
                    <div className="flex items-center gap-1">
                      {openRankData[userGroup.user.fid]?.engagement?.rank && (
                        <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-1.5 py-0.5 rounded-full">
                          OR #
                          {openRankData[
                            userGroup.user.fid
                          ]?.engagement?.rank?.toLocaleString()}
                        </span>
                      )}
                      {quotientScores[userGroup.user.fid] && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded-full">
                          {(
                            quotientScores[userGroup.user.fid]?.quotientScore ||
                            0
                          ).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className={`text-xs ${
                      isDarkTheme ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {userGroup.conversations.length} unreplied cast
                    {userGroup.conversations.length !== 1 ? "s" : ""}
                  </div>
                </div>
                <div
                  className={`text-xs ${
                    isDarkTheme ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {expandedUser === userGroup.user.fid ? "▼" : "▶"}
                </div>
              </div>
            </div>

            {/* Expanded User Content - Only visible when user is expanded */}
            {expandedUser === userGroup.user.fid && (
              <button className="w-full items-start">
                <div className="border-t border-gray-200 dark:border-gray-700">
                  {userGroup.conversations.map((conversation, index) => (
                    <ReplyCardSimple
                      key={index}
                      conversation={conversation}
                      themeMode={themeMode}
                      isDarkTheme={isDarkTheme}
                      onMarkAsRead={onMarkAsRead}
                      onDiscard={onDiscard}
                    />
                  ))}
                </div>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Loading states */}
      {loading && (
        <div className="col-span-full flex justify-center py-8">
          <div
            className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
              isDarkTheme ? "border-white/60" : "border-gray-600"
            }`}
          ></div>
        </div>
      )}
      {isLoadingMore && (
        <div className="col-span-full flex justify-center py-4">
          <div
            className={`animate-spin rounded-full h-6 w-6 border-b-2 ${
              isDarkTheme ? "border-white/60" : "border-gray-600"
            }`}
          ></div>
        </div>
      )}
      {hasMore && (
        <div
          ref={observerRef}
          className="h-8 w-full flex items-center justify-center"
          style={{ minHeight: "32px" }}
        >
          {isLoadingMore && (
            <div className="text-xs opacity-50">Loading more...</div>
          )}
        </div>
      )}

      {/* Cast Detail Modal - Ready for future use */}
      {/* <CastDetailModal
        isOpen={false} // TODO: Change to isModalOpen when ready to use
        onClose={() => setIsModalOpen(false)}
        conversation={null} // TODO: Change to selectedConversation when ready to use
        themeMode={themeMode}
        isDarkTheme={isDarkTheme}
      /> */}
    </div>
  );
}
