import React from "react";
import { sdk } from "@farcaster/miniapp-sdk";

export type TabType = "inbox" | "focus" | "analytics";

interface TabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isDarkTheme: boolean;
  themeMode: "dark" | "light" | "Farcaster";
}

const tabs = [
  {
    id: "inbox" as TabType,
    label: "Inbox",
    icon: (
      <svg
        width={20}
        height={20}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
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
        width={20}
        height={20}
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
    ),
  },
  {
    id: "analytics" as TabType,
    label: "Analytics",
    icon: (
      <svg
        width={20}
        height={20}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
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
  const getBackgroundClass = () => {
    switch (themeMode) {
      case "dark":
        return "bg-gray-900/95 backdrop-blur-md border-gray-800";
      case "light":
        return "bg-white/95 backdrop-blur-md border-gray-200";
      case "Farcaster":
        return "bg-purple-900/95 backdrop-blur-md border-purple-800/50";
      default:
        return "bg-gray-900/95 backdrop-blur-md border-gray-800";
    }
  };

  const getTextColor = (isActive: boolean) => {
    if (isActive) {
      switch (themeMode) {
        case "light":
          return "text-blue-600";
        case "Farcaster":
          return "text-purple-300";
        default:
          return "text-blue-400";
      }
    } else {
      switch (themeMode) {
        case "light":
          return "text-gray-500";
        case "Farcaster":
          return "text-white/60";
        default:
          return "text-gray-400";
      }
    }
  };

  const getBorderColor = () => {
    switch (themeMode) {
      case "light":
        return "border-gray-200";
      case "Farcaster":
        return "border-purple-800/50";
      default:
        return "border-gray-800";
    }
  };

  return (
    <div
      className={`sticky bottom-0 z-50 ${getBackgroundClass()} border-t ${getBorderColor()}`}
    >
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sdk.haptics?.impactOccurred?.("light");
                onTabChange(tab.id);
              }}
              className={`flex flex-col items-center justify-center w-full py-2 rounded-lg transition-all duration-200 ${
                isActive ? "scale-105" : "hover:scale-102 hover:bg-white/5"
              }`}
              aria-label={tab.label}
            >
              <div
                className={`mb-1 transition-all duration-200 ${getTextColor(
                  isActive
                )}`}
              >
                {tab.icon}
              </div>
              <span
                className={`text-xs font-medium transition-all duration-200 ${getTextColor(
                  isActive
                )}`}
              >
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-current mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
