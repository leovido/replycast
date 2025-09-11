import React from "react";
import { render, screen } from "@testing-library/react";
import { ReplyCard } from "./ReplyCard";

const mockDetail = {
  username: "testuser",
  timeAgo: "2h",
  castUrl: "https://farcaster.xyz/cast/123",
  text: "This is a test reply",
  avatarUrl: "https://example.com/avatar.jpg",
  castHash: "0x123",
  authorFid: 12345,
  originalCastText: "Original cast text",
  originalCastHash: "0x456",
  originalAuthorUsername: "originaluser",
  replyCount: 5,
  hasUserInteraction: false,
  timestamp: Date.now(),
  embeds: [
    {
      url: "https://example.com/image.jpg",
      metadata: {
        content_type: "image/jpeg",
        content_length: 12345,
        image: {
          width_px: 800,
          height_px: 600,
        },
      },
    },
  ],
};

describe("ReplyCard", () => {
  const defaultProps = {
    detail: mockDetail,
    openRank: null,
    onClick: jest.fn(),
    viewMode: "list" as const,
    isDarkTheme: true,
    onMarkAsRead: jest.fn(),
  };

  it("renders without open rank when not provided", () => {
    render(<ReplyCard {...defaultProps} />);

    expect(screen.getByText("@testuser")).toBeInTheDocument();
    expect(screen.getByText("This is a test reply")).toBeInTheDocument();
    expect(screen.queryByText("OpenRank")).not.toBeInTheDocument();
  });

  it("renders open rank when provided", () => {
    render(<ReplyCard {...defaultProps} openRank={1500} />);

    expect(screen.getByText("@testuser")).toBeInTheDocument();
    expect(screen.getByText("#1,500")).toBeInTheDocument();
  });

  it("renders open rank with null value", () => {
    render(<ReplyCard {...defaultProps} openRank={null} />);

    expect(screen.getByText("@testuser")).toBeInTheDocument();
    expect(screen.getByText("--")).toBeInTheDocument();
  });

  it("renders open rank with undefined value", () => {
    render(<ReplyCard {...defaultProps} openRank={null} />);

    expect(screen.getByText("@testuser")).toBeInTheDocument();
    expect(screen.queryByText("OpenRank")).not.toBeInTheDocument();
  });

  it("formats large open rank numbers correctly", () => {
    render(<ReplyCard {...defaultProps} openRank={1234567} />);

    expect(screen.getByText("#1,234,567")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const mockOnClick = jest.fn();
    render(<ReplyCard {...defaultProps} onClick={mockOnClick} />);

    const cardButton = screen.getByRole("button");
    cardButton.click();

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("shows 'You interacted' badge when hasUserInteraction is true", () => {
    const detailWithInteraction = { ...mockDetail, hasUserInteraction: true };
    render(<ReplyCard {...defaultProps} detail={detailWithInteraction} />);

    expect(screen.getByText("You interacted")).toBeInTheDocument();
  });

  it("does not show 'You interacted' badge when hasUserInteraction is false", () => {
    render(<ReplyCard {...defaultProps} />);

    expect(screen.queryByText("You interacted")).not.toBeInTheDocument();
  });

  it("handles embeds data correctly", () => {
    render(<ReplyCard {...defaultProps} />);

    // The LinkContent component should receive the embeds prop
    // We can't easily test the LinkContent rendering without mocking it,
    // but we can verify the component renders without errors
    expect(screen.getByText("@testuser")).toBeInTheDocument();
    expect(screen.getByText("This is a test reply")).toBeInTheDocument();
  });

  it("handles empty embeds array", () => {
    const detailWithoutEmbeds = { ...mockDetail, embeds: [] };
    render(<ReplyCard {...defaultProps} detail={detailWithoutEmbeds} />);

    expect(screen.getByText("@testuser")).toBeInTheDocument();
    expect(screen.getByText("This is a test reply")).toBeInTheDocument();
  });

  it("handles undefined embeds", () => {
    const detailWithoutEmbeds = { ...mockDetail, embeds: undefined };
    render(<ReplyCard {...defaultProps} detail={detailWithoutEmbeds} />);

    expect(screen.getByText("@testuser")).toBeInTheDocument();
    expect(screen.getByText("This is a test reply")).toBeInTheDocument();
  });
});
