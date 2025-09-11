/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Instrument Sans", "Nunito", "Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "pulse-slow": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-delayed": "bounce 1s infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      colors: {
        primary: {
          50: "#f0f9ff",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        glass: {
          bg: "rgba(255, 255, 255, 0.1)",
          border: "rgba(255, 255, 255, 0.2)",
        },
        neon: {
          pink: "#ff0080",
          cyan: "#00ffff",
          pinkDark: "#cc0066",
          cyanDark: "#00cccc",
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
  // Performance optimizations
  corePlugins: {
    // Disable unused features for smaller bundle
    aspectRatio: false,
    backdropHueRotate: false,
    backdropInvert: false,
    backdropSepia: false,
    caretColor: false,
    fontVariantNumeric: false,
    isolation: false,
    mixBlendMode: false,
    scrollSnapType: false,
    touchAction: false,
  },
  // Optimize for production
  ...(process.env.NODE_ENV === "production" && {
    safelist: [
      // Keep essential animation classes
      "animate-bounce",
      "animate-pulse",
      "animate-spin",
      // Keep utility classes that might be dynamically added
      {
        pattern: /^(bg|text|border)-.*/,
      },
    ],
  }),
};
