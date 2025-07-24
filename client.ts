import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

const config = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY || "",
  baseOptions: {
    headers: {
      "x-neynar-experimental": true,
    },
  },
});

// make sure to set your NEYNAR_API_KEY .env
// for testing purposes, you can insert your key as a string param into NeynarAPIClient
export const client = new NeynarAPIClient(config);
