import React, { useState, useRef, useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { LinkContent } from "./LinkContent";
import type { UnrepliedDetail } from "@/types/types";

interface SpeedModeAltProps {
  conversations: UnrepliedDetail[];
  openRankRanks: Record<number, number | null>;
  isDarkThemeMode: boolean;
}

export function SpeedModeAlt({
  conversations,
  openRankRanks,
  isDarkThemeMode,
}: SpeedModeAltProps) {
  const [expandedUser, setExpandedUser] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyError, setReplyError] = useState("");
  const [observerRef, setObserverRef] = useState<HTMLDivElement | null>(null);

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

  const handleMarkAsRead = (conversation: UnrepliedDetail) => {
    // TODO: Implement mark as read functionality
    console.log("Marking as read:", conversation.castHash);
    setReplyText("");
    setReplyError("");
  };

  const handleDiscard = (conversation: UnrepliedDetail) => {
    // TODO: Implement discard functionality
    console.log("Discarding:", conversation.castHash);
    setReplyText("");
    setReplyError("");
  };

  const handleReply = (conversation: UnrepliedDetail) => {
    if (!replyText.trim()) {
      setReplyError("Reply cannot be empty");
      return;
    }
    if (replyText.length > 320) {
      setReplyError("Reply is too long");
      return;
    }

    // TODO: Implement reply functionality
    console.log("Sending reply:", replyText, "to:", conversation.castHash);
    setReplyText("");
    setReplyError("");
  };

  const handleViewCast = async (castHash: string) => {
    try {
      await sdk.actions.viewCast({ hash: castHash });
    } catch (error) {
      console.error("Error viewing cast:", error);
    }
  };

  useEffect(() => {
    if (observerRef) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // TODO: Implement infinite scroll to fetch more conversations
              console.log("Loading more conversations...");
            }
          });
        },
        { threshold: 0.1 }
      );

      observer.observe(observerRef);
      return () => observer.disconnect();
    }
  }, [observerRef]);

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
        {Object.values(userGroups).map((userGroup) => (
          <div
            key={userGroup.user.fid}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* User Header - Always Visible */}
            <div
              className="p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
                    <span className="font-medium text-gray-900 dark:text-white truncate text-sm">
                      @{userGroup.user.username}
                    </span>
                    {openRankRanks[userGroup.user.fid] && (
                      <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-1.5 py-0.5 rounded-full">
                        #{openRankRanks[userGroup.user.fid]?.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {userGroup.conversations.length} unreplied cast{userGroup.conversations.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {expandedUser === userGroup.user.fid ? "▼" : "▶"}
                </div>
              </div>
            </div>

            {/* Expanded User Content - Only visible when user is expanded */}
            {expandedUser === userGroup.user.fid && (
              <div className="border-t border-gray-200 dark:border-gray-700">
                {userGroup.conversations.map((conversation, index) => (
                  <div
                    key={conversation.castHash}
                    className={`${
                      index < userGroup.conversations.length - 1
                        ? "border-b border-gray-100 dark:border-gray-700"
                        : ""
                    }`}
                  >
                    {/* Cast Content - Smaller bubbles */}
                    {conversation.text.trim() ? (
                      <div className="px-2 py-2">
                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                          {conversation.text.replace(/(https?:\/\/[^\s]+)/g, "")}
                        </p>
                      </div>
                    ) : (
                      <div className="px-2 py-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                          📎 Cast contains embedded media only
                        </div>
                      </div>
                    )}

                    {/* Embedded Media - Smaller */}
                    <div className="px-2 pb-2">
                      <LinkContent
                        text={conversation.originalCastText}
                        isDarkTheme={isDarkThemeMode}
                        className="mb-0"
                      />
                    </div>

                    {/* Reply Text Field - Smaller */}
                    <div className="px-2 pb-2">
                      <div className="flex items-center justify-between mb-1">
                        <label
                          htmlFor={`reply-text-${conversation.castHash}`}
                          className="text-xs font-medium text-gray-700 dark:text-gray-300"
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
                          setReplyError("");
                        }}
                        placeholder="Type your reply..."
                        className={`w-full p-1.5 border rounded text-xs resize-none transition-colors ${
                          replyError
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                        } ${
                          isDarkThemeMode
                            ? "bg-gray-700 text-white placeholder-gray-400"
                            : "bg-white text-gray-900 placeholder-gray-500"
                        }`}
                        rows={2}
                        maxLength={320}
                        style={{ minHeight: "40px" }}
                      />
                      {replyError && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                          {replyError}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons - Smaller */}
                    <div className="px-2 pb-2">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleMarkAsRead(conversation)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-2 py-1.5 rounded text-xs font-medium transition-colors"
                        >
                          Mark Read
                        </button>
                        <button
                          onClick={() => handleDiscard(conversation)}
                          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-2 py-1.5 rounded text-xs font-medium transition-colors"
                        >
                          Skip
                        </button>
                        <button
                          onClick={() => handleReply(conversation)}
                          disabled={!replyText.trim()}
                          className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                            replyText.trim()
                              ? "bg-purple-600 hover:bg-purple-700 text-white"
                              : "bg-gray-400 dark:bg-gray-600 text-gray-200 dark:text-gray-300 cursor-not-allowed"
                          }`}
                        >
                          Send Reply
                        </button>
                      </div>
                    </div>

                    {/* Cast Actions - Smaller */}
                    <div className="px-2 pb-2">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleViewCast(conversation.castHash)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded text-xs font-medium transition-colors"
                        >
                          View Cast
                        </button>
                        <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1.5">
                          {conversation.timeAgo} • {conversation.replyCount} replies
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Infinite Scroll Observer */}
      <div ref={setObserverRef} className="h-4" />
    </div>
  );
}
