import dynamic from "next/dynamic";
import type { UnrepliedDetail } from "@/types/types";
import type { RefObject } from "react";

// Lazy load ReplyCard component
const ReplyCard = dynamic(
  () => import("./ReplyCard").then((mod) => ({ default: mod.ReplyCard })),
  {
    loading: () => (
      <div className="animate-pulse bg-white/10 rounded-xl h-32" />
    ),
    ssr: false,
  }
);

interface ConversationListProps {
  conversations: UnrepliedDetail[];
  viewMode: "list" | "grid";
  openRankRanks: Record<number, number | null>;
  loading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  observerRef: RefObject<HTMLDivElement>;
  onReply: (detail: UnrepliedDetail) => void;
  isDarkTheme: boolean;
  useOldDesign: boolean;
  onMarkAsRead?: (detail: UnrepliedDetail) => void;
  onDiscard?: (detail: UnrepliedDetail) => void;
  dayFilter?: string;
}

export function ConversationList({
  conversations,
  viewMode,
  openRankRanks,
  loading,
  isLoadingMore,
  hasMore,
  observerRef,
  onReply,
  isDarkTheme,
  useOldDesign,
  onMarkAsRead,
  onDiscard,
  dayFilter,
}: ConversationListProps) {
  // Render old design
  if (useOldDesign) {
    return (
      <div className="px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          {viewMode === "list" ? (
            <div className="space-y-6">
              {conversations.map((cast, index) => (
                <ReplyCard
                  key={`${cast.castHash}-${index}`}
                  detail={cast}
                  openRank={openRankRanks[cast.authorFid] || null}
                  onClick={() => onReply(cast)}
                  viewMode={viewMode}
                  isDarkTheme={true}
                  useOldDesign={true}
                  onMarkAsRead={onMarkAsRead}
                  onDiscard={onDiscard}
                />
              ))}
            </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {conversations.map((cast, index) => (
                <div
                  key={`${cast.castHash}-${index}`}
                  className="break-inside-avoid mb-6"
                >
                  <ReplyCard
                    detail={cast}
                    openRank={openRankRanks[cast.authorFid] || null}
                    onClick={() => onReply(cast)}
                    viewMode={viewMode}
                    isDarkTheme={true}
                    useOldDesign={true}
                    onMarkAsRead={onMarkAsRead}
                    onDiscard={onDiscard}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Loading More Indicator */}
          {isLoadingMore && (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-3 text-white/80">
                <svg
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-spin"
                  aria-hidden="true"
                >
                  <path d="M23 4v6h-6" />
                  <path d="M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10" />
                  <path d="M20.49 15A9 9 0 0 1 6.36 18.36L1 14" />
                </svg>
                <span className="text-sm font-medium">
                  Loading more conversations...
                </span>
              </div>
            </div>
          )}

          {/* End of Results */}
          {!hasMore && conversations.length > 0 && (
            <div className="text-center py-8">
              <div className="text-white/60 text-sm">
                <span className="font-medium">🎉 All caught up!</span>
                <p className="mt-1">
                  You&apos;ve seen all your unreplied conversations.
                </p>
              </div>
            </div>
          )}

          {/* Intersection Observer Element */}
          <div ref={observerRef} className="h-4 w-full" aria-hidden="true" />

          {/* Empty State */}
          {conversations.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="glass rounded-3xl p-12">
                <div className="text-6xl mb-4">🎉</div>
                <h3
                  className="text-2xl font-bold text-white mb-2"
                  style={{
                    fontFamily: "Instrument Sans, Nunito, Inter, sans-serif",
                  }}
                >
                  All caught up!
                </h3>
                <p className="text-gray-700/80 text-lg">
                  You&apos;ve replied to all your conversations.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render new design
  return (
    <div className="px-6 pb-6">
      <div
        className={`
          max-w-6xl mx-auto
          ${
            viewMode === "grid"
              ? "columns-1 md:columns-2 lg:columns-3 gap-6"
              : "space-y-6"
          }
        `}
      >
        {conversations.map((detail) => (
          <div
            key={detail.castHash}
            className={viewMode === "grid" ? "mb-6 break-inside-avoid" : ""}
          >
            <ReplyCard
              detail={detail}
              openRank={openRankRanks[detail.authorFid]}
              onClick={() => onReply(detail)}
              viewMode={viewMode}
              isDarkTheme={isDarkTheme}
              useOldDesign={false}
              onMarkAsRead={onMarkAsRead}
              onDiscard={onDiscard}
            />
          </div>
        ))}
        {loading && (
          <div className="col-span-full flex justify-center py-8">
            <div
              className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                isDarkTheme ? "border-white/60" : "border-gray-600"
              }`}
            ></div>
          </div>
        )}
        {isLoadingMore && (
          <div className="col-span-full flex justify-center py-4">
            <div
              className={`animate-spin rounded-full h-6 w-6 border-b-2 ${
                isDarkTheme ? "border-white/60" : "border-gray-600"
              }`}
            ></div>
          </div>
        )}
        {hasMore && (
          <div
            ref={observerRef}
            className="h-8 w-full flex items-center justify-center"
            style={{ minHeight: "32px" }}
          >
            {isLoadingMore && (
              <div className="text-xs opacity-50">Loading more...</div>
            )}
          </div>
        )}

        {/* Today filter message */}
        {!hasMore && conversations.length > 0 && dayFilter === "today" && (
          <div className="col-span-full flex justify-center py-6">
            <div
              className={`text-center max-w-md ${
                isDarkTheme ? "text-white/60" : "text-gray-600"
              }`}
            >
              <div className="text-sm">
                <span className="font-medium">
                  📅 Today&apos;s conversations loaded
                </span>
                <p className="mt-1 text-xs opacity-80">
                  Want to see more? Try changing the time filter to &ldquo;Last
                  3 Days&rdquo; or &ldquo;All Time&rdquo; in settings.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
