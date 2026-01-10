import React from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useAppAnalytics } from "../hooks/useAnalytics";
import type { ThemeMode } from "@/types/types";

export type TabType = "inbox" | "focus" | "analytics";

interface TabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isDarkTheme: boolean;
  themeMode: ThemeMode;
}

const tabs = [
  {
    id: "inbox" as TabType,
    label: "Inbox",
    icon: (
      <svg
        width={18}
        height={18}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 4H2v16h20V4zM2 8h20" />
        <path d="M6 14h.01" />
        <path d="M10 14h.01" />
        <path d="M14 14h.01" />
        <path d="M18 14h.01" />
      </svg>
    ),
  },
  {
    id: "focus" as TabType,
    label: "Focus",
    icon: (
      <svg
        width={18}
        height={18}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v6m0 6v6" />
        <path d="M3.6 3.6l4.2 4.2m8.4 8.4 4.2 4.2" />
        <path d="M1 12h6m6 0h6" />
        <path d="M3.6 20.4l4.2-4.2m8.4-8.4 4.2-4.2" />
      </svg>
    ),
  },
  {
    id: "analytics" as TabType,
    label: "Analytics",
    icon: (
      <svg
        width={18}
        height={18}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3v18h18" />
        <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
      </svg>
    ),
  },
];

export function TabBar({
  activeTab,
  onTabChange,
  isDarkTheme,
  themeMode,
}: TabBarProps) {
  const { trackTabChanged } = useAppAnalytics();

  const handleTabChange = (tab: TabType) => {
    // Track tab change
    trackTabChanged(tab, {
      previousTab: activeTab,
      theme: themeMode,
    });

    // Trigger haptic feedback
    sdk.haptics?.impactOccurred?.("light");

    // Call the original onTabChange
    onTabChange(tab);
  };

  const getBackgroundColor = () => {
    switch (themeMode) {
      case "Farcaster":
        return "bg-purple-900";
      case "light":
        return "bg-white";
      default:
        return "bg-gray-900";
    }
  };

  const getBorderColor = () => {
    switch (themeMode) {
      case "Farcaster":
        return "border-purple-700/50";
      case "light":
        return "border-gray-200";
      default:
        return "border-gray-700/50";
    }
  };

  const getActiveTextColor = () => {
    switch (themeMode) {
      case "light":
        return "text-gray-900";
      case "Farcaster":
        return "text-white";
      default:
        return "text-white";
    }
  };

  const getInactiveTextColor = () => {
    switch (themeMode) {
      case "light":
        return "text-gray-500";
      case "Farcaster":
        return "text-gray-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div
      className={`sticky bottom-0 z-50 border-t ${getBackgroundColor()} ${getBorderColor()}`}
    >
      <div className="flex items-center justify-around py-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const textColor = isActive ? getActiveTextColor() : getInactiveTextColor();
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`flex flex-col items-center justify-center w-full py-2 min-h-[56px] rounded-md transition-colors duration-150 ${
                isActive
                  ? ""
                  : isDarkTheme
                  ? "hover:bg-gray-800/50"
                  : "hover:bg-gray-50"
              }`}
              aria-label={tab.label}
            >
              <div className={`mb-1 ${textColor}`}>
                {tab.icon}
              </div>
              <span
                className={`text-xs font-medium ${textColor}`}
              >
                {tab.label}
              </span>
              {isActive && (
                <div
                  className={`w-1 h-1 rounded-full mt-1 ${
                    isDarkTheme ? "bg-white" : "bg-gray-900"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
