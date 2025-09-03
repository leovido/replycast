import type { AppProps } from "next/app";
import "../styles/globals.css";
import { Analytics } from "@vercel/analytics/next";
import { AuthKitProvider } from "@farcaster/auth-kit";
import { SpeedInsights } from "@vercel/speed-insights/next";

const config = {
  // Optional: Relay server URL
  // relay: "https://relay.farcaster.xyz",

  // Optional: Ethereum RPC URL
  // rpcUrl: "https://mainnet.optimism.io",

  // Optional: Domain for SIWF
  domain:
    typeof window !== "undefined" ? window.location.host : "localhost:3000",
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <AuthKitProvider config={config}>
        <Component {...pageProps} />
        <SpeedInsights />
      </AuthKitProvider>
      <Analytics />
    </>
  );
}
