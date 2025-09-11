import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReputationFilter } from "./ReputationFilter";
import type { ReputationType } from "@/hooks/useReputation";

describe("ReputationFilter", () => {
  const defaultProps = {
    reputationType: "quotient" as ReputationType,
    onReputationTypeChange: jest.fn(),
    isDarkTheme: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render with correct labels", () => {
    render(<ReputationFilter {...defaultProps} />);

    expect(screen.getByText("Reputation:")).toBeInTheDocument();
    expect(screen.getByText("Quotient")).toBeInTheDocument();
    expect(screen.getByText("OpenRank")).toBeInTheDocument();
  });

  it("should show quotient as selected by default", () => {
    render(<ReputationFilter {...defaultProps} />);

    const quotientButton = screen.getByText("Quotient").closest("button");
    const openRankButton = screen.getByText("OpenRank").closest("button");

    expect(quotientButton).toHaveClass("bg-purple-500");
    expect(openRankButton).not.toHaveClass("bg-blue-500");
  });

  it("should show openrank as selected when reputationType is openrank", () => {
    render(<ReputationFilter {...defaultProps} reputationType="openrank" />);

    const quotientButton = screen.getByText("Quotient").closest("button");
    const openRankButton = screen.getByText("OpenRank").closest("button");

    expect(openRankButton).toHaveClass("bg-blue-500");
    expect(quotientButton).not.toHaveClass("bg-purple-500");
  });

  it("should call onReputationTypeChange when quotient button is clicked", () => {
    const mockOnChange = jest.fn();
    render(
      <ReputationFilter
        {...defaultProps}
        onReputationTypeChange={mockOnChange}
      />
    );

    const quotientButton = screen.getByText("Quotient");
    fireEvent.click(quotientButton);

    expect(mockOnChange).toHaveBeenCalledWith("quotient");
  });

  it("should call onReputationTypeChange when openrank button is clicked", () => {
    const mockOnChange = jest.fn();
    render(
      <ReputationFilter
        {...defaultProps}
        onReputationTypeChange={mockOnChange}
      />
    );

    const openRankButton = screen.getByText("OpenRank");
    fireEvent.click(openRankButton);

    expect(mockOnChange).toHaveBeenCalledWith("openrank");
  });

  it("should apply dark theme styles when isDarkTheme is true", () => {
    render(<ReputationFilter {...defaultProps} isDarkTheme={true} />);

    const quotientButton = screen.getByText("Quotient").closest("button");
    expect(quotientButton).toHaveClass("bg-purple-600");
  });

  it("should apply light theme styles when isDarkTheme is false", () => {
    render(<ReputationFilter {...defaultProps} isDarkTheme={false} />);

    const quotientButton = screen.getByText("Quotient").closest("button");
    expect(quotientButton).toHaveClass("bg-purple-500");
  });

  it("should have correct hover states for unselected buttons", () => {
    render(<ReputationFilter {...defaultProps} />);

    const openRankButton = screen.getByText("OpenRank").closest("button");
    expect(openRankButton).toHaveClass("hover:bg-gray-100");
  });

  it("should have correct hover states for unselected buttons in dark theme", () => {
    render(<ReputationFilter {...defaultProps} isDarkTheme={true} />);

    const openRankButton = screen.getByText("OpenRank").closest("button");
    expect(openRankButton).toHaveClass("hover:bg-white/10");
  });

  it("should maintain button state when clicking already selected button", () => {
    const mockOnChange = jest.fn();
    render(
      <ReputationFilter
        {...defaultProps}
        onReputationTypeChange={mockOnChange}
      />
    );

    const quotientButton = screen.getByText("Quotient");
    fireEvent.click(quotientButton);

    // Should still call the onChange even if it's the same value
    expect(mockOnChange).toHaveBeenCalledWith("quotient");
  });

  it("should render with proper accessibility attributes", () => {
    render(<ReputationFilter {...defaultProps} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);

    buttons.forEach((button) => {
      expect(button).toBeEnabled();
    });
  });

  it("should have consistent styling between theme modes", () => {
    const { rerender } = render(
      <ReputationFilter {...defaultProps} isDarkTheme={false} />
    );

    const lightThemeButton = screen.getByText("Quotient").closest("button");
    const lightThemeClasses = lightThemeButton?.className;

    rerender(<ReputationFilter {...defaultProps} isDarkTheme={true} />);

    const darkThemeButton = screen.getByText("Quotient").closest("button");
    const darkThemeClasses = darkThemeButton?.className;

    // Should have different classes for different themes
    expect(lightThemeClasses).not.toEqual(darkThemeClasses);
  });
});
