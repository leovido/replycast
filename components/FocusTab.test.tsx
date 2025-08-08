import React from "react";
import { render, screen } from "@testing-library/react";
import { FocusTab } from "./FocusTab";

// Mock React hooks
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useState: jest.fn((initial) => [initial, jest.fn()]),
  useEffect: jest.fn((fn) => fn()),
  useRef: jest.fn(() => ({ current: null })),
  useCallback: jest.fn((fn) => fn),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

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
    timestamp: 1640995200000, // Required field
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
    timestamp: 1640998800000, // Required field
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
  themeMode: "dark" as const,
  onMarkAsRead: jest.fn(),
  onDiscard: jest.fn(),
  dayFilter: "all" as const,
};

describe("FocusTab", () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue("true"); // Tutorial completed by default
    localStorageMock.setItem.mockClear();
    localStorageMock.clear.mockClear();
  });

  it("renders focus conversations when tutorial is completed", () => {
    render(<FocusTab {...defaultProps} />);

    expect(screen.getByText("Focus (2)")).toBeInTheDocument();
    expect(
      screen.getByText("Conversations you've marked as read for easy reference")
    ).toBeInTheDocument();
  });

  it("shows empty state when no conversations and tutorial completed", () => {
    render(<FocusTab {...defaultProps} markedAsReadConversations={[]} />);

    expect(screen.getByText("No Focus Items")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Conversations you mark as read will appear here for easy reference."
      )
    ).toBeInTheDocument();
  });

  it("shows loading state when tutorial completed", () => {
    render(<FocusTab {...defaultProps} loading={true} />);

    expect(screen.getByText("Loading focus items...")).toBeInTheDocument();
  });

  it("displays correct conversation count when tutorial completed", () => {
    render(
      <FocusTab
        {...defaultProps}
        markedAsReadConversations={mockMarkedAsReadConversations}
      />
    );

    expect(screen.getByText("Focus (2)")).toBeInTheDocument();
  });

  it("displays single conversation count correctly when tutorial completed", () => {
    render(
      <FocusTab
        {...defaultProps}
        markedAsReadConversations={[mockMarkedAsReadConversations[0]]}
      />
    );

    expect(screen.getByText("Focus (1)")).toBeInTheDocument();
  });

  it("displays reply count badge correctly", () => {
    render(<FocusTab {...defaultProps} />);

    // Should show total reply count (5 + 3 = 8)
    expect(screen.getByText("8 replies")).toBeInTheDocument();
  });
});
