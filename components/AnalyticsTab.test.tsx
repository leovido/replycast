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

const mockOpenRankRanks = {
  12345: 1500,
  67890: 2500,
  11111: 3500,
};

const defaultProps = {
  allConversations: mockAllConversations,
  userOpenRank: 2000,
  openRankRanks: mockOpenRankRanks,
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
    expect(within(card).getByText(/Unreplied conversations/i)).toBeInTheDocument();
  });

  it("displays unique authors count", () => {
    render(<AnalyticsTab {...defaultProps} />);
    const heading = screen.getByText(/Unique Authors/i);
    const card = heading.parentElement!.parentElement as HTMLElement;
    expect(within(card).getByText("3")).toBeInTheDocument();
    expect(within(card).getByText(/Different users to reply to/i)).toBeInTheDocument();
  });

  it("displays average OpenRank", () => {
    render(<AnalyticsTab {...defaultProps} />);
    const heading = screen.getByText(/Avg OpenRank/i);
    const card = heading.parentElement!.parentElement as HTMLElement;
    expect(within(card).getByText(/#\s*2,500/)).toBeInTheDocument();
  });

  it("displays user's OpenRank", () => {
    render(<AnalyticsTab {...defaultProps} userOpenRank={2000} />);

    expect(screen.getByText("#2,000")).toBeInTheDocument();
    expect(screen.getByText("Your OpenRank")).toBeInTheDocument();
  });

  it("handles null user OpenRank", () => {
    render(<AnalyticsTab {...defaultProps} userOpenRank={null} />);

    // When null, the entire "Your OpenRank" section is hidden
    expect(screen.queryByText("Your OpenRank")).not.toBeInTheDocument();
  });

  it("displays top authors by OpenRank", () => {
    render(<AnalyticsTab {...defaultProps} />);

    expect(screen.getByText("Top Authors by OpenRank")).toBeInTheDocument();
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
    expect(within(totalCard).getByText(/Unreplied conversations/i)).toBeInTheDocument();

    const uniqueHeading = screen.getByText(/Unique Authors/i);
    const uniqueCard = uniqueHeading.parentElement!.parentElement as HTMLElement;
    expect(within(uniqueCard).getByText("0")).toBeInTheDocument();
    expect(within(uniqueCard).getByText(/Different users to reply to/i)).toBeInTheDocument();

    const avgHeading = screen.getByText(/Avg OpenRank/i);
    const avgCard = avgHeading.parentElement!.parentElement as HTMLElement;
    expect(within(avgCard).getByText(/#\s*0/)).toBeInTheDocument();
  });

  it("calculates average OpenRank correctly", () => {
    // Average of 1500, 2500, 3500 = 2500
    render(<AnalyticsTab {...defaultProps} />);

    expect(screen.getAllByText("#2,500").length).toBeGreaterThan(0);
  });

  it("sorts top authors by OpenRank", () => {
    render(<AnalyticsTab {...defaultProps} />);

    // Should be sorted by OpenRank (lowest rank first, since lower numbers are better)
    const authors = screen.getAllByText(/@testuser/);
    expect(authors[0]).toHaveTextContent("@testuser1"); // 1500 (best rank)
    expect(authors[1]).toHaveTextContent("@testuser2"); // 2500
    expect(authors[2]).toHaveTextContent("@testuser3"); // 3500 (worst rank)
  });
});
