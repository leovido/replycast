import React from "react";
import { sdk } from "@farcaster/miniapp-sdk";

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  themeMode: "dark" | "light" | "Farcaster";
  onThemeChange: (theme: "dark" | "light" | "Farcaster") => void;
  viewMode: "list" | "grid";
  onViewModeChange: (mode: "list" | "grid") => void;
  sortOption: string;
  onSortChange: (option: string) => void;
  dayFilter: string;
  onDayFilterChange: (filter: string) => void;
  isDarkTheme: boolean;
}

export function SettingsMenu({
  isOpen,
  onClose,
  themeMode,
  onThemeChange,
  viewMode,
  onViewModeChange,
  sortOption,
  onSortChange,
  dayFilter,
  onDayFilterChange,
  isDarkTheme,
}: SettingsMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center pt-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Menu */}
      <div
        className={`relative w-full max-w-md rounded-2xl p-6 shadow-2xl ${
          isDarkTheme
            ? "bg-gradient-to-br from-gray-800/95 to-gray-900/95 border border-white/20"
            : "bg-white/95 border border-gray-200"
        } backdrop-blur-md transform transition-all duration-300 ease-out max-h-[90vh] overflow-y-auto`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className={`text-xl font-bold ${
              isDarkTheme ? "text-white" : "text-gray-900"
            }`}
          >
            Settings
          </h2>
          <button
            onClick={() => {
              sdk.haptics?.impactOccurred?.("light");
              onClose();
            }}
            className={`p-2 rounded-full hover:bg-white/10 transition-colors ${
              isDarkTheme ? "text-white/70" : "text-gray-600"
            }`}
          >
            <svg
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Theme Section */}
        <div className="mb-6">
          <h3
            className={`text-sm font-semibold mb-3 ${
              isDarkTheme ? "text-white/80" : "text-gray-700"
            }`}
          >
            Theme
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {(["Farcaster", "dark", "light"] as const).map((theme) => (
              <button
                key={theme}
                onClick={() => {
                  sdk.haptics?.impactOccurred?.("light");
                  onThemeChange(theme);
                }}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  themeMode === theme
                    ? isDarkTheme
                      ? "bg-white/20 ring-2 ring-white/40"
                      : "bg-gray-200 ring-2 ring-gray-400"
                    : isDarkTheme
                    ? "bg-white/10 hover:bg-white/15"
                    : "bg-gray-100 hover:bg-gray-150"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="text-lg">
                    {theme === "dark" ? "🌙" : theme === "light" ? "☀️" : "💎"}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      themeMode === theme
                        ? isDarkTheme
                          ? "text-white"
                          : "text-gray-900"
                        : isDarkTheme
                        ? "text-white/60"
                        : "text-gray-600"
                    }`}
                  >
                    {theme === "Farcaster" ? "Farcaster" : theme}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Section - Hidden on Mobile */}
        <div className="mb-6 hidden md:block">
          <h3
            className={`text-sm font-semibold mb-3 ${
              isDarkTheme ? "text-white/80" : "text-gray-700"
            }`}
          >
            View Mode
          </h3>
          <div className="flex gap-2">
            {(["list", "grid"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  sdk.haptics?.impactOccurred?.("light");
                  onViewModeChange(mode);
                }}
                className={`flex-1 p-3 rounded-xl transition-all ${
                  viewMode === mode
                    ? isDarkTheme
                      ? "bg-white/20 ring-2 ring-white/40"
                      : "bg-gray-200 ring-2 ring-gray-400"
                    : isDarkTheme
                    ? "bg-white/10 hover:bg-white/15"
                    : "bg-gray-100 hover:bg-gray-150"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="text-lg">{mode === "list" ? "📋" : "📊"}</div>
                  <span
                    className={`text-xs font-medium capitalize ${
                      viewMode === mode
                        ? isDarkTheme
                          ? "text-white"
                          : "text-gray-900"
                        : isDarkTheme
                        ? "text-white/60"
                        : "text-gray-600"
                    }`}
                  >
                    {mode}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="mb-6">
          <h3
            className={`text-sm font-semibold mb-3 ${
              isDarkTheme ? "text-white/80" : "text-gray-700"
            }`}
          >
            Sort By
          </h3>
          <select
            value={sortOption}
            onChange={(e) => {
              sdk.haptics?.impactOccurred?.("light");
              onSortChange(e.target.value);
            }}
            className={`w-full p-3 rounded-xl border transition-all ${
              isDarkTheme
                ? "bg-white/10 border-white/20 text-white focus:ring-white/40"
                : "bg-white border-gray-200 text-gray-900 focus:ring-gray-400"
            } focus:outline-none focus:ring-2`}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="fid-asc">FID (Low to High)</option>
            <option value="fid-desc">FID (High to Low)</option>
            <option value="openrank-asc">OpenRank (Low to High)</option>
            <option value="openrank-desc">OpenRank (High to Low)</option>
          </select>
        </div>

        {/* Day Filter */}
        <div className="mb-6">
          <h3
            className={`text-sm font-semibold mb-3 ${
              isDarkTheme ? "text-white/80" : "text-gray-700"
            }`}
          >
            Time Filter
          </h3>
          <select
            value={dayFilter}
            onChange={(e) => {
              sdk.haptics?.impactOccurred?.("light");
              onDayFilterChange(e.target.value);
            }}
            className={`w-full p-3 rounded-xl border transition-all ${
              isDarkTheme
                ? "bg-white/10 border-white/20 text-white focus:ring-white/40"
                : "bg-white border-gray-200 text-gray-900 focus:ring-gray-400"
            } focus:outline-none focus:ring-2`}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="3days">Last 3 Days</option>
            <option value="7days">Last 7 Days</option>
          </select>
        </div>
      </div>
    </div>
  );
}
