import React, { useState, useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

interface FocusTutorialProps {
  isDarkTheme: boolean;
  themeMode?: "dark" | "light" | "Farcaster";
  onComplete: () => void;
}

export function FocusTutorial({
  isDarkTheme,
  themeMode = "Farcaster",
  onComplete,
}: FocusTutorialProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Start the animation after a short delay and loop infinitely
  useEffect(() => {
    const startAnimation = () => {
      setIsAnimating(true);
    };

    const resetAnimation = () => {
      setIsAnimating(false);
    };

    // Initial delay
    const initialTimer = setTimeout(startAnimation, 1000);

    // Set up infinite loop
    const loopTimer = setInterval(() => {
      resetAnimation();
      setTimeout(startAnimation, 1500); // Small delay before next animation
    }, 3000); // Total cycle time

    return () => {
      clearTimeout(initialTimer);
      clearInterval(loopTimer);
    };
  }, []);

  const handleConfirm = () => {
    try {
      sdk.haptics?.impactOccurred?.("light");
    } catch (error) {
      // Haptic not available, continue anyway
    }
    setShowConfirmation(true);

    // Store that user has seen the tutorial
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "farcaster-widget-focus-tutorial-completed",
          "true"
        );
      } catch {
        // Ignore storage errors
      }
    }

    // Complete after a short delay
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  const getThemeStyles = () => {
    switch (themeMode) {
      case "dark":
        return {
          background:
            "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900",
          card: "bg-gradient-to-br from-white/15 to-white/10 backdrop-blur-lg",
          text: "text-white",
          textMuted: "text-white/60",
          border: "border-white/20",
          button: "bg-white/20 hover:bg-white/30 text-white",
        };
      case "light":
        return {
          background: "bg-gradient-to-br from-gray-50 via-white to-gray-100",
          card: "bg-white shadow-lg",
          text: "text-gray-900",
          textMuted: "text-gray-600",
          border: "border-gray-200",
          button: "bg-gray-800/20 hover:bg-gray-800/30 text-gray-900",
        };
      case "Farcaster":
      default:
        return {
          background:
            "bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500",
          card: "bg-gradient-to-br from-white/15 to-white/10 backdrop-blur-lg",
          text: "text-white",
          textMuted: "text-white/80",
          border: "border-white/20",
          button: "bg-white/20 hover:bg-white/30 text-white",
        };
    }
  };

  const styles = getThemeStyles();

  return (
    <div
      className={`min-h-[calc(100vh-200px)] flex flex-col items-center justify-center p-6 ${styles.background}`}
    >
      <div className="max-w-md w-full">
        {/* Tutorial Header */}
        <div className="text-center mb-8">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              themeMode === "light" ? "bg-gray-100" : "bg-white/10"
            }`}
          >
            <svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6m0 6v6" />
              <path d="M3.6 3.6l4.2 4.2m8.4 8.4 4.2 4.2" />
              <path d="M1 12h6m6 0h6" />
              <path d="M3.6 20.4l4.2-4.2m8.4-8.4 4.2-4.2" />
            </svg>
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${styles.text}`}>
            Welcome to Focus
          </h2>
          <p className={`${styles.textMuted}`}>
            Learn how to mark conversations as read for easy reference
          </p>
        </div>

        {/* Animated Example Card */}
        <div className="relative mb-8">
          <div
            className={`relative rounded-2xl p-6 ${styles.card} border ${
              styles.border
            } transition-all duration-1000 ${
              isAnimating ? "transform translate-x-20" : ""
            }`}
          >
            {/* Mock conversation content */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-full ${
                  themeMode === "light" ? "bg-gray-200" : "bg-white/20"
                }`}
              ></div>
              <div>
                <div className={`font-semibold ${styles.text}`}>
                  @example_user
                </div>
                <div className={`text-sm ${styles.textMuted}`}>2 hours ago</div>
              </div>
            </div>
            <p className={`${styles.textMuted} text-sm`}>
              &ldquo;This is an example conversation that you can mark as read
              by swiping right...&rdquo;
            </p>
          </div>

          {/* Swipe indicator */}
          <div
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-1000 ${
              isAnimating ? "opacity-0" : "opacity-100"
            }`}
          >
            <div className="flex items-center gap-2 text-sm text-green-500">
              <svg
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
              <span>Swipe right to mark as read</span>
            </div>
          </div>

          {/* Success indicator */}
          <div
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-all duration-500 ${
              isAnimating ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex items-center gap-2 text-sm text-green-500">
              <svg
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span>Marked as read!</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className={`text-center mb-6 ${styles.textMuted}`}>
          <p className="mb-2">
            <strong className={styles.text}>Swipe right</strong> on any
            conversation to mark it as read
          </p>
          <p className="text-sm">
            Marked conversations will here for easy reference
          </p>
        </div>

        {/* Confirmation Button */}
        <div className="text-center">
          <button
            onClick={handleConfirm}
            disabled={showConfirmation}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              showConfirmation ? "opacity-50 cursor-not-allowed" : styles.button
            }`}
          >
            {showConfirmation ? "Got it!" : "I understand"}
          </button>
        </div>
      </div>
    </div>
  );
}
