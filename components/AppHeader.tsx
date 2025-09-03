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
                // Disable optimization to prevent multiple requests
                unoptimized={true}
                // Disable lazy loading for immediate display
                priority={false}
                loading="eager"
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
                  aria-label={`View FID ${user?.fid}'s profile`}
                >
                  FID: {user?.fid}
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
