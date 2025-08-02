import { useState, useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import type { User } from "@/types/types";

export function useFarcasterAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInMiniApp, setIsInMiniApp] = useState<boolean | null>(null);

  // Call ready() immediately to hide splash screen
  useEffect(() => {
    async function hideSplash() {
      try {
        await sdk.actions.ready();
      } catch (error) {
        console.error("Failed to call ready():", error);
      }
    }
    hideSplash();
  }, []);

  // Check environment and initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // In development, bypass mini app check and use default user
        const isDevelopment = process.env.NODE_ENV === "development";
        const bypassMiniApp =
          isDevelopment ||
          new URLSearchParams(window.location.search).get("bypass") ===
            "true" ||
          process.env.NEXT_PUBLIC_BYPASS_MINIAPP === "true";

        if (bypassMiniApp) {
          console.log("Development mode: bypassing mini app check");
          setIsInMiniApp(false);
          // In development, use a test user but log it clearly
          const testUser = {
            fid: 203666,
            username: "leovido",
            displayName: "Leovido (DEV)",
            pfpUrl:
              "https://wrpcd.net/cdn-cgi/imagedelivery/BXluQx4ige9GuW0Ia56BHw/252c844e-7be7-4dd5-6938-c1affcfd7e00/anim=false,fit=contain,f=auto,w=576",
          };
          console.warn("Development mode: Using test user", testUser);
          setUser(testUser);
          setLoading(false);
          return;
        }

        // Check if we're in a Mini App environment
        const miniAppCheck = await sdk.isInMiniApp();
        setIsInMiniApp(miniAppCheck);

        if (miniAppCheck) {
          // If we're in a Mini App, try to get context
          try {
            const ctx = await sdk.context;
            const farUser = ctx?.user;
            if (!farUser) {
              throw new Error("Failed to get user context from Mini App");
            }
            setUser(farUser);
            setLoading(false); // Add this line to stop loading
          } catch (err) {
            console.error("Failed to get Mini App context:", err);
            setError("Failed to load user");
            setLoading(false); // Add this line to stop loading on error
          }
        } else {
          // Not in Mini App - user will need to sign in
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to initialize app:", err);
        setIsInMiniApp(false);
        setLoading(false);
      }
    };
    initializeApp();
  }, []);

  const handleSignIn = (userData: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  }) => {
    setUser(userData);
    setLoading(false);
  };

  const handleSignInError = (errorMessage: string) => {
    setError(errorMessage);
    setLoading(false);
  };

  return {
    user,
    loading,
    error,
    isInMiniApp,
    handleSignIn,
    handleSignInError,
  };
}
