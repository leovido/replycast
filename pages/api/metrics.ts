import type { NextApiRequest, NextApiResponse } from "next";
import client from "prom-client";

declare global {
  // eslint-disable-next-line no-var
  var __promRegistry: client.Registry | undefined;
  // eslint-disable-next-line no-var
  var __promDefaultMetricsInitialized: boolean | undefined;
}

function getRegistry(): client.Registry {
  if (!global.__promRegistry) {
    global.__promRegistry = new client.Registry();
  }

  if (!global.__promDefaultMetricsInitialized) {
    client.collectDefaultMetrics({
      register: global.__promRegistry,
      // Keep defaults; avoids label-cardinality surprises.
    });
    global.__promDefaultMetricsInitialized = true;
  }

  return global.__promRegistry;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const registry = getRegistry();

  res.setHeader("Content-Type", registry.contentType);
  res.setHeader("Cache-Control", "no-store");

  return res.status(200).send(await registry.metrics());
}

