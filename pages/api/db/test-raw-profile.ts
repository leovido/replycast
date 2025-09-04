import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../lib/db/config";
import { sql } from "drizzle-orm";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Test query to see raw profile data for specific FIDs
    const testFids = [240781, 228903];

    const result = await db.execute(sql`
      SELECT 
        p.fid,
        p.data as profile_data
      FROM profiles p
      WHERE p.fid IN (${testFids[0]}, ${testFids[1]})
    `);

    console.log("Raw profile data:", result.rows);

    return res.status(200).json({
      success: true,
      profiles: result.rows.map((row: any) => ({
        fid: row.fid,
        profileData: row.profile_data,
        username: row.profile_data?.username,
        displayName: row.profile_data?.displayName,
        pfpUrl: row.profile_data?.pfpUrl,
        bio: row.profile_data?.bio,
      })),
    });
  } catch (error) {
    console.error("Error testing raw profile data:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
