import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { url } = req.query;

  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "Missing or invalid url parameter" });
    return;
  }

  // Only allow http(s) URLs
  if (!/^https?:\/\//.test(url)) {
    res.status(400).json({ error: "Only http(s) URLs are allowed" });
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      res.status(400).json({ error: "Failed to fetch image" });
      return;
    }

    // Set the content type to match the fetched image
    const contentType =
      response.headers.get("content-type") || "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    // Optionally, set cache headers
    res.setHeader("Cache-Control", "public, max-age=3600");

    // Read the image data as a buffer and send it
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.end(buffer);
  } catch (e) {
    res.status(500).json({ error: "Error fetching image" });
  }
}
