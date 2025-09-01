import React, { useState, useEffect, type RefObject } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import type { UnrepliedDetail } from "@/types/types";
import {
  getBackgroundClass,
  getBorderColor,
  getBubbleBgColor,
  getCardBackground,
  getTextColor,
} from "@/utils/themeHelpers";
import type { ThemeMode } from "@/utils/themeHelpers";
import { ReplyCardSimple } from "./ReplyCardSimple";

interface SpeedModeAltProps {
  conversations: UnrepliedDetail[];
  openRankRanks: Record<number, number | null>;
  isDarkThemeMode: boolean;
  themeMode: ThemeMode;
  loading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  observerRef: RefObject<HTMLDivElement>;
  onMarkAsRead?: (conversation: UnrepliedDetail) => void;
  onDiscard?: (conversation: UnrepliedDetail) => void;
}

export function SpeedModeAlt({
  conversations,
  openRankRanks,
  isDarkThemeMode,
  themeMode,
  loading,
  isLoadingMore,
  hasMore,
  observerRef,
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

  // Sort users by OpenRank (highest rank first, since lower numbers are better ranks)
  const sortedUserGroups = Object.values(userGroups).sort((a, b) => {
    const rankA = openRankRanks[a.user.fid];
    const rankB = openRankRanks[b.user.fid];

    // If both have ranks, sort by rank (lower number = better rank)
    if (rankA !== null && rankB !== null) {
      return rankA - rankB;
    }

    // If only one has a rank, prioritize the one with rank
    if (rankA !== null && rankB === null) {
      return -1; // A has rank, B doesn't - A comes first
    }
    if (rankA === null && rankB !== null) {
      return 1; // B has rank, A doesn't - B comes first
    }

    // If neither has rank, sort alphabetically by username
    return a.user.username.localeCompare(b.user.username);
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
            )} overflow-hidden border-purple-300/60 shadow-lg shadow-purple-900/20`}
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
                    <span className="font-medium text-white dark:text-white truncate text-sm">
                      @{userGroup.user.username}
                    </span>
                    {openRankRanks[userGroup.user.fid] && (
                      <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-1.5 py-0.5 rounded-full">
                        #{openRankRanks[userGroup.user.fid]?.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-400">
                    {userGroup.conversations.length} unreplied cast
                    {userGroup.conversations.length !== 1 ? "s" : ""}
                  </div>
                </div>
                <div className="text-xs text-gray-400">
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
