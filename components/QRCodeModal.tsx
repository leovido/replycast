import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { SignInButton } from "@farcaster/auth-kit";

// Custom styled sign-in button component
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
    <div className={`styled-signin-container ${className}`}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .styled-signin-container button {
            width: 100% !important;
            background: #8b5cf6 !important;
            color: white !important;
            font-weight: 600 !important;
            padding: 0.75rem 1.5rem !important;
            border-radius: 0.5rem !important;
            border: none !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 0.5rem !important;
            transition: all 0.2s ease !important;
            transform: scale(1) !important;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
            cursor: pointer !important;
          }
          .styled-signin-container button:hover {
            background: #7c3aed !important;
            transform: scale(1.02) !important;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
          }
          .styled-signin-container button:active {
            transform: scale(0.98) !important;
          }
        `,
        }}
      />
      <SignInButton onSuccess={onSuccess} onError={onError} />
    </div>
  );
}

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCodeUri?: string;
  isLoading: boolean;
  error?: string;
  onSignInSuccess?: (data: any) => void;
  onSignInError?: (error: any) => void;
}

export function QRCodeModal({
  isOpen,
  onClose,
  qrCodeUri,
  isLoading,
  error,
  onSignInSuccess,
  onSignInError,
}: QRCodeModalProps) {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 transform transition-all duration-300 animate-[fadeInUp_0.3s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Sign In with Farcaster
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="text-center">
          {isLoading && (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center">
                <div className="flex flex-col items-center space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <p className="text-sm text-gray-600">Generating QR code...</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-48 h-48 bg-red-50 rounded-xl flex items-center justify-center">
                <div className="flex flex-col items-center space-y-3">
                  <svg
                    className="w-12 h-12 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <p className="text-sm text-red-600 text-center px-4">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {qrCodeUri && !isLoading && !error && (
            <div className="flex flex-col items-center space-y-4">
              {/* QR Code Container */}
              <div className="w-48 h-48 bg-white border-2 border-gray-200 rounded-xl p-4 flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    qrCodeUri
                  )}`}
                  alt="QR Code for Farcaster sign-in"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Instructions */}
              <div className="space-y-3 text-center">
                <p className="text-gray-600 text-sm">
                  Scan this QR code with your Farcaster app
                </p>
                <div className="flex items-center justify-center space-x-2">
                  <div className="flex -space-x-1">
                    <img
                      src="/fc-logo.png"
                      alt="Farcaster"
                      className="w-5 h-5 rounded border bg-white"
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    Works with Warpcast and other Farcaster clients
                  </span>
                </div>

                {/* Copy Link Button */}
                <button
                  onClick={() => {
                    if (qrCodeUri) {
                      navigator.clipboard.writeText(qrCodeUri);
                      // You could add a toast notification here
                    }
                  }}
                  className="text-xs text-purple-600 hover:text-purple-700 underline transition-colors"
                >
                  Copy sign-in link
                </button>
              </div>
            </div>
          )}

          {/* Alternative sign-in */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-500 text-sm mb-4">
              Or sign in directly:
            </p>
            <div className="w-full">
              <StyledSignInButton
                onSuccess={onSignInSuccess}
                onError={onSignInError}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document root
  return typeof window !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
