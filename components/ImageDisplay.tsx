"use client";

import React, { useState } from "react";
import Image from "next/image";

interface ImageDisplayProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  isDarkTheme: boolean;
}

export function ImageDisplay({
  src,
  alt,
  className = "",
  width = 400,
  height = 300,
  isDarkTheme,
}: ImageDisplayProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border-2 border-dashed ${
          isDarkTheme
            ? "border-white/20 bg-white/5"
            : "border-gray-300 bg-gray-50"
        } ${className}`}
        style={{ width, height }}
      >
        <div
          className={`text-center ${
            isDarkTheme ? "text-white/60" : "text-gray-500"
          }`}
        >
          <svg
            className="mx-auto h-8 w-8 mb-2 opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm">Image unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      {isLoading && (
        <div
          className={`absolute inset-0 flex items-center justify-center ${
            isDarkTheme ? "bg-white/5" : "bg-gray-100"
          }`}
        >
          <div className={`${isDarkTheme ? "text-white/60" : "text-gray-500"}`}>
            <svg
              className="animate-spin h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        </div>
      )}

      <Image
        src={`/api/image-proxy?url=${encodeURIComponent(src)}`}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        objectFit="contain"
        // Disable optimization to prevent multiple requests
        unoptimized={true}
        // Disable lazy loading for immediate display
        priority={false}
        loading="eager"
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: "100%",
          height: "auto",
          maxHeight: height,
          objectFit: "cover",
        }}
      />
    </div>
  );
}

export default ImageDisplay;
