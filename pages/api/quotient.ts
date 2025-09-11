import type { NextApiRequest, NextApiResponse } from "next";
import { MockQuotientService } from "@/utils/mockService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { fids } = req.body;

  if (!fids || !Array.isArray(fids) || fids.length === 0) {
    return res.status(400).json({ error: "FIDs array is required" });
  }

  if (fids.length > 1000) {
    return res
      .status(400)
      .json({ error: "Maximum 1000 FIDs allowed per request" });
  }

  // Check if mocks are enabled
  const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

  if (useMocks) {
    try {
      console.log("Mock: Using mock Quotient data");
      const mockData = await MockQuotientService.fetchScores(fids);
      return res.status(200).json(mockData);
    } catch (error) {
      console.error("Mock service error:", error);
      return res.status(500).json({ error: "Mock service failed" });
    }
  }

  // Real API call
  try {
    const response = await fetch(
      "https://api.quotient.social/v1/user-reputation",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fids,
          api_key: process.env.QUOTIENT_API_KEY || "",
        }),
        signal: AbortSignal.timeout(15000), // 15 second timeout
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        return res
          .status(500)
          .json({ error: "Quotient API authentication failed" });
      }
      if (response.status === 404) {
        return res
          .status(404)
          .json({ error: "No users found with the provided FIDs" });
      }
      throw new Error(`Quotient API error: ${response.status}`);
    }

    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching Quotient data:", error);

    if (error instanceof Error && error.name === "AbortError") {
      return res.status(408).json({ error: "Request timeout" });
    }

    res.status(500).json({ error: "Failed to fetch Quotient data" });
  }
}
