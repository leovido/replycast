import React from "react";
import Image from "next/image";
import {
  getBackgroundClass,
  getPrimaryTextColor,
  getTertiaryTextColor,
  type ThemeMode,
} from "@/utils/themeHelpers";
import type { UnrepliedDetail } from "@/types/types";
import { LinkContent } from "./LinkContent";
import { sdk } from "@farcaster/miniapp-sdk";

interface ReplyCardSimpleProps {
  conversation: UnrepliedDetail;
  themeMode: ThemeMode;
  isDarkTheme: boolean;
  onClick?: () => void;
  className?: string;
  isLoading?: boolean;
}

export function ReplyCardSimple({
  conversation,
  themeMode,
  isDarkTheme,
  onClick,
  className = "",
  isLoading = false,
}: ReplyCardSimpleProps) {
  const handleClick = async () => {
    if (isLoading) return; // Prevent multiple clicks

    try {
      // If a custom onClick is provided, use that
      if (onClick) {
        onClick();
        return;
      }

      // Otherwise, open the cast using the Farcaster SDK
      await sdk.actions.viewCast({ hash: conversation.castHash });
    } catch (error) {
      console.error("Error opening cast:", error);
      // Fallback: try to open the cast URL directly
      if (conversation.castUrl) {
        window.open(conversation.castUrl, "_blank");
      }
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
      className={`group relative w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all duration-200 cursor-pointer ${
        isLoading ? "opacity-75 pointer-events-none" : ""
      } ${className}`}
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
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Profile Picture */}
      <div className="flex flex-row p-4 gap-2 items-center">
        <div className="relative">
          <Image
            src={conversation.avatarUrl}
            alt={`@${conversation.username}'s avatar`}
            width={40}
            height={40}
            className="rounded-full ring-2 ring-gray-200 dark:ring-gray-600 group-hover:ring-purple-300 dark:group-hover:ring-purple-600 transition-all duration-200"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.username}`;
            }}
          />
          {/* Optional: Add a subtle glow effect on hover */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>

        {/* Header Row */}
        <div className="flex flex-col flex-1">
          {/* Username */}
          <span
            className={`font-semibold text-left group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors`}
          >
            @{conversation.username}
          </span>

          <span className={`text-sm text-left`}>{conversation.authorFid}</span>
        </div>

        {/* Timestamp - positioned at the rightmost side */}
        <span className={`text-sm text-right flex-shrink-0`}>
          {conversation.timeAgo}
        </span>
      </div>

      <div className={`flex gap-3 p-4`}>
        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {/* Cast Text */}
          {displayText && (
            <div
              className={`mb-3 text-sm text-left leading-relaxed break-words`}
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
          </div>
        </div>
      </div>
    </div>
  );
}
