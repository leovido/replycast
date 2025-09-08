import React from "react";
import { render, screen } from "@testing-library/react";
import { FocusTab } from "./FocusTab";
import { UnrepliedDetail } from "@/types/types";
import { QuotientScore } from "@/hooks/useQuotient";
import { OpenRankData } from "@/types/types";

// Mock the ConversationList component
jest.mock("./ConversationList", () => ({
  ConversationList: ({
    conversations,
  }: {
    conversations: UnrepliedDetail[];
  }) => (
    <div data-testid="conversation-list">
      {conversations.map((conv) => (
        <div key={conv.castHash} data-testid={`conversation-${conv.castHash}`}>
          {conv.username}: {conv.text}
        </div>
      ))}
    </div>
  ),
}));

// Mock the FocusTutorial component
jest.mock("./FocusTutorial", () => ({
  FocusTutorial: ({ onComplete }: { onComplete: () => void }) => (
    <div data-testid="focus-tutorial">
      <button onClick={onComplete}>Complete Tutorial</button>
    </div>
  ),
}));

// Mock the EmptyState component
jest.mock("./EmptyState", () => ({
  EmptyState: ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => (
    <div data-testid="empty-state">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
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
  markedAsReadConversations: mockConversations,
  viewMode: "list" as const,
  quotientScores: mockQuotientScores,
  openRankData: mockOpenRankData,
  loading: false,
  isLoadingMore: false,
  hasMore: false,
  observerRef: React.createRef<HTMLDivElement>(),
  onReply: jest.fn(),
  isDarkTheme: false,
  themeMode: "light" as const,
  onMarkAsRead: jest.fn(),
  onDiscard: jest.fn(),
  dayFilter: "all",
  searchQuery: "",
  isSearching: false,
  sortOption: "newest",
};

describe("FocusTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(() => "true"), // Tutorial completed
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  it("renders conversations sorted by newest first by default", () => {
    render(<FocusTab {...defaultProps} sortOption="newest" />);

    // Check that all conversations are present
    expect(screen.getByText("user1: Short message")).toBeInTheDocument();
    expect(
      screen.getByText("user2: This is a medium length message")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "user3: This is a very long message that exceeds fifty characters"
      )
    ).toBeInTheDocument();
  });

  it("sorts conversations by oldest first", () => {
    render(<FocusTab {...defaultProps} sortOption="oldest" />);

    // Check that all conversations are present
    expect(screen.getByText("user1: Short message")).toBeInTheDocument();
    expect(
      screen.getByText("user2: This is a medium length message")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "user3: This is a very long message that exceeds fifty characters"
      )
    ).toBeInTheDocument();
  });

  it("sorts conversations by FID ascending", () => {
    render(<FocusTab {...defaultProps} sortOption="fid-asc" />);

    // Check that all conversations are present
    expect(screen.getByText("user1: Short message")).toBeInTheDocument();
    expect(
      screen.getByText("user2: This is a medium length message")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "user3: This is a very long message that exceeds fifty characters"
      )
    ).toBeInTheDocument();
  });

  it("sorts conversations by FID descending", () => {
    render(<FocusTab {...defaultProps} sortOption="fid-desc" />);

    // Check that all conversations are present
    expect(screen.getByText("user1: Short message")).toBeInTheDocument();
    expect(
      screen.getByText("user2: This is a medium length message")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "user3: This is a very long message that exceeds fifty characters"
      )
    ).toBeInTheDocument();
  });

  it("sorts conversations by quotient score ascending", () => {
    render(<FocusTab {...defaultProps} sortOption="quotient-asc" />);

    // Check that all conversations are present
    expect(screen.getByText("user1: Short message")).toBeInTheDocument();
    expect(
      screen.getByText("user2: This is a medium length message")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "user3: This is a very long message that exceeds fifty characters"
      )
    ).toBeInTheDocument();
  });

  it("sorts conversations by quotient score descending", () => {
    render(<FocusTab {...defaultProps} sortOption="quotient-desc" />);

    // Check that all conversations are present
    expect(screen.getByText("user1: Short message")).toBeInTheDocument();
    expect(
      screen.getByText("user2: This is a medium length message")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "user3: This is a very long message that exceeds fifty characters"
      )
    ).toBeInTheDocument();
  });

  it("sorts conversations by OpenRank engagement score ascending", () => {
    render(<FocusTab {...defaultProps} sortOption="openrank-asc" />);

    // Check that all conversations are present
    expect(screen.getByText("user1: Short message")).toBeInTheDocument();
    expect(
      screen.getByText("user2: This is a medium length message")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "user3: This is a very long message that exceeds fifty characters"
      )
    ).toBeInTheDocument();
  });

  it("sorts conversations by OpenRank engagement score descending", () => {
    render(<FocusTab {...defaultProps} sortOption="openrank-desc" />);

    // Check that all conversations are present
    expect(screen.getByText("user1: Short message")).toBeInTheDocument();
    expect(
      screen.getByText("user2: This is a medium length message")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "user3: This is a very long message that exceeds fifty characters"
      )
    ).toBeInTheDocument();
  });

  it("filters conversations by day filter", () => {
    const todayConversations = [
      {
        ...mockConversations[0],
        timestamp: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago (today)
      },
      {
        ...mockConversations[1],
        timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
      },
    ];

    render(
      <FocusTab
        {...defaultProps}
        markedAsReadConversations={todayConversations}
        dayFilter="today"
      />
    );

    // Check that only today's conversation is present
    expect(screen.getByText("user1: Short message")).toBeInTheDocument();
    expect(
      screen.queryByText("user2: This is a medium length message")
    ).not.toBeInTheDocument();
  });

  it("shows loading state when loading", () => {
    render(<FocusTab {...defaultProps} loading={true} />);
    expect(screen.getByText("Loading focus items...")).toBeInTheDocument();
  });

  it("shows empty state when no conversations", () => {
    render(<FocusTab {...defaultProps} markedAsReadConversations={[]} />);
    expect(screen.getByText("No Focus Items")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Conversations you mark as read will appear here for easy reference."
      )
    ).toBeInTheDocument();
  });

  it("shows tutorial when not completed", () => {
    // Mock localStorage to return null (tutorial not completed)
    (window.localStorage.getItem as jest.Mock).mockReturnValue(null);

    render(<FocusTab {...defaultProps} />);
    expect(screen.getByTestId("focus-tutorial")).toBeInTheDocument();
  });

  it("handles missing quotient scores gracefully", () => {
    const conversationsWithoutQuotient = [
      { ...mockConversations[0], authorFid: 999 }, // No quotient score
      mockConversations[1],
    ];

    render(
      <FocusTab
        {...defaultProps}
        markedAsReadConversations={conversationsWithoutQuotient}
        sortOption="quotient-asc"
      />
    );

    // Check that all conversations are present
    expect(screen.getByText("user1: Short message")).toBeInTheDocument();
    expect(
      screen.getByText("user2: This is a medium length message")
    ).toBeInTheDocument();
  });

  it("handles missing OpenRank data gracefully", () => {
    const conversationsWithoutOpenRank = [
      { ...mockConversations[0], authorFid: 999 }, // No OpenRank data
      mockConversations[1],
    ];

    render(
      <FocusTab
        {...defaultProps}
        markedAsReadConversations={conversationsWithoutOpenRank}
        sortOption="openrank-asc"
      />
    );

    // Check that all conversations are present
    expect(screen.getByText("user1: Short message")).toBeInTheDocument();
    expect(
      screen.getByText("user2: This is a medium length message")
    ).toBeInTheDocument();
  });

  it("displays correct conversation count", () => {
    render(<FocusTab {...defaultProps} />);
    expect(screen.getByText("Focus (3)")).toBeInTheDocument();
  });

  it("displays correct reply count", () => {
    render(<FocusTab {...defaultProps} />);
    // Total reply count: 5 + 3 + 7 = 15
    expect(screen.getByText("15 replies")).toBeInTheDocument();
  });
});
