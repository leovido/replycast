import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const healthCheck = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    services: {
      database: "connected", // You can add actual DB health checks here
      cache: "connected", // You can add Redis health checks here
      api: "operational",
    },
  };

  try {
    // Add any additional health checks here
    // e.g., database connectivity, external API availability

    res.status(200).json(healthCheck);
  } catch (error) {
    healthCheck.status = "unhealthy";
    healthCheck.services.api = "error";

    res.status(503).json({
      ...healthCheck,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
