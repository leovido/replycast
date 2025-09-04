#!/usr/bin/env tsx

import { checkDatabaseConnection, testReadAccess, db } from "../lib/db/config";
import { reactions } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function debugDatabaseConnection() {
  console.log("🔍 Debugging database connection...\n");

  // Test 1: Basic connection
  console.log("1. Testing basic database connection...");
  const isConnected = await checkDatabaseConnection();
  console.log(
    `   Connection status: ${isConnected ? "✅ Connected" : "❌ Failed"}\n`
  );

  if (!isConnected) {
    console.log("❌ Cannot proceed - database connection failed");
    return;
  }

  // Test 2: Read access test
  console.log("2. Testing read access...");
  const hasReadAccess = await testReadAccess();
  console.log(
    `   Read access: ${hasReadAccess ? "✅ Success" : "❌ Failed"}\n`
  );

  // Test 3: Check reactions table exists and has data
  console.log("3. Testing reactions table...");
  try {
    const reactionCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(reactions)
      .limit(1);

    console.log(`   Reactions table exists: ✅`);
    console.log(`   Total reactions: ${reactionCount[0]?.count || 0}\n`);
  } catch (error) {
    console.log(`   Reactions table error: ❌ ${error}\n`);
  }

  // Test 4: Test the specific query that's failing
  console.log("4. Testing specific failing query...");
  const testCastHash = "0xa3d800ec7db83b3b054f665c6e83dba7d619a632";

  try {
    const testReactions = await db
      .select()
      .from(reactions)
      .where(eq(reactions.targetCastHash, testCastHash))
      .orderBy(desc(reactions.timestamp))
      .limit(100);

    console.log(`   Query successful: ✅`);
    console.log(
      `   Found ${testReactions.length} reactions for cast ${testCastHash}\n`
    );
  } catch (error) {
    console.log(`   Query failed: ❌ ${error}\n`);
  }

  // Test 5: Check if cast exists
  console.log("5. Testing if cast exists...");
  try {
    const { casts } = await import("../lib/db/schema");
    const cast = await db
      .select()
      .from(casts)
      .where(eq(casts.hash, testCastHash))
      .limit(1);

    console.log(`   Cast exists: ${cast.length > 0 ? "✅ Yes" : "❌ No"}\n`);
  } catch (error) {
    console.log(`   Cast check failed: ❌ ${error}\n`);
  }

  console.log("🏁 Debug complete!");
}

// Import required modules
import { sql, desc } from "drizzle-orm";

// Run the debug script
debugDatabaseConnection().catch(console.error);
