import type { AppProps } from "next/app";
import "../styles/globals.css";
import { Analytics } from "@vercel/analytics/next";
import { AuthKitProvider } from "@farcaster/auth-kit";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <AuthKitProvider>
        <Component {...pageProps} />
      </AuthKitProvider>
      <Analytics />
    </>
  );
}
