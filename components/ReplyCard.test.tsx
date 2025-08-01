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
};

describe("ReplyCard", () => {
  it("renders without open rank when not provided", () => {
    render(<ReplyCard detail={mockDetail} />);

    expect(screen.getByText("@testuser")).toBeInTheDocument();
    expect(screen.getByText("This is a test reply")).toBeInTheDocument();
    expect(screen.queryByText("OpenRank")).not.toBeInTheDocument();
  });

  it("renders open rank when provided", () => {
    render(<ReplyCard detail={mockDetail} openRank={1500} />);

    expect(screen.getByText("@testuser")).toBeInTheDocument();
    expect(screen.getByText("#1,500")).toBeInTheDocument();
    expect(screen.getByText("OpenRank")).toBeInTheDocument();
  });

  it("renders open rank with null value", () => {
    render(<ReplyCard detail={mockDetail} openRank={null} />);

    expect(screen.getByText("@testuser")).toBeInTheDocument();
    expect(screen.getByText("--")).toBeInTheDocument();
    expect(screen.getByText("OpenRank")).toBeInTheDocument();
  });

  it("renders open rank with undefined value", () => {
    render(<ReplyCard detail={mockDetail} openRank={undefined} />);

    expect(screen.getByText("@testuser")).toBeInTheDocument();
    expect(screen.queryByText("OpenRank")).not.toBeInTheDocument();
  });

  it("formats large open rank numbers correctly", () => {
    render(<ReplyCard detail={mockDetail} openRank={1234567} />);

    expect(screen.getByText("#1,234,567")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const mockOnClick = jest.fn();
    render(<ReplyCard detail={mockDetail} onClick={mockOnClick} />);

    const replyButton = screen.getByLabelText("Reply");
    replyButton.click();

    expect(mockOnClick).toHaveBeenCalledTimes(2); // Both article and button trigger onClick
  });
});
