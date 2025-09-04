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

  // Get unreplied conversations for a user - OPTIMIZED VERSION
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
    const queryLimit = Math.min(limit, 50);

    try {
      // OPTIMIZED: Use a single SQL query with JOINs instead of multiple queries
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

      console.log("Getting unreplied conversations with optimized query...");

      // Query to get actual replies from other users to your casts
      const result = await db.execute(sql`
        WITH user_casts AS (
          SELECT c.hash as original_cast_hash
          FROM casts c
          WHERE c.fid = ${userFid}
            AND c.parent_cast_hash IS NULL
            AND c.timestamp >= ${ninetyDaysAgo}
          ORDER BY c.timestamp DESC
          LIMIT ${queryLimit}
        ),
        replies_to_user_casts AS (
          SELECT 
            r.hash,
            r.fid,
            r.timestamp,
            r.text,
            r.embeds,
            r.parent_cast_url,
            r.parent_cast_fid,
            r.parent_cast_hash,
            r.mentions,
            r.mentions_positions,
            r.deleted_at,
            uc.original_cast_hash,
            ROW_NUMBER() OVER (PARTITION BY uc.original_cast_hash ORDER BY r.timestamp ASC) as reply_order
          FROM user_casts uc
          INNER JOIN casts r ON r.parent_cast_hash = uc.original_cast_hash
          WHERE r.fid != ${userFid}  -- Only replies from OTHER users
        )
        SELECT 
          r.*,
          uc.original_cast_hash
        FROM replies_to_user_casts r
        INNER JOIN user_casts uc ON r.original_cast_hash = uc.original_cast_hash
        WHERE r.reply_order = 1  -- Only the first reply to each cast
        ORDER BY r.timestamp DESC
      `);

      console.log(`Found ${result.rows.length} first replies from other users`);

      // Transform the result to match expected format
      const conversations = result.rows.map((row: any) => ({
        cast: {
          fid: row.fid,
          hash: row.hash,
          timestamp: row.timestamp,
          text: row.text,
          embeds: row.embeds,
          parentCastUrl: row.parent_cast_url,
          parentCastFid: row.parent_cast_fid,
          parentCastHash: row.parent_cast_hash,
          mentions: row.mentions,
          mentionsPositions: row.mentions_positions,
          deletedAt: row.deleted_at,
        },
        replyCount: 1, // This is the first reply
        firstReplyTime: row.timestamp ? new Date(row.timestamp) : null,
        firstReplyAuthor: row.fid ? parseInt(row.fid) : null,
      }));

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
