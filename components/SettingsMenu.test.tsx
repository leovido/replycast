import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SettingsMenu } from "./SettingsMenu";

// Mock the Farcaster SDK
jest.mock("@farcaster/miniapp-sdk", () => ({
  sdk: {
    context: Promise.resolve({
      client: {
        added: false,
      },
    }),
    actions: {
      addMiniApp: jest.fn(),
    },
    haptics: {
      impactOccurred: jest.fn(),
    },
  },
}));

describe("SettingsMenu", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    themeMode: "dark" as const,
    onThemeChange: jest.fn(),
    viewMode: "list" as const,
    onViewModeChange: jest.fn(),
    sortOption: "newest",
    onSortChange: jest.fn(),
    dayFilter: "all",
    onDayFilterChange: jest.fn(),
    isDarkTheme: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the settings menu when open", () => {
    render(<SettingsMenu {...defaultProps} />);

    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Theme")).toBeInTheDocument();
    expect(screen.getByText("Sort By")).toBeInTheDocument();
    expect(screen.getByText("Time Filter")).toBeInTheDocument();
    expect(screen.getByText("Mini App")).toBeInTheDocument();
  });

  it("shows Add to Farcaster button when not added", () => {
    render(<SettingsMenu {...defaultProps} />);

    expect(screen.getByText("Add to Farcaster")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Get quick access to ReplyCast from your Farcaster client"
      )
    ).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    render(<SettingsMenu {...defaultProps} />);

    // Find the close button by looking for the X icon (first button in header)
    const closeButton = screen.getAllByRole("button")[0];
    fireEvent.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("calls onThemeChange when theme buttons are clicked", () => {
    render(<SettingsMenu {...defaultProps} />);

    const lightThemeButton = screen.getByText("light");
    fireEvent.click(lightThemeButton);

    expect(defaultProps.onThemeChange).toHaveBeenCalledWith("light");
  });

  it("calls onSortChange when sort option is changed", () => {
    render(<SettingsMenu {...defaultProps} />);

    const sortSelect = screen.getByDisplayValue("Newest First");
    fireEvent.change(sortSelect, { target: { value: "oldest" } });

    expect(defaultProps.onSortChange).toHaveBeenCalledWith("oldest");
  });

  it("calls onDayFilterChange when day filter is changed", () => {
    render(<SettingsMenu {...defaultProps} />);

    const dayFilterSelect = screen.getByDisplayValue("All Time");
    fireEvent.change(dayFilterSelect, { target: { value: "today" } });

    expect(defaultProps.onDayFilterChange).toHaveBeenCalledWith("today");
  });
});
