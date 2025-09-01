import React from "react";
import type { ReplyTip } from "@/types/types";
import Image from "next/image";
import { useReplyTips } from "../hooks/useReplyTips";
import { LoadingScreen } from "./LoadingScreen";
import { EmptyState } from "./EmptyState";

interface TipsTabProps {
  user: { fid: number } | null;
  isDarkTheme: boolean;
  themeMode: "dark" | "light" | "Farcaster";
  useMockData?: boolean;
}

interface TipCardProps {
  tip: ReplyTip;
  isDarkTheme: boolean;
  themeMode: "dark" | "light" | "Farcaster";
}

function TipCard({ tip, isDarkTheme, themeMode }: TipCardProps) {
  const getCardClass = () => {
    switch (themeMode) {
      case "light":
        return "bg-white/80 backdrop-blur-md border border-gray-200 hover:border-gray-300";
      case "Farcaster":
        return "bg-purple-900/20 backdrop-blur-md border-2 border-purple-600/80 hover:border-purple-500/90 shadow-lg shadow-purple-900/20 hover:shadow-xl hover:shadow-purple-900/30";
      default:
        return "bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/30";
    }
  };

  const getTextClass = () => {
    return isDarkTheme ? "text-white" : "text-gray-900";
  };

  const getSubtextClass = () => {
    return isDarkTheme ? "text-white/60" : "text-gray-600";
  };

  const getAmountClass = () => {
    switch (themeMode) {
      case "light":
        return "text-green-600";
      case "Farcaster":
        return "text-purple-300";
      default:
        return "text-green-400";
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString();
  };

  return (
    <div
      className={`p-4 rounded-xl transition-all duration-200 ${getCardClass()}`}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
            {tip.authorPfpUrl ? (
              <Image
                src={tip.authorPfpUrl}
                alt={`${tip.authorUsername}'s avatar`}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {tip.authorUsername.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <span className={`font-semibold text-sm ${getTextClass()}`}>
                {tip.authorDisplayName || tip.authorUsername}
              </span>
              <span className={`text-xs ${getSubtextClass()}`}>
                @{tip.authorUsername}
              </span>
            </div>
            <div className={`text-lg font-bold ${getAmountClass()}`}>
              {formatAmount(tip.amount)} $REPLY
            </div>
          </div>

          <p className={`text-sm mb-2 line-clamp-2 ${getTextClass()}`}>
            {tip.castText}
          </p>

          <div className="flex items-center justify-between">
            <span className={`text-xs ${getSubtextClass()}`}>
              {formatTimeAgo(tip.timestamp)}
            </span>
            <a
              href={tip.castUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-xs ${getSubtextClass()} hover:underline`}
            >
              View Cast →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TipsTab({
  user,
  isDarkTheme,
  themeMode,
  useMockData = false,
}: TipsTabProps) {
  const {
    data,
    loading,
    error,
    isRefreshing,
    refreshData,
    getTotalReceived,
    getTotalGiven,
    getTotalReceivedToday,
    getTotalGivenToday,
    getTipsReceived,
    getTipsGiven,
  } = useReplyTips({ user, useMockData });

  const getCardClass = () => {
    switch (themeMode) {
      case "light":
        return "bg-white/80 backdrop-blur-md border border-gray-200";
      case "Farcaster":
        return "bg-purple-900/20 backdrop-blur-md border-2 border-purple-600/80 shadow-lg shadow-purple-900/20";
      default:
        return "bg-white/10 backdrop-blur-md border border-white/20";
    }
  };

  const getTextClass = () => {
    return isDarkTheme ? "text-white" : "text-gray-900";
  };

  const getSubtextClass = () => {
    return isDarkTheme ? "text-white/60" : "text-gray-600";
  };

  const getAccentClass = () => {
    switch (themeMode) {
      case "light":
        return "text-green-600";
      case "Farcaster":
        return "text-purple-300";
      default:
        return "text-green-400";
    }
  };

  const getSecondaryAccentClass = () => {
    switch (themeMode) {
      case "light":
        return "text-blue-600";
      case "Farcaster":
        return "text-purple-200";
      default:
        return "text-blue-400";
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="pb-20">
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
          <div className={`text-center ${getTextClass()}`}>
            <h3 className="text-lg font-semibold mb-2">Error Loading Tips</h3>
            <p className={`text-sm mb-4 ${getSubtextClass()}`}>{error}</p>
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className={`px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
            >
              {isRefreshing ? "Refreshing..." : "Try Again"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="pb-20">
        <EmptyState
          title="No Tips Data"
          description="Unable to load $REPLY tips data"
          themeMode={themeMode}
        />
      </div>
    );
  }

  const tipsReceived = getTipsReceived();
  const tipsGiven = getTipsGiven();
  const totalReceived = getTotalReceived();
  const totalGiven = getTotalGiven();
  const totalReceivedToday = getTotalReceivedToday();
  const totalGivenToday = getTotalGivenToday();

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="mb-6">
        <h2 className={`text-lg font-semibold mb-2 ${getTextClass()}`}>
          $REPLY Tips
        </h2>
        <p className={`text-sm ${getSubtextClass()}`}>
          Track your $REPLY token tips received and given
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 rounded-xl p-4">
        {/* Tips Received */}
        <div
          className={`p-4 rounded-xl ${getCardClass()} border border-purple-600/80 shadow-lg shadow-purple-900/20`}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-semibold ${getTextClass()}`}>Tips Received</h3>
            <svg
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={getTextClass()}
            >
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          </div>
          <div className={`text-2xl font-bold ${getAccentClass()}`}>
            {totalReceived.toLocaleString()} $REPLY
          </div>
          <p className={`text-sm ${getSubtextClass()}`}>Total received</p>
          <div
            className={`text-lg font-semibold mt-1 ${getSecondaryAccentClass()}`}
          >
            {totalReceivedToday.toLocaleString()} today
          </div>
        </div>

        {/* Tips Given */}
        <div
          className={`p-4 rounded-xl ${getCardClass()} border border-purple-600/80 shadow-lg shadow-purple-900/20`}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-semibold ${getTextClass()}`}>Tips Given</h3>
            <svg
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={getTextClass()}
            >
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          </div>
          <div className={`text-2xl font-bold ${getSecondaryAccentClass()}`}>
            {totalGiven.toLocaleString()} $REPLY
          </div>
          <p className={`text-sm ${getSubtextClass()}`}>Total given</p>
          <div className={`text-lg font-semibold mt-1 ${getAccentClass()}`}>
            {totalGivenToday.toLocaleString()} today
          </div>
        </div>
      </div>

      {/* Mini App Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* TIPN Card */}
        <div
          className={`p-4 rounded-xl ${getCardClass()} border border-purple-600/80 shadow-lg shadow-purple-900/20 cursor-pointer hover:scale-105 transition-transform duration-200`}
          onClick={() => window.open("https://tipnearn.com", "_blank")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              window.open("https://tipnearn.com", "_blank");
            }
          }}
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <img
                src="https://tipnearn.com/frame-image.png"
                alt="TIPN"
                className="w-12 h-12 rounded-lg object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold text-lg ${getTextClass()}`}>
                TIPN
              </h3>
              <p className={`text-sm ${getSubtextClass()}`}>
                Earn tips and rewards
              </p>
              <div className="flex items-center mt-2">
                <span className={`text-xs ${getSubtextClass()}`}>
                  Tap to open
                </span>
                <svg
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`ml-1 ${getSubtextClass()}`}
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15,3 21,3 21,9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* REPLY Card */}
        <div
          className={`p-4 rounded-xl ${getCardClass()} border border-purple-600/80 shadow-lg shadow-purple-900/20 cursor-pointer hover:scale-105 transition-transform duration-200`}
          onClick={() => window.open("https://reply-app.vercel.app", "_blank")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              window.open("https://reply-app.vercel.app", "_blank");
            }
          }}
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <img
                src="https://reply-app.vercel.app/reply-1024.png"
                alt="REPLY"
                className="w-12 h-12 rounded-lg object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold text-lg ${getTextClass()}`}>
                REPLY
              </h3>
              <p className={`text-sm ${getSubtextClass()}`}>
                Reply token platform
              </p>
              <div className="flex items-center mt-2">
                <span className={`text-xs ${getSubtextClass()}`}>
                  Tap to open
                </span>
                <svg
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`ml-1 ${getSubtextClass()}`}
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15,3 21,3 21,9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Lists */}
      <div className="space-y-6">
        {/* Tips Received Section */}
        <div>
          <h3 className={`text-md font-semibold mb-3 ${getTextClass()}`}>
            Tips Received ({tipsReceived.length})
          </h3>
          {tipsReceived.length > 0 ? (
            <div className="space-y-3">
              {tipsReceived.map((tip) => (
                <TipCard
                  key={tip.castHash}
                  tip={tip}
                  isDarkTheme={isDarkTheme}
                  themeMode={themeMode}
                />
              ))}
            </div>
          ) : (
            <div className={`text-center py-8 ${getSubtextClass()}`}>
              <p>No tips received yet</p>
            </div>
          )}
        </div>

        {/* Tips Given Section */}
        <div>
          <h3 className={`text-md font-semibold mb-3 ${getTextClass()}`}>
            Tips Given ({tipsGiven.length})
          </h3>
          {tipsGiven.length > 0 ? (
            <div className="space-y-3">
              {tipsGiven.map((tip) => (
                <TipCard
                  key={tip.castHash}
                  tip={tip}
                  isDarkTheme={isDarkTheme}
                  themeMode={themeMode}
                />
              ))}
            </div>
          ) : (
            <div className={`text-center py-8 ${getSubtextClass()}`}>
              <p>No tips given yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mt-8 text-center">
        <button
          onClick={refreshData}
          disabled={isRefreshing}
          className={`px-6 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
        >
          {isRefreshing ? "Refreshing..." : "Refresh Tips"}
        </button>
      </div>
    </div>
  );
}
