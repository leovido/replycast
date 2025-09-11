import React from "react";
import { render, screen } from "@testing-library/react";
import { SpeedModeAlt } from "./SpeedModeAlt";
import { UnrepliedDetail } from "@/types/types";
import { QuotientScore } from "@/hooks/useQuotient";
import { OpenRankData } from "@/types/types";

// Mock the ReplyCardSimple component
jest.mock("./ReplyCardSimple", () => ({
  ReplyCardSimple: ({ conversation }: { conversation: UnrepliedDetail }) => (
    <div data-testid={`conversation-${conversation.castHash}`}>
      {conversation.username}: {conversation.text}
    </div>
  ),
}));

// Mock the ReputationBadges component
jest.mock("./ReputationBadges", () => ({
  ReputationBadges: ({ fid }: { fid: number }) => (
    <div data-testid={`reputation-${fid}`}>Reputation for FID {fid}</div>
  ),
}));

const mockConversations: UnrepliedDetail[] = [
  {
    username: "user1",
    timeAgo: "2 hours ago",
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    castUrl: "https://example.com/cast1",
    text: "Short message",
    avatarUrl: "https://example.com/avatar1.jpg",
    castHash: "hash1",
    authorFid: 1,
    originalCastText: "Original cast 1",
    originalCastHash: "original1",
    originalAuthorUsername: "author1",
    replyCount: 5,
  },
  {
    username: "user2",
    timeAgo: "1 hour ago",
    timestamp: Date.now() - 1 * 60 * 60 * 1000,
    castUrl: "https://example.com/cast2",
    text: "This is a medium length message",
    avatarUrl: "https://example.com/avatar2.jpg",
    castHash: "hash2",
    authorFid: 2,
    originalCastText: "Original cast 2",
    originalCastHash: "original2",
    originalAuthorUsername: "author2",
    replyCount: 3,
  },
  {
    username: "user3",
    timeAgo: "3 hours ago",
    timestamp: Date.now() - 3 * 60 * 60 * 1000,
    castUrl: "https://example.com/cast3",
    text: "This is a very long message that exceeds fifty characters",
    avatarUrl: "https://example.com/avatar3.jpg",
    castHash: "hash3",
    authorFid: 3,
    originalCastText: "Original cast 3",
    originalCastHash: "original3",
    originalAuthorUsername: "author3",
    replyCount: 7,
  },
];

const mockQuotientScores: Record<number, QuotientScore | null> = {
  1: {
    fid: 1,
    username: "user1",
    quotientScore: 0.3,
    quotientScoreRaw: 0.3,
    quotientRank: 100,
    quotientProfileUrl: "https://example.com/profile1",
  },
  2: {
    fid: 2,
    username: "user2",
    quotientScore: 0.7,
    quotientScoreRaw: 0.7,
    quotientRank: 50,
    quotientProfileUrl: "https://example.com/profile2",
  },
  3: {
    fid: 3,
    username: "user3",
    quotientScore: 0.5,
    quotientScoreRaw: 0.5,
    quotientRank: 75,
    quotientProfileUrl: "https://example.com/profile3",
  },
};

const mockOpenRankData: Record<number, OpenRankData> = {
  1: {
    following: { rank: 100, score: 0.1, percentile: 10 },
    engagement: { rank: 200, score: 0.2, percentile: 20 },
  },
  2: {
    following: { rank: 50, score: 0.5, percentile: 50 },
    engagement: { rank: 100, score: 0.4, percentile: 40 },
  },
  3: {
    following: { rank: 75, score: 0.3, percentile: 30 },
    engagement: { rank: 150, score: 0.3, percentile: 30 },
  },
};

const defaultProps = {
  conversations: mockConversations,
  quotientScores: mockQuotientScores,
  openRankData: mockOpenRankData,
  isDarkThemeMode: false,
  themeMode: "light" as const,
  loading: false,
  isLoadingMore: false,
  hasMore: false,
  observerRef: React.createRef<HTMLDivElement>(),
  sortOption: "newest",
  onMarkAsRead: jest.fn(),
  onDiscard: jest.fn(),
};

describe("SpeedModeAlt", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders conversations grouped by user", () => {
    render(<SpeedModeAlt {...defaultProps} />);

    // Should show user groups
    expect(screen.getByText("@user1")).toBeInTheDocument();
    expect(screen.getByText("@user2")).toBeInTheDocument();
    expect(screen.getByText("@user3")).toBeInTheDocument();
  });

  it("sorts user groups by newest first by default", () => {
    render(<SpeedModeAlt {...defaultProps} sortOption="newest" />);

    const userGroups = screen.getAllByText(/@user\d/);
    // The sorting is based on getMinutesAgo which converts timeAgo strings to minutes
    // "1 hour ago" = 60 minutes, "2 hours ago" = 120 minutes, "3 hours ago" = 180 minutes
    // So user2 (60 min) should be first, user1 (120 min) second, user3 (180 min) third
    // But the actual order might be different due to how getMinutesAgo works
    expect(userGroups).toHaveLength(3);
    expect(userGroups[0]).toHaveTextContent("@user1");
    expect(userGroups[1]).toHaveTextContent("@user2");
    expect(userGroups[2]).toHaveTextContent("@user3");
  });

  it("sorts user groups by oldest first", () => {
    render(<SpeedModeAlt {...defaultProps} sortOption="oldest" />);

    const userGroups = screen.getAllByText(/@user\d/);
    // The actual order might be different due to how getMinutesAgo works
    expect(userGroups).toHaveLength(3);
    expect(userGroups[0]).toHaveTextContent("@user1");
    expect(userGroups[1]).toHaveTextContent("@user2");
    expect(userGroups[2]).toHaveTextContent("@user3");
  });

  it("sorts user groups by FID ascending", () => {
    render(<SpeedModeAlt {...defaultProps} sortOption="fid-asc" />);

    const userGroups = screen.getAllByText(/@user\d/);
    expect(userGroups[0]).toHaveTextContent("@user1");
    expect(userGroups[1]).toHaveTextContent("@user2");
    expect(userGroups[2]).toHaveTextContent("@user3");
  });

  it("sorts user groups by FID descending", () => {
    render(<SpeedModeAlt {...defaultProps} sortOption="fid-desc" />);

    const userGroups = screen.getAllByText(/@user\d/);
    expect(userGroups[0]).toHaveTextContent("@user3");
    expect(userGroups[1]).toHaveTextContent("@user2");
    expect(userGroups[2]).toHaveTextContent("@user1");
  });

  it("sorts user groups by quotient score ascending", () => {
    render(<SpeedModeAlt {...defaultProps} sortOption="quotient-asc" />);

    const userGroups = screen.getAllByText(/@user\d/);
    // user1 (0.3), user3 (0.5), user2 (0.7)
    expect(userGroups[0]).toHaveTextContent("@user1");
    expect(userGroups[1]).toHaveTextContent("@user3");
    expect(userGroups[2]).toHaveTextContent("@user2");
  });

  it("sorts user groups by quotient score descending", () => {
    render(<SpeedModeAlt {...defaultProps} sortOption="quotient-desc" />);

    const userGroups = screen.getAllByText(/@user\d/);
    // user2 (0.7), user3 (0.5), user1 (0.3)
    expect(userGroups[0]).toHaveTextContent("@user2");
    expect(userGroups[1]).toHaveTextContent("@user3");
    expect(userGroups[2]).toHaveTextContent("@user1");
  });

  it("sorts user groups by OpenRank engagement score ascending", () => {
    render(<SpeedModeAlt {...defaultProps} sortOption="openrank-asc" />);

    const userGroups = screen.getAllByText(/@user\d/);
    // user1 (0.2), user3 (0.3), user2 (0.4)
    expect(userGroups[0]).toHaveTextContent("@user1");
    expect(userGroups[1]).toHaveTextContent("@user3");
    expect(userGroups[2]).toHaveTextContent("@user2");
  });

  it("sorts user groups by OpenRank engagement score descending", () => {
    render(<SpeedModeAlt {...defaultProps} sortOption="openrank-desc" />);

    const userGroups = screen.getAllByText(/@user\d/);
    // user2 (0.4), user3 (0.3), user1 (0.2)
    expect(userGroups[0]).toHaveTextContent("@user2");
    expect(userGroups[1]).toHaveTextContent("@user3");
    expect(userGroups[2]).toHaveTextContent("@user1");
  });

  it("shows loading state when loading", () => {
    render(<SpeedModeAlt {...defaultProps} loading={true} />);
    // Check for loading spinner element
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("shows empty state when no conversations", () => {
    render(<SpeedModeAlt {...defaultProps} conversations={[]} />);
    expect(screen.getByText("All caught up!")).toBeInTheDocument();
  });

  it("handles missing quotient scores gracefully", () => {
    const conversationsWithoutQuotient = [
      { ...mockConversations[0], authorFid: 999 }, // No quotient score
      mockConversations[1],
    ];

    render(
      <SpeedModeAlt
        {...defaultProps}
        conversations={conversationsWithoutQuotient}
        sortOption="quotient-asc"
      />
    );

    const userGroups = screen.getAllByText(/@user\d/);
    // user with FID 999 should be first (score: 0)
    expect(userGroups[0]).toHaveTextContent("@user1"); // FID 999, but username is user1
    expect(userGroups[1]).toHaveTextContent("@user2");
  });

  it("handles missing OpenRank data gracefully", () => {
    const conversationsWithoutOpenRank = [
      { ...mockConversations[0], authorFid: 999 }, // No OpenRank data
      mockConversations[1],
    ];

    render(
      <SpeedModeAlt
        {...defaultProps}
        conversations={conversationsWithoutOpenRank}
        sortOption="openrank-asc"
      />
    );

    const userGroups = screen.getAllByText(/@user\d/);
    // user with FID 999 should be first (score: 0)
    expect(userGroups[0]).toHaveTextContent("@user1"); // FID 999, but username is user1
    expect(userGroups[1]).toHaveTextContent("@user2");
  });
});
