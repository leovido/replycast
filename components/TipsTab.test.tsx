import React from "react";
import { render, screen } from "@testing-library/react";
import { TipsTab } from "./TipsTab";

// Mock the useReplyTips hook
jest.mock("../hooks/useReplyTips", () => ({
  useReplyTips: jest.fn(),
}));

const mockUseReplyTips = require("../hooks/useReplyTips").useReplyTips;

describe("TipsTab", () => {
  const defaultProps = {
    user: { fid: 203666 },
    isDarkTheme: false,
    themeMode: "Farcaster" as const,
    useMockData: true,
  };

  beforeEach(() => {
    mockUseReplyTips.mockClear();
  });

  it("renders loading state", () => {
    mockUseReplyTips.mockReturnValue({
      loading: true,
      error: null,
      data: null,
    });

    render(<TipsTab {...defaultProps} />);
    expect(
      screen.getByText("Loading your conversations...")
    ).toBeInTheDocument();
  });

  it("renders error state", () => {
    mockUseReplyTips.mockReturnValue({
      loading: false,
      error: "Failed to fetch tips",
      data: null,
    });

    render(<TipsTab {...defaultProps} />);
    expect(screen.getByText("Error Loading Tips")).toBeInTheDocument();
    expect(screen.getByText("Failed to fetch tips")).toBeInTheDocument();
  });

  it("renders empty state when no data", () => {
    mockUseReplyTips.mockReturnValue({
      loading: false,
      error: null,
      data: null,
    });

    render(<TipsTab {...defaultProps} />);
    expect(screen.getByText("No Tips Data")).toBeInTheDocument();
  });

  it("renders tips data correctly", () => {
    const mockData = {
      tipsReceived: [
        {
          amount: 5000,
          timestamp: Math.floor(Date.now() / 1000) - 3600,
          castHash: "0x1234567890abcdef",
          castText: "Amazing work! 5000 $REPLY",
          castUrl: "https://farcaster.xyz/cast/0x1234567890abcdef",
          authorFid: 123456,
          authorUsername: "alice",
          authorDisplayName: "Alice",
          authorPfpUrl: "https://example.com/avatar.jpg",
          isTipGiven: false,
        },
      ],
      tipsGiven: [
        {
          amount: 3000,
          timestamp: Math.floor(Date.now() / 1000) - 1800,
          castHash: "0xfedcba0987654321",
          castText: "Thanks! 3000 $REPLY",
          castUrl: "https://farcaster.xyz/cast/0xfedcba0987654321",
          authorFid: 203666,
          authorUsername: "user",
          authorDisplayName: "Current User",
          authorPfpUrl: "https://example.com/user.jpg",
          isTipGiven: true,
        },
      ],
      totalReceived: 5000,
      totalGiven: 3000,
      totalReceivedToday: 5000,
      totalGivenToday: 3000,
      message: "Successfully fetched $REPLY tips",
    };

    mockUseReplyTips.mockReturnValue({
      loading: false,
      error: null,
      data: mockData,
      getTotalReceived: () => mockData.totalReceived,
      getTotalGiven: () => mockData.totalGiven,
      getTotalReceivedToday: () => mockData.totalReceivedToday,
      getTotalGivenToday: () => mockData.totalGivenToday,
      getTipsReceived: () => mockData.tipsReceived,
      getTipsGiven: () => mockData.tipsGiven,
    });

    render(<TipsTab {...defaultProps} />);

    expect(screen.getByText("$REPLY Tips")).toBeInTheDocument();
    expect(screen.getByText("Tips Received")).toBeInTheDocument();
    expect(screen.getByText("Tips Given")).toBeInTheDocument();
    expect(screen.getByText("Total received")).toBeInTheDocument();
    expect(screen.getByText("Total given")).toBeInTheDocument();
    expect(screen.getByText("5,000 today")).toBeInTheDocument(); // Received today
    expect(screen.getByText("3,000 today")).toBeInTheDocument(); // Given today

    // Check for mini app cards
    expect(screen.getByText("TIPN")).toBeInTheDocument();
    expect(screen.getByText("REPLY")).toBeInTheDocument();
    expect(screen.getByText("Earn tips and rewards")).toBeInTheDocument();
    expect(screen.getByText("Reply token platform")).toBeInTheDocument();
  });
});
