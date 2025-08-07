// Swipe Debug Script - Add this to production to debug touch events
// Usage: Add <script src="/swipe-debug.js"></script> in production to debug

(function () {
  console.log("🔍 Swipe Debug Script Loaded");

  let touchDebugOverlay;

  function createDebugOverlay() {
    touchDebugOverlay = document.createElement("div");
    touchDebugOverlay.id = "touch-debug-overlay";
    touchDebugOverlay.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 10px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      max-width: 300px;
      pointer-events: none;
    `;
    document.body.appendChild(touchDebugOverlay);
  }

  function updateDebugInfo(info) {
    if (!touchDebugOverlay) createDebugOverlay();

    // Detect iframe/WebView environment
    const isInIframe = window !== window.parent || window.frameElement !== null;
    const isWebView = /WebView|wv/.test(navigator.userAgent);
    const isFarcaster = /Farcaster/i.test(navigator.userAgent);

    // Check if any swipe elements are in active mode
    const swipeModeActive = document.querySelector(".swipe-mode-active")
      ? "✅"
      : "❌";

    touchDebugOverlay.innerHTML = `
      <div><strong>Swipe Debug (iOS-style)</strong></div>
      <div>Env: ${process?.env?.NODE_ENV || "production"}</div>
      <div>Iframe: ${isInIframe ? "✅" : "❌"}</div>
      <div>WebView: ${isWebView ? "✅" : "❌"}</div>
      <div>Farcaster: ${isFarcaster ? "✅" : "❌"}</div>
                    <div>Long Press: 250ms to activate</div>
      <div>Swipe Mode: ${swipeModeActive}</div>
      <div>Time: ${new Date().toLocaleTimeString()}</div>
      <div>${info}</div>
    `;
  }

  // Listen for touch events on swipe-enabled elements
  document.addEventListener(
    "touchstart",
    function (e) {
      const target = e.target.closest(".swipe-enabled");
      if (target) {
        updateDebugInfo(`👆 Long Press Started (250ms timer)`);
        console.log(
          "🔍 Touch Start - Long Press Timer:",
          e.touches[0].clientX,
          e.touches[0].clientY
        );
      }
    },
    { passive: true }
  );

  // Listen for mouse events on swipe-enabled elements (for desktop)
  document.addEventListener(
    "mousedown",
    function (e) {
      const target = e.target.closest(".swipe-enabled");
      if (target) {
        updateDebugInfo(`🖱️ Long Press Started (desktop 250ms timer)`);
        console.log(
          "🔍 Mouse Down - Long Press Timer:",
          e.clientX,
          e.clientY,
          "Button:",
          e.button
        );
      }
    },
    { passive: true }
  );

  document.addEventListener(
    "touchmove",
    function (e) {
      const target = e.target.closest(".swipe-enabled");
      if (target) {
        updateDebugInfo(`👉 Touch Move (may cancel long press)`);
        console.log("🔍 Touch Move:", e.touches[0].clientX);
      }
    },
    { passive: true }
  );

  document.addEventListener(
    "mousemove",
    function (e) {
      const target = e.target.closest(".swipe-enabled");
      if (target && e.buttons === 1) {
        // Only when left mouse button is held
        updateDebugInfo(`🖱️ Mouse Move detected (desktop)`);
        console.log("🔍 Mouse Move:", e.clientX);
      }
    },
    { passive: true }
  );

  document.addEventListener(
    "touchend",
    function (e) {
      const target = e.target.closest(".swipe-enabled");
      if (target) {
        updateDebugInfo(`✋ Touch End detected`);
        console.log("🔍 Touch End");
      }
    },
    { passive: true }
  );

  document.addEventListener(
    "mouseup",
    function (e) {
      const target = e.target.closest(".swipe-enabled");
      if (target) {
        updateDebugInfo(`🖱️ Mouse Up detected (desktop)`);
        console.log("🔍 Mouse Up");
      }
    },
    { passive: true }
  );

  // Test touch-action support
  const testEl = document.createElement("div");
  testEl.style.touchAction = "pan-x";
  const touchActionSupported = testEl.style.touchAction === "pan-x";

  console.log("🔍 Touch Action Support:", touchActionSupported);
  updateDebugInfo(`Touch Action: ${touchActionSupported ? "✅" : "❌"}`);

  // Show all swipe-enabled elements
  const swipeElements = document.querySelectorAll(".swipe-enabled");
  console.log("🔍 Swipe-enabled elements found:", swipeElements.length);

  swipeElements.forEach((el, i) => {
    el.style.outline = "2px dashed rgba(0,255,0,0.5)";
    console.log(`🔍 Swipe element ${i}:`, el);
  });
})();
