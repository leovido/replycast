// Privacy configuration for ReplyCast analytics
export interface PrivacyConfig {
  enableAnalytics: boolean;
  enableErrorTracking: boolean;
  dataRetentionDays: number;
  sensitiveFieldFiltering: boolean;
  hashUserIdentifiers: boolean;
}

export const DEFAULT_PRIVACY_CONFIG: PrivacyConfig = {
  enableAnalytics: true,
  enableErrorTracking: true,
  dataRetentionDays: 30, // Align with Vercel's automatic cleanup
  sensitiveFieldFiltering: true,
  hashUserIdentifiers: true,
};

export const PRIVACY_STORAGE_KEY = "replycast-privacy-preferences";

export class PrivacyManager {
  private config: PrivacyConfig;

  constructor(config?: Partial<PrivacyConfig>) {
    this.config = { ...DEFAULT_PRIVACY_CONFIG, ...config };
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(PRIVACY_STORAGE_KEY);
      if (stored) {
        const userPrefs = JSON.parse(stored);
        this.config = { ...this.config, ...userPrefs };
      }
    } catch (error) {
      console.warn("Failed to load privacy preferences:", error);
    }
  }

  private saveToStorage(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(PRIVACY_STORAGE_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.warn("Failed to save privacy preferences:", error);
    }
  }

  getConfig(): PrivacyConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<PrivacyConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveToStorage();
  }

  shouldTrackAnalytics(): boolean {
    return this.config.enableAnalytics;
  }

  shouldTrackErrors(): boolean {
    return this.config.enableErrorTracking;
  }

  shouldFilterSensitiveData(): boolean {
    return this.config.sensitiveFieldFiltering;
  }

  shouldHashUserIdentifiers(): boolean {
    return this.config.hashUserIdentifiers;
  }

  // Utility to create privacy-compliant user identifier
  createAnonymousId(fid?: number): string {
    if (!fid || !this.shouldHashUserIdentifiers()) {
      return "anonymous";
    }

    // Simple hash to create anonymous but consistent identifier
    const hash = Array.from(fid.toString()).reduce((hash, char) => {
      const chr = char.charCodeAt(0);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
      return hash;
    }, 0);

    return `user_${Math.abs(hash)}`;
  }
}

// Global privacy manager instance
export const privacyManager = new PrivacyManager();
