import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  const defaultProps = {
    title: "Test Title",
    description: "Test Description",
  };

  it("renders title and description", () => {
    render(<EmptyState {...defaultProps} />);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    const icon = <div data-testid="test-icon">Icon</div>;
    render(<EmptyState {...defaultProps} icon={icon} />);

    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("renders action button when provided", () => {
    const mockAction = {
      label: "Test Action",
      onClick: jest.fn(),
    };

    render(<EmptyState {...defaultProps} action={mockAction} />);

    const button = screen.getByText("Test Action");
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(mockAction.onClick).toHaveBeenCalledTimes(1);
  });

  it("applies dark theme styles", () => {
    render(<EmptyState {...defaultProps} themeMode="dark" />);

    const title = screen.getByText("Test Title");
    expect(title).toHaveClass("text-white");
  });

  it("applies light theme styles", () => {
    render(<EmptyState {...defaultProps} themeMode="light" />);

    const title = screen.getByText("Test Title");
    expect(title).toHaveClass("text-gray-900");
  });

  it("applies Farcaster theme styles by default", () => {
    render(<EmptyState {...defaultProps} />);

    const title = screen.getByText("Test Title");
    expect(title).toHaveClass("text-white");
  });

  it("does not render action button when not provided", () => {
    render(<EmptyState {...defaultProps} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("does not render icon when not provided", () => {
    render(<EmptyState {...defaultProps} />);

    // Should not have the icon container
    const container = screen.getByText("Test Title").closest("div");
    expect(container?.querySelector(".w-16.h-16")).not.toBeInTheDocument();
  });
});
