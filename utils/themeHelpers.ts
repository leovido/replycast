export type ThemeMode = "dark" | "light" | "Farcaster";

/**
 * Get background class based on theme mode
 * @param themeMode - The current theme mode
 * @returns Tailwind CSS classes for background styling
 */
export const getBackgroundClass = (themeMode: ThemeMode): string => {
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

/**
 * Get text color based on theme mode and active state
 * @param themeMode - The current theme mode
 * @param isActive - Whether the element is in active state
 * @returns Tailwind CSS classes for text color
 */
export const getTextColor = (
  themeMode: ThemeMode,
  isActive: boolean
): string => {
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

/**
 * Get border color based on theme mode
 * @param themeMode - The current theme mode
 * @returns Tailwind CSS classes for border color
 */
export const getBorderColor = (themeMode: ThemeMode): string => {
  switch (themeMode) {
    case "light":
      return "border-gray-200";
    case "Farcaster":
      return "border-purple-300/60";
    default:
      return "border-gray-800";
  }
};

/**
 * Get bubble background color based on theme mode
 * @param themeMode - The current theme mode
 * @returns Tailwind CSS classes for bubble background
 */
export const getBubbleBgColor = (themeMode: ThemeMode): string => {
  switch (themeMode) {
    case "dark":
      return "bg-gray-800";
    case "light":
      return "bg-white";
    case "Farcaster":
      return "bg-purple-50 dark:bg-purple-900/20";
    default:
      return "bg-gray-800";
  }
};

/**
 * Get hover background color based on theme mode
 * @param themeMode - The current theme mode
 * @returns Tailwind CSS classes for hover background
 */
export const getHoverBgColor = (themeMode: ThemeMode): string => {
  switch (themeMode) {
    case "dark":
      return "hover:bg-gray-700";
    case "light":
      return "hover:bg-gray-50";
    case "Farcaster":
      return "hover:bg-purple-100 dark:hover:bg-purple-800/30";
    default:
      return "hover:bg-gray-700";
  }
};

/**
 * Get button background color based on theme mode and state
 * @param themeMode - The current theme mode
 * @param isActive - Whether the button is in active state
 * @returns Tailwind CSS classes for button background
 */
export const getButtonBgColor = (
  themeMode: ThemeMode,
  isActive: boolean = false
): string => {
  if (isActive) {
    switch (themeMode) {
      case "light":
        return "bg-blue-600 hover:bg-blue-700";
      case "Farcaster":
        return "bg-purple-600 hover:bg-purple-700";
      default:
        return "bg-blue-600 hover:bg-blue-700";
    }
  } else {
    switch (themeMode) {
      case "light":
        return "bg-gray-600 hover:bg-gray-700";
      case "Farcaster":
        return "bg-purple-600 hover:bg-purple-700";
      default:
        return "bg-gray-600 hover:bg-gray-700";
    }
  }
};

/**
 * Get input field styling based on theme mode
 * @param themeMode - The current theme mode
 * @param hasError - Whether the input has an error
 * @returns Tailwind CSS classes for input styling
 */
export const getInputStyling = (
  themeMode: ThemeMode,
  hasError: boolean = false
): string => {
  const baseClasses = "border rounded transition-colors";

  if (hasError) {
    return `${baseClasses} border-red-500 focus:border-red-500 focus:ring-red-500`;
  }

  switch (themeMode) {
    case "light":
      return `${baseClasses} border-gray-300 focus:border-blue-500 focus:ring-blue-500`;
    case "Farcaster":
      return `${baseClasses} border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500`;
    default:
      return `${baseClasses} border-gray-300 focus:border-blue-500 focus:ring-blue-500`;
  }
};

/**
 * Get card background styling based on theme mode and interaction state
 * @param themeMode - The current theme mode
 * @param hasUserInteraction - Whether the user has interacted with the content
 * @param isSwipeModeActive - Whether swipe mode is active
 * @returns Tailwind CSS classes for card background
 */
export const getCardBackground = (
  themeMode: ThemeMode,
  hasUserInteraction: boolean = false,
  isSwipeModeActive: boolean = false
): string => {
  if (isSwipeModeActive) {
    return "ring-2 ring-yellow-400/60 shadow-2xl shadow-yellow-500/20 scale-[1.02] touch-none select-none";
  }

  if (hasUserInteraction) {
    switch (themeMode) {
      case "dark":
        return "bg-gradient-to-br from-white/15 to-white/10 ring-2 ring-blue-400/40 shadow-xl shadow-blue-500/20 backdrop-blur-md border border-white/20";
      case "light":
        return "bg-gradient-to-br from-blue-50 to-purple-50 ring-2 ring-blue-400/30 shadow-xl shadow-blue-500/20";
      case "Farcaster":
        return "bg-gradient-to-br from-purple-50 to-purple-100 ring-2 ring-purple-400/30 shadow-xl shadow-purple-500/20";
      default:
        return "bg-gradient-to-br from-white/15 to-white/10 ring-2 ring-blue-400/40 shadow-xl shadow-blue-500/20 backdrop-blur-md border border-white/20";
    }
  } else {
    switch (themeMode) {
      case "dark":
        return "bg-gradient-to-br from-white/12 to-white/8 backdrop-blur-md border border-white/15 hover:bg-gradient-to-br hover:from-white/15 hover:to-white/10 hover:shadow-lg hover:shadow-white/5";
      case "light":
        return "bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white/90";
      case "Farcaster":
        return "bg-purple-50/80 backdrop-blur-sm border border-purple-200 hover:bg-purple-50/90";
      default:
        return "bg-gradient-to-br from-white/12 to-white/8 backdrop-blur-md border border-white/15 hover:bg-gradient-to-br hover:from-white/15 hover:to-white/10 hover:shadow-lg hover:shadow-white/5";
    }
  }
};

/**
 * Get card overlay background for enhanced 3D effect
 * @param themeMode - The current theme mode
 * @returns Tailwind CSS classes for overlay background
 */
export const getCardOverlayBackground = (themeMode: ThemeMode): string => {
  switch (themeMode) {
    case "dark":
      return "bg-gradient-to-br from-blue-500/5 to-purple-500/5";
    case "light":
      return "bg-gradient-to-br from-blue-500/10 to-purple-500/10";
    case "Farcaster":
      return "bg-gradient-to-br from-purple-500/10 to-purple-600/10";
    default:
      return "bg-gradient-to-br from-blue-500/5 to-purple-500/5";
  }
};

/**
 * Get primary text color based on theme mode
 * @param themeMode - The current theme mode
 * @returns Tailwind CSS classes for primary text color
 */
export const getPrimaryTextColor = (themeMode: ThemeMode): string => {
  switch (themeMode) {
    case "dark":
      return "text-white";
    case "light":
      return "text-gray-900";
    case "Farcaster":
      return "text-gray-900 dark:text-white";
    default:
      return "text-white";
  }
};

/**
 * Get secondary text color based on theme mode
 * @param themeMode - The current theme mode
 * @returns Tailwind CSS classes for secondary text color
 */
export const getSecondaryTextColor = (themeMode: ThemeMode): string => {
  switch (themeMode) {
    case "dark":
      return "text-white/70";
    case "light":
      return "text-gray-600";
    case "Farcaster":
      return "text-gray-600 dark:text-white/70";
    default:
      return "text-white/70";
  }
};

/**
 * Get tertiary text color based on theme mode
 * @param themeMode - The current theme mode
 * @returns Tailwind CSS classes for tertiary text color
 */
export const getTertiaryTextColor = (themeMode: ThemeMode): string => {
  switch (themeMode) {
    case "dark":
      return "text-white/60";
    case "light":
      return "text-gray-500";
    case "Farcaster":
      return "text-gray-500 dark:text-white/60";
    default:
      return "text-white/60";
  }
};

/**
 * Get quaternary text color based on theme mode
 * @param themeMode - The current theme mode
 * @returns Tailwind CSS classes for quaternary text color
 */
export const getQuaternaryTextColor = (themeMode: ThemeMode): string => {
  switch (themeMode) {
    case "dark":
      return "text-white/40";
    case "light":
      return "text-gray-400";
    case "Farcaster":
      return "text-gray-400 dark:text-white/40";
    default:
      return "text-white/40";
  }
};

/**
 * Get OpenRank star color based on theme mode
 * @param themeMode - The current theme mode
 * @returns Tailwind CSS classes for OpenRank star color
 */
export const getOpenRankStarColor = (themeMode: ThemeMode): string => {
  switch (themeMode) {
    case "dark":
      return "text-yellow-400";
    case "light":
      return "text-purple-700";
    case "Farcaster":
      return "text-purple-700 dark:text-yellow-400";
    default:
      return "text-yellow-400";
  }
};

/**
 * Get interaction badge styling based on theme mode
 * @param themeMode - The current theme mode
 * @returns Tailwind CSS classes for interaction badge
 */
export const getInteractionBadgeStyling = (themeMode: ThemeMode): string => {
  switch (themeMode) {
    case "dark":
      return "bg-blue-500/20 text-blue-300";
    case "light":
      return "bg-purple-100 text-purple-700";
    case "Farcaster":
      return "bg-purple-100 text-purple-700 dark:bg-blue-500/20 dark:text-blue-300";
    default:
      return "bg-blue-500/20 text-blue-300";
  }
};

/**
 * Get hover text color for interactive elements
 * @param themeMode - The current theme mode
 * @returns Tailwind CSS classes for hover text color
 */
export const getHoverTextColor = (themeMode: ThemeMode): string => {
  switch (themeMode) {
    case "dark":
      return "hover:text-blue-300";
    case "light":
      return "hover:text-blue-600";
    case "Farcaster":
      return "hover:text-purple-600 dark:hover:text-blue-300";
    default:
      return "hover:text-blue-300";
  }
};

/**
 * Get hover text color for secondary interactive elements
 * @param themeMode - The current theme mode
 * @returns Tailwind CSS classes for secondary hover text color
 */
export const getHoverSecondaryTextColor = (themeMode: ThemeMode): string => {
  switch (themeMode) {
    case "dark":
      return "hover:text-blue-300/70";
    case "light":
      return "hover:text-blue-600/70";
    case "Farcaster":
      return "hover:text-purple-600/70 dark:hover:text-blue-300/70";
    default:
      return "hover:text-blue-300/70";
  }
};
