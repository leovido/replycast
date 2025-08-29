import React from "react";
import Image from "next/image";
import {
  getPrimaryTextColor,
  getSecondaryTextColor,
  getTertiaryTextColor,
  type ThemeMode,
} from "@/utils/themeHelpers";
import type { UnrepliedDetail } from "@/types/types";
import { LinkContent } from "./LinkContent";

interface ReplyCardSimpleProps {
  conversation: UnrepliedDetail;
  themeMode: ThemeMode;
  isDarkTheme: boolean;
  onClick?: () => void;
  className?: string;
}

export function ReplyCardSimple({
  conversation,
  themeMode,
  isDarkTheme,
  onClick,
  className = "",
}: ReplyCardSimpleProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  // Extract links from the text
  const extractLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const links = text.match(urlRegex) || [];
    return links;
  };

  // Remove links from display text
  const getDisplayText = (text: string) => {
    return text.replace(/(https?:\/\/[^\s]+)/g, "").trim();
  };

  const links = extractLinks(conversation.text);
  const displayText = getDisplayText(conversation.text);

  return (
    <div
      className={`group relative w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-200 cursor-pointer ${className}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="flex gap-3 p-4">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
          <div className="relative">
            <Image
              src={conversation.avatarUrl}
              alt={`@${conversation.username}'s avatar`}
              width={30}
              height={30}
              className="rounded-full ring-2 ring-gray-200 dark:ring-gray-600 group-hover:ring-purple-300 dark:group-hover:ring-purple-600 transition-all duration-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.username}`;
              }}
            />
            {/* Optional: Add a subtle glow effect on hover */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex flex-col items-start">
              {/* Username */}
              <span
                className={`font-semibold text-base ${getPrimaryTextColor(
                  themeMode
                )} group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors`}
              >
                @{conversation.username}
              </span>

              <span className={`text-sm ${getTertiaryTextColor(themeMode)}`}>
                {conversation.authorFid}
              </span>
            </div>

            {/* Timestamp */}
            <span
              className={`text-sm ${getTertiaryTextColor(themeMode)} ml-auto`}
            >
              {conversation.timeAgo}
            </span>

            {/* More Options Icon */}
            <button
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Show options menu
                console.log("Show options for:", conversation.castHash);
              }}
            >
              <svg
                className="w-4 h-4 text-gray-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 5v.01M12 12h.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>

          {/* Cast Text */}
          {displayText && (
            <div
              className={`mb-3 text-sm text-left leading-relaxed break-words ${getPrimaryTextColor(
                themeMode
              )}`}
            >
              {displayText}
            </div>
          )}

          {/* Links Section */}
          {links.length > 0 && (
            <div className="mb-3">
              <LinkContent
                text={conversation.text}
                isDarkTheme={isDarkTheme}
                className="mb-0"
              />
            </div>
          )}

          {/* Show indicator when there's no text but there are embeds */}
          {!displayText && !links.length && (
            <div
              className={`mb-3 text-sm italic ${getTertiaryTextColor(
                themeMode
              )}`}
            >
              📎 Cast contains embedded media
            </div>
          )}

          {/* Interaction Bar */}
          <div
            className={`flex items-center gap-6 text-sm ${getTertiaryTextColor(
              themeMode
            )}`}
          >
            {/* Replies */}
            <div className="flex items-center gap-2 group/stat hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span className="font-medium">{conversation.replyCount}</span>
            </div>

            {/* Recasts */}
            {conversation.recastsCount !== undefined &&
              conversation.recastsCount > 0 && (
                <div className="flex items-center gap-2 group/stat hover:text-green-600 dark:hover:text-green-400 transition-colors">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="font-medium">
                    {conversation.recastsCount}
                  </span>
                </div>
              )}

            {/* Likes */}
            {conversation.likesCount !== undefined &&
              conversation.likesCount > 0 && (
                <div className="flex items-center gap-2 group/stat hover:text-red-600 dark:hover:text-red-400 transition-colors">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span className="font-medium">{conversation.likesCount}</span>
                </div>
              )}

            {/* Share Icon */}
            <div className="flex items-center gap-2 ml-auto group/stat hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
