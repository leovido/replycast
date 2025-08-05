import React from "react";
import { render, screen } from "@testing-library/react";
import { FocusTab } from "./FocusTab";

const mockMarkedAsReadConversations = [
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
];

const defaultProps = {
  markedAsReadConversations: mockMarkedAsReadConversations,
  viewMode: "list" as const,
  openRankRanks: { 12345: 1500, 67890: 2500 },
  loading: false,
  isLoadingMore: false,
  hasMore: false,
  observerRef: { current: null },
  onReply: jest.fn(),
  isDarkTheme: true,
  onMarkAsRead: jest.fn(),
  dayFilter: "today" as const,
};

describe("FocusTab", () => {
  it("renders focus conversations", () => {
    render(<FocusTab {...defaultProps} />);

    expect(screen.getByText("Focus")).toBeInTheDocument();
    expect(screen.getByText("2 focus conversations")).toBeInTheDocument();
    expect(screen.getByText("@testuser1")).toBeInTheDocument();
    expect(screen.getByText("@testuser2")).toBeInTheDocument();
  });

  it("shows empty state when no conversations", () => {
    render(<FocusTab {...defaultProps} markedAsReadConversations={[]} />);

    expect(screen.getByText("Focus")).toBeInTheDocument();
    expect(screen.getByText("0 focus conversations")).toBeInTheDocument();
    expect(screen.getByText("No focus conversations yet")).toBeInTheDocument();
    expect(screen.getByText("Mark conversations as read to see them here")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(<FocusTab {...defaultProps} loading={true} />);

    expect(screen.getByText("Loading focus conversations...")).toBeInTheDocument();
  });

  it("applies dark theme styling", () => {
    render(<FocusTab {...defaultProps} isDarkTheme={true} />);

    const container = screen.getByText("Focus").closest("div");
    expect(container).toHaveClass("text-white");
  });

  it("applies light theme styling", () => {
    render(<FocusTab {...defaultProps} isDarkTheme={false} />);

    const container = screen.getByText("Focus").closest("div");
    expect(container).toHaveClass("text-gray-900");
  });

  it("displays correct conversation count", () => {
    render(<FocusTab {...defaultProps} markedAsReadConversations={mockMarkedAsReadConversations} />);

    expect(screen.getByText("2 focus conversations")).toBeInTheDocument();
  });

  it("displays single conversation count correctly", () => {
    render(<FocusTab {...defaultProps} markedAsReadConversations={[mockMarkedAsReadConversations[0]]} />);

    expect(screen.getByText("1 focus conversation")).toBeInTheDocument();
  });

  it("passes correct props to ConversationList", () => {
    const mockOnReply = jest.fn();
    const mockOnMarkAsRead = jest.fn();
    
    render(
      <FocusTab 
        {...defaultProps} 
        onReply={mockOnReply}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    // The ConversationList should be rendered with the marked as read conversations
    expect(screen.getByText("@testuser1")).toBeInTheDocument();
    expect(screen.getByText("@testuser2")).toBeInTheDocument();
  });

  it("handles grid view mode", () => {
    render(<FocusTab {...defaultProps} viewMode="grid" />);

    // Should still render the conversations
    expect(screen.getByText("@testuser1")).toBeInTheDocument();
    expect(screen.getByText("@testuser2")).toBeInTheDocument();
  });
}); 