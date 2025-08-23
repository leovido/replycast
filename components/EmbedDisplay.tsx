"use client";

import React from "react";
import { classifyUrl } from "@/utils/linkUtils";

interface EmbedDisplayProps {
  url: string;
  isDarkTheme: boolean;
  className?: string;
}

export function EmbedDisplay({
  url,
  isDarkTheme,
  className = "",
}: EmbedDisplayProps) {
  const urlInfo = classifyUrl(url);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const renderYouTubeEmbed = () => {
    const thumbnail = urlInfo.thumbnail;
    return (
      <div className="flex flex-col">
        {thumbnail && (
          <div className="relative mb-3">
            <img
              src={thumbnail}
              alt="Video thumbnail"
              className="w-full h-32 object-cover rounded-lg"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/70 rounded-full p-3">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={`font-medium text-sm truncate ${
                isDarkTheme ? "text-white" : "text-gray-900"
              }`}
            >
              {urlInfo.title || "YouTube Video"}
            </p>
            <p
              className={`text-xs ${
                isDarkTheme ? "text-white/60" : "text-gray-500"
              }`}
            >
              {urlInfo.domain}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderGenericEmbed = () => {
    return (
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isDarkTheme ? "bg-white/10" : "bg-gray-100"
          }`}
        >
          <svg
            className={`w-6 h-6 ${
              isDarkTheme ? "text-white/60" : "text-gray-500"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm truncate ${
              isDarkTheme ? "text-white/80" : "text-gray-700"
            }`}
          >
            {url}
          </p>
          <p
            className={`text-xs ${
              isDarkTheme ? "text-white/60" : "text-gray-500"
            }`}
          >
            {urlInfo.domain}
          </p>
        </div>
      </div>
    );
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full p-3 rounded-lg border transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-400 ${
        isDarkTheme
          ? "border-white/20 bg-white/5 hover:bg-white/10"
          : "border-gray-200 bg-gray-50 hover:bg-gray-100"
      } ${className}`}
    >
      {urlInfo.type === "youtube" ? renderYouTubeEmbed() : renderGenericEmbed()}
    </button>
  );
}
