// Utility to check and debug environment variables
export function checkMockEnvironment() {
  const isClient = typeof window !== "undefined";
  const isServer = typeof window === "undefined";

  const envVars = {
    NEXT_PUBLIC_USE_MOCKS: process.env.NEXT_PUBLIC_USE_MOCKS,
    NODE_ENV: process.env.NODE_ENV,
    isClient,
    isServer,
  };

  console.log("🔍 Environment Check:", envVars);

  if (isClient) {
    // Check if the environment variable is accessible on the client
    const mockEnabled = process.env.NEXT_PUBLIC_USE_MOCKS === "true";
    console.log("📱 Client-side mock enabled:", mockEnabled);

    if (mockEnabled) {
      console.log("✅ Mocks should be working on the client");
    } else {
      console.log("❌ Mocks are disabled on the client");
      console.log("💡 Set NEXT_PUBLIC_USE_MOCKS=true in your .env.local file");
    }
  }

  if (isServer) {
    console.log("🖥️  Server-side environment detected");
  }

  return envVars;
}

// Function to force enable mocks (for testing)
export function forceEnableMocks() {
  if (typeof window !== "undefined") {
    // This is a hack for development - don't use in production
    (window as any).__FORCE_MOCKS__ = true;
    console.log("🔧 Forced mocks enabled via window.__FORCE_MOCKS__");
  }
}

// Function to check if mocks should be used (with fallback)
export function shouldUseMocksWithFallback(): boolean {
  // Check environment variable first
  if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
    return true;
  }

  // Check if mocks were forced via window
  if (typeof window !== "undefined" && (window as any).__FORCE_MOCKS__) {
    return true;
  }

  // Check if we're in development mode
  if (process.env.NODE_ENV === "development") {
    console.log(
      "💡 Development mode detected - consider enabling mocks with NEXT_PUBLIC_USE_MOCKS=true"
    );
  }

  return false;
}
