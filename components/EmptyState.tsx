import React from "react";
import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  themeMode?: "dark" | "light" | "Farcaster";
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  title,
  description,
  icon,
  themeMode = "Farcaster",
  action,
}: EmptyStateProps) {
  const getThemeStyles = () => {
    switch (themeMode) {
      case "dark":
        return {
          container: "bg-gradient-to-br from-white/5 to-white/0",
          text: "text-white",
          textMuted: "text-white/60",
          border: "border-white/10",
          iconBg: "bg-white/5",
        };
      case "light":
        return {
          container: "bg-gray-50/50",
          text: "text-gray-900",
          textMuted: "text-gray-600",
          border: "border-gray-200",
          iconBg: "bg-gray-100",
        };
      case "Farcaster":
      default:
        return {
          container: "bg-gradient-to-br from-white/5 to-white/0",
          text: "text-white",
          textMuted: "text-white/70",
          border: "border-white/10",
          iconBg: "bg-white/5",
        };
    }
  };

  const styles = getThemeStyles();

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div
        className={`text-center max-w-sm mx-auto p-8 rounded-2xl ${styles.container} border ${styles.border}`}
      >
        {icon && (
          <div
            className={`w-16 h-16 mx-auto mb-6 rounded-full ${styles.iconBg} flex items-center justify-center`}
          >
            {icon}
          </div>
        )}

        <h3 className={`text-xl font-semibold mb-3 ${styles.text}`}>{title}</h3>

        <p className={`text-sm leading-relaxed mb-6 ${styles.textMuted}`}>
          {description}
        </p>

        {action && (
          <Button
            onClick={action.onClick}
            themeMode={themeMode}
            hapticFeedback="medium"
          >
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
