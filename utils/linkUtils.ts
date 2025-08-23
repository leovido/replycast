/**
 * Utility functions for extracting and classifying links from text
 */

// Common image file extensions
const IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".svg",
  ".bmp",
  ".ico",
  ".tiff",
];

// Common video file extensions
const VIDEO_EXTENSIONS = [
  ".mp4",
  ".webm",
  ".ogg",
  ".mov",
  ".avi",
  ".mkv",
  ".flv",
  ".wmv",
];

// Known domains that typically serve images
const IMAGE_DOMAINS = [
  "imgur.com",
  "i.imgur.com",
  "images.unsplash.com",
  "picsum.photos",
  "via.placeholder.com",
  "placehold.co",
  "dummyimage.com",
];

// Known domains that typically serve videos
const VIDEO_DOMAINS = [
  "youtube.com",
  "youtu.be",
  "vimeo.com",
  "dailymotion.com",
  "twitch.tv",
  "tiktok.com",
  "instagram.com",
  "twitter.com",
  "x.com",
];

/**
 * Extract URLs from text content
 */
export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);
  return matches || [];
}

/**
 * Check if a URL points to an image
 */
export function isImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);

    // Check file extension
    const pathname = urlObj.pathname.toLowerCase();
    if (IMAGE_EXTENSIONS.some((ext) => pathname.endsWith(ext))) {
      return true;
    }

    // Check domain
    if (IMAGE_DOMAINS.some((domain) => urlObj.hostname.includes(domain))) {
      return true;
    }

    // Check for common image patterns in path
    if (
      pathname.includes("/image/") ||
      pathname.includes("/img/") ||
      pathname.includes("/photo/")
    ) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Check if a URL points to a video
 */
export function isVideoUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);

    // Check file extension
    const pathname = urlObj.pathname.toLowerCase();
    if (VIDEO_EXTENSIONS.some((ext) => pathname.endsWith(ext))) {
      return true;
    }

    // Check domain
    if (VIDEO_DOMAINS.some((domain) => urlObj.hostname.includes(domain))) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Get the domain from a URL for display purposes
 */
export function getDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace("www.", "");
  } catch {
    return url;
  }
}

/**
 * Extract title from YouTube URLs
 */
export function getYouTubeTitle(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (
      urlObj.hostname.includes("youtube.com") ||
      urlObj.hostname.includes("youtu.be")
    ) {
      // For youtu.be links, we can't extract title without API call
      // For now, return a generic YouTube title
      return "YouTube Video";
    }
  } catch {
    // Invalid URL
  }
  return null;
}

/**
 * Get thumbnail URL for YouTube videos
 */
export function getYouTubeThumbnail(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes("youtu.be")) {
      const videoId = urlObj.pathname.slice(1);
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    } else if (urlObj.hostname.includes("youtube.com")) {
      const videoId = urlObj.searchParams.get("v");
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }
  } catch {
    // Invalid URL
  }
  return null;
}

/**
 * Classify a URL and return metadata
 */
export function classifyUrl(url: string): {
  type: "image" | "video" | "youtube" | "other";
  domain: string;
  title?: string;
  thumbnail?: string;
} {
  const domain = getDomainFromUrl(url);

  if (isImageUrl(url)) {
    return { type: "image", domain };
  }

  if (isVideoUrl(url)) {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      return {
        type: "youtube",
        domain,
        title: getYouTubeTitle(url) || undefined,
        thumbnail: getYouTubeThumbnail(url) || undefined,
      };
    }
    return { type: "video", domain };
  }

  return { type: "other", domain };
}
