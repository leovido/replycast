import type { NextApiRequest, NextApiResponse } from "next";
import { checkDatabaseConnection, testReadAccess } from "@/lib/db/config";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check database connection
    const isConnected = await checkDatabaseConnection();

    if (!isConnected) {
      return res.status(503).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        message: "Database connection failed",
        details: "Cannot establish connection to the database",
      });
    }

    // Test read access
    const canRead = await testReadAccess();

    if (!canRead) {
      return res.status(503).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        message: "Database read access failed",
        details: "Connection successful but cannot read data",
      });
    }

    // Both connection and read access are working
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      message: "Database connection and read access successful",
      details: "Read-only access confirmed",
    });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({
      status: "error",
      timestamp: new Date().toISOString(),
      message: "Health check failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
