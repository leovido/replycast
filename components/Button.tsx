import React from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import type { ThemeMode } from "../types/types";

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  themeMode?: ThemeMode;
  className?: string;
  hapticFeedback?: "light" | "medium" | "heavy";
}

export function Button({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  size = "md",
  themeMode = "Farcaster",
  className = "",
  hapticFeedback = "light",
}: ButtonProps) {
  const handleClick = () => {
    if (disabled) return;

    try {
      sdk.haptics?.impactOccurred?.(hapticFeedback);
    } catch (error) {
      // Haptic not available, continue anyway
    }

    onClick();
  };

  const getThemeStyles = () => {
    switch (themeMode) {
      case "dark":
        return {
          primary: "bg-white/20 hover:bg-white/30 text-white border-white/20",
          secondary:
            "bg-white/10 hover:bg-white/20 text-white/80 border-white/10",
        };
      case "light":
        return {
          primary: "bg-gray-900 hover:bg-gray-800 text-white border-gray-300",
          secondary:
            "bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-200",
        };
      case "neon":
        return {
          primary:
            "bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 border-pink-500/40 shadow-lg shadow-pink-500/25",
          secondary:
            "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border-cyan-500/40 shadow-lg shadow-cyan-500/25",
        };
      case "Farcaster":
      default:
        return {
          primary: "bg-white/20 hover:bg-white/30 text-white border-white/20",
          secondary:
            "bg-white/10 hover:bg-white/20 text-white/80 border-white/10",
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "px-4 py-2 text-sm";
      case "lg":
        return "px-8 py-4 text-lg";
      case "md":
      default:
        return "px-6 py-3 text-base";
    }
  };

  const styles = getThemeStyles();
  const variantStyle = styles[variant];
  const sizeStyle = getSizeStyles();

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        ${sizeStyle}
        rounded-lg
        font-medium
        transition-all
        duration-200
        border
        ${variantStyle}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `
        .trim()
        .replace(/\s+/g, " ")}
    >
      {children}
    </button>
  );
}
