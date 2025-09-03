import React from "react";
import { render, screen } from "@testing-library/react";
import { LinkContent } from "./LinkContent";

// Mock the child components
jest.mock("./ImageDisplay", () => ({
  ImageDisplay: ({ src, alt }: { src: string; alt: string }) => (
    <div data-testid="image-display" data-src={src} data-alt={alt}>
      Image: {src}
    </div>
  ),
}));

jest.mock("./EmbedDisplay", () => ({
  EmbedDisplay: ({ url }: { url: string }) => (
    <div data-testid="embed-display" data-url={url}>
      Embed: {url}
    </div>
  ),
}));

describe("LinkContent", () => {
  it("renders nothing when no URLs are present", () => {
    render(<LinkContent text="This is just plain text" isDarkTheme={false} />);
    expect(screen.queryByTestId("image-display")).not.toBeInTheDocument();
    expect(screen.queryByTestId("embed-display")).not.toBeInTheDocument();
  });

  it("renders image display for image URLs", () => {
    const text = "Check out this image: https://example.com/image.jpg";
    render(<LinkContent text={text} isDarkTheme={false} />);

    expect(screen.getByTestId("image-display")).toBeInTheDocument();
    expect(screen.getByTestId("image-display")).toHaveAttribute(
      "data-src",
      "https://example.com/image.jpg"
    );
  });

  it("renders embed display for non-image URLs", () => {
    const text = "Check out this video: https://youtu.be/avjI3_GIZBw";
    render(<LinkContent text={text} isDarkTheme={false} />);

    expect(screen.getByTestId("embed-display")).toBeInTheDocument();
    expect(screen.getByTestId("embed-display")).toHaveAttribute(
      "data-url",
      "https://youtu.be/avjI3_GIZBw"
    );
  });

  it("renders both images and embeds when mixed content is present", () => {
    const text =
      "Check out this image: https://example.com/image.jpg and this video: https://youtu.be/avjI3_GIZBw";
    render(<LinkContent text={text} isDarkTheme={false} />);

    expect(screen.getByTestId("image-display")).toBeInTheDocument();
    expect(screen.getByTestId("embed-display")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const text = "Check out this: https://example.com";
    const { container } = render(
      <LinkContent text={text} isDarkTheme={false} className="custom-class" />
    );

    const linkContent = container.firstChild as HTMLElement;
    expect(linkContent).toHaveClass("custom-class");
  });
});
