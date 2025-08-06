import React from "react";
import { render, screen } from "@testing-library/react";
import { LoadingScreen } from "./LoadingScreen";

describe("LoadingScreen", () => {
  it("renders with default Farcaster theme", () => {
    render(<LoadingScreen />);

    expect(screen.getByText("ReplyCast")).toBeInTheDocument();
    expect(
      screen.getByText("Loading your conversations...")
    ).toBeInTheDocument();

    // Check that the component renders without errors
    expect(screen.getByText("ReplyCast")).toBeInTheDocument();
  });

  it("renders with dark theme", () => {
    render(<LoadingScreen themeMode="dark" />);

    expect(screen.getByText("ReplyCast")).toBeInTheDocument();
  });

  it("renders with light theme", () => {
    render(<LoadingScreen themeMode="light" />);

    expect(screen.getByText("ReplyCast")).toBeInTheDocument();
  });

  it("renders with Farcaster theme explicitly", () => {
    render(<LoadingScreen themeMode="Farcaster" />);

    expect(screen.getByText("ReplyCast")).toBeInTheDocument();
  });

  it("has proper loading animation dots", () => {
    render(<LoadingScreen />);

    const dots = screen
      .getAllByRole("generic")
      .filter(
        (el) =>
          el.className.includes("animate-bounce") &&
          el.className.includes("rounded-full")
      );

    expect(dots).toHaveLength(3);
  });
});
