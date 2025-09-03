import { mockReplies } from "./mockData";

describe("mockData", () => {
  describe("mockReplies", () => {
    it("has the correct structure", () => {
      expect(mockReplies).toHaveProperty("unrepliedCount");
      expect(mockReplies).toHaveProperty("unrepliedDetails");
      expect(mockReplies).toHaveProperty("message");
      expect(Array.isArray(mockReplies.unrepliedDetails)).toBe(true);
    });

    it("contains the expected number of replies", () => {
      expect(mockReplies.unrepliedCount).toBe(5);
      expect(mockReplies.unrepliedDetails).toHaveLength(5);
    });

    it("includes the YouTube link in sophia's reply", () => {
      const sophiaReply = mockReplies.unrepliedDetails.find(
        (reply) => reply.username === "sophia"
      );

      expect(sophiaReply).toBeDefined();
      expect(sophiaReply?.text).toContain("https://youtu.be/avjI3_GIZBw");
    });

    it("includes image links in alex's reply", () => {
      const alexReply = mockReplies.unrepliedDetails.find(
        (reply) => reply.username === "alex"
      );

      expect(alexReply).toBeDefined();
      expect(alexReply?.text).toContain("https://picsum.photos/800/600");
      expect(alexReply?.text).toContain("https://example.com");
    });

    it("includes mixed content in olivia's reply", () => {
      const oliviaReply = mockReplies.unrepliedDetails.find(
        (reply) => reply.username === "olivia"
      );

      expect(oliviaReply).toBeDefined();
      expect(oliviaReply?.text).toContain("https://youtu.be/dQw4w9WgXcQ");
      expect(oliviaReply?.text).toContain("https://picsum.photos/400/300");
      expect(oliviaReply?.userLiked).toBe(true);
      expect(oliviaReply?.hasUserInteraction).toBe(true);
    });

    it("includes image links in mike's reply", () => {
      const mikeReply = mockReplies.unrepliedDetails.find(
        (reply) => reply.username === "mike"
      );

      expect(mikeReply).toBeDefined();
      expect(mikeReply?.text).toContain("https://farcaster.xyz");
      expect(mikeReply?.text).toContain(
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
      );
    });

    it("has a reply with no links (emma)", () => {
      const emmaReply = mockReplies.unrepliedDetails.find(
        (reply) => reply.username === "emma"
      );

      expect(emmaReply).toBeDefined();
      expect(emmaReply?.text).not.toContain("http");
      expect(emmaReply?.userRecasted).toBe(true);
      expect(emmaReply?.hasUserInteraction).toBe(true);
    });

    it("has unique FIDs for each reply", () => {
      const fids = mockReplies.unrepliedDetails.map((reply) => reply.authorFid);
      const uniqueFids = new Set(fids);
      expect(uniqueFids.size).toBe(fids.length);
    });

    it("has realistic engagement metrics", () => {
      mockReplies.unrepliedDetails.forEach((reply) => {
        if (reply.likesCount !== undefined) {
          expect(reply.likesCount).toBeGreaterThanOrEqual(0);
        }
        if (reply.recastsCount !== undefined) {
          expect(reply.recastsCount).toBeGreaterThanOrEqual(0);
        }
        expect(reply.replyCount).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
