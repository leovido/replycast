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
      return "border-purple-800/50";
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
