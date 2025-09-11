import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TabBar } from "./TabBar";

const mockOnTabChange = jest.fn();

const defaultProps = {
  activeTab: "inbox" as const,
  onTabChange: mockOnTabChange,
  isDarkTheme: true,
  themeMode: "Farcaster" as const,
};

describe("TabBar", () => {
  beforeEach(() => {
    mockOnTabChange.mockClear();
  });

  it("renders all tabs", () => {
    render(<TabBar {...defaultProps} />);

    expect(screen.getByText("Inbox")).toBeInTheDocument();
    expect(screen.getByText("Focus")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
  });

  it("shows active tab with correct styling", () => {
    render(<TabBar {...defaultProps} activeTab="focus" />);

    const focusTab = screen.getByText("Focus").closest("button");
    expect(focusTab).toHaveClass("scale-105");
  });

  it("calls onTabChange when tab is clicked", () => {
    render(<TabBar {...defaultProps} />);

    const focusTab = screen.getByText("Focus");
    fireEvent.click(focusTab);

    expect(mockOnTabChange).toHaveBeenCalledWith("focus");
  });

  it("applies dark theme styling", () => {
    render(<TabBar {...defaultProps} isDarkTheme={true} themeMode="dark" />);

    const tabBar = screen.getByText("Inbox").closest("div")?.parentElement;
    expect(tabBar).toHaveClass(
      "bg-gradient-to-r",
      "from-gray-900/95",
      "via-gray-800/95",
      "to-gray-900/95"
    );
  });

  it("applies light theme styling", () => {
    render(<TabBar {...defaultProps} isDarkTheme={false} themeMode="light" />);

    const tabBar = screen.getByText("Inbox").closest("div")?.parentElement;
    expect(tabBar).toHaveClass(
      "bg-gradient-to-r",
      "from-gray-50/95",
      "via-white/95",
      "to-gray-100/95"
    );
  });

  it("applies Farcaster theme styling", () => {
    render(<TabBar {...defaultProps} themeMode="Farcaster" />);

    const tabBar = screen.getByText("Inbox").closest("div")?.parentElement;
    expect(tabBar).toHaveClass(
      "bg-gradient-to-r",
      "from-purple-900/95",
      "via-purple-800/95",
      "to-indigo-900/95"
    );
  });

  it("shows active indicator for active tab", () => {
    render(<TabBar {...defaultProps} activeTab="analytics" />);

    const analyticsTab = screen.getByText("Analytics").closest("button");
    const activeIndicator = analyticsTab?.querySelector(
      "div[class*='w-1 h-1']"
    );
    expect(activeIndicator).toBeInTheDocument();
  });

  it("does not show active indicator for inactive tabs", () => {
    render(<TabBar {...defaultProps} activeTab="inbox" />);

    const focusTab = screen.getByText("Focus").closest("button");
    const activeIndicator = focusTab?.querySelector("div[class*='w-1 h-1']");
    expect(activeIndicator).not.toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(<TabBar {...defaultProps} />);

    const inboxTab = screen.getByText("Inbox").closest("button");
    expect(inboxTab).toHaveAttribute("aria-label", "Inbox");
  });

  it("applies hover effects to inactive tabs", () => {
    render(<TabBar {...defaultProps} activeTab="inbox" />);

    const focusTab = screen.getByText("Focus").closest("button");
    expect(focusTab).toHaveClass("hover:scale-102", "hover:bg-white/5");
  });
});
