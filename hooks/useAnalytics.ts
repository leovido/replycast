import { useCallback } from "react";
import {
  trackEvent,
  trackError,
  trackPageView,
  setUser,
  setProperty,
  analytics,
} from "../utils/analytics";

// Analytics event constants
export const ANALYTICS_EVENTS = {
  APP_OPENED: "app_opened",
  TAB_CHANGED: "tab_changed",
  SWIPE_ACTION: "swipe_action",
  CAST_VIEWED: "cast_viewed",
  MARK_AS_READ: "mark_as_read",
  DISCARD_CAST: "discard_cast",
  REFRESH_DATA: "refresh_data",
  THEME_CHANGED: "theme_changed",
  SETTINGS_OPENED: "settings_opened",
  ADD_TO_FARCASTER: "add_to_farcaster",
  TUTORIAL_COMPLETED: "tutorial_completed",
  ERROR_OCCURRED: "error_occurred",
  API_CALL_FAILED: "api_call_failed",
  PERFORMANCE_ISSUE: "performance_issue",
} as const;

// Analytics action constants
export const ANALYTICS_ACTIONS = {
  SWIPE: {
    MARK_AS_READ: "mark_as_read",
    DISCARD: "discard",
  },
  REFRESH: {
    PULL_TO_REFRESH: "pull_to_refresh",
    BUTTON_CLICK: "button_click",
  },
  TUTORIAL: {
    FOCUS_TUTORIAL: "focus_tutorial",
  },
} as const;

// Analytics event types for type safety
export type AnalyticsEventType =
  | typeof ANALYTICS_EVENTS.APP_OPENED
  | typeof ANALYTICS_EVENTS.TAB_CHANGED
  | typeof ANALYTICS_EVENTS.SWIPE_ACTION
  | typeof ANALYTICS_EVENTS.CAST_VIEWED
  | typeof ANALYTICS_EVENTS.MARK_AS_READ
  | typeof ANALYTICS_EVENTS.DISCARD_CAST
  | typeof ANALYTICS_EVENTS.REFRESH_DATA
  | typeof ANALYTICS_EVENTS.THEME_CHANGED
  | typeof ANALYTICS_EVENTS.SETTINGS_OPENED
  | typeof ANALYTICS_EVENTS.ADD_TO_FARCASTER
  | typeof ANALYTICS_EVENTS.TUTORIAL_COMPLETED
  | typeof ANALYTICS_EVENTS.ERROR_OCCURRED
  | typeof ANALYTICS_EVENTS.API_CALL_FAILED
  | typeof ANALYTICS_EVENTS.PERFORMANCE_ISSUE;

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
      track(ANALYTICS_EVENTS.APP_OPENED, context);
    },
    [track]
  );

  const trackTabChanged = useCallback(
    (tabName: string, context?: Record<string, any>) => {
      track(ANALYTICS_EVENTS.TAB_CHANGED, { tabName, ...context });
    },
    [track]
  );

  const trackSwipeAction = useCallback(
    (
      action:
        | typeof ANALYTICS_ACTIONS.SWIPE.MARK_AS_READ
        | typeof ANALYTICS_ACTIONS.SWIPE.DISCARD,
      context?: Record<string, any>
    ) => {
      track(ANALYTICS_EVENTS.SWIPE_ACTION, { action, ...context });
    },
    [track]
  );

  const trackCastViewed = useCallback(
    (castHash: string, context?: Record<string, any>) => {
      track(ANALYTICS_EVENTS.CAST_VIEWED, { castHash, ...context });
    },
    [track]
  );

  const trackMarkAsRead = useCallback(
    (castHash: string, context?: Record<string, any>) => {
      track(ANALYTICS_EVENTS.MARK_AS_READ, { castHash, ...context });
    },
    [track]
  );

  const trackDiscardCast = useCallback(
    (castHash: string, context?: Record<string, any>) => {
      track(ANALYTICS_EVENTS.DISCARD_CAST, { castHash, ...context });
    },
    [track]
  );

  const trackRefreshData = useCallback(
    (context?: Record<string, any>) => {
      track(ANALYTICS_EVENTS.REFRESH_DATA, context);
    },
    [track]
  );

  const trackThemeChanged = useCallback(
    (theme: string, context?: Record<string, any>) => {
      track(ANALYTICS_EVENTS.THEME_CHANGED, { theme, ...context });
    },
    [track]
  );

  const trackSettingsOpened = useCallback(
    (context?: Record<string, any>) => {
      track(ANALYTICS_EVENTS.SETTINGS_OPENED, context);
    },
    [track]
  );

  const trackAddToFarcaster = useCallback(
    (success: boolean, context?: Record<string, any>) => {
      track(ANALYTICS_EVENTS.ADD_TO_FARCASTER, { success, ...context });
    },
    [track]
  );

  const trackTutorialCompleted = useCallback(
    (tutorialName: string, context?: Record<string, any>) => {
      track(ANALYTICS_EVENTS.TUTORIAL_COMPLETED, { tutorialName, ...context });
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
      track(ANALYTICS_EVENTS.API_CALL_FAILED, {
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
      track(ANALYTICS_EVENTS.PERFORMANCE_ISSUE, { issue, ...context });
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
