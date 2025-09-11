import React from "react";
import { render, screen, within } from "@testing-library/react";
import { AnalyticsTab } from "./AnalyticsTab";

const mockAllConversations = [
  {
    username: "testuser1",
    timeAgo: "2h",
    castUrl: "https://farcaster.xyz/cast/123",
    text: "This is a test reply",
    avatarUrl: "https://example.com/avatar1.jpg",
    castHash: "0x123",
    authorFid: 12345,
    originalCastText: "Original cast text",
    originalCastHash: "0x456",
    originalAuthorUsername: "originaluser",
    replyCount: 5,
  },
  {
    username: "testuser2",
    timeAgo: "1h",
    castUrl: "https://farcaster.xyz/cast/456",
    text: "Another test reply",
    avatarUrl: "https://example.com/avatar2.jpg",
    castHash: "0x789",
    authorFid: 67890,
    originalCastText: "Another original cast",
    originalCastHash: "0xabc",
    originalAuthorUsername: "anotheruser",
    replyCount: 3,
  },
  {
    username: "testuser3",
    timeAgo: "3h",
    castUrl: "https://farcaster.xyz/cast/789",
    text: "Third test reply",
    avatarUrl: "https://example.com/avatar3.jpg",
    castHash: "0xdef",
    authorFid: 11111,
    originalCastText: "Third original cast",
    originalCastHash: "0xghi",
    originalAuthorUsername: "thirduser",
    replyCount: 1,
  },
];

const mockOpenRankData = {
  12345: {
    following: { rank: 1500, score: 0.5, percentile: 99 },
    engagement: { rank: 1400, score: 0.6, percentile: 99 },
  },
  67890: {
    following: { rank: 2500, score: 0.4, percentile: 98 },
    engagement: { rank: 2400, score: 0.5, percentile: 98 },
  },
  11111: {
    following: { rank: 3500, score: 0.3, percentile: 97 },
    engagement: { rank: 3400, score: 0.4, percentile: 97 },
  },
};

const defaultProps = {
  allConversations: mockAllConversations,
  userOpenRank: 2000,
  userQuotientScore: 0.85,
  openRankData: mockOpenRankData,
  isDarkTheme: true,
  themeMode: "Farcaster" as const,
};

describe("AnalyticsTab", () => {
  it("renders analytics overview", () => {
    render(<AnalyticsTab {...defaultProps} />);

    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(
      screen.getByText("Insights about your unreplied conversations")
    ).toBeInTheDocument();
  });

  it("displays total conversations count", () => {
    render(<AnalyticsTab {...defaultProps} />);
    const heading = screen.getByText("Total Conversations");
    const card = heading.parentElement!.parentElement as HTMLElement;
    expect(within(card).getByText("3")).toBeInTheDocument();
    expect(
      within(card).getByText(/Unreplied conversations/i)
    ).toBeInTheDocument();
  });

  it("displays unique authors count", () => {
    render(<AnalyticsTab {...defaultProps} />);
    const heading = screen.getByText(/Unique Authors/i);
    const card = heading.parentElement!.parentElement as HTMLElement;
    expect(within(card).getByText("3")).toBeInTheDocument();
    expect(
      within(card).getByText(/Different users to reply to/i)
    ).toBeInTheDocument();
  });

  it("displays average engagement rank", () => {
    render(<AnalyticsTab {...defaultProps} />);
    const heading = screen.getByText(/Avg Engagement Rank/i);
    const card = heading.parentElement!.parentElement as HTMLElement;
    // Average engagement rank: (1400 + 2400 + 3400) / 3 = 2400
    expect(within(card).getByText(/#\s*2,400/)).toBeInTheDocument();
  });

  it("displays average following rank", () => {
    render(<AnalyticsTab {...defaultProps} />);
    const heading = screen.getByText(/Avg Following Rank/i);
    const card = heading.parentElement!.parentElement as HTMLElement;
    // Average following rank: (1500 + 2500 + 3500) / 3 = 2500
    expect(within(card).getByText(/#\s*2,500/)).toBeInTheDocument();
  });

  it("displays user's reputation with OpenRank and Quotient scores", () => {
    render(
      <AnalyticsTab
        {...defaultProps}
        userOpenRank={2000}
        userQuotientScore={0.85}
      />
    );

    expect(screen.getByText("#2,000")).toBeInTheDocument();
    expect(screen.getByText("85")).toBeInTheDocument();
    expect(screen.getByText("Your Reputation")).toBeInTheDocument();
    expect(screen.getByText("Engagement Rank")).toBeInTheDocument();
    expect(screen.getByText("Quotient Score")).toBeInTheDocument();
  });

  it("handles null user reputation", () => {
    render(
      <AnalyticsTab
        {...defaultProps}
        userOpenRank={null}
        userQuotientScore={null}
      />
    );

    // When both are null, the entire "Your Reputation" section is hidden
    expect(screen.queryByText("Your Reputation")).not.toBeInTheDocument();
  });

  it("displays top authors by engagement rank", () => {
    render(<AnalyticsTab {...defaultProps} />);

    expect(
      screen.getByText("Top Authors by Engagement Rank")
    ).toBeInTheDocument();
    expect(screen.getByText("@testuser1")).toBeInTheDocument();
    expect(screen.getByText("@testuser2")).toBeInTheDocument();
    expect(screen.getByText("@testuser3")).toBeInTheDocument();
  });

  it("shows author FIDs", () => {
    render(<AnalyticsTab {...defaultProps} />);

    expect(screen.getByText("FID: 12345")).toBeInTheDocument();
    expect(screen.getByText("FID: 67890")).toBeInTheDocument();
    expect(screen.getByText("FID: 11111")).toBeInTheDocument();
  });

  it("applies dark theme styling", () => {
    render(<AnalyticsTab {...defaultProps} isDarkTheme={true} />);

    const heading = screen.getByText("Analytics");
    expect(heading).toHaveClass("text-lg", "font-semibold");
  });

  it("applies light theme styling", () => {
    render(<AnalyticsTab {...defaultProps} isDarkTheme={false} />);

    const heading = screen.getByText("Analytics");
    expect(heading).toHaveClass("text-lg", "font-semibold");
  });

  it("handles empty conversations", () => {
    render(<AnalyticsTab {...defaultProps} allConversations={[]} />);
    const totalHeading = screen.getByText("Total Conversations");
    const totalCard = totalHeading.parentElement!.parentElement as HTMLElement;
    expect(within(totalCard).getByText("0")).toBeInTheDocument();
    expect(
      within(totalCard).getByText(/Unreplied conversations/i)
    ).toBeInTheDocument();

    const uniqueHeading = screen.getByText(/Unique Authors/i);
    const uniqueCard = uniqueHeading.parentElement!
      .parentElement as HTMLElement;
    expect(within(uniqueCard).getByText("0")).toBeInTheDocument();
    expect(
      within(uniqueCard).getByText(/Different users to reply to/i)
    ).toBeInTheDocument();

    const avgEngagementHeading = screen.getByText(/Avg Engagement Rank/i);
    const avgEngagementCard = avgEngagementHeading.parentElement!
      .parentElement as HTMLElement;
    expect(within(avgEngagementCard).getByText(/#\s*0/)).toBeInTheDocument();

    const avgFollowingHeading = screen.getByText(/Avg Following Rank/i);
    const avgFollowingCard = avgFollowingHeading.parentElement!
      .parentElement as HTMLElement;
    expect(within(avgFollowingCard).getByText(/#\s*0/)).toBeInTheDocument();
  });

  it("calculates average ranks correctly", () => {
    render(<AnalyticsTab {...defaultProps} />);

    // Average engagement rank: (1400 + 2400 + 3400) / 3 = 2400
    expect(screen.getAllByText("#2,400").length).toBeGreaterThan(0);
    // Average following rank: (1500 + 2500 + 3500) / 3 = 2500
    expect(screen.getAllByText("#2,500").length).toBeGreaterThan(0);
  });

  it("sorts top authors by engagement rank", () => {
    render(<AnalyticsTab {...defaultProps} />);

    // Should be sorted by engagement rank (lowest rank first, since lower numbers are better)
    const authors = screen.getAllByText(/@testuser/);
    expect(authors[0]).toHaveTextContent("@testuser1"); // 1400 (best engagement rank)
    expect(authors[1]).toHaveTextContent("@testuser2"); // 2400
    expect(authors[2]).toHaveTextContent("@testuser3"); // 3400 (worst engagement rank)
  });
});
