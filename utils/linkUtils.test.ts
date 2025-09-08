import {
  extractUrls,
  isImageUrl,
  isVideoUrl,
  isMusicUrl,
  getDomainFromUrl,
  getYouTubeTitle,
  getYouTubeThumbnail,
  getSpotifyMetadata,
  classifyUrl,
} from "./linkUtils";

describe("linkUtils", () => {
  describe("extractUrls", () => {
    it("extracts URLs from text", () => {
      const text = "Check out https://example.com and http://test.org/page";
      const urls = extractUrls(text);
      expect(urls).toEqual(["https://example.com", "http://test.org/page"]);
    });

    it("returns empty array when no URLs found", () => {
      const text = "No URLs here";
      const urls = extractUrls(text);
      expect(urls).toEqual([]);
    });

    it("handles URLs with query parameters", () => {
      const text = "Visit https://example.com?param=value&other=123";
      const urls = extractUrls(text);
      expect(urls).toEqual(["https://example.com?param=value&other=123"]);
    });

    it("handles URLs with fragments", () => {
      const text = "Go to https://example.com#section";
      const urls = extractUrls(text);
      expect(urls).toEqual(["https://example.com#section"]);
    });

    it("handles multiple URLs in same text", () => {
      const text = "Links: https://a.com https://b.com https://c.com";
      const urls = extractUrls(text);
      expect(urls).toEqual(["https://a.com", "https://b.com", "https://c.com"]);
    });
  });

  describe("isImageUrl", () => {
    it("identifies image URLs by extension", () => {
      expect(isImageUrl("https://example.com/image.jpg")).toBe(true);
      expect(isImageUrl("https://example.com/image.png")).toBe(true);
      expect(isImageUrl("https://example.com/image.gif")).toBe(true);
      expect(isImageUrl("https://example.com/image.webp")).toBe(true);
      expect(isImageUrl("https://example.com/image.svg")).toBe(true);
    });

    it("identifies image URLs by domain", () => {
      expect(isImageUrl("https://imgur.com/abc123")).toBe(true);
      expect(isImageUrl("https://i.imgur.com/abc123.jpg")).toBe(true);
      expect(isImageUrl("https://images.unsplash.com/photo")).toBe(true);
      expect(isImageUrl("https://picsum.photos/800/600")).toBe(true);
    });

    it("identifies image URLs by path patterns", () => {
      expect(isImageUrl("https://example.com/image/photo.jpg")).toBe(true);
      expect(isImageUrl("https://example.com/img/photo.jpg")).toBe(true);
      expect(isImageUrl("https://example.com/photo/photo.jpg")).toBe(true);
    });

    it("rejects non-image URLs", () => {
      expect(isImageUrl("https://example.com/page.html")).toBe(false);
      expect(isImageUrl("https://example.com/video.mp4")).toBe(false);
      expect(isImageUrl("https://example.com/document.pdf")).toBe(false);
    });

    it("handles invalid URLs gracefully", () => {
      expect(isImageUrl("not-a-url")).toBe(false);
      expect(isImageUrl("")).toBe(false);
    });
  });

  describe("isVideoUrl", () => {
    it("identifies video URLs by extension", () => {
      expect(isVideoUrl("https://example.com/video.mp4")).toBe(true);
      expect(isVideoUrl("https://example.com/video.webm")).toBe(true);
      expect(isVideoUrl("https://example.com/video.ogg")).toBe(true);
    });

    it("identifies video URLs by domain", () => {
      expect(isVideoUrl("https://youtube.com/watch?v=123")).toBe(true);
      expect(isVideoUrl("https://youtu.be/123")).toBe(true);
      expect(isVideoUrl("https://vimeo.com/123456")).toBe(true);
      expect(isVideoUrl("https://tiktok.com/@user/video/123")).toBe(true);
    });

    it("rejects non-video URLs", () => {
      expect(isVideoUrl("https://example.com/image.jpg")).toBe(false);
      expect(isVideoUrl("https://example.com/page.html")).toBe(false);
    });
  });

  describe("isMusicUrl", () => {
    it("identifies music service URLs", () => {
      expect(isMusicUrl("https://open.spotify.com/track/123")).toBe(true);
      expect(isMusicUrl("https://spotify.com/album/456")).toBe(true);
      expect(isMusicUrl("https://music.apple.com/us/album/789")).toBe(true);
      expect(isMusicUrl("https://soundcloud.com/user/track")).toBe(true);
      expect(isMusicUrl("https://tidal.com/album/123")).toBe(true);
      expect(isMusicUrl("https://bandcamp.com/album/456")).toBe(true);
    });

    it("rejects non-music URLs", () => {
      expect(isMusicUrl("https://example.com/page")).toBe(false);
      expect(isMusicUrl("https://youtube.com/watch?v=123")).toBe(false);
    });
  });

  describe("getDomainFromUrl", () => {
    it("extracts domain from URL", () => {
      expect(getDomainFromUrl("https://example.com/page")).toBe("example.com");
      expect(getDomainFromUrl("http://subdomain.example.org/path")).toBe(
        "subdomain.example.org"
      );
    });

    it("removes www prefix", () => {
      expect(getDomainFromUrl("https://www.example.com")).toBe("example.com");
    });

    it("handles invalid URLs gracefully", () => {
      expect(getDomainFromUrl("not-a-url")).toBe("not-a-url");
      expect(getDomainFromUrl("")).toBe("");
    });
  });

  describe("getYouTubeTitle", () => {
    it("returns YouTube title for youtube.com URLs", () => {
      const title = getYouTubeTitle("https://youtube.com/watch?v=abc123");
      expect(title).toBe("YouTube Video");
    });

    it("returns YouTube title for youtu.be URLs", () => {
      const title = getYouTubeTitle("https://youtu.be/abc123");
      expect(title).toBe("YouTube Video");
    });

    it("returns null for non-YouTube URLs", () => {
      const title = getYouTubeTitle("https://example.com/video");
      expect(title).toBeNull();
    });

    it("handles invalid URLs gracefully", () => {
      const title = getYouTubeTitle("not-a-url");
      expect(title).toBeNull();
    });
  });

  describe("getYouTubeThumbnail", () => {
    it("generates thumbnail URL for youtu.be links", () => {
      const thumbnail = getYouTubeThumbnail("https://youtu.be/abc123");
      expect(thumbnail).toBe(
        "https://img.youtube.com/vi/abc123/maxresdefault.jpg"
      );
    });

    it("generates thumbnail URL for youtube.com links", () => {
      const thumbnail = getYouTubeThumbnail(
        "https://youtube.com/watch?v=abc123"
      );
      expect(thumbnail).toBe(
        "https://img.youtube.com/vi/abc123/maxresdefault.jpg"
      );
    });

    it("returns null for non-YouTube URLs", () => {
      const thumbnail = getYouTubeThumbnail("https://example.com/video");
      expect(thumbnail).toBeNull();
    });

    it("handles invalid URLs gracefully", () => {
      const thumbnail = getYouTubeThumbnail("not-a-url");
      expect(thumbnail).toBeNull();
    });
  });

  describe("getSpotifyMetadata", () => {
    it("extracts track metadata", () => {
      const metadata = getSpotifyMetadata(
        "https://open.spotify.com/track/abc123"
      );
      expect(metadata).toEqual({
        title: "Spotify Track",
        type: "track",
        trackId: "abc123",
      });
    });

    it("extracts album metadata", () => {
      const metadata = getSpotifyMetadata(
        "https://open.spotify.com/album/def456"
      );
      expect(metadata).toEqual({
        title: "Spotify Album",
        type: "album",
        trackId: "def456",
      });
    });

    it("extracts playlist metadata", () => {
      const metadata = getSpotifyMetadata(
        "https://open.spotify.com/playlist/ghi789"
      );
      expect(metadata).toEqual({
        title: "Spotify Playlist",
        type: "playlist",
        trackId: "ghi789",
      });
    });

    it("extracts artist metadata", () => {
      const metadata = getSpotifyMetadata(
        "https://open.spotify.com/artist/jkl012"
      );
      expect(metadata).toEqual({
        title: "Spotify Artist",
        type: "artist",
        trackId: "jkl012",
      });
    });

    it("returns null for non-Spotify URLs", () => {
      const metadata = getSpotifyMetadata("https://example.com/music");
      expect(metadata).toBeNull();
    });
  });

  describe("classifyUrl", () => {
    it("classifies image URLs", () => {
      const result = classifyUrl("https://example.com/image.jpg");
      expect(result.type).toBe("image");
      expect(result.domain).toBe("example.com");
    });

    it("classifies YouTube URLs", () => {
      const result = classifyUrl("https://youtube.com/watch?v=abc123");
      expect(result.type).toBe("youtube");
      expect(result.domain).toBe("youtube.com");
      expect(result.title).toBe("YouTube Video");
      expect(result.thumbnail).toBe(
        "https://img.youtube.com/vi/abc123/maxresdefault.jpg"
      );
    });

    it("classifies video URLs", () => {
      const result = classifyUrl("https://example.com/video.mp4");
      expect(result.type).toBe("video");
      expect(result.domain).toBe("example.com");
    });

    it("classifies Spotify URLs", () => {
      const result = classifyUrl("https://open.spotify.com/track/abc123");
      expect(result.type).toBe("music");
      expect(result.domain).toBe("open.spotify.com");
      expect(result.title).toBe("Spotify Track");
      expect(result.metadata).toEqual({
        title: "Spotify Track",
        type: "track",
        trackId: "abc123",
      });
    });

    it("classifies other music URLs", () => {
      const result = classifyUrl("https://soundcloud.com/user/track");
      expect(result.type).toBe("music");
      expect(result.domain).toBe("soundcloud.com");
    });

    it("classifies other URLs", () => {
      const result = classifyUrl("https://example.com/page");
      expect(result.type).toBe("other");
      expect(result.domain).toBe("example.com");
    });
  });
});
