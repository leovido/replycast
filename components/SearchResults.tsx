import React from "react";
import type { ThemeMode } from "@/types/types";

interface SearchResultsProps {
  isSearching: boolean;
  totalFound: number;
  totalOriginal: number;
  searchQuery: string;
  isDarkTheme: boolean;
  themeMode: ThemeMode;
  onClearSearch: () => void;
}

export function SearchResults({
  isSearching,
  totalFound,
  totalOriginal,
  searchQuery,
  isDarkTheme,
  themeMode,
  onClearSearch,
}: SearchResultsProps) {
  if (!isSearching) return null;

  const getContainerClass = () => {
    const baseClass = "flex items-center justify-between p-3 rounded-xl mb-4";
    const themeClass = isDarkTheme
      ? "bg-white/10 backdrop-blur-md border border-white/20"
      : "bg-white/80 backdrop-blur-md border border-gray-200";

    return `${baseClass} ${themeClass}`;
  };

  const getTextClass = () => {
    return isDarkTheme ? "text-white" : "text-gray-900";
  };

  const getSubtextClass = () => {
    return isDarkTheme ? "text-white/60" : "text-gray-600";
  };

  const getAccentClass = () => {
    switch (themeMode) {
      case "light":
        return "text-blue-600";
      case "neon":
        return "text-pink-400";
      case "Farcaster":
        return "text-purple-300";
      default:
        return "text-blue-400";
    }
  };

  const getButtonClass = () => {
    const baseClass =
      "px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95";
    const themeClass = isDarkTheme
      ? "bg-white/20 hover:bg-white/30 text-white"
      : "bg-gray-100 hover:bg-gray-200 text-gray-700";

    return `${baseClass} ${themeClass}`;
  };

  return (
    <div className={getContainerClass()}>
      <div className="flex items-center gap-3">
        {/* Search Icon */}
        <div className="flex-shrink-0">
          <svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className={getAccentClass()}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>

        {/* Search Info */}
        <div className="flex-1 min-w-0">
          <div className={`font-medium ${getTextClass()}`}>Search Results</div>
          <div className={`text-sm ${getSubtextClass()}`}>
            Found{" "}
            <span className={`font-semibold ${getAccentClass()}`}>
              {totalFound}
            </span>{" "}
            of <span className="font-semibold">{totalOriginal}</span>{" "}
            conversations
          </div>
          <div className={`text-xs ${getSubtextClass()} mt-1`}>
            Searching for:{" "}
            <span className="font-mono">&ldquo;{searchQuery}&rdquo;</span>
          </div>
        </div>

        {/* Clear Button */}
        <button
          onClick={onClearSearch}
          className={getButtonClass()}
          aria-label="Clear search"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
