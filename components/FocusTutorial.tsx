import React, { useState, useEffect } from "react";
import { Button } from "./Button";
import { useAppAnalytics, ANALYTICS_ACTIONS } from "../hooks/useAnalytics";

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
  const { trackTutorialCompleted } = useAppAnalytics();
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
    setShowConfirmation(true);

    // Track tutorial completion
    trackTutorialCompleted(ANALYTICS_ACTIONS.TUTORIAL.FOCUS_TUTORIAL, {
      theme: themeMode,
    });

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
          mainCard:
            "bg-gradient-to-br from-white/15 to-white/10 backdrop-blur-lg shadow-xl ring-1 ring-white/10",
          exampleCard:
            "bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg",
          text: "text-white",
          textMuted: "text-white/60",
          border: "border-white/20",
          iconBg: "bg-white/10",
        };
      case "light":
        return {
          mainCard: "bg-white shadow-xl ring-1 ring-gray-200",
          exampleCard: "bg-gray-50 shadow-lg",
          text: "text-gray-900",
          textMuted: "text-gray-600",
          border: "border-gray-200",
          iconBg: "bg-gray-100",
        };
      case "Farcaster":
      default:
        return {
          mainCard:
            "bg-gradient-to-br from-white/15 to-white/10 backdrop-blur-lg shadow-xl ring-1 ring-white/10",
          exampleCard:
            "bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg",
          text: "text-white",
          textMuted: "text-white/80",
          border: "border-white/20",
          iconBg: "bg-white/10",
        };
    }
  };

  const styles = getThemeStyles();

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center p-6">
      <div className={`max-w-md w-full rounded-2xl p-8 ${styles.mainCard}`}>
        {/* Tutorial Header */}
        <div className="text-center mb-8">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${styles.iconBg}`}
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
            className={`relative rounded-2xl p-6 ${styles.exampleCard} border ${
              styles.border
            } transition-all duration-1000 ${
              isAnimating ? "transform translate-x-20" : ""
            }`}
          >
            {/* Mock conversation content */}
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full ${styles.iconBg}`}></div>
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
        </div>

        {/* Instructions */}
        <div className={`text-center mb-6 ${styles.textMuted}`}>
          <p className="mb-2">
            <strong className={styles.text}>Swipe right</strong> on any
            conversation to mark it as read
          </p>
          <p className="text-sm">
            Marked conversations will show up here for easy reference
          </p>
        </div>

        {/* Confirmation Button */}
        <div className="text-center">
          <Button
            onClick={handleConfirm}
            disabled={showConfirmation}
            themeMode={themeMode}
            hapticFeedback="light"
          >
            {showConfirmation ? "Got it!" : "I understand"}
          </Button>
        </div>
      </div>
    </div>
  );
}
