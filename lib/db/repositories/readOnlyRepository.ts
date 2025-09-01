import { eq, and, desc, asc, sql, isNull, isNotNull } from "drizzle-orm";
import { db } from "../config";
import { casts, profiles, links, reactions, verifications } from "../schema";
import type { Cast, Profile, Link, Reaction, Verification } from "../schema";

export class ReadOnlyRepository {
  // =====================================================
  // CASTS QUERIES
  // =====================================================

  // Get cast by hash
  async getCastByHash(hash: string): Promise<Cast | null> {
    const [cast] = await db
      .select()
      .from(casts)
      .where(eq(casts.hash, hash))
      .limit(1);

    return cast || null;
  }

  // Get casts by author FID
  async getCastsByAuthor(
    fid: number,
    limit: number = 25,
    cursor?: string
  ): Promise<{
    casts: Cast[];
    nextCursor: string | null;
  }> {
    let whereClause: any = eq(casts.fid, fid);

    if (cursor) {
      const cursorCast = await this.getCastByHash(cursor);
      if (cursorCast && cursorCast.timestamp) {
        whereClause = and(
          eq(casts.fid, fid),
          sql`${casts.timestamp} < ${cursorCast.timestamp}`
        );
      }
    }

    const results = await db
      .select()
      .from(casts)
      .where(whereClause)
      .orderBy(desc(casts.timestamp))
      .limit(limit + 1);

    const hasNextPage = results.length > limit;
    const castResults = hasNextPage ? results.slice(0, limit) : results;
    const nextCursor = hasNextPage
      ? castResults[castResults.length - 1].hash
      : null;

    return { casts: castResults, nextCursor };
  }

  // Get replies to a cast
  async getRepliesToCast(
    castHash: string,
    limit: number = 50
  ): Promise<Cast[]> {
    return await db
      .select()
      .from(casts)
      .where(eq(casts.parentCastHash, castHash))
      .orderBy(asc(casts.timestamp))
      .limit(limit);
  }

  // Get conversation thread (all replies at any depth)
  async getConversationThread(
    castHash: string,
    limit: number = 100
  ): Promise<Cast[]> {
    const replies = await db
      .select()
      .from(casts)
      .where(eq(casts.parentCastHash, castHash))
      .orderBy(asc(casts.timestamp))
      .limit(limit);

    return replies;
  }

  // Check if user has replied to a conversation
  async hasUserRepliedToConversation(
    userFid: number,
    rootCastHash: string
  ): Promise<boolean> {
    const [reply] = await db
      .select()
      .from(casts)
      .where(
        and(eq(casts.fid, userFid), eq(casts.parentCastHash, rootCastHash))
      )
      .limit(1);

    return !!reply;
  }

  // Get unreplied conversations for a user
  async getUnrepliedConversations(
    userFid: number,
    limit: number = 25
  ): Promise<{
    conversations: Array<{
      cast: Cast;
      replyCount: number;
      firstReplyTime: Date | null;
      firstReplyAuthor: number | null;
    }>;
    totalCount: number;
  }> {
    // OPTIMIZED VERSION - Uses existing (hash, fid) index more efficiently
    const queryLimit = Math.min(limit, 50);

    try {
      // Strategy: Get user's recent casts first, then check for replies
      // This leverages the existing (hash, fid) index better
      const userCasts = await db
        .select()
        .from(casts)
        .where(and(eq(casts.fid, userFid), isNull(casts.parentCastHash)))
        .orderBy(desc(casts.timestamp))
        .limit(queryLimit);

      // For each cast, quickly check if it has replies using the hash index
      const conversations = await Promise.all(
        userCasts.map(async (cast) => {
          // Use the hash index to quickly check for replies
          const [replyCheck] = await db
            .select({ count: sql<number>`count(*)` })
            .from(casts)
            .where(eq(casts.parentCastHash, cast.hash))
            .limit(1);

          const replyCount = replyCheck?.count || 0;

          return {
            cast,
            replyCount,
            firstReplyTime: null, // Would need additional query to get this
            firstReplyAuthor: null, // Would need additional query to get this
          };
        })
      );

      return {
        conversations,
        totalCount: conversations.length,
      };
    } catch (error) {
      console.error("Database query failed:", error);
      return {
        conversations: [],
        totalCount: 0,
      };
    }
  }

  // Search casts by text content
  async searchCasts(query: string, limit: number = 20): Promise<Cast[]> {
    return await db
      .select()
      .from(casts)
      .where(sql`${casts.text} ILIKE ${`%${query}%`}`)
      .orderBy(desc(casts.timestamp))
      .limit(limit);
  }

  // =====================================================
  // PROFILES QUERIES
  // =====================================================

  // Get profile by FID
  async getProfileByFid(fid: number): Promise<Profile | null> {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.fid, fid))
      .limit(1);

    return profile || null;
  }

  // Get multiple profiles by FIDs
  async getProfilesByFids(fids: number[]): Promise<Profile[]> {
    if (fids.length === 0) return [];

    return await db
      .select()
      .from(profiles)
      .where(sql`${profiles.fid} = ANY(${fids})`);
  }

  // Search profiles by username (from JSONB data)
  async searchProfiles(query: string, limit: number = 20): Promise<Profile[]> {
    return await db
      .select()
      .from(profiles)
      .where(sql`${profiles.data}->>'username' ILIKE ${`%${query}%`}`)
      .orderBy(profiles.lastUpdatedAt)
      .limit(limit);
  }

  // =====================================================
  // LINKS QUERIES
  // =====================================================

  // Get user's followers
  async getUserFollowers(fid: number, limit: number = 50): Promise<Link[]> {
    return await db
      .select()
      .from(links)
      .where(and(eq(links.targetFid, fid), eq(links.type, "follow")))
      .orderBy(desc(links.timestamp))
      .limit(limit);
  }

  // Get user's following
  async getUserFollowing(fid: number, limit: number = 50): Promise<Link[]> {
    return await db
      .select()
      .from(links)
      .where(and(eq(links.fid, fid), eq(links.type, "follow")))
      .orderBy(desc(links.timestamp))
      .limit(limit);
  }

  // =====================================================
  // REACTIONS QUERIES
  // =====================================================

  // Get reactions for a cast
  async getCastReactions(
    castHash: string,
    limit: number = 50
  ): Promise<Reaction[]> {
    return await db
      .select()
      .from(reactions)
      .where(eq(reactions.targetCastHash, castHash))
      .orderBy(desc(reactions.timestamp))
      .limit(limit);
  }

  // Get user's reactions
  async getUserReactions(fid: number, limit: number = 50): Promise<Reaction[]> {
    return await db
      .select()
      .from(reactions)
      .where(eq(reactions.fid, fid))
      .orderBy(desc(reactions.timestamp))
      .limit(limit);
  }

  // =====================================================
  // VERIFICATIONS QUERIES
  // =====================================================

  // Get user's verifications
  async getUserVerifications(fid: number): Promise<Verification[]> {
    return await db
      .select()
      .from(verifications)
      .where(eq(verifications.fid, fid))
      .orderBy(desc(verifications.timestamp));
  }

  // =====================================================
  // STATISTICS QUERIES
  // =====================================================

  // Get user statistics
  async getUserStats(fid: number): Promise<{
    totalCasts: number;
    totalReplies: number;
    followerCount: number;
    followingCount: number;
    lastActivity: Date | null;
  }> {
    const [castCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(casts)
      .where(eq(casts.fid, fid));

    const [replyCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(casts)
      .where(and(eq(casts.fid, fid), isNotNull(casts.parentCastHash)));

    const [followerCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(links)
      .where(and(eq(links.targetFid, fid), eq(links.type, "follow")));

    const [followingCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(links)
      .where(and(eq(links.fid, fid), eq(links.type, "follow")));

    const [lastActivity] = await db
      .select({ timestamp: casts.timestamp })
      .from(casts)
      .where(eq(casts.fid, fid))
      .orderBy(desc(casts.timestamp))
      .limit(1);

    return {
      totalCasts: castCount?.count || 0,
      totalReplies: replyCount?.count || 0,
      followerCount: followerCount?.count || 0,
      followingCount: followingCount?.count || 0,
      lastActivity: lastActivity?.timestamp || null,
    };
  }
}

// Export singleton instance
export const readOnlyRepository = new ReadOnlyRepository();
