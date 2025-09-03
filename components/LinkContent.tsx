"use client";

import React from "react";
import { extractUrls, isImageUrl } from "@/utils/linkUtils";
import { ImageDisplay } from "./ImageDisplay";
import { EmbedDisplay } from "./EmbedDisplay";

interface LinkContentProps {
  text: string;
  isDarkTheme: boolean;
  className?: string;
}

export function LinkContent({
  text,
  isDarkTheme,
  className = "",
}: LinkContentProps) {
  const urls = extractUrls(text);

  if (urls.length === 0) {
    return null;
  }

  // Separate images and other links
  const imageUrls = urls.filter((url) => isImageUrl(url));
  const otherUrls = urls.filter((url) => !isImageUrl(url));

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
        />
      ))}
    </div>
  );
}
