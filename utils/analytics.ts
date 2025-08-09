import { ANALYTICS_EVENTS } from "@/hooks/useAnalytics";
import { track } from "@vercel/analytics";

// Vercel Analytics implementation
export interface AnalyticsProvider {
  init(): void;
  trackEvent(eventName: string, properties?: Record<string, any>): void;
  trackError(error: Error, context?: Record<string, any>): void;
  trackPageView(pageName: string, properties?: Record<string, any>): void;
  setUser(userId: string, properties?: Record<string, any>): void;
  setProperty(key: string, value: any): void;
}

// Vercel Analytics implementation
class VercelAnalytics implements AnalyticsProvider {
  private isInitialized = false;

  init(): void {
    if (typeof window !== "undefined" && !this.isInitialized) {
      // Vercel Analytics is automatically initialized
      this.isInitialized = true;
      console.log("📊 Vercel Analytics initialized");
    }
  }

  trackEvent(eventName: string, properties?: Record<string, any>): void {
    if (typeof window !== "undefined" && this.isInitialized) {
      // Vercel Analytics automatically tracks events
      // You can add custom event tracking here if needed
      track(eventName, properties);
      console.log("📊 Vercel Analytics Event:", eventName, properties);
    }
  }

  trackError(error: Error, context?: Record<string, any>): void {
    if (typeof window !== "undefined" && this.isInitialized) {
      // Vercel Analytics automatically tracks errors
      track(ANALYTICS_EVENTS.ERROR_OCCURRED, {
        error: error.message,
        ...context,
      });
      console.error("📊 Vercel Analytics Error:", error, context);
    }
  }

  trackPageView(pageName: string, properties?: Record<string, any>): void {
    if (typeof window !== "undefined" && this.isInitialized) {
      // Vercel Analytics automatically tracks page views
      track(ANALYTICS_EVENTS.PAGE_VIEW, { pageName, ...properties });
      console.log("📊 Vercel Analytics Page View:", pageName, properties);
    }
  }

  setUser(userId: string, properties?: Record<string, any>): void {
    if (typeof window !== "undefined" && this.isInitialized) {
      // Vercel Analytics doesn't have explicit user setting
      // But we can track user-related events
      this.trackEvent(ANALYTICS_EVENTS.USER_IDENTIFIED, {
        userId,
        ...properties,
      });
    }
  }

  setProperty(key: string, value: any): void {
    if (typeof window !== "undefined" && this.isInitialized) {
      // Vercel Analytics doesn't have explicit property setting
      // But we can track property changes as events
      this.trackEvent(ANALYTICS_EVENTS.PROPERTY_SET, { key, value });
    }
  }
}

// Analytics configuration
interface AnalyticsConfig {
  enabled: boolean;
  debug?: boolean;
}

// Analytics manager
class AnalyticsManager {
  private provider: AnalyticsProvider;
  private config: AnalyticsConfig;

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.provider = new VercelAnalytics();
  }

  init(): void {
    if (this.config.enabled) {
      this.provider.init();
    }
  }

  trackEvent(eventName: string, properties?: Record<string, any>): void {
    if (this.config.enabled) {
      this.provider.trackEvent(eventName, properties);
    }
  }

  trackError(error: Error, context?: Record<string, any>): void {
    if (this.config.enabled) {
      this.provider.trackError(error, context);
    }
  }

  trackPageView(pageName: string, properties?: Record<string, any>): void {
    if (this.config.enabled) {
      this.provider.trackPageView(pageName, properties);
    }
  }

  setUser(userId: string, properties?: Record<string, any>): void {
    if (this.config.enabled) {
      this.provider.setUser(userId, properties);
    }
  }

  setProperty(key: string, value: any): void {
    if (this.config.enabled) {
      this.provider.setProperty(key, value);
    }
  }

  // Method to enable/disable analytics
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    console.log(`📊 Analytics ${enabled ? "enabled" : "disabled"}`);
  }
}

// Default configuration
const defaultConfig: AnalyticsConfig = {
  enabled:
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true",
  debug: process.env.NODE_ENV === "development",
};

// Create and export the analytics instance
export const analytics = new AnalyticsManager(defaultConfig);

// Convenience functions for easy usage
export const trackEvent = (
  eventName: string,
  properties?: Record<string, any>
) => {
  analytics.trackEvent(eventName, properties);
};

export const trackError = (error: Error, context?: Record<string, any>) => {
  analytics.trackError(error, context);
};

export const trackPageView = (
  pageName: string,
  properties?: Record<string, any>
) => {
  analytics.trackPageView(pageName, properties);
};

export const setUser = (userId: string, properties?: Record<string, any>) => {
  analytics.setUser(userId, properties);
};

export const setProperty = (key: string, value: any) => {
  analytics.setProperty(key, value);
};

// Initialize analytics
if (typeof window !== "undefined") {
  analytics.init();
}
