import React, { useState, useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useAppAnalytics } from "../hooks/useAnalytics";
import { privacyManager, type PrivacyConfig } from "../utils/privacy";
import type { ThemeMode } from "../types/types";

interface AddToFarcasterButtonProps {
  isDarkTheme: boolean;
}

function AddToFarcasterButton({ isDarkTheme }: AddToFarcasterButtonProps) {
  const { trackAddToFarcaster } = useAppAnalytics();
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [showMessage, setShowMessage] = useState<string | null>(null);

  // Check if already added on mount
  React.useEffect(() => {
    const checkIfAdded = async () => {
      try {
        const context = await sdk.context;
        setIsAdded(context.client.added);
      } catch (error) {
        console.error("Failed to get context:", error);
      }
    };
    checkIfAdded();
  }, []);

  const handleAddMiniApp = async () => {
    try {
      setIsLoading(true);
      await sdk.actions.addMiniApp();
      setIsAdded(true);
      setShowMessage("✅ Added to Farcaster!");

      // Track successful add
      trackAddToFarcaster(true, {
        theme: isDarkTheme ? "dark" : "light",
      });

      // Hide success message after 3 seconds
      setTimeout(() => setShowMessage(null), 3000);
    } catch (error: any) {
      console.error("Failed to add Mini App:", error);

      // Track failed add
      trackAddToFarcaster(false, {
        error: error?.name || "unknown",
        theme: isDarkTheme ? "dark" : "light",
      });

      if (error?.name === "RejectedByUser") {
        setShowMessage("❌ Cancelled by user");
      } else {
        setShowMessage("❌ Failed to add");
      }

      // Hide error message after 3 seconds
      setTimeout(() => setShowMessage(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {isAdded ? (
        <div
          className={`p-4 rounded-xl border-2 border-dashed ${
            isDarkTheme
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-green-50 border-green-200 text-green-700"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">✅</span>
            <div>
              <div className="font-medium">Added to Farcaster</div>
              <div className="text-sm opacity-70">
                ReplyCast is in your Mini Apps collection
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={handleAddMiniApp}
          disabled={isLoading}
          className={`w-full p-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 ${
            isLoading
              ? isDarkTheme
                ? "bg-white/10 text-white/50 cursor-not-allowed"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
              : isDarkTheme
              ? "bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30"
              : "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              <span>Adding...</span>
            </>
          ) : (
            <>
              <span className="text-lg">📱</span>
              <span className="font-medium">Add to Farcaster</span>
            </>
          )}
        </button>
      )}

      {showMessage && (
        <div
          className={`p-3 rounded-lg text-sm ${
            showMessage.includes("✅")
              ? isDarkTheme
                ? "bg-green-500/20 text-green-400"
                : "bg-green-100 text-green-700"
              : isDarkTheme
              ? "bg-red-500/20 text-red-400"
              : "bg-red-100 text-red-700"
          }`}
        >
          {showMessage}
        </div>
      )}

      <div
        className={`text-xs ${isDarkTheme ? "text-white/50" : "text-gray-500"}`}
      >
        Get quick access to ReplyCast from your Farcaster client
      </div>
    </div>
  );
}

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  themeMode: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  viewMode: "list" | "grid";
  onViewModeChange: (mode: "list" | "grid") => void;
  sortOption: string;
  onSortChange: (option: string) => void;
  dayFilter: string;
  onDayFilterChange: (filter: string) => void;
  reputationType: "quotient" | "openrank";
  onReputationTypeChange: (type: "quotient" | "openrank") => void;
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
  reputationType,
  onReputationTypeChange,
  isDarkTheme,
}: SettingsMenuProps) {
  const [privacyConfig, setPrivacyConfig] = useState<PrivacyConfig>(
    privacyManager.getConfig()
  );

  useEffect(() => {
    setPrivacyConfig(privacyManager.getConfig());
  }, [isOpen]);

  const handlePrivacyChange = (key: keyof PrivacyConfig, value: boolean) => {
    const newConfig = { ...privacyConfig, [key]: value };
    setPrivacyConfig(newConfig);
    privacyManager.updateConfig({ [key]: value });
  };

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
          <div className="grid grid-cols-4 gap-2">
            {(["Farcaster", "dark", "light", "neon"] as const).map((theme) => (
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
                    {theme === "dark"
                      ? "🌙"
                      : theme === "light"
                      ? "☀️"
                      : theme === "neon"
                      ? "✨"
                      : "💎"}
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

        {/* Reputation Type Selection */}
        <div className="mb-6">
          <h3
            className={`text-sm font-semibold mb-3 ${
              isDarkTheme ? "text-white/80" : "text-gray-700"
            }`}
          >
            Reputation Type
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {(["quotient", "openrank"] as const).map((type) => (
              <button
                key={type}
                onClick={() => {
                  sdk.haptics?.impactOccurred?.("light");
                  onReputationTypeChange(type);
                }}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  reputationType === type
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
                    {type === "quotient" ? "💎" : "⭐"}
                  </div>
                  <span
                    className={`text-xs font-medium capitalize ${
                      reputationType === type
                        ? isDarkTheme
                          ? "text-white"
                          : "text-gray-900"
                        : isDarkTheme
                        ? "text-white/60"
                        : "text-gray-600"
                    }`}
                  >
                    {type === "quotient" ? "Quotient" : "OpenRank"}
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
            <option value="quotient-asc">Quotient (Low to High)</option>
            <option value="quotient-desc">Quotient (High to Low)</option>
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

        {/* Add to Farcaster Section */}
        <div className="mb-6">
          <h3
            className={`text-sm font-semibold mb-3 ${
              isDarkTheme ? "text-white/80" : "text-gray-700"
            }`}
          >
            Mini App
          </h3>
          <AddToFarcasterButton isDarkTheme={isDarkTheme} />
        </div>

        {/* Privacy Settings Section */}
        <div className="mb-6">
          <h3
            className={`text-sm font-semibold mb-3 ${
              isDarkTheme ? "text-white/80" : "text-gray-700"
            }`}
          >
            Privacy & Analytics
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span
                className={`text-sm ${
                  isDarkTheme ? "text-white/70" : "text-gray-600"
                }`}
              >
                Analytics
              </span>
              <button
                onClick={() =>
                  handlePrivacyChange(
                    "enableAnalytics",
                    !privacyConfig.enableAnalytics
                  )
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  privacyConfig.enableAnalytics
                    ? "bg-blue-500"
                    : isDarkTheme
                    ? "bg-white/20"
                    : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacyConfig.enableAnalytics
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span
                className={`text-sm ${
                  isDarkTheme ? "text-white/70" : "text-gray-600"
                }`}
              >
                Error Tracking
              </span>
              <button
                onClick={() =>
                  handlePrivacyChange(
                    "enableErrorTracking",
                    !privacyConfig.enableErrorTracking
                  )
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  privacyConfig.enableErrorTracking
                    ? "bg-blue-500"
                    : isDarkTheme
                    ? "bg-white/20"
                    : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacyConfig.enableErrorTracking
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span
                className={`text-sm ${
                  isDarkTheme ? "text-white/70" : "text-gray-600"
                }`}
              >
                Filter Sensitive Data
              </span>
              <button
                onClick={() =>
                  handlePrivacyChange(
                    "sensitiveFieldFiltering",
                    !privacyConfig.sensitiveFieldFiltering
                  )
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  privacyConfig.sensitiveFieldFiltering
                    ? "bg-blue-500"
                    : isDarkTheme
                    ? "bg-white/20"
                    : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacyConfig.sensitiveFieldFiltering
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div
            className={`mt-3 p-3 rounded-lg ${
              isDarkTheme ? "bg-white/5" : "bg-gray-50"
            }`}
          >
            <p
              className={`text-xs ${
                isDarkTheme ? "text-white/60" : "text-gray-500"
              }`}
            >
              🔒 ReplyCast uses privacy-focused analytics. No personal data is
              tracked or stored. All data is anonymous and automatically deleted
              after 30 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
