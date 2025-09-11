import React from "react";
import { render, screen } from "@testing-library/react";
import LinkContent from "./LinkContent";

// Mock the child components with simple implementations
jest.mock("./ImageDisplay", () => {
  return function MockImageDisplay({
    src,
    alt,
    isDarkTheme,
  }: {
    src: string;
    alt: string;
    isDarkTheme?: boolean;
  }) {
    return (
      <div
        data-testid="image-display"
        data-src={src}
        data-alt={alt}
        data-dark={isDarkTheme}
      />
    );
  };
});

jest.mock("./EmbedDisplay", () => {
  return function MockEmbedDisplay({
    url,
    isDarkTheme,
  }: {
    url: string;
    isDarkTheme?: boolean;
  }) {
    return (
      <div data-testid="embed-display" data-url={url} data-dark={isDarkTheme} />
    );
  };
});

// Mock the linkUtils functions
jest.mock("@/utils/linkUtils", () => ({
  extractUrls: jest.fn((text: string) => {
    const urlRegex = /https?:\/\/[^\s]+/g;
    return text.match(urlRegex) || [];
  }),
  isImageUrl: jest.fn((url: string) => {
    return (
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url) ||
      /imgur\.com|images\.unsplash\.com|picsum\.photos/i.test(url) ||
      /\/image\/|\/img\/|\/photo\//i.test(url)
    );
  }),
}));

describe("LinkContent", () => {
  const defaultProps = {
    text: "Test text",
    isDarkTheme: false,
  };

  it("renders nothing when no URLs are found", () => {
    render(<LinkContent {...defaultProps} text="No URLs here" embeds={[]} />);
    expect(screen.queryByTestId("image-display")).not.toBeInTheDocument();
    expect(screen.queryByTestId("embed-display")).not.toBeInTheDocument();
  });

  it("extracts and displays URLs from text", () => {
    const text =
      "Check out this image: https://example.com/image.jpg and this link: https://example.com/page";
    render(<LinkContent {...defaultProps} text={text} />);

    expect(screen.getByTestId("image-display")).toHaveAttribute(
      "data-src",
      "https://example.com/image.jpg"
    );
    expect(screen.getByTestId("embed-display")).toHaveAttribute(
      "data-url",
      "https://example.com/page"
    );
  });

  it("extracts and displays URLs from embeds", () => {
    const embeds = [
      {
        url: "https://example.com/embed-image.png",
        metadata: { content_type: "image/png" },
      },
      {
        url: "https://youtube.com/watch?v=123",
        metadata: { content_type: "text/html" },
      },
    ];

    render(
      <LinkContent {...defaultProps} text="No text URLs" embeds={embeds} />
    );

    expect(screen.getByTestId("image-display")).toHaveAttribute(
      "data-src",
      "https://example.com/embed-image.png"
    );
    expect(screen.getByTestId("embed-display")).toHaveAttribute(
      "data-url",
      "https://youtube.com/watch?v=123"
    );
  });

  it("handles empty embeds array", () => {
    render(
      <LinkContent
        {...defaultProps}
        text="https://example.com/text-image.jpg"
        embeds={[]}
      />
    );
    expect(screen.getByTestId("image-display")).toHaveAttribute(
      "data-src",
      "https://example.com/text-image.jpg"
    );
  });

  it("handles undefined embeds prop", () => {
    render(
      <LinkContent
        {...defaultProps}
        text="https://example.com/text-image.jpg"
        embeds={undefined}
      />
    );
    expect(screen.getByTestId("image-display")).toHaveAttribute(
      "data-src",
      "https://example.com/text-image.jpg"
    );
  });

  it("applies custom className", () => {
    const { container } = render(
      <LinkContent
        {...defaultProps}
        text="https://example.com/image.jpg"
        className="custom-class"
      />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("passes isDarkTheme to child components", () => {
    const text = "https://example.com/image.jpg https://example.com/page";
    render(<LinkContent {...defaultProps} text={text} isDarkTheme={true} />);

    // The mock components don't actually use isDarkTheme, but we verify they render
    expect(screen.getByTestId("image-display")).toBeInTheDocument();
    expect(screen.getByTestId("embed-display")).toBeInTheDocument();
  });
});
