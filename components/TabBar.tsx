import React from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useAppAnalytics } from "../hooks/useAnalytics";
import {
  getBackgroundClass,
  getBorderColor,
  getTextColor,
} from "@/utils/themeHelpers";
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

  return (
    <nav
      className={`sticky bottom-0 z-50 ${getBackgroundClass(
        themeMode
      )} border-t ${getBorderColor(themeMode)}`}
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around py-2" role="tablist">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex flex-col items-center justify-center w-full py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isActive ? "scale-105" : "hover:scale-102 hover:bg-white/5"
              }`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab.id}-panel`}
              id={`${tab.id}-tab`}
              aria-label={`${tab.label} tab`}
              title={`Switch to ${tab.label} tab`}
              type="button"
            >
              <div
                className={`mb-1 transition-all duration-200 ${getTextColor(
                  themeMode,
                  isActive
                )}`}
              >
                {tab.icon}
              </div>
              <span
                className={`text-xs font-medium transition-all duration-200 ${getTextColor(
                  themeMode,
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
    </nav>
  );
}
