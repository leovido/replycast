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

interface CastDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: UnrepliedDetail | null;
  themeMode: ThemeMode;
  isDarkTheme: boolean;
}

export function CastDetailModal({
  isOpen,
  onClose,
  conversation,
  themeMode,
  isDarkTheme,
}: CastDetailModalProps) {
  if (!isOpen || !conversation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`relative w-full max-w-md max-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl ${
          isDarkTheme ? "bg-gray-900" : "bg-white"
        }`}
      >
        {/* Header */}
        <div
          className={`sticky top-0 z-10 flex items-center justify-between p-4 border-b ${
            isDarkTheme ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <h2
            className={`text-lg font-semibold ${getPrimaryTextColor(
              themeMode
            )}`}
          >
            Cast Details
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Cast Content */}
        <div className="p-4">
          {/* User Info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-shrink-0">
              <Image
                src={`/api/image-proxy?url=${conversation.avatarUrl}`}
                alt={`@${conversation.username}'s avatar`}
                width={48}
                height={48}
                className="rounded-full border-2 border-white/20"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.username}`;
                }}
              />
            </div>
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <div
                className={`font-semibold leading-tight text-lg ${getPrimaryTextColor(
                  themeMode
                )}`}
              >
                @{conversation.username}
              </div>
              <div className={`text-sm ${getSecondaryTextColor(themeMode)}`}>
                FID: {conversation.authorFid}
              </div>
              <div className={`text-sm ${getTertiaryTextColor(themeMode)}`}>
                {conversation.timeAgo}
              </div>
            </div>
          </div>

          {/* Cast Text */}
          {conversation.text.trim() && (
            <div
              className={`mb-4 text-base leading-relaxed break-words whitespace-pre-wrap ${getPrimaryTextColor(
                themeMode
              )}`}
            >
              {conversation.text}
            </div>
          )}

          {/* Embedded Media */}
          <div className="mb-4">
            <LinkContent
              text={conversation.originalCastText}
              isDarkTheme={isDarkTheme}
              className="mb-0"
              embeds={conversation.embeds}
            />
          </div>

          {/* Show indicator when there's no text but there are embeds */}
          {!conversation.text.trim() && (
            <div
              className={`mb-4 text-xs italic ${getTertiaryTextColor(
                themeMode
              )}`}
            >
              📎 Cast contains embedded media
            </div>
          )}

          {/* Interaction Stats */}
          <div
            className={`flex items-center gap-6 text-sm ${
              themeMode === "dark"
                ? "text-white/80"
                : getTertiaryTextColor(themeMode)
            }`}
          >
            <div className="flex items-center gap-2">
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
              <span>{conversation.replyCount} replies</span>
            </div>

            {conversation.likesCount !== undefined &&
              conversation.likesCount > 0 && (
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span>{conversation.likesCount} likes</span>
                </div>
              )}

            {conversation.recastsCount !== undefined &&
              conversation.recastsCount > 0 && (
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>{conversation.recastsCount} recasts</span>
                </div>
              )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                // TODO: Implement mark as read functionality
                onClose();
              }}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Mark Read
            </button>
            <button
              onClick={() => {
                // TODO: Implement discard functionality
                onClose();
              }}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
