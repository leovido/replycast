import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";
import { sdk } from "@farcaster/miniapp-sdk";

// Mock the Farcaster SDK
jest.mock("@farcaster/miniapp-sdk", () => ({
  sdk: {
    haptics: {
      impactOccurred: jest.fn(),
      notificationOccurred: jest.fn(),
      selectionChanged: jest.fn(),
    },
    actions: {
      ready: jest.fn(),
      viewCast: jest.fn(),
      composeCast: jest.fn(),
    },
    context: {
      user: {
        fid: 123,
        username: "testuser",
        displayName: "Test User",
        pfpUrl: "https://example.com/avatar.jpg",
      },
    },
  },
}));

describe("Mini App Features", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Haptic Feedback", () => {
    it("should trigger haptic feedback on button click", () => {
      const mockOnClick = jest.fn();
      render(
        <Button onClick={mockOnClick} hapticFeedback="light">
          Test Button
        </Button>
      );

      const button = screen.getByText("Test Button");
      fireEvent.click(button);

      expect(sdk.haptics.impactOccurred).toHaveBeenCalledWith("light");
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it("should handle different haptic intensities", () => {
      const mockOnClick = jest.fn();

      // Test light haptic
      const { rerender } = render(
        <Button onClick={mockOnClick} hapticFeedback="light">
          Light Button
        </Button>
      );
      fireEvent.click(screen.getByText("Light Button"));
      expect(sdk.haptics.impactOccurred).toHaveBeenCalledWith("light");

      // Test medium haptic
      rerender(
        <Button onClick={mockOnClick} hapticFeedback="medium">
          Medium Button
        </Button>
      );
      fireEvent.click(screen.getByText("Medium Button"));
      expect(sdk.haptics.impactOccurred).toHaveBeenCalledWith("medium");

      // Test heavy haptic
      rerender(
        <Button onClick={mockOnClick} hapticFeedback="heavy">
          Heavy Button
        </Button>
      );
      fireEvent.click(screen.getByText("Heavy Button"));
      expect(sdk.haptics.impactOccurred).toHaveBeenCalledWith("heavy");
    });

    it("should not trigger haptic feedback when disabled", () => {
      const mockOnClick = jest.fn();
      render(
        <Button onClick={mockOnClick} disabled hapticFeedback="light">
          Disabled Button
        </Button>
      );

      const button = screen.getByText("Disabled Button");
      fireEvent.click(button);

      expect(sdk.haptics.impactOccurred).not.toHaveBeenCalled();
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe("SDK Actions", () => {
    it("should call ready action when app initializes", async () => {
      // This would typically be called in a useEffect
      await sdk.actions.ready();
      expect(sdk.actions.ready).toHaveBeenCalled();
    });

    it("should call viewCast action", async () => {
      const castHash = "0x1234567890abcdef";
      await sdk.actions.viewCast({ hash: castHash });
      expect(sdk.actions.viewCast).toHaveBeenCalledWith({ hash: castHash });
    });

    it("should call composeCast action", async () => {
      const castData = {
        text: "Test cast",
        embeds: ["https://example.com"],
      };
      await sdk.actions.composeCast(castData);
      expect(sdk.actions.composeCast).toHaveBeenCalledWith(castData);
    });
  });

  describe("SDK Context", () => {
    it("should provide user context", () => {
      expect(sdk.context.user).toBeDefined();
      expect(sdk.context.user.fid).toBe(123);
      expect(sdk.context.user.username).toBe("testuser");
      expect(sdk.context.user.displayName).toBe("Test User");
      expect(sdk.context.user.pfpUrl).toBe("https://example.com/avatar.jpg");
    });
  });

  describe("Haptic Feedback Types", () => {
    it("should support impact haptic feedback", () => {
      sdk.haptics.impactOccurred("light");
      expect(sdk.haptics.impactOccurred).toHaveBeenCalledWith("light");
    });

    it("should support notification haptic feedback", () => {
      sdk.haptics.notificationOccurred("success");
      expect(sdk.haptics.notificationOccurred).toHaveBeenCalledWith("success");
    });

    it("should support selection haptic feedback", () => {
      sdk.haptics.selectionChanged();
      expect(sdk.haptics.selectionChanged).toHaveBeenCalled();
    });
  });

  describe("Mini App Best Practices", () => {
    it("should use appropriate haptic intensity for different actions", () => {
      const mockOnClick = jest.fn();

      // Light for minor actions
      render(
        <Button onClick={mockOnClick} hapticFeedback="light">
          Minor Action
        </Button>
      );
      fireEvent.click(screen.getByText("Minor Action"));
      expect(sdk.haptics.impactOccurred).toHaveBeenCalledWith("light");

      // Medium for moderate actions
      render(
        <Button onClick={mockOnClick} hapticFeedback="medium">
          Moderate Action
        </Button>
      );
      fireEvent.click(screen.getByText("Moderate Action"));
      expect(sdk.haptics.impactOccurred).toHaveBeenCalledWith("medium");

      // Heavy for significant actions
      render(
        <Button onClick={mockOnClick} hapticFeedback="heavy">
          Significant Action
        </Button>
      );
      fireEvent.click(screen.getByText("Significant Action"));
      expect(sdk.haptics.impactOccurred).toHaveBeenCalledWith("heavy");
    });

    it("should not overuse haptic feedback", () => {
      const mockOnClick = jest.fn();
      render(
        <Button onClick={mockOnClick} hapticFeedback="light">
          Test Button
        </Button>
      );

      const button = screen.getByText("Test Button");

      // Multiple rapid clicks should not spam haptic feedback
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      // Should be called once per click
      expect(sdk.haptics.impactOccurred).toHaveBeenCalledTimes(3);
    });
  });
});
