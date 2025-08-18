import { memo } from "react";
import type { ThemeMode } from "../types/types";

interface LoadingScreenProps {
  themeMode?: ThemeMode;
}

// Helper function to get theme-aware styling
const getThemeStyles = (themeMode: ThemeMode = "Farcaster") => {
  switch (themeMode) {
    case "dark":
      return {
        background: "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900",
        text: "text-white",
        textMuted: "text-white/80",
        iconBg: "bg-white/20",
        iconBorder: "border-white/30",
        dots: "bg-white/60",
      };
    case "light":
      return {
        background: "bg-gradient-to-br from-gray-50 via-white to-gray-100",
        text: "text-gray-900",
        textMuted: "text-gray-600",
        iconBg: "bg-gray-800/20",
        iconBorder: "border-gray-800/30",
        dots: "bg-gray-600/60",
      };
    case "neon":
      return {
        background: "bg-gradient-to-br from-black via-gray-900 to-black",
        text: "text-pink-400",
        textMuted: "text-cyan-400/80",
        iconBg: "bg-pink-500/20",
        iconBorder: "border-pink-500/40",
        dots: "bg-cyan-400",
      };
    case "Farcaster":
    default:
      return {
        background:
          "bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500",
        text: "text-white",
        textMuted: "text-white/80",
        iconBg: "bg-white/20",
        iconBorder: "border-white/30",
        dots: "bg-white/60",
      };
  }
};

// Memoized Loading Screen Component
export const LoadingScreen = memo<LoadingScreenProps>(
  ({ themeMode = "Farcaster" }) => {
    const styles = getThemeStyles(themeMode);

    return (
      <div
        className={`min-h-screen ${styles.background} flex items-center justify-center`}
      >
        <div className="text-center">
          {/* Logo/Icon */}
          <div className="mb-8">
            <div
              className={`w-16 h-16 mx-auto ${styles.iconBg} rounded-2xl flex items-center justify-center backdrop-blur-sm border ${styles.iconBorder}`}
            >
              <svg
                width={32}
                height={32}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-center"
                aria-hidden="true"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
          </div>

          {/* App Title */}
          <h1
            className={`text-3xl font-black ${styles.text} mb-2 tracking-tight`}
            style={{ fontFamily: "Instrument Sans, Nunito, Inter, sans-serif" }}
          >
            ReplyCast
          </h1>
          <p className={`${styles.textMuted} text-lg font-medium mb-8`}>
            Loading your conversations...
          </p>

          {/* Loading Animation */}
          <div className="flex justify-center space-x-2">
            <div
              className={`w-3 h-3 ${styles.dots} rounded-full animate-bounce`}
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className={`w-3 h-3 ${styles.dots} rounded-full animate-bounce`}
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className={`w-3 h-3 ${styles.dots} rounded-full animate-bounce`}
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }
);

LoadingScreen.displayName = "LoadingScreen";
