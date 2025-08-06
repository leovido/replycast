import React from "react";
import { render, screen, act } from "@testing-library/react";
import { ToastNotification } from "./ToastNotification";

// Mock the SDK
jest.mock("@farcaster/miniapp-sdk", () => ({
  sdk: {
    haptics: {
      impactOccurred: jest.fn(),
    },
  },
}));

describe("ToastNotification", () => {
  const defaultProps = {
    message: "Test message",
    type: "success" as const,
    isVisible: true,
    onHide: jest.fn(),
    themeMode: "Farcaster" as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders when visible", () => {
    render(<ToastNotification {...defaultProps} />);
    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  it("does not render when not visible", () => {
    render(<ToastNotification {...defaultProps} isVisible={false} />);
    expect(screen.queryByText("Test message")).not.toBeInTheDocument();
  });

  it("shows success icon for success type", () => {
    render(<ToastNotification {...defaultProps} type="success" />);
    // Check for the checkmark path in success icon
    const successIcon = screen.getByTestId("toast-icon");
    expect(successIcon).toHaveClass("text-green-400");
  });

  it("shows error icon for error type", () => {
    render(<ToastNotification {...defaultProps} type="error" />);
    // Error icon should be present
    const errorIcon = screen.getByTestId("toast-icon");
    expect(errorIcon).toHaveClass("text-red-400");
  });

  it("shows info icon for info type", () => {
    render(<ToastNotification {...defaultProps} type="info" />);
    // Info icon should be present
    const infoIcon = screen.getByTestId("toast-icon");
    expect(infoIcon).toHaveClass("text-blue-400");
  });

  it("calls onHide after duration", () => {
    const onHide = jest.fn();
    render(
      <ToastNotification {...defaultProps} onHide={onHide} duration={1000} />
    );

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Wait for animation delay
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(onHide).toHaveBeenCalled();
  });

  it("applies dark theme styles", () => {
    render(<ToastNotification {...defaultProps} themeMode="dark" />);
    const textElement = screen.getByText("Test message");
    expect(textElement).toHaveClass("text-white");
  });

  it("applies light theme styles", () => {
    render(<ToastNotification {...defaultProps} themeMode="light" />);
    const textElement = screen.getByText("Test message");
    expect(textElement).toHaveClass("text-gray-900");
  });

  it("applies Farcaster theme styles", () => {
    render(<ToastNotification {...defaultProps} themeMode="Farcaster" />);
    const textElement = screen.getByText("Test message");
    expect(textElement).toHaveClass("text-white");
  });

  it("has proper animation classes when visible", () => {
    render(<ToastNotification {...defaultProps} />);
    const toast = screen
      .getByText("Test message")
      .closest("div")?.parentElement;
    expect(toast).toHaveClass("translate-y-0", "opacity-100");
  });

  it("uses custom duration when provided", () => {
    const onHide = jest.fn();
    render(
      <ToastNotification {...defaultProps} onHide={onHide} duration={2000} />
    );

    // Fast-forward time less than custom duration
    act(() => {
      jest.advanceTimersByTime(1500);
    });

    expect(onHide).not.toHaveBeenCalled();

    // Fast-forward to custom duration
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Wait for animation delay
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(onHide).toHaveBeenCalled();
  });
});
