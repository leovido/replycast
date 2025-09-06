import React from "react";
import type { UnrepliedDetail, OpenRankData } from "@/types/types";
import Image from "next/image";
import type { ThemeMode } from "@/types/types";

interface AnalyticsTabProps {
  allConversations: UnrepliedDetail[];
  userOpenRank: number | null;
  userQuotientScore: number | null;
  openRankData: Record<number, OpenRankData>;
  isDarkTheme: boolean;
  themeMode: ThemeMode;
}

export function AnalyticsTab({
  allConversations,
  userOpenRank,
  userQuotientScore,
  openRankData,
  isDarkTheme,
  themeMode,
}: AnalyticsTabProps) {
  // Calculate analytics
  const totalConversations = allConversations.length;
  const uniqueAuthors = new Set(allConversations.map((c) => c.authorFid)).size;
  const averageEngagementRank =
    allConversations.reduce((sum, conv) => {
      const data = openRankData[conv.authorFid];
      const rank = data?.engagement?.rank;
      return sum + (rank || 0);
    }, 0) / totalConversations || 0;

  const averageFollowingRank =
    allConversations.reduce((sum, conv) => {
      const data = openRankData[conv.authorFid];
      const rank = data?.following?.rank;
      return sum + (rank || 0);
    }, 0) / totalConversations || 0;

  const getCardClass = () => {
    switch (themeMode) {
      case "light":
        return "bg-white/80 backdrop-blur-md border border-gray-200";
      case "neon":
        return "bg-pink-500/20 backdrop-blur-md border border-pink-500/40 shadow-lg shadow-pink-500/25";
      case "Farcaster":
        return "bg-purple-900/20 backdrop-blur-md border border-purple-800/30";
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
        return "text-blue-600";
      case "neon":
        return "text-pink-400";
      case "Farcaster":
        return "text-purple-300";
      default:
        return "text-blue-400";
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className={`text-lg font-semibold mb-2 ${getTextClass()}`}>
          Analytics
        </h2>
        <p className={`text-sm ${getSubtextClass()}`}>
          Insights about your unreplied conversations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Conversations */}
        <div className={`p-4 rounded-xl ${getCardClass()}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-semibold ${getTextClass()}`}>
              Total Conversations
            </h3>
            <svg
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className={getAccentClass()}
            >
              <path d="M22 4H2v16h20V4zM2 8h20" />
              <path d="M6 14h.01" />
              <path d="M10 14h.01" />
              <path d="M14 14h.01" />
              <path d="M18 14h.01" />
            </svg>
          </div>
          <div className={`text-2xl font-bold ${getAccentClass()}`}>
            {totalConversations.toLocaleString()}
          </div>
          <p className={`text-sm ${getSubtextClass()}`}>
            Unreplied conversations
          </p>
        </div>

        {/* Unique Authors */}
        <div className={`p-4 rounded-xl ${getCardClass()}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-semibold ${getTextClass()}`}>
              Unique Authors
            </h3>
            <svg
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className={getAccentClass()}
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="m22 21-2-2" />
              <path d="M16 16l4 4" />
            </svg>
          </div>
          <div className={`text-2xl font-bold ${getAccentClass()}`}>
            {uniqueAuthors.toLocaleString()}
          </div>
          <p className={`text-sm ${getSubtextClass()}`}>
            Different users to reply to
          </p>
        </div>

        {/* Average Engagement Rank */}
        <div className={`p-4 rounded-xl ${getCardClass()}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-semibold ${getTextClass()}`}>
              Avg Engagement Rank
            </h3>
            <svg
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className={getAccentClass()}
            >
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          </div>
          <div className={`text-2xl font-bold ${getAccentClass()}`}>
            #{Math.round(averageEngagementRank).toLocaleString()}
          </div>
          <p className={`text-sm ${getSubtextClass()}`}>
            Average engagement rank
          </p>
        </div>

        {/* Average Following Rank */}
        <div className={`p-4 rounded-xl ${getCardClass()}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-semibold ${getTextClass()}`}>
              Avg Following Rank
            </h3>
            <svg
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className={getAccentClass()}
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="m22 21-2-2" />
              <path d="M16 16l4 4" />
            </svg>
          </div>
          <div className={`text-2xl font-bold ${getAccentClass()}`}>
            #{Math.round(averageFollowingRank).toLocaleString()}
          </div>
          <p className={`text-sm ${getSubtextClass()}`}>
            Average following rank
          </p>
        </div>
      </div>

      {/* Your Reputation Scores */}
      {(userOpenRank !== null && userOpenRank !== undefined) ||
      (userQuotientScore !== null && userQuotientScore !== undefined) ? (
        <div className={`p-6 rounded-xl ${getCardClass()} mb-8`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${getTextClass()}`}>
              Your Reputation
            </h3>
            <div className="flex items-center gap-2">
              <svg
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="text-yellow-400"
              >
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
              <svg
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="text-purple-400"
              >
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            {userOpenRank !== null && userOpenRank !== undefined && (
              <div className="text-center">
                <div className={`text-3xl font-bold mb-1 ${getAccentClass()}`}>
                  #{userOpenRank.toLocaleString()}
                </div>
                <p className={`text-sm ${getSubtextClass()}`}>
                  Engagement Rank
                </p>
              </div>
            )}
            {userQuotientScore !== null && userQuotientScore !== undefined && (
              <div className="text-center">
                <div className={`text-3xl font-bold mb-1 text-purple-400`}>
                  {(userQuotientScore * 100).toFixed(0)}
                </div>
                <p className={`text-sm ${getSubtextClass()}`}>Quotient Score</p>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Top Authors by Engagement Rank */}
      <div className={`p-6 rounded-xl ${getCardClass()}`}>
        <h3 className={`text-lg font-semibold mb-4 ${getTextClass()}`}>
          Top Authors by Engagement Rank
        </h3>
        <div className="space-y-3">
          {allConversations
            .sort((a, b) => {
              const dataA = openRankData[a.authorFid];
              const dataB = openRankData[b.authorFid];
              const rankA = dataA?.engagement?.rank || 999999;
              const rankB = dataB?.engagement?.rank || 999999;
              return rankA - rankB;
            })
            .slice(0, 5)
            .map((conversation, index) => {
              const data = openRankData[conversation.authorFid];
              const engagementRank = data?.engagement?.rank;
              const followingRank = data?.following?.rank;

              if (!engagementRank) return null;

              return (
                <div
                  key={`${conversation.authorFid}-${index}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index < 3 ? getAccentClass() : getSubtextClass()
                      }`}
                    >
                      #{index + 1}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <Image
                          src={`/api/image-proxy?url=${conversation.avatarUrl}`}
                          alt={`${conversation.username}'s avatar`}
                          width={48}
                          height={48}
                          className="w-10 h-10 rounded-full border-2 border-white/20"
                          // Disable optimization to prevent multiple requests
                          unoptimized={true}
                          // Disable lazy loading for immediate display
                          priority={false}
                          loading="eager"
                        />
                      </div>
                      <div>
                        <div className={`font-medium ${getTextClass()}`}>
                          @{conversation.username}
                        </div>
                        <div className={`text-sm ${getSubtextClass()}`}>
                          FID: {conversation.authorFid}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${getAccentClass()}`}>
                      #{engagementRank.toLocaleString()}
                    </div>
                    <div className={`text-xs ${getSubtextClass()}`}>
                      Eng: #{engagementRank.toLocaleString()}
                    </div>
                    {followingRank && (
                      <div className={`text-xs ${getSubtextClass()}`}>
                        Fol: #{followingRank.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
