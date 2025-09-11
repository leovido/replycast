"use client";

import React from "react";
import { extractUrls, isImageUrl } from "@/utils/linkUtils";
import ImageDisplay from "./ImageDisplay";
import EmbedDisplay from "./EmbedDisplay";

interface LinkContentProps {
  text: string;
  isDarkTheme: boolean;
  themeMode?: "dark" | "light" | "Farcaster" | "neon";
  className?: string;
  embeds?: Array<{
    url?: string;
    cast_id?: {
      fid: number;
      hash: string;
    };
    metadata?: {
      content_type?: string;
      content_length?: number;
      image?: {
        width_px: number;
        height_px: number;
      };
    };
  }>;
}

export function LinkContent({
  text,
  isDarkTheme,
  themeMode = isDarkTheme ? "dark" : "light",
  className = "",
  embeds = [],
}: LinkContentProps) {
  const textUrls = extractUrls(text);

  // Extract URLs from embeds
  const embedUrls = embeds
    .filter((embed) => embed.url)
    .map((embed) => embed.url!);

  // Combine and deduplicate URLs
  const allUrls = [...new Set([...textUrls, ...embedUrls])];

  if (allUrls.length === 0) {
    return null;
  }

  // Separate images and other links
  const imageUrls = allUrls.filter((url) => isImageUrl(url));
  const otherUrls = allUrls.filter((url) => !isImageUrl(url));

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Display images */}
      {imageUrls.map((url, index) => (
        <ImageDisplay
          key={`image-${index}`}
          src={url}
          alt={`Image from ${url}`}
          isDarkTheme={isDarkTheme}
          width={400}
          height={300}
          className="w-full"
        />
      ))}

      {/* Display other links as embeddings */}
      {otherUrls.map((url, index) => (
        <EmbedDisplay
          key={`embed-${index}`}
          url={url}
          isDarkTheme={isDarkTheme}
          themeMode={themeMode}
        />
      ))}
    </div>
  );
}

export default LinkContent;
