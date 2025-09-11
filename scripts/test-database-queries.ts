#!/usr/bin/env tsx

/**
 * Test script to verify all database queries from DATABASE_QUERIES.md work correctly
 * Run with: npx tsx scripts/test-database-queries.ts
 */

import { readOnlyRepository } from '../lib/db/repositories/readOnlyRepository';
import { db } from '../lib/db/config';
import { sql } from 'drizzle-orm';

// Test data - using known FIDs from the Farcaster network
const TEST_FID = 3; // Vitalik's FID
const TEST_CAST_HASH = '0x1234567890abcdef'; // This will likely not exist, but we'll test the query structure

interface TestResult {
  query: string;
  success: boolean;
  error?: string;
  executionTime?: number;
  resultCount?: number;
}

class DatabaseQueryTester {
  private results: TestResult[] = [];

  private async runTest(
    name: string,
    testFn: () => Promise<any>
  ): Promise<void> {
    console.log(`\n🧪 Testing: ${name}`);
    const startTime = Date.now();
    
    try {
      const result = await testFn();
      const executionTime = Date.now() - startTime;
      const resultCount = Array.isArray(result) ? result.length : (result ? 1 : 0);
      
      this.results.push({
        query: name,
        success: true,
        executionTime,
        resultCount
      });
      
      console.log(`✅ Success (${executionTime}ms, ${resultCount} results)`);
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.results.push({
        query: name,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime
      });
      
      console.log(`❌ Failed (${executionTime}ms): ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async testAllQueries(): Promise<void> {
    console.log('🚀 Starting Database Query Tests...\n');

    // Test 1: Get Cast by Hash
    await this.runTest('Get Cast by Hash', async () => {
      return await readOnlyRepository.getCastByHash(TEST_CAST_HASH);
    });

    // Test 2: Get Casts by Author
    await this.runTest('Get Casts by Author', async () => {
      return await readOnlyRepository.getCastsByAuthor(TEST_FID, 5);
    });

    // Test 3: Get Replies to Cast
    await this.runTest('Get Replies to Cast', async () => {
      return await readOnlyRepository.getRepliesToCast(TEST_CAST_HASH, 10);
    });

    // Test 4: Check if User Replied to Conversation
    await this.runTest('Check if User Replied to Conversation', async () => {
      return await readOnlyRepository.hasUserRepliedToConversation(TEST_FID, TEST_CAST_HASH);
    });

    // Test 5: Get Unreplied Conversations
    await this.runTest('Get Unreplied Conversations', async () => {
      return await readOnlyRepository.getUnrepliedConversations(TEST_FID, 5);
    });

    // Test 6: Get Cast Reactions
    await this.runTest('Get Cast Reactions', async () => {
      return await readOnlyRepository.getCastReactions(TEST_CAST_HASH, 10);
    });

    // Test 7: Get User Profile
    await this.runTest('Get User Profile', async () => {
      return await readOnlyRepository.getProfileByFid(TEST_FID);
    });

    // Test 8: Get Multiple Profiles
    await this.runTest('Get Multiple Profiles', async () => {
      return await readOnlyRepository.getProfilesByFids([TEST_FID, 1, 2]);
    });

    // Test 9: Search Profiles by Username
    await this.runTest('Search Profiles by Username', async () => {
      return await readOnlyRepository.searchProfiles('vitalik', 5);
    });

    // Test 10: Get User Followers
    await this.runTest('Get User Followers', async () => {
      return await readOnlyRepository.getUserFollowers(TEST_FID, 10);
    });

    // Test 11: Get User Following
    await this.runTest('Get User Following', async () => {
      return await readOnlyRepository.getUserFollowing(TEST_FID, 10);
    });

    // Test 12: Get User Reactions
    await this.runTest('Get User Reactions', async () => {
      return await readOnlyRepository.getUserReactions(TEST_FID, 10);
    });

    // Test 13: Get User Verifications
    await this.runTest('Get User Verifications', async () => {
      return await readOnlyRepository.getUserVerifications(TEST_FID);
    });

    // Test 14: Get User Statistics
    await this.runTest('Get User Statistics', async () => {
      return await readOnlyRepository.getUserStats(TEST_FID);
    });

    // Test 15: Search Casts by Text
    await this.runTest('Search Casts by Text', async () => {
      return await readOnlyRepository.searchCasts('ethereum', 5);
    });

    // Test raw SQL queries to verify they match the documentation
    await this.testRawSQLQueries();

    this.printSummary();
  }

  private async testRawSQLQueries(): Promise<void> {
    console.log('\n🔍 Testing Raw SQL Queries from Documentation...\n');

    // Test the main performance-critical query
    await this.runTest('Raw SQL: Count replies to cast', async () => {
      const result = await db.execute(sql`
        SELECT count(*) FROM casts
        WHERE parent_cast_hash = ${TEST_CAST_HASH}
        LIMIT 1
      `);
      return result.rows[0];
    });

    // Test profile search with JSONB
    await this.runTest('Raw SQL: Search profiles by username', async () => {
      const result = await db.execute(sql`
        SELECT * FROM profiles
        WHERE data->>'username' ILIKE ${'%vitalik%'}
        ORDER BY last_updated_at
        LIMIT 5
      `);
      return result.rows;
    });

    // Test cast search
    await this.runTest('Raw SQL: Search casts by text', async () => {
      const result = await db.execute(sql`
        SELECT * FROM casts
        WHERE text ILIKE ${'%ethereum%'}
        ORDER BY timestamp DESC
        LIMIT 5
      `);
      return result.rows;
    });

    // Test user statistics queries
    await this.runTest('Raw SQL: Get user cast count', async () => {
      const result = await db.execute(sql`
        SELECT count(*) FROM casts WHERE fid = ${TEST_FID}
      `);
      return result.rows[0];
    });

    await this.runTest('Raw SQL: Get user reply count', async () => {
      const result = await db.execute(sql`
        SELECT count(*) FROM casts
        WHERE fid = ${TEST_FID} AND parent_cast_hash IS NOT NULL
      `);
      return result.rows[0];
    });

    await this.runTest('Raw SQL: Get follower count', async () => {
      const result = await db.execute(sql`
        SELECT count(*) FROM links
        WHERE target_fid = ${TEST_FID} AND type = 'follow'
      `);
      return result.rows[0];
    });

    await this.runTest('Raw SQL: Get following count', async () => {
      const result = await db.execute(sql`
        SELECT count(*) FROM links
        WHERE fid = ${TEST_FID} AND type = 'follow'
      `);
      return result.rows[0];
    });
  }

  private printSummary(): void {
    console.log('\n📊 Test Summary');
    console.log('================');
    
    const successful = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const totalTime = this.results.reduce((sum, r) => sum + (r.executionTime || 0), 0);
    
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️  Total execution time: ${totalTime}ms`);
    console.log(`📈 Average execution time: ${Math.round(totalTime / this.results.length)}ms`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`  • ${r.query}: ${r.error}`);
        });
    }

    // Performance analysis
    const slowQueries = this.results
      .filter(r => r.success && (r.executionTime || 0) > 1000)
      .sort((a, b) => (b.executionTime || 0) - (a.executionTime || 0));

    if (slowQueries.length > 0) {
      console.log('\n🐌 Slow Queries (>1000ms):');
      slowQueries.forEach(r => {
        console.log(`  • ${r.query}: ${r.executionTime}ms`);
      });
    }

    console.log('\n🎯 Recommendations:');
    
    // Check for the main performance bottleneck
    const unrepliedTest = this.results.find(r => r.query.includes('Unreplied Conversations'));
    if (unrepliedTest && unrepliedTest.executionTime && unrepliedTest.executionTime > 500) {
      console.log('  • Consider optimizing the unreplied conversations query (main bottleneck)');
    }

    // Check for missing indexes
    const profileSearchTest = this.results.find(r => r.query.includes('Search Profiles'));
    if (profileSearchTest && profileSearchTest.executionTime && profileSearchTest.executionTime > 500) {
      console.log('  • Consider adding a GIN index on profiles.data for faster JSONB searches');
    }

    console.log('\n✨ Test completed!');
  }
}

// Run the tests
async function main() {
  try {
    const tester = new DatabaseQueryTester();
    await tester.testAllQueries();
  } catch (error) {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

