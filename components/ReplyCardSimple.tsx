import React, { memo, useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { sdk } from "@farcaster/miniapp-sdk";
import {
  getBackgroundClass,
  getPrimaryTextColor,
  getTertiaryTextColor,
  type ThemeMode,
} from "@/utils/themeHelpers";
import type { UnrepliedDetail } from "@/types/types";
import { LinkContent } from "./LinkContent";

interface ReplyCardSimpleProps {
  conversation: UnrepliedDetail;
  themeMode: ThemeMode;
  isDarkTheme: boolean;
  onClick?: () => void;
  className?: string;
  isLoading?: boolean;
  onMarkAsRead?: (conversation: UnrepliedDetail) => void;
  onDiscard?: (conversation: UnrepliedDetail) => void;
}

export const ReplyCardSimple = memo<ReplyCardSimpleProps>(
  ({
    conversation,
    themeMode,
    isDarkTheme,
    onClick,
    className = "",
    isLoading = false,
    onMarkAsRead,
    onDiscard,
  }) => {
    // Debug: Log the props to see if they're being passed
    console.log("ReplyCardSimple props:", {
      onMarkAsRead: !!onMarkAsRead,
      onDiscard: !!onDiscard,
    });
    // Swipe functionality state
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);
    const [isSwipeModeActive, setIsSwipeModeActive] = useState(false);
    const [showSwipeActions, setShowSwipeActions] = useState(false);
    const [wasSwipeActionPerformed, setWasSwipeActionPerformed] =
      useState(false);

    // Refs for touch and mouse handling
    const cardRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef<number>(0);
    const touchStartY = useRef<number>(0);
    const mouseStartX = useRef<number>(0);
    const mouseStartY = useRef<number>(0);
    const isMouseDragging = useRef<boolean>(false);

    // Timer ref for long press activation (500ms)
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const hasMovedDuringPress = useRef<boolean>(false);

    const handleClick = async () => {
      if (
        isLoading ||
        isDragging ||
        wasSwipeActionPerformed ||
        isSwipeModeActive
      )
        return;

      try {
        // If a custom onClick is provided, use that
        if (onClick) {
          onClick();
          return;
        }

        // Otherwise, open the cast using the Farcaster SDK
        await sdk.actions.viewCast({ hash: conversation.castHash });
      } catch (error) {
        console.error("Error opening cast:", error);
        // Fallback: try to open the cast URL directly
        if (conversation.castUrl) {
          window.open(conversation.castUrl, "_blank");
        }
      }
    };

    // Helper functions for long press activation (iOS-style)
    const startLongPress = useCallback(() => {
      // Clear any existing timer
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }

      hasMovedDuringPress.current = false;

      // Detect if we're on desktop (even in mobile view)
      const isDesktop =
        !("ontouchstart" in window) || window.navigator.maxTouchPoints === 0;
      const longPressDelay = isDesktop ? 150 : 200; // Faster activation on desktop

      // Start long press timer
      longPressTimer.current = setTimeout(() => {
        // Only activate swipe mode if user hasn't moved (not scrolling)
        if (!hasMovedDuringPress.current) {
          console.log("Long press activated - swipe mode enabled");
          setIsSwipeModeActive(true);
          setShowSwipeActions(true);

          // Trigger haptic feedback to indicate swipe mode activation
          try {
            sdk.haptics?.impactOccurred?.("medium");
          } catch (error) {
            // Haptic not available, continue anyway
          }
        }
      }, longPressDelay);
    }, []);

    const clearLongPress = useCallback(() => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      // Don't immediately clear swipe mode if we're actively dragging
      if (!isDragging) {
        // Smooth reset with animation
        if (isSwipeModeActive) {
          // Add a small delay for smooth transition back to normal state
          setTimeout(() => {
            setIsSwipeModeActive(false);
            setShowSwipeActions(false);
            setDragOffset(0);
          }, 150);
        } else {
          setIsSwipeModeActive(false);
          setShowSwipeActions(false);
          setDragOffset(0);
        }
      }

      hasMovedDuringPress.current = false;
    }, [isSwipeModeActive, isDragging]);

    // Function to reset swipe action flag (called after onClick)
    const resetSwipeActionFlag = useCallback(() => {
      setWasSwipeActionPerformed(false);
    }, []);

    // Function to reset drag state after swipe action
    const resetDragState = useCallback(() => {
      setIsDragging(false);
      setDragOffset(0);
      // Keep swipe mode active briefly to show the action was completed
      setTimeout(() => {
        setIsSwipeModeActive(false);
        setShowSwipeActions(false);
      }, 200);
    }, []);

    // Touch event handlers
    const handleTouchStart = useCallback(
      (e: React.TouchEvent) => {
        try {
          const touch = e.touches[0];
          if (!touch) return;

          // Only start long press if we have swipe actions available
          if (onMarkAsRead || onDiscard) {
            touchStartX.current = touch.clientX;
            touchStartY.current = touch.clientY;
            startLongPress();
          }
        } catch (error) {
          console.error("Touch start error:", error);
        }
      },
      [startLongPress, onMarkAsRead, onDiscard]
    );

    const handleTouchMove = useCallback(
      (e: React.TouchEvent) => {
        try {
          const touch = e.touches[0];
          if (!touch) return;

          const deltaX = touch.clientX - touchStartX.current;
          const deltaY = touch.clientY - touchStartY.current;
          const totalMovement = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

          // If user moves during long press, mark as moved (prevents swipe mode activation)
          if (totalMovement > 25) {
            hasMovedDuringPress.current = true;

            // If not in swipe mode yet, allow normal scrolling
            if (!isSwipeModeActive) {
              clearLongPress();
              return; // Allow normal scrolling behavior
            }
          }

          // ONLY block events when swipe mode is actually active
          if (isSwipeModeActive) {
            e.stopPropagation();

            // Improved horizontal swipe detection with better tolerance
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 3) {
              if (!isDragging || Math.abs(deltaX - dragOffset) > 1) {
                setIsDragging(true);
                setDragOffset(deltaX);
              }
            } else {
              // Block any vertical movement completely
              if (isDragging) {
                setIsDragging(false);
                setDragOffset(0);
              }
            }
          }
        } catch (error) {
          console.error("Touch move error:", error);
        }
      },
      [isSwipeModeActive, clearLongPress, isDragging, dragOffset]
    );

    const handleTouchEnd = useCallback(
      (e: React.TouchEvent) => {
        try {
          const touch = e.changedTouches[0];
          if (!touch) return;

          // If we're in swipe mode and dragging, process the swipe action
          if (isSwipeModeActive && isDragging) {
            e.stopPropagation();

            const deltaX = touch.clientX - touchStartX.current;
            const swipeThreshold = 25;

            if (Math.abs(deltaX) > swipeThreshold) {
              if (deltaX > 0 && onMarkAsRead) {
                // Swipe right - mark as read
                console.log("Swipe right - calling onMarkAsRead", conversation);
                try {
                  sdk.haptics?.impactOccurred?.("light");
                } catch (error) {
                  // Haptic not available, continue anyway
                }
                setWasSwipeActionPerformed(true);
                onMarkAsRead(conversation);
                resetDragState();
              } else if (deltaX < 0 && onDiscard) {
                // Swipe left - discard
                console.log("Swipe left - calling onDiscard", conversation);
                try {
                  sdk.haptics?.impactOccurred?.("medium");
                } catch (error) {
                  // Haptic not available, continue anyway
                }
                setWasSwipeActionPerformed(true);
                onDiscard(conversation);
                resetDragState();
              }
            } else {
              resetDragState();
            }
          }

          clearLongPress();
        } catch (error) {
          console.error("Touch end error:", error);
          clearLongPress();
        }
      },
      [
        isSwipeModeActive,
        isDragging,
        onMarkAsRead,
        onDiscard,
        conversation,
        clearLongPress,
        resetDragState,
      ]
    );

    // Mouse event handlers for desktop support
    const handleMouseDown = useCallback(
      (e: React.MouseEvent) => {
        if (e.button !== 0) return;

        try {
          // Only start long press if we have swipe actions available
          if (onMarkAsRead || onDiscard) {
            mouseStartX.current = e.clientX;
            mouseStartY.current = e.clientY;
            isMouseDragging.current = true;
            startLongPress();
          }
        } catch (error) {
          console.error("Mouse down error:", error);
        }
      },
      [startLongPress, onMarkAsRead, onDiscard]
    );

    const handleMouseMove = useCallback(
      (e: React.MouseEvent) => {
        try {
          if (!isMouseDragging.current) return;

          const deltaX = e.clientX - mouseStartX.current;
          const deltaY = e.clientY - mouseStartY.current;
          const totalMovement = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

          if (totalMovement > 25) {
            hasMovedDuringPress.current = true;

            if (!isSwipeModeActive) {
              clearLongPress();
              return;
            }
          }

          if (isSwipeModeActive) {
            e.stopPropagation();

            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 3) {
              if (!isDragging || Math.abs(deltaX - dragOffset) > 1) {
                setIsDragging(true);
                setDragOffset(deltaX);
              }
            } else {
              if (isDragging) {
                setIsDragging(false);
                setDragOffset(0);
              }
            }
          }
        } catch (error) {
          console.error("Mouse move error:", error);
        }
      },
      [isSwipeModeActive, clearLongPress, isDragging, dragOffset]
    );

    const handleMouseUp = useCallback(
      (e: React.MouseEvent) => {
        try {
          if (isSwipeModeActive && isDragging && isMouseDragging.current) {
            e.stopPropagation();

            const deltaX = e.clientX - mouseStartX.current;
            const swipeThreshold = 25;

            if (Math.abs(deltaX) > swipeThreshold) {
              if (deltaX > 0 && onMarkAsRead) {
                console.log(
                  "Mouse swipe right - calling onMarkAsRead",
                  conversation
                );
                try {
                  sdk.haptics?.impactOccurred?.("light");
                } catch (error) {
                  // Haptic not available, continue anyway
                }
                setWasSwipeActionPerformed(true);
                onMarkAsRead(conversation);
                resetDragState();
              } else if (deltaX < 0 && onDiscard) {
                console.log(
                  "Mouse swipe left - calling onDiscard",
                  conversation
                );
                try {
                  sdk.haptics?.impactOccurred?.("medium");
                } catch (error) {
                  // Haptic not available, continue anyway
                }
                setWasSwipeActionPerformed(true);
                onDiscard(conversation);
                resetDragState();
              }
            } else {
              resetDragState();
            }
          }

          isMouseDragging.current = false;
          clearLongPress();
        } catch (error) {
          console.error("Mouse up error:", error);
          isMouseDragging.current = false;
          clearLongPress();
        }
      },
      [
        isSwipeModeActive,
        isDragging,
        onMarkAsRead,
        onDiscard,
        conversation,
        clearLongPress,
        resetDragState,
      ]
    );

    // Global mouse up handler
    useEffect(() => {
      const handleGlobalMouseUp = () => {
        if (isMouseDragging.current) {
          isMouseDragging.current = false;
          clearLongPress();
        }
      };

      if (isMouseDragging.current) {
        document.addEventListener("mouseup", handleGlobalMouseUp);
        return () => {
          document.removeEventListener("mouseup", handleGlobalMouseUp);
        };
      }
    }, [clearLongPress]);

    // Cleanup timer on unmount
    useEffect(() => {
      return () => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
        }
      };
    }, []);

    // Keyboard event handlers for desktop fallback
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (!isSwipeModeActive) return;

        if (e.key === "ArrowLeft" && onDiscard) {
          e.preventDefault();
          setWasSwipeActionPerformed(true);
          onDiscard(conversation);
          resetDragState();
        } else if (e.key === "ArrowRight" && onMarkAsRead) {
          e.preventDefault();
          setWasSwipeActionPerformed(true);
          onMarkAsRead(conversation);
          resetDragState();
        }
      },
      [isSwipeModeActive, onDiscard, onMarkAsRead, conversation, resetDragState]
    );

    // Extract links from the text
    const extractLinks = (text: string) => {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const links = text.match(urlRegex) || [];
      return links;
    };

    // Remove links from display text
    const getDisplayText = (text: string) => {
      return text.replace(/(https?:\/\/[^\s]+)/g, "").trim();
    };

    const links = extractLinks(conversation.text);
    const displayText = getDisplayText(conversation.text);

    // Calculate transform based on drag with hardware acceleration
    const transform = isDragging
      ? `translate3d(${dragOffset}px, 0, 0)`
      : isSwipeModeActive
      ? "translate3d(0, 0, 0)"
      : "";

    return (
      <div
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        className={`group relative w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all duration-300 cursor-pointer swipe-enabled ${
          isLoading ? "opacity-75 pointer-events-none" : ""
        } ${isSwipeModeActive ? "swipe-mode-active" : ""} ${className}`}
        style={{
          transform,
          ...(isSwipeModeActive && {
            touchAction: "pan-x",
            userSelect: "none",
            WebkitUserSelect: "none",
            WebkitTouchCallout: "none",
          }),
        }}
      >
        {/* Swipe Action Indicators */}
        {showSwipeActions && (
          <>
            {onDiscard && (
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-red-500/20 flex items-center justify-center rounded-l-2xl">
                <div className="text-red-400 text-sm font-medium">Discard</div>
              </div>
            )}
            {onMarkAsRead && (
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-green-500/20 flex items-center justify-center rounded-r-2xl">
                <div className="text-green-400 text-sm font-medium">
                  Mark Read
                </div>
              </div>
            )}
          </>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Profile Picture */}
        <div className="flex flex-row px-4 pt-4 gap-3 items-center">
          <div className="relative">
            <Image
              src={conversation.avatarUrl}
              alt={`@${conversation.username}'s avatar`}
              width={40}
              height={40}
              className="rounded-full ring-2 ring-gray-200 dark:ring-gray-600 group-hover:ring-purple-300 dark:group-hover:ring-purple-600 transition-all duration-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.username}`;
              }}
            />
            {/* Optional: Add a subtle glow effect on hover */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>

          {/* Header Row */}
          <div className="flex flex-col flex-1 min-w-0">
            {/* Username */}
            <span
              className={`font-semibold text-left group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-sm truncate`}
            >
              @{conversation.username}
            </span>

            <span className={`text-xs text-left text-gray-500 dark:text-gray-400`}>
              FID: {conversation.authorFid}
            </span>
          </div>

          {/* Timestamp - positioned at the rightmost side */}
          <span className={`text-xs text-right flex-shrink-0 text-gray-500 dark:text-gray-400`}>
            {conversation.timeAgo}
          </span>
        </div>

        <div className={`flex gap-3 px-4 pb-4`}>
          {/* Content Area */}
          <div className="flex-1 min-w-0">
            {/* Cast Text */}
            {displayText && (
              <div
                className={`mb-3 text-sm text-left leading-relaxed break-words`}
              >
                {displayText}
              </div>
            )}

            {/* Links Section */}
            {links.length > 0 && (
              <div className="mb-3">
                <LinkContent
                  text={conversation.text}
                  isDarkTheme={isDarkTheme}
                  className="mb-0"
                />
              </div>
            )}

            {/* Show indicator when there's no text but there are embeds */}
            {!displayText && !links.length && (
              <div
                className={`mb-3 text-sm italic ${getTertiaryTextColor(
                  themeMode
                )}`}
              >
                📎 Cast contains embedded media
              </div>
            )}

            {/* Interaction Bar */}
            <div
              className={`flex items-center gap-4 text-sm pt-2 border-t border-gray-100 dark:border-gray-800 ${getTertiaryTextColor(
                themeMode
              )}`}
            >
              {/* Replies */}
              <div className="flex items-center gap-1.5 group/stat hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                <svg
                  className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-xs font-medium tabular-nums">{conversation.replyCount}</span>
              </div>

              {/* Recasts */}
              <div className="flex items-center gap-1.5 group/stat hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer">
                <svg
                  className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M3 21v-5h5" />
                </svg>
                <span className="text-xs font-medium tabular-nums">{conversation.recastsCount}</span>
              </div>

              {/* Likes */}
              <div className="flex items-center gap-1.5 group/stat hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">
                <svg
                  className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span className="text-xs font-medium tabular-nums">{conversation.likesCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ReplyCardSimple.displayName = "ReplyCardSimple";
