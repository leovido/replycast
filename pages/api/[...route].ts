import { Hono } from "hono";
import { handle } from "@hono/node-server/vercel";
import type { PageConfig } from "next";

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
  // runtime: "edge",
};

const app = new Hono();

export default handle(app);
