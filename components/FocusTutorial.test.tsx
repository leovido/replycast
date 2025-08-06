import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FocusTutorial } from "./FocusTutorial";

// Mock the Farcaster SDK
jest.mock("@farcaster/miniapp-sdk", () => ({
  sdk: {
    haptics: {
      impactOccurred: jest.fn(),
    },
  },
}));

describe("FocusTutorial", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  });

  it("renders tutorial content", () => {
    render(
      <FocusTutorial
        isDarkTheme={false}
        themeMode="light"
        onComplete={jest.fn()}
      />
    );

    expect(screen.getByText("Welcome to Focus")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Learn how to mark conversations as read for easy reference"
      )
    ).toBeInTheDocument();
    expect(screen.getByText("I understand")).toBeInTheDocument();
  });

  it("shows animated example after delay", async () => {
    render(
      <FocusTutorial
        isDarkTheme={false}
        themeMode="light"
        onComplete={jest.fn()}
      />
    );

    // Initially should show swipe indicator
    expect(screen.getByText("Swipe right to mark as read")).toBeInTheDocument();

    // After animation delay, should show success indicator
    await waitFor(
      () => {
        expect(screen.getByText("Marked as read!")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("handles confirmation button click", async () => {
    const onComplete = jest.fn();
    render(
      <FocusTutorial
        isDarkTheme={false}
        themeMode="light"
        onComplete={onComplete}
      />
    );

    const button = screen.getByText("I understand");
    fireEvent.click(button);

    // Button should change to "Got it!"
    expect(screen.getByText("Got it!")).toBeInTheDocument();

    // Should call onComplete after delay
    await waitFor(
      () => {
        expect(onComplete).toHaveBeenCalled();
      },
      { timeout: 1000 }
    );
  });

  it("stores tutorial completion in localStorage", async () => {
    const onComplete = jest.fn();
    render(
      <FocusTutorial
        isDarkTheme={false}
        themeMode="light"
        onComplete={onComplete}
      />
    );

    const button = screen.getByText("I understand");
    fireEvent.click(button);

    await waitFor(() => {
      expect(
        localStorage.getItem("farcaster-widget-focus-tutorial-completed")
      ).toBe("true");
    });
  });

  it("applies dark theme styles", () => {
    render(
      <FocusTutorial
        isDarkTheme={true}
        themeMode="dark"
        onComplete={jest.fn()}
      />
    );

    // Check that the component renders with dark theme
    expect(screen.getByText("Welcome to Focus")).toBeInTheDocument();
  });

  it("applies light theme styles", () => {
    render(
      <FocusTutorial
        isDarkTheme={false}
        themeMode="light"
        onComplete={jest.fn()}
      />
    );

    // Check that the component renders with light theme
    expect(screen.getByText("Welcome to Focus")).toBeInTheDocument();
  });

  it("applies Farcaster theme styles", () => {
    render(
      <FocusTutorial
        isDarkTheme={false}
        themeMode="Farcaster"
        onComplete={jest.fn()}
      />
    );

    // Check that the component renders with Farcaster theme
    expect(screen.getByText("Welcome to Focus")).toBeInTheDocument();
  });
});
