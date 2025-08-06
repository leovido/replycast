import React, { memo, useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { sdk } from "@farcaster/miniapp-sdk";
import type { UnrepliedDetail } from "@/types/types";

export interface ReplyCardProps {
  detail: UnrepliedDetail;
  openRank: number | null;
  onClick: () => void;
  viewMode: "list" | "grid";
  isDarkTheme: boolean;
  useOldDesign: boolean;
  onMarkAsRead?: (detail: UnrepliedDetail) => void;
  onDiscard?: (detail: UnrepliedDetail) => void;
}

export const ReplyCard = memo<ReplyCardProps>(
  ({
    detail,
    openRank,
    onClick,
    viewMode,
    isDarkTheme,
    useOldDesign,
    onMarkAsRead,
    onDiscard,
  }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);
    const [isSwipeModeActive, setIsSwipeModeActive] = useState(false);
    const [showSwipeActions, setShowSwipeActions] = useState(false);
    const cardRef = useRef<HTMLButtonElement>(null);
    const touchStartX = useRef<number>(0);
    const touchStartY = useRef<number>(0);

    // Add mouse position refs for desktop support
    const mouseStartX = useRef<number>(0);
    const mouseStartY = useRef<number>(0);
    const isMouseDragging = useRef<boolean>(false);

    // Timer ref for long press activation (1500ms)
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const hasMovedDuringPress = useRef<boolean>(false);

    const handleProfileClick = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        await sdk.actions.viewProfile({ fid: detail.authorFid });
      } catch (error) {
        console.error("Failed to view profile:", error);
      }
    };

    // Helper functions for long press activation (iOS-style)
    const startLongPress = useCallback(() => {
      // Clear any existing timer
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }

      hasMovedDuringPress.current = false;

      // Start long press timer for 1500ms
      longPressTimer.current = setTimeout(() => {
        // Only activate swipe mode if user hasn't moved (not scrolling)
        if (!hasMovedDuringPress.current) {
          setIsSwipeModeActive(true);
          setShowSwipeActions(true);

          // Trigger haptic feedback to indicate swipe mode activation
          try {
            sdk.haptics?.impactOccurred?.("medium");
          } catch (error) {
            // Haptic not available, continue anyway
          }

          if (process.env.NODE_ENV === "development") {
            console.log("🔓 Swipe mode activated after long press");
          }
        }
      }, 1500);
    }, []);

    const clearLongPress = useCallback(() => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      setIsSwipeModeActive(false);
      setShowSwipeActions(false);
      setIsDragging(false);
      setDragOffset(0);
      hasMovedDuringPress.current = false;
    }, []);

    const handleTouchStart = useCallback(
      (e: React.TouchEvent) => {
        try {
          const touch = e.touches[0];
          if (!touch) return;

          touchStartX.current = touch.clientX;
          touchStartY.current = touch.clientY;

          // Start long press timer to potentially activate swipe mode
          startLongPress();

          if (process.env.NODE_ENV === "development") {
            console.log(
              "Touch start - long press timer started:",
              touch.clientX,
              touch.clientY
            );
          }
        } catch (error) {
          console.error("Touch start error:", error);
        }
      },
      [startLongPress]
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
          if (totalMovement > 10) {
            hasMovedDuringPress.current = true;

            // If not in swipe mode yet, allow normal scrolling
            if (!isSwipeModeActive) {
              // Clear the long press timer since user is scrolling
              clearLongPress();
              return; // Allow normal scrolling behavior
            }
          }

          // Only process swipe gestures if swipe mode is active
          if (isSwipeModeActive) {
            // Essential for iframe/WebView environments - stop event propagation
            e.stopPropagation();

            // Only allow horizontal swipes in swipe mode
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
              // Use passive: false to allow preventDefault
              if (e.cancelable) {
                e.preventDefault();
              }

              setIsDragging(true);
              setDragOffset(deltaX);

              if (process.env.NODE_ENV === "development") {
                console.log("Swipe mode - Touch move:", deltaX);
              }
            }
          }
        } catch (error) {
          console.error("Touch move error:", error);
        }
      },
      [isSwipeModeActive, clearLongPress]
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
            const swipeThreshold = 40; // Minimum distance for swipe action

            if (process.env.NODE_ENV === "development") {
              console.log(
                "Touch end in swipe mode:",
                deltaX,
                "threshold:",
                swipeThreshold
              );
            }

            if (Math.abs(deltaX) > swipeThreshold) {
              if (deltaX > 0 && onMarkAsRead) {
                // Swipe right - mark as read (only if onMarkAsRead is provided)
                if (process.env.NODE_ENV === "development") {
                  console.log("Swipe right - marking as read");
                }
                try {
                  // Trigger haptic feedback
                  sdk.haptics?.impactOccurred?.("light");
                } catch (error) {
                  // Haptic not available, continue anyway
                }
                onMarkAsRead(detail);
              } else if (deltaX < 0 && onDiscard) {
                // Swipe left - discard (not interested)
                if (process.env.NODE_ENV === "development") {
                  console.log("Swipe left - discarding cast");
                }
                try {
                  // Trigger haptic feedback
                  sdk.haptics?.impactOccurred?.("medium");
                } catch (error) {
                  // Haptic not available, continue anyway
                }
                onDiscard(detail);
              }
            }
          }

          // Always clear everything on touch end
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
        detail,
        clearLongPress,
      ]
    );

    // Mouse event handlers for desktop support
    const handleMouseDown = useCallback(
      (e: React.MouseEvent) => {
        // Only handle left mouse button
        if (e.button !== 0) return;

        try {
          mouseStartX.current = e.clientX;
          mouseStartY.current = e.clientY;
          isMouseDragging.current = true;

          // Start long press timer for desktop
          startLongPress();

          if (process.env.NODE_ENV === "development") {
            console.log(
              "Mouse down - long press timer started (desktop):",
              e.clientX,
              e.clientY
            );
          }
        } catch (error) {
          console.error("Mouse down error:", error);
        }
      },
      [startLongPress]
    );

    const handleMouseMove = useCallback(
      (e: React.MouseEvent) => {
        try {
          if (!isMouseDragging.current) return;

          const deltaX = e.clientX - mouseStartX.current;
          const deltaY = e.clientY - mouseStartY.current;
          const totalMovement = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

          // If user moves during long press, mark as moved (prevents swipe mode activation)
          if (totalMovement > 10) {
            hasMovedDuringPress.current = true;

            // If not in swipe mode yet, clear long press
            if (!isSwipeModeActive) {
              clearLongPress();
              return; // Allow normal mouse interactions
            }
          }

          // Only process swipe gestures if swipe mode is active
          if (isSwipeModeActive) {
            e.stopPropagation();
            e.preventDefault();

            // Only allow horizontal swipes in swipe mode
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
              setIsDragging(true);
              setDragOffset(deltaX);

              if (process.env.NODE_ENV === "development") {
                console.log("Swipe mode - Mouse move (desktop):", deltaX);
              }
            }
          }
        } catch (error) {
          console.error("Mouse move error:", error);
        }
      },
      [isSwipeModeActive, clearLongPress]
    );

    const handleMouseUp = useCallback(
      (e: React.MouseEvent) => {
        try {
          // If we're in swipe mode and dragging, process the swipe action
          if (isSwipeModeActive && isDragging && isMouseDragging.current) {
            e.stopPropagation();

            const deltaX = e.clientX - mouseStartX.current;
            const swipeThreshold = 40; // Same threshold as touch events

            if (process.env.NODE_ENV === "development") {
              console.log(
                "Mouse up in swipe mode (desktop):",
                deltaX,
                "threshold:",
                swipeThreshold
              );
            }

            if (Math.abs(deltaX) > swipeThreshold) {
              if (deltaX > 0 && onMarkAsRead) {
                // Swipe right - mark as read (only if onMarkAsRead is provided)
                if (process.env.NODE_ENV === "development") {
                  console.log("Mouse swipe right - marking as read");
                }
                try {
                  // Trigger haptic feedback (will be ignored on desktop but works on mobile)
                  sdk.haptics?.impactOccurred?.("light");
                } catch (error) {
                  // Haptic not available, continue anyway
                }
                onMarkAsRead(detail);
              } else if (deltaX < 0 && onDiscard) {
                // Swipe left - discard (not interested)
                if (process.env.NODE_ENV === "development") {
                  console.log("Mouse swipe left - discarding cast");
                }
                try {
                  // Trigger haptic feedback (will be ignored on desktop but works on mobile)
                  sdk.haptics?.impactOccurred?.("medium");
                } catch (error) {
                  // Haptic not available, continue anyway
                }
                onDiscard(detail);
              }
            }
          }

          // Always clear everything and reset mouse state
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
        detail,
        clearLongPress,
      ]
    );

    // Global mouse up handler to catch mouse release outside the component
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

    const hasUserInteraction =
      detail.hasUserInteraction || detail.userLiked || detail.userRecasted;

    // Calculate transform based on drag
    const transform = isDragging ? `translateX(${dragOffset}px)` : "";

    // Render old design
    if (useOldDesign) {
      return (
        <button
          ref={cardRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={(e) => {
            // Only trigger onClick if not dragging
            if (!isDragging) {
              console.log("Card clicked - opening cast");
              onClick();
            }
          }}
          className={`
            relative isolate flex flex-col gap-6
            w-full
            rounded-2xl p-8 shadow-xl ring-1 ring-white/10
            bg-gradient-to-br from-white/15 to-white/10 backdrop-blur-lg overflow-hidden
            transition-all duration-300 ease-out
            focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
            group
            swipe-enabled
            ${
              isSwipeModeActive
                ? "ring-2 ring-yellow-400/60 shadow-2xl shadow-yellow-500/20 scale-[1.02]"
                : hasUserInteraction
                ? "bg-gradient-to-br from-white/20 to-white/15 ring-2 ring-blue-400/40 shadow-2xl hover:shadow-blue-500/20 hover:scale-[1.02] hover:-translate-y-1"
                : "hover:bg-gradient-to-br hover:from-white/18 hover:to-white/12 hover:scale-[1.01] hover:-translate-y-0.5"
            }
          `}
          style={{ transform }}
        >
          {/* Swipe Action Indicators - delayed by 1500ms */}
          {showSwipeActions && (
            <>
              {onMarkAsRead && (
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-green-500/20 flex items-center justify-center rounded-l-2xl">
                  <div className="text-green-400 text-sm font-medium">
                    Mark Read
                  </div>
                </div>
              )}
              {onDiscard && (
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-red-500/20 flex items-center justify-center rounded-r-2xl">
                  <div className="text-red-400 text-sm font-medium">
                    Discard
                  </div>
                </div>
              )}
            </>
          )}

          {/* Enhanced 3D effect for cards with interactions */}
          {hasUserInteraction && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl pointer-events-none" />
          )}

          {/* Header Section */}
          <div className="z-10 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <Image
                  src={`/api/image-proxy?url=${detail.avatarUrl}`}
                  alt={`${detail.username}'s avatar`}
                  width={48}
                  height={48}
                  className="rounded-full border-2 border-white/20"
                />
                {/* Interaction indicator */}
                {hasUserInteraction && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-zinc-900 flex items-center justify-center">
                    <svg
                      width={8}
                      height={8}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-white"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div
                  onClick={handleProfileClick}
                  className="text-white font-semibold leading-tight text-lg hover:text-blue-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded flex items-center gap-1 truncate cursor-pointer"
                  aria-label={`View @${detail.username}'s profile`}
                >
                  @{detail.username}
                  <svg
                    width={14}
                    height={14}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-60 flex-shrink-0"
                    aria-hidden="true"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </div>
                <div
                  onClick={handleProfileClick}
                  className="text-white/70 text-sm hover:text-blue-300/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded flex items-center gap-1 cursor-pointer"
                  aria-label={`View FID ${detail.authorFid}'s profile`}
                >
                  FID: {detail.authorFid}
                  <svg
                    width={12}
                    height={12}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-60"
                    aria-hidden="true"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Time and OpenRank */}
            <div className="flex flex-col items-end gap-1 text-right">
              <div className="text-white/60 text-sm">{detail.timeAgo}</div>
              {openRank !== null && openRank !== undefined && (
                <div className="flex items-center gap-1">
                  <svg
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-yellow-400"
                    aria-hidden="true"
                  >
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                  <span className="text-yellow-400 font-bold text-lg">
                    #{openRank.toLocaleString()}
                  </span>
                </div>
              )}
              {(openRank === null || openRank === undefined) && (
                <div className="flex items-center gap-1">
                  <svg
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white/40"
                    aria-hidden="true"
                  >
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                  <span className="text-white/40 text-sm">--</span>
                </div>
              )}
              {detail.userLiked && (
                <div className="flex items-center gap-1 text-xs text-red-400">
                  <svg
                    width={12}
                    height={12}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  Liked
                </div>
              )}
              {detail.userRecasted && (
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <svg
                    width={12}
                    height={12}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Recasted
                </div>
              )}
            </div>
          </div>

          {/* Cast Text */}
          <p className="z-10 text-white text-base leading-relaxed break-words whitespace-pre-wrap text-left">
            {detail.text}
          </p>

          {/* Footer */}
          <div className="z-10 flex items-center justify-between text-sm text-white/60">
            <div className="flex items-center gap-4">
              <span>Replies: {detail.replyCount}</span>
              {detail.likesCount !== undefined && detail.likesCount > 0 && (
                <div className="flex items-center gap-1">
                  <svg
                    width={12}
                    height={12}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-red-400"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span>{detail.likesCount}</span>
                </div>
              )}
              {detail.recastsCount !== undefined && detail.recastsCount > 0 && (
                <div className="flex items-center gap-1">
                  <svg
                    width={12}
                    height={12}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-green-400"
                  >
                    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>{detail.recastsCount}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {hasUserInteraction && (
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                    isDarkTheme
                      ? "bg-blue-500/20 text-blue-300"
                      : "bg-purple-100 text-purple-700"
                  }`}
                >
                  <svg
                    width={10}
                    height={10}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  You interacted
                </div>
              )}
            </div>
          </div>
        </button>
      );
    }

    // Render new design
    return (
      <button
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={(e) => {
          // Only trigger onClick if not dragging
          if (!isDragging) {
            console.log("Card clicked (new design) - opening cast");
            onClick();
          }
        }}
        className={`relative w-full text-left p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 swipe-enabled ${
          isSwipeModeActive
            ? "ring-2 ring-yellow-400/60 shadow-2xl shadow-yellow-500/20 scale-[1.02]"
            : hasUserInteraction
            ? isDarkTheme
              ? "bg-gradient-to-br from-white/15 to-white/10 ring-2 ring-blue-400/40 shadow-xl shadow-blue-500/20 backdrop-blur-md border border-white/20"
              : "bg-gradient-to-br from-blue-50 to-purple-50 ring-2 ring-blue-400/30 shadow-xl shadow-blue-500/20"
            : isDarkTheme
            ? "bg-gradient-to-br from-white/12 to-white/8 backdrop-blur-md border border-white/15 hover:bg-gradient-to-br hover:from-white/15 hover:to-white/10 hover:shadow-lg hover:shadow-white/5"
            : "bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white/90"
        }`}
        style={{ transform }}
      >
        {/* Swipe Action Indicators - delayed by 1500ms */}
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

        {/* Enhanced 3D effect for cards with interactions */}
        {hasUserInteraction && (
          <div
            className={`absolute inset-0 rounded-2xl pointer-events-none ${
              isDarkTheme
                ? "bg-gradient-to-br from-blue-500/5 to-purple-500/5"
                : "bg-gradient-to-br from-blue-500/10 to-purple-500/10"
            }`}
          />
        )}

        {/* Header Section */}
        <div className="z-10 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <Image
                src={`/api/image-proxy?url=${detail.avatarUrl}`}
                alt={`${detail.username}'s avatar`}
                width={48}
                height={48}
                className="rounded-full border-2 border-white/20"
              />
              {/* Interaction indicator */}
              {hasUserInteraction && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-zinc-900 flex items-center justify-center">
                  <svg
                    width={8}
                    height={8}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-white"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <div
                onClick={handleProfileClick}
                className={`font-semibold leading-tight text-lg hover:text-blue-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded flex items-center gap-1 truncate cursor-pointer ${
                  isDarkTheme ? "text-white" : "text-gray-900"
                }`}
                aria-label={`View @${detail.username}'s profile`}
              >
                @{detail.username}
                <svg
                  width={14}
                  height={14}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-60 flex-shrink-0"
                  aria-hidden="true"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>
              <div
                onClick={handleProfileClick}
                className={`text-sm hover:text-blue-300/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded flex items-center gap-1 cursor-pointer ${
                  isDarkTheme ? "text-white/70" : "text-gray-600"
                }`}
                aria-label={`View FID ${detail.authorFid}'s profile`}
              >
                FID: {detail.authorFid}
                <svg
                  width={12}
                  height={12}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-60"
                  aria-hidden="true"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>
            </div>
          </div>

          {/* Time and OpenRank */}
          <div className="flex flex-col items-end gap-1 text-right">
            <div
              className={`text-sm ${
                isDarkTheme ? "text-white/60" : "text-gray-500"
              }`}
            >
              {detail.timeAgo}
            </div>
            {openRank !== null && openRank !== undefined && (
              <div className="flex items-center gap-1">
                <svg
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={
                    isDarkTheme ? "text-yellow-400" : "text-purple-700"
                  }
                  aria-hidden="true"
                >
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                </svg>
                <span
                  className={`font-bold text-lg ${
                    isDarkTheme ? "text-yellow-400" : "text-purple-700"
                  }`}
                >
                  #{openRank.toLocaleString()}
                </span>
              </div>
            )}
            {(openRank === null || openRank === undefined) && (
              <div className="flex items-center gap-1">
                <svg
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={isDarkTheme ? "text-white/40" : "text-gray-400"}
                  aria-hidden="true"
                >
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                </svg>
                <span
                  className={`text-sm ${
                    isDarkTheme ? "text-white/40" : "text-gray-400"
                  }`}
                >
                  --
                </span>
              </div>
            )}
            {detail.userLiked && (
              <div className="flex items-center gap-1 text-xs text-red-400">
                <svg
                  width={12}
                  height={12}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Liked
              </div>
            )}
            {detail.userRecasted && (
              <div className="flex items-center gap-1 text-xs text-green-400">
                <svg
                  width={12}
                  height={12}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Recasted
              </div>
            )}
          </div>
        </div>

        {/* Cast Text */}
        <p
          className={`z-10 pt-4 text-base leading-relaxed break-words whitespace-pre-wrap text-left ${
            isDarkTheme ? "text-white" : "text-gray-900"
          }`}
        >
          {detail.text}
        </p>

        {/* Footer */}
        <div
          className={`z-10 flex items-center justify-between text-sm ${
            isDarkTheme ? "text-white/60" : "text-gray-500"
          }`}
        >
          <div className="flex items-center gap-4">
            <span>Replies: {detail.replyCount}</span>
            {detail.likesCount !== undefined && detail.likesCount > 0 && (
              <div className="flex items-center gap-1">
                <svg
                  width={12}
                  height={12}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-red-400"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span>{detail.likesCount}</span>
              </div>
            )}
            {detail.recastsCount !== undefined && detail.recastsCount > 0 && (
              <div className="flex items-center gap-1">
                <svg
                  width={12}
                  height={12}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-green-400"
                >
                  <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>{detail.recastsCount}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasUserInteraction && (
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                  isDarkTheme
                    ? "bg-blue-500/20 text-blue-300"
                    : "bg-purple-100 text-purple-700"
                }`}
              >
                <svg
                  width={10}
                  height={10}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                You interacted
              </div>
            )}
          </div>
        </div>
      </button>
    );
  }
);

ReplyCard.displayName = "ReplyCard";
