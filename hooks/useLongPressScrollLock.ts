"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type Options = {
  /** How long to hold before we treat it as a long-press (ms) */
  threshold?: number;
  /** Whether to block all scrolling or just vertical scrolling */
  blockVerticalOnly?: boolean;
  /** Custom CSS class to apply when active */
  activeClass?: string;
};

export function useLongPressScrollLock(options: Options = {}) {
  const {
    threshold = 250,
    blockVerticalOnly = true,
    activeClass = "long-press-active",
  } = options;

  const [active, setActive] = useState(false);
  const timerRef = useRef<number | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  const start = useCallback(
    (e: React.PointerEvent) => {
      if (timerRef.current) window.clearTimeout(timerRef.current);

      // Store starting position for movement detection
      startPosRef.current = { x: e.clientX, y: e.clientY };

      timerRef.current = window.setTimeout(() => setActive(true), threshold);
    },
    [threshold]
  );

  const stop = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    setActive(false);
    startPosRef.current = null;
  }, []);

  // Enhanced scroll blocking with movement detection
  useEffect(() => {
    if (!active) return;

    const html = document.documentElement;
    const body = document.body;

    // Add classes to both html and body for better compatibility
    html.classList.add("overflow-hidden", activeClass);
    body.classList.add("overflow-hidden", activeClass);

    // Block touch scrolling with movement detection
    const blockTouchMove = (e: TouchEvent) => {
      if (!startPosRef.current) return;

      const touch = e.touches[0];
      if (!touch) return;

      const deltaX = touch.clientX - startPosRef.current.x;
      const deltaY = touch.clientY - startPosRef.current.y;

      if (blockVerticalOnly) {
        // Only block vertical scrolling, allow horizontal
        if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 5) {
          e.preventDefault();
        }
      } else {
        // Block all scrolling
        e.preventDefault();
      }
    };

    // Block wheel scrolling (mouse wheel, trackpad)
    const blockWheel = (e: WheelEvent) => {
      if (blockVerticalOnly) {
        // Only block vertical scrolling
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
        }
      } else {
        // Block all scrolling
        e.preventDefault();
      }
    };

    // Block keyboard scrolling (arrow keys, space, etc.)
    const blockKeyDown = (e: KeyboardEvent) => {
      const scrollKeys = [
        "ArrowUp",
        "ArrowDown",
        "PageUp",
        "PageDown",
        "Home",
        "End",
        " ",
      ];
      if (scrollKeys.includes(e.key)) {
        e.preventDefault();
      }
    };

    // Add event listeners with passive: false for better control
    window.addEventListener("touchmove", blockTouchMove, { passive: false });
    window.addEventListener("wheel", blockWheel, { passive: false });
    window.addEventListener("keydown", blockKeyDown);

    return () => {
      html.classList.remove("overflow-hidden", activeClass);
      body.classList.remove("overflow-hidden", activeClass);
      window.removeEventListener("touchmove", blockTouchMove as any);
      window.removeEventListener("wheel", blockWheel);
      window.removeEventListener("keydown", blockKeyDown);
    };
  }, [active, activeClass, blockVerticalOnly]);

  return {
    active,
    bind: {
      onPointerDown: start,
      onPointerUp: stop,
      onPointerCancel: stop,
      onPointerLeave: stop,
    } as React.HTMLAttributes<HTMLElement>,
    // Expose manual control methods
    start,
    stop,
  };
}
