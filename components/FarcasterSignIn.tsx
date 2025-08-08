import { useState, useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

interface FarcasterSignInProps {
  onSignIn: (user: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  }) => void;
  onError: (error: string) => void;
}

export function FarcasterSignIn({ onSignIn, onError }: FarcasterSignInProps) {
  const [isInMiniApp, setIsInMiniApp] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkEnvironment = async () => {
      try {
        const miniAppCheck = await sdk.isInMiniApp();
        setIsInMiniApp(miniAppCheck);

        if (miniAppCheck) {
          // If we're in a Mini App, try to get context with retries
          let retries = 0;
          const maxRetries = 5;

          const tryGetContext = async () => {
            try {
              const ctx = await sdk.context;
              if (ctx?.user) {
                onSignIn(ctx.user);
                return true;
              } else {
                console.log(
                  "SignIn: User context not available yet, retry:",
                  retries + 1
                );
                return false;
              }
            } catch (err) {
              return false;
            }
          };

          // Try to get context with retries
          const attemptContext = async () => {
            while (retries < maxRetries) {
              const success = await tryGetContext();
              if (success) return;

              retries++;
              if (retries < maxRetries) {
                // Wait 500ms before retrying
                await new Promise((resolve) => setTimeout(resolve, 500));
              }
            }
          };

          attemptContext();
        }
      } catch (err) {
        console.error("Error checking Mini App environment:", err);
        setIsInMiniApp(false);
      }
    };

    checkEnvironment();
  }, [onSignIn]);

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if signIn action is available
      if (!sdk.actions?.signIn) {
        // Fallback: simulate sign-in for demo purposes

        const mockUser = {
          fid: 12345,
          username: "demo_user",
          displayName: "Demo User",
          pfpUrl: "https://randomuser.me/api/portraits/men/1.jpg",
        };
        onSignIn(mockUser);
        return;
      }

      // Generate a secure nonce (in production, this should come from your server)
      const nonce =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

      const result = await sdk.actions.signIn({
        nonce,
      });

      // In a real app, you would send this to your server for verification
      // For now, we'll simulate a successful sign-in

      // Simulate getting user data (in production, verify with your server)
      const mockUser = {
        fid: 12345, // This would come from server verification
        username: "user123",
        displayName: "Farcaster User",
        pfpUrl: "https://randomuser.me/api/portraits/men/1.jpg",
      };

      onSignIn(mockUser);
    } catch (err) {
      const error = err as Error;
      console.error("Sign in error:", error.message);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to sign in with Farcaster. Please try again.";
      setError(errorMessage);
      onError("Sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  // If we're in a Mini App and context is available, don't show sign-in
  if (isInMiniApp === true) {
    return null;
  }

  // If we're still checking the environment, show loading
  if (isInMiniApp === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Regular website sign-in interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center text-white mb-8">
          <h1 className="text-4xl font-bold mb-4">📝 ReplyCast</h1>
          <p className="text-lg opacity-90">Never miss a reply again</p>
        </div>

        <div className="space-y-4">
          <p className="text-white/80 text-center">
            Sign in with Farcaster to track and reply to your unreplied
            conversations.
          </p>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full bg-white text-purple-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>🔗</span>
                <span>Connect with Farcaster</span>
              </>
            )}
          </button>

          <div className="text-center text-white/60 text-sm mt-6">
            <p>
              This app helps you track and reply to your unreplied Farcaster
              conversations.
            </p>
            <p className="mt-2">
              <a
                href="https://farcaster.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white transition-colors"
              >
                Learn more about Farcaster
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
