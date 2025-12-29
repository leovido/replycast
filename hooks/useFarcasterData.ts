import { useEffect, useCallback, useRef, useReducer } from "react";
import type {
  FarcasterRepliesResponse,
  UnrepliedDetail,
  User,
  Cursor,
} from "@/types/types";
import { MockFarcasterService } from "@/utils/mockService";

interface UseFarcasterDataProps {
  user: User | null;
  fetchOpenRankData: (fids: number[]) => Promise<void>;
  clearOpenRankCache: () => void;
  dayFilter?: string;
}

export class FarcasterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FarcasterError';
  }
}

// State shape for useReducer
interface State {
  data: FarcasterRepliesResponse | null;
  loading: boolean;
  error: string | null;
  isRefreshing: boolean;
  cursor: Cursor;
  hasMore: boolean;
  isLoadingMore: boolean;
  conversations: UnrepliedDetail[];
  userOpenRank: number | null;
  userQuotientScore: number | null;
  userFollowingRank: number | null;
}

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: FarcasterRepliesResponse }
  | { type: 'FETCH_ERROR'; error: string }
  | { type: 'LOAD_MORE_START' }
  | { type: 'LOAD_MORE_SUCCESS'; payload: UnrepliedDetail[]; cursor: Cursor }
  | { type: 'LOAD_MORE_ERROR' }
  | { type: 'REFRESH_START' }
  | { type: 'REFRESH_SUCCESS'; payload: FarcasterRepliesResponse }
  | { type: 'SET_USER_RANKS'; openRank: number | null; quotient: number | null; following: number | null }
  | { type: 'RESET_PAGINATION' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    
    case 'FETCH_SUCCESS':
      return {
        ...state,
        data: action.payload,
        loading: false,
        isLoadingMore: false,
        conversations: deduplicateConversations(action.payload.unrepliedDetails || []),
        cursor: action.payload.nextCursor || null,
        hasMore: !!action.payload.nextCursor,
      };
    
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.error, hasMore: false, isRefreshing: false };
    
    case 'LOAD_MORE_START':
      return { ...state, isLoadingMore: true };
    
    case 'LOAD_MORE_SUCCESS':
      return {
        ...state,
        isLoadingMore: false,
        conversations: deduplicateAndMerge(state.conversations, action.payload),
        cursor: action.cursor,
        hasMore: !!action.cursor && action.payload.length > 0,
      };
    
    case 'LOAD_MORE_ERROR':
      return { ...state, isLoadingMore: false, hasMore: false };
    
    case 'REFRESH_START':
      return { ...state, isRefreshing: true, error: null };
    
    case 'REFRESH_SUCCESS':
      return {
        ...state,
        isRefreshing: false,
        data: action.payload,
        conversations: deduplicateConversations(action.payload.unrepliedDetails || []),
        cursor: action.payload.nextCursor || null,
        hasMore: !!action.payload.nextCursor,
      };
    
    case 'SET_USER_RANKS':
      return {
        ...state,
        userOpenRank: action.openRank,
        userQuotientScore: action.quotient,
        userFollowingRank: action.following,
      };
    
    case 'RESET_PAGINATION':
      return {
        ...state,
        cursor: null,
        hasMore: true,
        isLoadingMore: false,
        conversations: [],
      };
    
    default:
      return state;
  }
}

// Helper functions
function deduplicateConversations(conversations: UnrepliedDetail[]): UnrepliedDetail[] {
  const seen = new Set<string>();
  return conversations.filter(conv => {
    if (seen.has(conv.castHash)) return false;
    seen.add(conv.castHash);
    return true;
  });
}

function deduplicateAndMerge(existing: UnrepliedDetail[], newItems: UnrepliedDetail[]): UnrepliedDetail[] {
  const existingHashes = new Set(existing.map(item => item.castHash));
  const filtered = newItems.filter(item => !existingHashes.has(item.castHash));
  return [...existing, ...filtered];
}

export function useFarcasterData({
  user,
  fetchOpenRankData,
  clearOpenRankCache,
  dayFilter = "today",
}: UseFarcasterDataProps) {
  const [state, dispatch] = useReducer(reducer, {
    data: null,
    loading: true,
    error: null,
    isRefreshing: false,
    cursor: null,
    hasMore: true,
    isLoadingMore: false,
    conversations: [],
    userOpenRank: null,
    userQuotientScore: null,
    userFollowingRank: null,
  });

  // Store function refs to avoid dependency issues
  const fetchOpenRankDataRef = useRef(fetchOpenRankData);
  const clearOpenRankCacheRef = useRef(clearOpenRankCache);
  
  useEffect(() => {
    fetchOpenRankDataRef.current = fetchOpenRankData;
    clearOpenRankCacheRef.current = clearOpenRankCache;
  });

  // Fetch user reputation (separate effect for separate concern)
  useEffect(() => {
    if (!user?.fid) return;

    const abortController = new AbortController();
    
    const fetchReputation = async () => {
      try {
        const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
          (typeof window !== "undefined" && (window as any).__FORCE_MOCKS__);

        if (useMocks) {
          const mockScore = await MockFarcasterService.fetchUserReputation(user.fid, "quotient");
          dispatch({ type: 'SET_USER_RANKS', openRank: mockScore, quotient: null, following: null });
          return;
        }

        // Parallel fetch with timeout
        const [openRankResponse, quotientResponse] = await Promise.all([
          fetch(`/api/openRank?fids=${user.fid}`, {
            signal: abortController.signal,
          }),
          fetch(`/api/quotient`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fids: [user.fid] }),
            signal: abortController.signal,
          }),
        ]);

        let openRank = null, quotient = null, following = null;

        if (openRankResponse.ok) {
          const data = await openRankResponse.json();
          if (data.ranks?.[user.fid]) {
            openRank = data.ranks[user.fid].engagement.rank;
            following = data.ranks[user.fid].following.rank;
          }
        }

        if (quotientResponse.ok) {
          const data = await quotientResponse.json();
          if (data.data?.[0]) {
            quotient = data.data[0].quotientScore;
          }
        }

        dispatch({ type: 'SET_USER_RANKS', openRank, quotient, following });
      } catch (error: unknown) {
        console.error("Failed to fetch user reputation:", error);
      }
    };

    fetchReputation();

    return () => abortController.abort();
  }, [user?.fid]); // Only primitive dependency

  // Main data fetch effect
  useEffect(() => {
    if (!user?.fid) return;

    const abortController = new AbortController();
    let isCancelled = false;

    const fetchData = async () => {
      dispatch({ type: 'FETCH_START' });

      try {
        const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
          (typeof window !== "undefined" && (window as any).__FORCE_MOCKS__);

        let responseData: FarcasterRepliesResponse;

        if (useMocks) {
          responseData = await MockFarcasterService.fetchReplies(user.fid, dayFilter, 25);
        } else {
          const url = new URL("/api/farcaster-notification-replies", window.location.origin);
          url.searchParams.set("fid", user.fid.toString());
          url.searchParams.set("limit", "25");
          if (dayFilter !== "all") {
            url.searchParams.set("dayFilter", dayFilter);
          }

          const res = await fetch(url.toString(), {
            signal: abortController.signal,
          });
          
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          responseData = await res.json();
        }

        if (isCancelled) return;

        dispatch({ type: 'FETCH_SUCCESS', payload: responseData });

        // Fire and forget: fetch OpenRank for conversation authors
        if (responseData.unrepliedDetails?.length > 0) {
          const fids = responseData.unrepliedDetails.map(detail => detail.authorFid);
          fetchOpenRankDataRef.current(fids).catch(console.error);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') return;
          if (isCancelled) return;
          
          dispatch({
            type: 'FETCH_ERROR',
            error: error instanceof Error ? error.message : "Failed to load conversations",
          });
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
      abortController.abort();
    };
  }, [user?.fid, dayFilter]); // Only primitive dependencies

  // Load more callback
  const loadMoreConversations = useCallback(async () => {
    if (!state.hasMore || state.isLoadingMore || state.loading || !user?.fid) return;

    const abortController = new AbortController();
    dispatch({ type: 'LOAD_MORE_START' });

    try {
      const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
        (typeof window !== "undefined" && (window as any).__FORCE_MOCKS__);

      let responseData: FarcasterRepliesResponse;

      if (useMocks) {
        responseData = await MockFarcasterService.fetchReplies(
          user.fid,
          dayFilter,
          25,
          state.cursor || undefined
        );
      } else {
        const url = new URL("/api/farcaster-notification-replies", window.location.origin);
        url.searchParams.set("fid", user.fid.toString());
        if (state.cursor) {
          url.searchParams.set("cursor", state.cursor);
        }
        if (dayFilter !== "all") {
          url.searchParams.set("dayFilter", dayFilter);
        }

        const res = await fetch(url.toString(), {
          signal: abortController.signal,
        });
        responseData = await res.json();
      }

      dispatch({
        type: 'LOAD_MORE_SUCCESS',
        payload: responseData.unrepliedDetails || [],
        cursor: responseData.nextCursor || null,
      });

      // Fire and forget: fetch OpenRank
      if (responseData.unrepliedDetails?.length > 0) {
        const fids = responseData.unrepliedDetails.map(detail => detail.authorFid);
        fetchOpenRankDataRef.current(fids).catch(console.error);
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') return;
        dispatch({ type: 'LOAD_MORE_ERROR' });
      }
    }
  }, [state.hasMore, state.isLoadingMore, state.loading, state.cursor, user?.fid, dayFilter]);

  // Refresh callback
  const handleRefresh = useCallback(async () => {
    if (!user?.fid) return;

    dispatch({ type: 'REFRESH_START' });
    clearOpenRankCacheRef.current();

    try {
      const url = new URL("/api/farcaster-notification-replies", window.location.origin);
      url.searchParams.set("fid", user.fid.toString());
      url.searchParams.set("limit", "25");
      if (dayFilter !== "all") {
        url.searchParams.set("dayFilter", dayFilter);
      }

      const res = await fetch(url.toString(), { cache: "no-store" });
      const responseData = await res.json();

      dispatch({ type: 'REFRESH_SUCCESS', payload: responseData });

      // Fire and forget: fetch OpenRank
      if (responseData.unrepliedDetails?.length > 0) {
        const fids = responseData.unrepliedDetails.map((detail: UnrepliedDetail) => detail.authorFid);
        fetchOpenRankDataRef.current(fids).catch(console.error);
      }
    } catch (err) {
      dispatch({
        type: 'FETCH_ERROR',
        error: "Failed to refresh conversations",
      });
    }
  }, [user?.fid, dayFilter]);

  const resetPagination = useCallback(() => {
    dispatch({ type: 'RESET_PAGINATION' });
  }, []);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    isRefreshing: state.isRefreshing,
    allConversations: state.conversations,
    hasMore: state.hasMore,
    isLoadingMore: state.isLoadingMore,
    cursor: state.cursor,
    userOpenRank: state.userOpenRank,
    userQuotientScore: state.userQuotientScore,
    userFollowingRank: state.userFollowingRank,
    loadMoreConversations,
    handleRefresh,
    resetPagination,
  };
}