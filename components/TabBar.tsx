import React from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useAppAnalytics } from "../hooks/useAnalytics";
import {
  getBackgroundClass,
  getBorderColor,
  getTextColor,
} from "@/utils/themeHelpers";
import type { ThemeMode } from "@/types/types";

export type TabType = "inbox" | "focus" | "analytics" | "tips";

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
  {
    id: "tips" as TabType,
    label: "Tips",
    icon: (
      <svg
        width={20}
        height={20}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
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
    <div
      className={`sticky bottom-0 z-50 ${getBackgroundClass(
        themeMode
      )} ${getBorderColor(themeMode)} border-t`}
    >
      <div className="flex justify-around items-center h-16 px-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${getTextColor(
                themeMode,
                isActive
              )}`}
              aria-label={`Switch to ${tab.label} tab`}
            >
              <div
                className={`mb-1 transition-transform duration-200 ${
                  isActive ? "scale-110" : "scale-100"
                }`}
              >
                {tab.icon}
              </div>
              <span
                className={`text-xs font-medium transition-all duration-200 ${
                  isActive ? "opacity-100" : "opacity-70"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
