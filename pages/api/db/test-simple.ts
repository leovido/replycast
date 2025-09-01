import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db/config";
import { casts } from "@/lib/db/schema";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Simple test: just get one cast
    const [cast] = await db.select().from(casts).limit(1);

    if (cast) {
      return res.status(200).json({
        success: true,
        message: "Database query successful",
        cast: {
          hash: cast.hash,
          fid: cast.fid,
          timestamp: cast.timestamp,
        },
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Database query successful but no casts found",
        cast: null,
      });
    }
  } catch (error) {
    console.error("Simple database test error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
