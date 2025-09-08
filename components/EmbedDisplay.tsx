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
  const [thumbnailError, setThumbnailError] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const renderYouTubeEmbed = () => {
    const thumbnail = urlInfo.thumbnail;

    // Generate fallback thumbnail URLs for different qualities
    const getFallbackThumbnails = () => {
      if (!urlInfo.thumbnail) return [];

      const baseUrl = urlInfo.thumbnail.replace("/hqdefault.jpg", "");
      return [
        `${baseUrl}/maxresdefault.jpg`, // Highest quality
        `${baseUrl}/hqdefault.jpg`, // High quality (current)
        `${baseUrl}/mqdefault.jpg`, // Medium quality
        `${baseUrl}/sddefault.jpg`, // Standard quality
      ];
    };

    const fallbackThumbnails = getFallbackThumbnails();

    return (
      <div className="flex flex-col">
        {thumbnail && !thumbnailError && (
          <div className="relative mb-3">
            <img
              src={thumbnail}
              alt="Video thumbnail"
              className="w-full h-32 object-cover rounded-lg"
              onError={() => setThumbnailError(true)}
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

        {/* Fallback thumbnail with multiple quality attempts */}
        {thumbnailError && fallbackThumbnails.length > 0 && (
          <div className="relative mb-3">
            <img
              src={fallbackThumbnails[2]} // Try mqdefault.jpg as fallback
              alt="Video thumbnail (fallback)"
              className="w-full h-32 object-cover rounded-lg"
              onError={() => {
                // If fallback also fails, show generic placeholder
                setThumbnailError(true);
              }}
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

        {/* Generic YouTube placeholder if no thumbnails work */}
        {(!thumbnail || thumbnailError) && fallbackThumbnails.length === 0 && (
          <div className="relative mb-3">
            <div className="w-full h-32 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-16 h-16 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </div>
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

  const renderMusicEmbed = () => {
    const isSpotify = url.includes("spotify.com");
    const musicData = urlInfo.metadata;

    // For Spotify tracks, we can show enhanced metadata when available
    if (isSpotify && musicData?.type === "track") {
      return (
        <div className="flex flex-col">
          {/* Spotify track with enhanced design */}
          <div className="relative mb-3">
            <div className="w-full h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
              {/* Spotify logo as placeholder */}
              <svg
                className="w-16 h-16 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.6-1.079.6-.45 0-.9-.15-1.2-.45l-4.5-4.5-4.5 4.5c-.3.3-.75.45-1.2.45-.42 0-.84-.24-1.08-.6-.24-.36-.24-.84 0-1.2l4.5-4.5-4.5-4.5c-.24-.36-.24-.84 0-1.2.24-.36.66-.6 1.08-.6.45 0 .9.15 1.2.45l4.5 4.5 4.5-4.5c.3-.3.75-.45 1.2-.45.42 0 .84.24 1.08.6.24.36.24.84 0 1.2l-4.5 4.5 4.5 4.5c.24.36.24.84 0 1.2z" />
              </svg>
            </div>
            {/* Play button overlay */}
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

          {/* Track information */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0C5.4 0 0 5.4 0 12s5.5 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.6-1.079.6-.45 0-.9-.15-1.2-.45l-4.5-4.5-4.5 4.5c-.3.3-.75.45-1.2.45-.42 0-.84-.24-1.08-.6-.24-.36-.24-.84 0-1.2l4.5-4.5-4.5-4.5c-.24-.36-.24-.84 0-1.2.24-.36.66-.6 1.08-.6.45 0 .9.15 1.2.45l4.5 4.5 4.5-4.5c.3-.3.75-.45 1.2-.45.42 0 .84.24 1.08.6.24.36.24.84 0 1.2l-4.5 4.5 4.5 4.5c.24.36.24.84 0 1.2z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={`font-semibold text-sm truncate ${
                  isDarkTheme ? "text-white" : "text-gray-900"
                }`}
              >
                Spotify Track
              </p>
              <p
                className={`text-xs ${
                  isDarkTheme ? "text-white/70" : "text-gray-600"
                }`}
              >
                {musicData.trackId
                  ? `Track ID: ${musicData.trackId}`
                  : "Music on Spotify"}
              </p>
              <p
                className={`text-xs ${
                  isDarkTheme ? "text-white/50" : "text-gray-500"
                }`}
              >
                Click to open in Spotify
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Generic music embed for other music services
    return (
      <div className="flex flex-col">
        {/* Music thumbnail/cover */}
        <div className="relative mb-3">
          <div className="w-full h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-16 h-16 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.6-1.079.6-.45 0-.9-.15-1.2-.45l-4.5-4.5-4.5 4.5c-.3.3-.75.45-1.2.45-.42 0-.84-.24-1.08-.6-.24-.36-.24-.84 0-1.2l4.5-4.5-4.5-4.5c-.24-.36-.24-.84 0-1.2.24-.36.66-.6 1.08-.6.45 0 .9.15 1.2.45l4.5 4.5 4.5-4.5c.3-.3.75-.45 1.2-.45.42 0 .84.24 1.08.6.24.36.24.84 0 1.2l-4.5 4.5 4.5-4.5c.24.36.24.84 0 1.2z" />
            </svg>
          </div>
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

        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
            {isSpotify ? (
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.6-1.079.6-.45 0-.9-.15-1.2-.45l-4.5-4.5-4.5 4.5c-.3.3-.75.45-1.2.45-.42 0-.84-.24-1.08-.6-.24-.36-.24-.84 0-1.2l4.5-4.5-4.5-4.5c-.24-.36-.24-.84 0-1.2.24-.36.66-.6 1.08-.6.45 0 .9.15 1.2.45l4.5 4.5 4.5-4.5c.3-.3.75-.45 1.2-.45.42 0 .84.24 1.08.6.24.36.24.84 0 1.2l-4.5 4.5 4.5 4.5c.24.36.24.84 0 1.2z" />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={`font-medium text-sm truncate ${
                isDarkTheme ? "text-white" : "text-gray-900"
              }`}
            >
              {musicData?.title || "Music Track"}
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
      {urlInfo.type === "youtube"
        ? renderYouTubeEmbed()
        : urlInfo.type === "music"
        ? renderMusicEmbed()
        : renderGenericEmbed()}
    </button>
  );
}

export default EmbedDisplay;
