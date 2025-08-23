import {
  extractUrls,
  isImageUrl,
  isVideoUrl,
  getDomainFromUrl,
  getYouTubeTitle,
  getYouTubeThumbnail,
  classifyUrl,
} from "./linkUtils";

describe("linkUtils", () => {
  describe("extractUrls", () => {
    it("extracts URLs from text", () => {
      const text = "Check out https://example.com and https://test.org";
      const urls = extractUrls(text);
      expect(urls).toEqual(["https://example.com", "https://test.org"]);
    });

    it("returns empty array for text without URLs", () => {
      const text = "This is just plain text";
      const urls = extractUrls(text);
      expect(urls).toEqual([]);
    });

    it("handles mixed content with URLs", () => {
      const text =
        "Text with https://example.com and more text https://test.org";
      const urls = extractUrls(text);
      expect(urls).toEqual(["https://example.com", "https://test.org"]);
    });
  });

  describe("isImageUrl", () => {
    it("identifies image URLs by extension", () => {
      expect(isImageUrl("https://example.com/image.jpg")).toBe(true);
      expect(isImageUrl("https://example.com/photo.png")).toBe(true);
      expect(isImageUrl("https://example.com/icon.gif")).toBe(true);
      expect(isImageUrl("https://example.com/logo.webp")).toBe(true);
    });

    it("identifies image URLs by domain", () => {
      expect(isImageUrl("https://imgur.com/abc123")).toBe(true);
      expect(isImageUrl("https://images.unsplash.com/photo")).toBe(true);
    });

    it("identifies non-image URLs", () => {
      expect(isImageUrl("https://example.com/page.html")).toBe(false);
      expect(isImageUrl("https://youtube.com/watch?v=123")).toBe(false);
    });
  });

  describe("isVideoUrl", () => {
    it("identifies video URLs by extension", () => {
      expect(isVideoUrl("https://example.com/video.mp4")).toBe(true);
      expect(isVideoUrl("https://example.com/movie.webm")).toBe(true);
    });

    it("identifies video URLs by domain", () => {
      expect(isVideoUrl("https://youtube.com/watch?v=123")).toBe(true);
      expect(isVideoUrl("https://vimeo.com/123456")).toBe(true);
    });

    it("identifies non-video URLs", () => {
      expect(isVideoUrl("https://example.com/page.html")).toBe(false);
      expect(isVideoUrl("https://example.com/image.jpg")).toBe(false);
    });
  });

  describe("getDomainFromUrl", () => {
    it("extracts domain from URL", () => {
      expect(getDomainFromUrl("https://www.example.com/page")).toBe(
        "example.com"
      );
      expect(getDomainFromUrl("https://test.org")).toBe("test.org");
      expect(getDomainFromUrl("http://subdomain.example.com")).toBe(
        "subdomain.example.com"
      );
    });

    it("handles invalid URLs gracefully", () => {
      expect(getDomainFromUrl("invalid-url")).toBe("invalid-url");
    });
  });

  describe("getYouTubeTitle", () => {
    it("returns title for YouTube URLs", () => {
      expect(getYouTubeTitle("https://youtube.com/watch?v=123")).toBe(
        "YouTube Video"
      );
      expect(getYouTubeTitle("https://youtu.be/123")).toBe("YouTube Video");
    });

    it("returns null for non-YouTube URLs", () => {
      expect(getYouTubeTitle("https://example.com")).toBeNull();
    });
  });

  describe("getYouTubeThumbnail", () => {
    it("returns thumbnail URL for youtu.be links", () => {
      const thumbnail = getYouTubeThumbnail("https://youtu.be/avjI3_GIZBw");
      expect(thumbnail).toBe(
        "https://img.youtube.com/vi/avjI3_GIZBw/maxresdefault.jpg"
      );
    });

    it("returns thumbnail URL for youtube.com links", () => {
      const thumbnail = getYouTubeThumbnail(
        "https://youtube.com/watch?v=avjI3_GIZBw"
      );
      expect(thumbnail).toBe(
        "https://img.youtube.com/vi/avjI3_GIZBw/maxresdefault.jpg"
      );
    });

    it("returns null for non-YouTube URLs", () => {
      expect(getYouTubeThumbnail("https://example.com")).toBeNull();
    });
  });

  describe("classifyUrl", () => {
    it("classifies image URLs correctly", () => {
      const result = classifyUrl("https://example.com/image.jpg");
      expect(result.type).toBe("image");
      expect(result.domain).toBe("example.com");
    });

    it("classifies YouTube URLs correctly", () => {
      const result = classifyUrl("https://youtu.be/avjI3_GIZBw");
      expect(result.type).toBe("youtube");
      expect(result.domain).toBe("youtu.be");
      expect(result.title).toBe("YouTube Video");
      expect(result.thumbnail).toBe(
        "https://img.youtube.com/vi/avjI3_GIZBw/maxresdefault.jpg"
      );
    });

    it("classifies other URLs correctly", () => {
      const result = classifyUrl("https://example.com/page.html");
      expect(result.type).toBe("other");
      expect(result.domain).toBe("example.com");
    });
  });
});
