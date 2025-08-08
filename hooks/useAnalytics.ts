import { useCallback } from "react";
import {
  trackEvent,
  trackError,
  trackPageView,
  setUser,
  setProperty,
  analytics,
} from "../utils/analytics";

// Analytics event types for type safety
export type AnalyticsEventType =
  | "app_opened"
  | "tab_changed"
  | "swipe_action"
  | "cast_viewed"
  | "mark_as_read"
  | "discard_cast"
  | "refresh_data"
  | "theme_changed"
  | "settings_opened"
  | "add_to_farcaster"
  | "tutorial_completed"
  | "error_occurred"
  | "api_call_failed"
  | "performance_issue";

// Analytics hook for easy usage in components
export function useAnalytics() {
  const track = useCallback(
    (eventName: AnalyticsEventType, properties?: Record<string, any>) => {
      trackEvent(eventName, properties);
    },
    []
  );

  const trackErrorEvent = useCallback(
    (error: Error, context?: Record<string, any>) => {
      trackError(error, context);
    },
    []
  );

  const trackPage = useCallback(
    (pageName: string, properties?: Record<string, any>) => {
      trackPageView(pageName, properties);
    },
    []
  );

  const identifyUser = useCallback(
    (userId: string, properties?: Record<string, any>) => {
      setUser(userId, properties);
    },
    []
  );

  const setAnalyticsProperty = useCallback((key: string, value: any) => {
    setProperty(key, value);
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    analytics.setEnabled(enabled);
  }, []);

  return {
    track,
    trackError: trackErrorEvent,
    trackPage,
    identifyUser,
    setProperty: setAnalyticsProperty,
    setEnabled,
  };
}

// Specific analytics functions for common events
export const useAppAnalytics = () => {
  const { track, trackError, identifyUser } = useAnalytics();

  const trackAppOpened = useCallback(
    (context?: Record<string, any>) => {
      track("app_opened", context);
    },
    [track]
  );

  const trackTabChanged = useCallback(
    (tabName: string, context?: Record<string, any>) => {
      track("tab_changed", { tabName, ...context });
    },
    [track]
  );

  const trackSwipeAction = useCallback(
    (action: "mark_as_read" | "discard", context?: Record<string, any>) => {
      track("swipe_action", { action, ...context });
    },
    [track]
  );

  const trackCastViewed = useCallback(
    (castHash: string, context?: Record<string, any>) => {
      track("cast_viewed", { castHash, ...context });
    },
    [track]
  );

  const trackMarkAsRead = useCallback(
    (castHash: string, context?: Record<string, any>) => {
      track("mark_as_read", { castHash, ...context });
    },
    [track]
  );

  const trackDiscardCast = useCallback(
    (castHash: string, context?: Record<string, any>) => {
      track("discard_cast", { castHash, ...context });
    },
    [track]
  );

  const trackRefreshData = useCallback(
    (context?: Record<string, any>) => {
      track("refresh_data", context);
    },
    [track]
  );

  const trackThemeChanged = useCallback(
    (theme: string, context?: Record<string, any>) => {
      track("theme_changed", { theme, ...context });
    },
    [track]
  );

  const trackSettingsOpened = useCallback(
    (context?: Record<string, any>) => {
      track("settings_opened", context);
    },
    [track]
  );

  const trackAddToFarcaster = useCallback(
    (success: boolean, context?: Record<string, any>) => {
      track("add_to_farcaster", { success, ...context });
    },
    [track]
  );

  const trackTutorialCompleted = useCallback(
    (tutorialName: string, context?: Record<string, any>) => {
      track("tutorial_completed", { tutorialName, ...context });
    },
    [track]
  );

  const trackAppError = useCallback(
    (error: Error, context?: Record<string, any>) => {
      trackError(error, context);
    },
    [trackError]
  );

  const trackApiError = useCallback(
    (endpoint: string, error: Error, context?: Record<string, any>) => {
      track("api_call_failed", {
        endpoint,
        errorMessage: error.message,
        ...context,
      });
      trackError(error, { endpoint, ...context });
    },
    [track, trackError]
  );

  const trackPerformanceIssue = useCallback(
    (issue: string, context?: Record<string, any>) => {
      track("performance_issue", { issue, ...context });
    },
    [track]
  );

  return {
    trackAppOpened,
    trackTabChanged,
    trackSwipeAction,
    trackCastViewed,
    trackMarkAsRead,
    trackDiscardCast,
    trackRefreshData,
    trackThemeChanged,
    trackSettingsOpened,
    trackAddToFarcaster,
    trackTutorialCompleted,
    trackAppError,
    trackApiError,
    trackPerformanceIssue,
  };
};
