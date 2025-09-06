import { useEffect, useState } from "react";
import type { ThemeMode } from "../types/types";

export interface ToastNotificationProps {
  message: string;
  type: "success" | "error" | "info";
  isVisible: boolean;
  onHide: () => void;
  duration?: number;
  themeMode?: ThemeMode;
}

export function ToastNotification({
  message,
  type,
  isVisible,
  onHide,
  duration = 3000,
  themeMode = "Farcaster",
}: ToastNotificationProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onHide, 300); // Wait for slide-up animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onHide]);

  const getThemeStyles = () => {
    switch (themeMode) {
      case "dark":
        return {
          container:
            "bg-gradient-to-br from-white/15 to-white/10 backdrop-blur-lg shadow-xl ring-1 ring-white/10",
          text: "text-white",
          icon: {
            success: "text-green-400",
            error: "text-red-400",
            info: "text-blue-400",
          },
        };
      case "light":
        return {
          container: "bg-white shadow-xl ring-1 ring-gray-200",
          text: "text-gray-900",
          icon: {
            success: "text-green-600",
            error: "text-red-600",
            info: "text-blue-600",
          },
        };
      case "neon":
        return {
          container:
            "bg-gradient-to-br from-pink-500/20 to-cyan-500/20 backdrop-blur-lg shadow-xl ring-1 ring-pink-500/30 shadow-lg shadow-pink-500/25",
          text: "text-pink-400",
          icon: {
            success: "text-green-400",
            error: "text-red-400",
            info: "text-cyan-400",
          },
        };
      case "Farcaster":
      default:
        return {
          container:
            "bg-gradient-to-br from-white/15 to-white/10 backdrop-blur-lg shadow-xl ring-1 ring-white/10",
          text: "text-white",
          icon: {
            success: "text-green-400",
            error: "text-red-400",
            info: "text-blue-400",
          },
        };
    }
  };

  const styles = getThemeStyles();

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className={styles.icon.success}
            data-testid="toast-icon"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        );
      case "error":
        return (
          <svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className={styles.icon.error}
            data-testid="toast-icon"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      case "info":
      default:
        return (
          <svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className={styles.icon.info}
            data-testid="toast-icon"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        );
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] transition-all duration-300 ease-out pointer-events-none ${
        isAnimating
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0"
      }`}
      style={{
        position: "fixed",
        top: "1rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
      }}
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${styles.container} max-w-sm`}
      >
        {getIcon()}
        <span className={`font-medium ${styles.text}`}>{message}</span>
      </div>
    </div>
  );
}
