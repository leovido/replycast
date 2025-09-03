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
  quotientScores: Record<number, { quotientScore: number } | null>;
  reputationType: "quotient" | "openrank";
  loading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  observerRef: RefObject<HTMLDivElement>;
  onReply: (detail: UnrepliedDetail) => void;
  isDarkTheme: boolean;
  onMarkAsRead?: (detail: UnrepliedDetail) => void;
  onDiscard?: (detail: UnrepliedDetail) => void;
  dayFilter?: string;
}

export function ConversationList({
  conversations,
  viewMode,
  openRankRanks,
  quotientScores,
  reputationType,
  loading,
  isLoadingMore,
  hasMore,
  observerRef,
  onReply,
  isDarkTheme,
  onMarkAsRead,
  onDiscard,
  dayFilter,
}: ConversationListProps) {
  return (
    <div className="px-6">
      <div
        className={`
          max-w-6xl mx-auto
          ${
            viewMode === "grid"
              ? "columns-1 md:columns-2 lg:columns-3 gap-4"
              : "space-y-4"
          }
        `}
      >
        {conversations.map((detail) => (
          <div
            key={detail.castHash}
            className={viewMode === "grid" ? "mb-4 break-inside-avoid" : ""}
          >
            <ReplyCard
              detail={detail}
              openRank={openRankRanks[detail.authorFid]}
              quotientScore={
                quotientScores[detail.authorFid]?.quotientScore || null
              }
              reputationType={reputationType}
              onClick={() => onReply(detail)}
              viewMode={viewMode}
              isDarkTheme={isDarkTheme}
              onMarkAsRead={onMarkAsRead}
              onDiscard={onDiscard}
            />
          </div>
        ))}
        {loading && (
          <div className="col-span-full flex justify-center py-4">
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
          <div className="col-span-full flex justify-center py-4 pb-20">
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
