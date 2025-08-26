import Image from "next/image";
import { sdk } from "@farcaster/miniapp-sdk";
import type { User } from "@/types/types";

interface AppHeaderProps {
  user: User | null;
  conversationCount: number;
  userOpenRank: number | null;
  error: string | null;
  isRefreshing: boolean;
  getCacheStatus: () => {
    isValid: boolean;
    age: number;
    cachedFids: number;
    ttl: number;
  };
  onRefresh: () => void;
  isDarkTheme: boolean;
  useOldDesign: boolean;
}

export function AppHeader({
  user,
  conversationCount,
  userOpenRank,
  error,
  isRefreshing,
  getCacheStatus,
  onRefresh,
  isDarkTheme,
  useOldDesign,
}: AppHeaderProps) {
  const handleProfileClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user?.fid) return;

    try {
      await sdk.actions.viewProfile({ fid: user.fid });
    } catch (error) {
      console.error("Failed to view profile:", error);
    }
  };

  // Render old design
  if (useOldDesign) {
    return (
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-cyan-500/20"></div>
        <div className="relative px-6 pt-12 pb-8">
          <div className="max-w-3xl mx-auto text-center">
            {/* App Title with Logo */}
            <div className="flex flex-col items-center justify-center mb-2">
              <Image
                src="/logo.png"
                alt="ReplyCast Logo"
                width={75}
                height={75}
                className="mb-2 rounded-xl shadow-lg"
                priority
              />
              <h1
                className="text-5xl font-black text-white tracking-tight"
                style={{
                  fontFamily: "Instrument Sans, Nunito, Inter, sans-serif",
                }}
              >
                ReplyCast
              </h1>
              <p
                className="text-xl md:text-2xl font-medium text-white/90 mb-8"
                style={{
                  fontFamily: "Instrument Sans, Nunito, Inter, sans-serif",
                }}
              >
                Never miss a reply again
              </p>
            </div>

            {/* User Greeting */}
            {user && (
              <div className="mb-6 flex items-center justify-left gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                {user.pfpUrl && (
                  <Image
                    src={`/api/image-proxy?url=${user.pfpUrl}`}
                    alt="Profile picture"
                    width={60}
                    height={60}
                    className="rounded-full border-2 border-white/30"
                  />
                )}
                <div className="flex flex-col text-left items-start">
                  <button
                    onClick={handleProfileClick}
                    className="text-white font-semibold text-lg hover:text-blue-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded mb-1"
                    aria-label={`View @${user.username}'s profile`}
                  >
                    {user.displayName}
                  </button>
                  <div className="text-white/70 text-sm">FID: {user.fid}</div>
                  {userOpenRank !== null && (
                    <div className="text-white/70 text-sm mt-1">
                      OpenRank: {userOpenRank.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stats Card */}
            <div className="glass rounded-3xl p-10 mb-8 animate-fade-in-up shadow-xl border border-white/30">
              <div className="text-center">
                <div className="text-white/80 text-lg font-medium mb-2">
                  {user?.username} has
                </div>
                <div
                  className="text-7xl md:text-8xl font-extrabold text-white mb-2 tracking-tighter"
                  style={{
                    fontFamily: "Instrument Sans, Nunito, Inter, sans-serif",
                  }}
                >
                  {conversationCount !== undefined ? conversationCount : "--"}
                </div>
                <div className="text-white text-xl font-semibold mb-2">
                  unreplied conversations
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mt-6 bg-red-500/10 border border-red-400/30 rounded-xl p-4">
                    <div className="text-red-700 text-sm font-medium">
                      {error}
                    </div>
                  </div>
                )}

                {/* Cache Status - Development Only */}
                {process.env.NODE_ENV === "development" && (
                  <div className="text-xs text-white/60 bg-white/5 px-2 py-1 rounded-lg border border-white/10 mt-4">
                    <span className="font-mono">
                      Cache: {getCacheStatus().cachedFids} FIDs (
                      {getCacheStatus().age}s)
                    </span>
                  </div>
                )}

                {/* Refresh Button */}
                <button
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="btn-secondary mt-6 inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-xl px-4 py-2 text-base"
                  aria-label="Refresh"
                >
                  <svg
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`${isRefreshing ? "animate-spin" : ""}`}
                    aria-hidden="true"
                  >
                    <path d="M23 4v6h-6" />
                    <path d="M1 20v-6h6" />
                    <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10" />
                    <path d="M20.49 15A9 9 0 0 1 6.36 18.36L1 14" />
                  </svg>
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render new design
  return (
    <div
      className={`px-6 py-4 ${
        isDarkTheme
          ? "bg-white/10 backdrop-blur-sm border-b border-white/20"
          : "bg-white/60 backdrop-blur-sm border-b border-gray-200"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {user?.pfpUrl && (
              <Image
                src={`/api/image-proxy?url=${user.pfpUrl}`}
                alt={`${user.username}'s avatar`}
                width={48}
                height={48}
                className="rounded-full border-2 border-white/20"
              />
            )}
            <div className="text-left">
              <button
                onClick={handleProfileClick}
                className={`font-semibold text-lg hover:text-blue-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded ${
                  isDarkTheme ? "text-white" : "text-gray-900"
                }`}
                aria-label={`View @${user?.username}'s profile`}
              >
                {user?.displayName} (@{user?.username})
              </button>
              <div className="flex flex-col">
                <button
                  onClick={handleProfileClick}
                  className={`text-sm hover:text-blue-300/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded ${
                    isDarkTheme ? "text-white/70" : "text-gray-600"
                  }`}
                  style={{
                    marginBottom: "-5px",
                  }}
                  aria-label={`View FID ${user?.fid}'s profile`}
                >
                  FID: {user?.fid}tarstast
                </button>
                {userOpenRank !== null && (
                  <div
                    className={`text-sm ${
                      isDarkTheme ? "text-white/70" : "text-gray-600"
                    }`}
                  >
                    OpenRank: {userOpenRank.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div
              className={`text-right ${
                isDarkTheme ? "text-white/70" : "text-gray-600"
              }`}
            >
              <div className="text-sm">
                {conversationCount} conversation
                {conversationCount !== 1 ? "s" : ""}
              </div>
              {error && (
                <div className="text-red-400 text-sm mt-1">{error}</div>
              )}
            </div>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className={`p-2 rounded-full transition-colors ${
                isRefreshing
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-white/10"
              } ${isDarkTheme ? "text-white" : "text-gray-700"}`}
              aria-label="Refresh conversations"
            >
              <svg
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className={isRefreshing ? "animate-spin" : ""}
              >
                <path d="M21 2v6h-6" />
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M3 22v-6h6" />
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
