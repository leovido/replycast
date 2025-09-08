import React from "react";

interface ScoreExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkTheme: boolean;
}

export function ScoreExplanationModal({
  isOpen,
  onClose,
  isDarkTheme,
}: ScoreExplanationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onClose();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />

      {/* Modal Content */}
      <div
        className={`relative w-full max-w-md rounded-2xl p-6 shadow-2xl ${
          isDarkTheme
            ? "bg-gray-900 border border-gray-700"
            : "bg-white border border-gray-200"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isDarkTheme
                  ? "bg-purple-600 text-white"
                  : "bg-purple-100 text-purple-600"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h2
                className={`text-xl font-bold ${
                  isDarkTheme ? "text-white" : "text-gray-900"
                }`}
              >
                What&apos;s New
              </h2>
              <p
                className={`text-sm ${
                  isDarkTheme ? "text-white/60" : "text-gray-500"
                }`}
              >
                Introducing reputation scoring
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-opacity-10 ${
              isDarkTheme
                ? "text-white hover:bg-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Feature Introduction */}
          <div
            className={`p-4 rounded-xl ${
              isDarkTheme
                ? "bg-purple-900/20 border border-purple-800/30"
                : "bg-purple-50 border border-purple-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isDarkTheme
                    ? "bg-purple-600 text-white"
                    : "bg-purple-100 text-purple-600"
                }`}
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3
                  className={`font-semibold mb-2 ${
                    isDarkTheme ? "text-white" : "text-gray-900"
                  }`}
                >
                  New: Reputation Scoring System
                </h3>
                <p
                  className={`text-sm leading-relaxed ${
                    isDarkTheme ? "text-white/80" : "text-gray-600"
                  }`}
                >
                  We&apos;ve added comprehensive reputation metrics to help you
                  understand your influence and engagement quality on Farcaster.
                  Track your progress with real-time scores from trusted data
                  sources.
                </p>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-4">
            <h4
              className={`text-sm font-semibold ${
                isDarkTheme ? "text-white" : "text-gray-900"
              }`}
            >
              What you can now track:
            </h4>

            {/* Following Score Feature */}
            <div className="flex items-start gap-3">
              <div
                className={`px-3 py-1.5 rounded-full text-sm font-medium flex-shrink-0 ${
                  isDarkTheme
                    ? "bg-yellow-900/30 text-yellow-300"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                F: #27
              </div>
              <div>
                <p
                  className={`font-medium text-sm ${
                    isDarkTheme ? "text-white" : "text-gray-900"
                  }`}
                >
                  Following Score
                </p>
                <p
                  className={`text-xs mt-1 ${
                    isDarkTheme ? "text-white/70" : "text-gray-600"
                  }`}
                >
                  Track how many important people follow you. Quality over
                  quantity - lower is better.
                </p>
              </div>
            </div>

            {/* Engagement Score Feature */}
            <div className="flex items-start gap-3">
              <div
                className={`px-3 py-1.5 rounded-full text-sm font-medium flex-shrink-0 ${
                  isDarkTheme
                    ? "bg-yellow-900/30 text-yellow-300"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                E: #42
              </div>
              <div>
                <p
                  className={`font-medium text-sm ${
                    isDarkTheme ? "text-white" : "text-gray-900"
                  }`}
                >
                  Engagement Score
                </p>
                <p
                  className={`text-xs mt-1 ${
                    isDarkTheme ? "text-white/70" : "text-gray-600"
                  }`}
                >
                  See who actually pays attention and interacts with your
                  content.
                </p>
              </div>
            </div>

            {/* Quotient Score Feature */}
            <div className="flex items-start gap-3">
              <div
                className={`px-3 py-1.5 rounded-full text-sm font-medium flex-shrink-0 ${
                  isDarkTheme
                    ? "bg-blue-900/30 text-blue-300"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                0.85
              </div>
              <div>
                <p
                  className={`font-medium text-sm ${
                    isDarkTheme ? "text-white" : "text-gray-900"
                  }`}
                >
                  Reputation Score
                </p>
                <p
                  className={`text-xs mt-1 ${
                    isDarkTheme ? "text-white/70" : "text-gray-600"
                  }`}
                >
                  Combined reputation metric. Closer to 1.00 = more reputable.
                </p>
              </div>
            </div>
          </div>

          {/* Learn More Links */}
          <div
            className={`pt-4 border-t ${
              isDarkTheme ? "border-white/10" : "border-gray-200"
            }`}
          >
            <p
              className={`text-xs mb-3 ${
                isDarkTheme ? "text-white/60" : "text-gray-500"
              }`}
            >
              Learn more about our data sources:
            </p>
            <div className="flex gap-4">
              <a
                href="https://openrank.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`text-xs underline hover:no-underline ${
                  isDarkTheme ? "text-blue-400" : "text-blue-600"
                }`}
              >
                Open Rank →
              </a>
              <a
                href="https://www.quotient.social/"
                target="_blank"
                rel="noopener noreferrer"
                className={`text-xs underline hover:no-underline ${
                  isDarkTheme ? "text-blue-400" : "text-blue-600"
                }`}
              >
                Quotient →
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={onClose}
            className={`text-sm underline hover:no-underline ${
              isDarkTheme ? "text-white/60" : "text-gray-500"
            }`}
          >
            Don&apos;t show again
          </button>
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isDarkTheme
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "bg-purple-600 hover:bg-purple-700 text-white"
            }`}
          >
            Start exploring
          </button>
        </div>
      </div>
    </div>
  );
}
