import { memo } from "react";

// Memoized Loading Screen Component
export const LoadingScreen = memo(() => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center">
      <div className="text-center">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
            <svg
              width={32}
              height={32}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-center"
              aria-hidden="true"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        </div>

        {/* App Title */}
        <h1
          className="text-3xl font-black text-white mb-2 tracking-tight"
          style={{ fontFamily: "Instrument Sans, Nunito, Inter, sans-serif" }}
        >
          ReplyCast
        </h1>
        <p className="text-white/80 text-lg font-medium mb-8">
          Loading your conversations...
        </p>

        {/* Loading Animation */}
        <div className="flex justify-center space-x-2">
          <div
            className="w-3 h-3 bg-white/60 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-3 h-3 bg-white/60 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-3 h-3 bg-white/60 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>
    </div>
  );
});

LoadingScreen.displayName = "LoadingScreen";