import { useState, useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { SignInButton } from "@farcaster/auth-kit";
import { QRCodeModal } from "./QRCodeModal";
import { Button } from "./Button";

// Custom styled sign-in button component for main page
function StyledSignInButton({
  onSuccess,
  onError,
  className = "",
}: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  className?: string;
}) {
  return (
    <div className={`styled-signin-main ${className}`}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .styled-signin-main button {
            width: 100% !important;
            background: #8b5cf6 !important;
            backdrop-filter: blur(8px) !important;
            color: white !important;
            font-weight: 600 !important;
            font-size: 1.125rem !important;
            padding: 1rem 1.5rem !important;
            border-radius: 0.75rem !important;
            border: 1px solid rgba(139, 92, 246, 0.3) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 0.75rem !important;
            transition: all 0.2s ease !important;
            transform: scale(1) !important;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
            cursor: pointer !important;
          }
          .styled-signin-main button:hover {
            background: #7c3aed !important;
            border-color: rgba(124, 58, 237, 0.5) !important;
            transform: scale(1.02) !important;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
          }
          .styled-signin-main button:active {
            transform: scale(0.98) !important;
          }
        `,
        }}
      />
      <SignInButton onSuccess={onSuccess} onError={onError} />
    </div>
  );
}

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
  const [showQRModal, setShowQRModal] = useState(false);

  // Generate a random nonce for SIWF
  const [nonce] = useState(() => {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))

      .join("");
  });

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

  const handleSignInSuccess = (data: any) => {
    try {
      const { fid, username, displayName, pfpUrl } = data || {};
      if (!fid) throw new Error("Missing fid from sign-in response");
      setShowQRModal(false); // Close modal on success
      onSignIn({ fid, username, displayName, pfpUrl });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Sign in parsing error";
      setError(msg);
      onError(msg);
    }
  };

  const handleSignInError = (e: any) => {
    const msg =
      e instanceof Error ? e.message : "Failed to sign in with Farcaster.";
    setError(msg);
    onError(msg);
  };

  // For now, we'll keep it simple and enhance the UI without the custom hook
  // TODO: Implement useSignIn hook when available

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

          <div className="w-full">
            <StyledSignInButton
              onSuccess={handleSignInSuccess}
              onError={handleSignInError}
              className="w-full"
            />
          </div>

          {/* QR Code Modal */}
          <QRCodeModal
            isOpen={showQRModal}
            onClose={() => setShowQRModal(false)}
            qrCodeUri="https://warpcast.com/~/sign-in-with-farcaster"
            isLoading={false}
            error={undefined}
            onSignInSuccess={handleSignInSuccess}
            onSignInError={handleSignInError}
          />

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
