import React from "react";

interface ReputationBadgesProps {
  fid: number;
  openRankData?: Record<number, any>;
  quotientScores?: Record<number, any>;
  showLabels?: boolean;
  size?: "sm" | "md";
  className?: string;
  // Alternative data sources for FarcasterApp
  userOpenRank?: number | null;
  userQuotientScore?: number | null;
}

export function ReputationBadges({
  fid,
  openRankData,
  quotientScores,
  showLabels = true,
  size = "sm",
  className = "",
  userOpenRank,
  userQuotientScore,
}: ReputationBadgesProps) {
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-xs px-2 py-1",
  };

  // Try different data sources
  const engagementRank = openRankData?.[fid]?.engagement?.rank ?? userOpenRank;
  const followingRank = openRankData?.[fid]?.following?.rank;
  const quotientScore =
    quotientScores?.[fid]?.quotientScore ?? userQuotientScore;

  // Debug logging
  console.log("ReputationBadges debug:", {
    fid,
    openRankData: openRankData?.[fid],
    quotientScores: quotientScores?.[fid],
    userOpenRank,
    userQuotientScore,
    engagementRank,
    followingRank,
    quotientScore,
  });

  return (
    <div className={`flex flex-row items-center gap-1 ${className}`}>
      {/* Engagement Rank */}
      {engagementRank && (
        <span
          className={`${sizeClasses[size]} bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full`}
        >
          {showLabels ? "E: " : ""}#{engagementRank.toLocaleString()}
        </span>
      )}

      {/* Following Rank */}
      {followingRank && (
        <span
          className={`${sizeClasses[size]} bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full`}
        >
          {showLabels ? "F: " : ""}#{followingRank.toLocaleString()}
        </span>
      )}

      {/* Quotient Score */}
      {quotientScore && (
        <span
          className={`${sizeClasses[size]} bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full`}
        >
          {quotientScore.toFixed(2)}
        </span>
      )}
    </div>
  );
}
