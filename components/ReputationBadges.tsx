import React from "react";
import { Badge } from "./Badge";

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
  // Try different data sources
  const engagementRank = openRankData?.[fid]?.engagement?.rank ?? userOpenRank;
  const followingRank = openRankData?.[fid]?.following?.rank;
  const quotientScore =
    quotientScores?.[fid]?.quotientScore ?? userQuotientScore;

  return (
    <div className={`flex flex-row items-center gap-1 ${className}`}>
      {/* Engagement Rank */}
      {engagementRank && (
        <Badge variant="engagement" size={size} showLabel={showLabels}>
          #{engagementRank.toLocaleString()}
        </Badge>
      )}

      {/* Following Rank */}
      {followingRank && (
        <Badge variant="following" size={size} showLabel={showLabels}>
          #{followingRank.toLocaleString()}
        </Badge>
      )}

      {/* Quotient Score */}
      {quotientScore && (
        <Badge variant="quotient" size={size} showLabel={showLabels}>
          {quotientScore.toFixed(2)}
        </Badge>
      )}
    </div>
  );
}
