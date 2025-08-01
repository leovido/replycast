import { useState, useEffect, useMemo, memo } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

// Hooks
import { useFarcasterAuth } from "@/hooks/useFarcasterAuth";
import { useOpenRank } from "@/hooks/useOpenRank";
import { useFarcasterData } from "@/hooks/useFarcasterData";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

// Components
import { LoadingScreen } from "./LoadingScreen";
import { FarcasterSignIn } from "./FarcasterSignIn";
import { AppHeader } from "./AppHeader";
import { Filters } from "./Filters";
import { ConversationList } from "./ConversationList";

// Utils
import { sortDetails } from "@/utils/farcaster";

// Types
import type {
  ViewMode,
  DayFilter,
  SortOption,
  UnrepliedDetail,
} from "@/types/farcaster";

const FarcasterApp = memo(() => {
  // Authentication
  const {
    user,
    loading: authLoading,
    error: authError,
    isInMiniApp,
    handleSignIn,
    handleSignInError,
  } = useFarcasterAuth();

  // OpenRank data
  const { openRankRanks, fetchOpenRankRanks, getCacheStatus, clearCache } =
    useOpenRank();

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [dayFilter, setDayFilter] = useState<DayFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  // Farcaster data
  const {
    data,
    loading: dataLoading,
    error: dataError,
    isRefreshing,
    allConversations,
    hasMore,
    isLoadingMore,
    loadMoreConversations,
    handleRefresh,
    resetPagination,
  } = useFarcasterData({
    user,
    fetchOpenRankRanks,
    clearOpenRankCache: clearCache,
    dayFilter,
  });

  // Infinite scroll
  const { observerRef } = useInfiniteScroll({
    hasMore,
    isLoadingMore,
    loading: dataLoading,
    loadMoreConversations,
  });

  // Reset pagination when filters change
  useEffect(() => {
    if (allConversations.length > 0) {
      resetPagination();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayFilter, sortOption]);

  // Reply handler
  const handleReply = async (cast: UnrepliedDetail) => {
    try {
      console.log("viewing cast...");
      await sdk.actions.viewCast({
        hash: cast.castHash,
      });
    } catch (error) {
      console.error("Failed to view cast:", error);
      // Could implement fallback modal here if needed
    }
  };

  // Memoized processed data
  const processedConversations = useMemo(() => {
    if (!allConversations.length) return [];

    // Apply sorting only (filtering is now handled on the backend)
    return sortDetails(allConversations, sortOption, openRankRanks);
  }, [allConversations, sortOption, openRankRanks]);

  // Loading state
  const loading = authLoading || dataLoading;
  const error = authError || dataError;

  // Show loading screen when loading is true
  if (loading) {
    return <LoadingScreen />;
  }

  // Show sign-in screen if not in Mini App and no user
  if (!isInMiniApp && !user) {
    return (
      <FarcasterSignIn onSignIn={handleSignIn} onError={handleSignInError} />
    );
  }

  // Show error screen
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 font-sans">
      {/* Header Section */}
      <AppHeader
        user={user}
        conversationCount={allConversations.length}
        error={error}
        isRefreshing={isRefreshing}
        getCacheStatus={getCacheStatus}
        onRefresh={handleRefresh}
      />

      {/* Filter Section */}
      <div className="px-6 pb-4">
        <div className="max-w-3xl mx-auto">
          <Filters
            viewMode={viewMode}
            dayFilter={dayFilter}
            sortOption={sortOption}
            onViewModeChange={setViewMode}
            onDayFilterChange={setDayFilter}
            onSortOptionChange={setSortOption}
          />
        </div>
      </div>

      {/* Conversations List */}
      <ConversationList
        conversations={processedConversations}
        viewMode={viewMode}
        openRankRanks={openRankRanks}
        loading={loading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        observerRef={observerRef}
        onReply={handleReply}
      />
    </div>
  );
});

FarcasterApp.displayName = "FarcasterApp";

export default FarcasterApp;
