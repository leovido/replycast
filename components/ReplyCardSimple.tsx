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
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="font-medium">{conversation.replyCount}</span>
            </div>

            {/* Recasts */}
            <div className="flex items-center gap-2 group/stat hover:text-green-600 dark:hover:text-green-400 transition-colors">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
              <span className="font-medium">{conversation.recastsCount}</span>
            </div>

            {/* Likes */}
            <div className="flex items-center gap-2 group/stat hover:text-red-600 dark:hover:text-red-400 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span className="font-medium">{conversation.likesCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
