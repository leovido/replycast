import { useEffect, useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { sdk } from '@farcaster/miniapp-sdk'
import { ReplyCard } from './ReplyCard';
import { User } from '@/types/types';

interface UnrepliedDetail {
  username: string;
  timeAgo: string;
  castUrl: string;
  text: string;
  avatarUrl: string;
  castHash: string;
  authorFid: number;
  originalCastText: string;
  originalCastHash: string;
  originalAuthorUsername: string;
  replyCount: number;
}

interface FarcasterRepliesResponse {
  unrepliedCount: number;
  unrepliedDetails: UnrepliedDetail[];
  message: string;
  nextCursor?: string | null;
}

const mockReplies: FarcasterRepliesResponse = {
  unrepliedCount: 3,
  unrepliedDetails: [
  {
    avatarUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
    username: 'sophia',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    timeAgo: '2h',
    authorFid: 123,
    castUrl: 'https://farcaster.xyz/cast/123',
    castHash: '123',
    originalCastText: 'Original text',
    originalCastHash: '123',
    originalAuthorUsername: 'original_author',
    replyCount: 0,
  },
  {
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    username: 'alex',
    text: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    timeAgo: '1h',
    authorFid: 123,
    castUrl: 'https://farcaster.xyz/cast/123',
    castHash: '123',
    originalCastText: 'Original text',
    originalCastHash: '123',
    originalAuthorUsername: 'original_author',
    replyCount: 0,
  },
  {
    avatarUrl: 'https://randomuser.me/api/portraits/women/65.jpg',
    username: 'olivia',
    text: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco.',
    timeAgo: '5m',
    authorFid: 123,
    castUrl: 'https://farcaster.xyz/cast/123',
    castHash: '123',
    originalCastText: 'Original text',
    originalCastHash: '123',
    originalAuthorUsername: 'original_author',
    replyCount: 0,
  },
  ],
  message: 'Success',
};

// Loading Screen Component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center">
      <div className="text-center">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
            <svg
              width={32}
              height={32}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-center"
              aria-hidden="true"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        </div>
        
        {/* App Title */}
        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
          ReplyCast
        </h1>
        <p className="text-white/80 text-lg font-medium mb-8">
          Loading your conversations...
        </p>
        
        {/* Loading Animation */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  )
}

export default function FarcasterApp() {
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<FarcasterRepliesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCast, setSelectedCast] = useState<UnrepliedDetail | null>(null)
  const [replyText, setReplyText] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const [replyError, setReplyError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [dayFilter, setDayFilter] = useState<'all' | 'today' | '3days' | '7days'>('all')
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'fid-asc' | 'fid-desc' | 'short' | 'medium' | 'long'>('newest')
  const [openRankRanks, setOpenRankRanks] = useState<Record<number, number | null>>({})
  
  // Pagination state
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [allConversations, setAllConversations] = useState<UnrepliedDetail[]>([])
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const observerRef = useRef<HTMLDivElement>(null)
  
  // Cache for OpenRank data with TTL (5 minutes)
  const openRankCache = useRef<{
    data: Record<number, number | null>;
    timestamp: number;
  }>({ data: {}, timestamp: 0 });
  
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Utility to check cache status
  const getCacheStatus = useCallback(() => {
    const now = Date.now();
    const isCacheValid = (now - openRankCache.current.timestamp) < CACHE_TTL;
    const cacheAge = Math.round((now - openRankCache.current.timestamp) / 1000);
    const cachedFids = Object.keys(openRankCache.current.data).length;
    
    return {
      isValid: isCacheValid,
      age: cacheAge,
      cachedFids,
      ttl: Math.round(CACHE_TTL / 1000)
    };
  }, [CACHE_TTL]);

  // Helper to fetch OpenRank ranks with caching
  const fetchOpenRankRanks = useCallback(async (fids: number[]) => {
    if (fids.length === 0) return;
    
    const now = Date.now();
    const uniqueFids = Array.from(new Set(fids));
    
    // Check if cache is still valid
    const isCacheValid = (now - openRankCache.current.timestamp) < CACHE_TTL;
    
    // Filter out FIDs that are already cached and valid
    const cachedFids = uniqueFids.filter(fid => 
      isCacheValid && openRankCache.current.data.hasOwnProperty(fid)
    );
    
    // FIDs that need to be fetched
    const fidsToFetch = uniqueFids.filter(fid => 
      !isCacheValid || !openRankCache.current.data.hasOwnProperty(fid)
    );
    
    // If we have cached data, use it immediately
    if (cachedFids.length > 0) {
      const cachedRanks: Record<number, number | null> = {};
      cachedFids.forEach(fid => {
        cachedRanks[fid] = openRankCache.current.data[fid];
      });
      
      // Update state with cached data
      setOpenRankRanks(prev => ({ ...prev, ...cachedRanks }));
    }
    
    // If no FIDs need fetching, we're done
    if (fidsToFetch.length === 0) {
      return;
    }
    
    try {
      const cacheStatus = getCacheStatus();
      console.log(`OpenRank cache: ${cacheStatus.cachedFids} FIDs cached, ${cacheStatus.age}s old (TTL: ${cacheStatus.ttl}s)`);
      console.log(`Fetching OpenRank for ${fidsToFetch.length} FIDs (${cachedFids.length} from cache)`);
      
      const response = await fetch(`/api/openRank?fids=${fidsToFetch.join(',')}`);
      const data = await response.json();
      
      if (data.ranks) {
        // Convert string keys to numbers for consistency
        const newRankMap: Record<number, number | null> = {};
        
        Object.entries(data.ranks).forEach(([fid, rank]) => {
          newRankMap[parseInt(fid)] = rank as number | null;
        });
        
        // Update cache with new data
        openRankCache.current.data = { ...openRankCache.current.data, ...newRankMap };
        openRankCache.current.timestamp = now;
        
        // Update state with new data
        setOpenRankRanks(prev => ({ ...prev, ...newRankMap }));
      }
    } catch (error) {
      console.error('Failed to fetch OpenRank ranks:', error);
    }
  }, [CACHE_TTL, getCacheStatus]);

  // Helper to filter by day
  function filterByDay(details: UnrepliedDetail[]) {
    if (dayFilter === 'all') return details;
    return details.filter(detail => {
      const match = detail.timeAgo.match(/(\d+)([mhd])/);
      if (!match) return true;
      const value = parseInt(match[1], 10);
      const unit = match[2];
      let minutesAgo = 0;
      if (unit === 'm') minutesAgo = value;
      if (unit === 'h') minutesAgo = value * 60;
      if (unit === 'd') minutesAgo = value * 60 * 24;
      if (dayFilter === 'today') return minutesAgo <= 60 * 24;
      if (dayFilter === '3days') return minutesAgo <= 60 * 24 * 3;
      if (dayFilter === '7days') return minutesAgo <= 60 * 24 * 7;
      return true;
    });
  }

  // Helper to sort
  function sortDetails(details: UnrepliedDetail[]) {
    let arr = [...details];
    switch (sortOption) {
      case 'newest':
        // Assume timeAgo is like '2h', '5m', '1d'. Sort by minutesAgo ascending (newest first)
        arr.sort((a, b) => getMinutesAgo(a.timeAgo) - getMinutesAgo(b.timeAgo));
        break;
      case 'oldest':
        arr.sort((a, b) => getMinutesAgo(b.timeAgo) - getMinutesAgo(a.timeAgo));
        break;
      case 'fid-asc':
        arr.sort((a, b) => a.authorFid - b.authorFid);
        break;
      case 'fid-desc':
        arr.sort((a, b) => b.authorFid - a.authorFid);
        break;
      case 'short':
        arr = arr.filter(d => d.text.length < 20);
        break;
      case 'medium':
        arr = arr.filter(d => d.text.length >= 20 && d.text.length <= 50);
        break;
      case 'long':
        arr = arr.filter(d => d.text.length > 50);
        break;
      default:
        break;
    }
    return arr;
  }

  function getMinutesAgo(timeAgo: string) {
    const match = timeAgo.match(/(\d+)([mhd])/);
    if (!match) return 0;
    const value = parseInt(match[1], 10);
    const unit = match[2];
    if (unit === 'm') return value;
    if (unit === 'h') return value * 60;
    if (unit === 'd') return value * 60 * 24;
    return 0;
  }

  const MAX_CHARACTERS = 320 // Farcaster cast limit

  const fetchData = useCallback(async (isInitialLoad = true) => {
    try {
      const userFid = user?.fid || 203666;
      const url = new URL('/api/farcaster-replies', window.location.origin);
      url.searchParams.set('fid', userFid.toString());
      url.searchParams.set('limit', '5');
      
      if (!isInitialLoad && cursor) {
        url.searchParams.set('cursor', cursor);
      }
      
      const res = await fetch(url.toString(), {
        cache: isInitialLoad ? 'default' : 'no-store'
      });
      const responseData = await res.json();
      
      if (responseData) {
        if (isInitialLoad) {
          // Initial load - replace all data
          setData(responseData);
          setAllConversations(responseData.unrepliedDetails || []);
          setCursor(responseData.nextCursor || null);
          setHasMore(!!responseData.nextCursor);
          setLoading(false);
        } else {
          // Pagination load - append data
          setData(prev => ({
            ...prev!,
            unrepliedDetails: [...(prev?.unrepliedDetails || []), ...(responseData.unrepliedDetails || [])],
            unrepliedCount: (prev?.unrepliedCount || 0) + (responseData.unrepliedDetails?.length || 0)
          }));
          setAllConversations(prev => [...prev, ...(responseData.unrepliedDetails || [])]);
          setCursor(responseData.nextCursor || null);
          setHasMore(!!responseData.nextCursor);
          setIsLoadingMore(false);
        }
        
        // Fetch OpenRank ranks for new FIDs
        const newFids = responseData.unrepliedDetails?.map((detail: UnrepliedDetail) => detail.authorFid) || [];
        if (newFids.length > 0) {
          await fetchOpenRankRanks(newFids);
        }
      } else {
        setError(responseData.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError('Failed to load conversations');
      if (!isInitialLoad) {
        setIsLoadingMore(false);
      }
    }
  }, [user, fetchOpenRankRanks, cursor])

  // Reset pagination when filters change
  useEffect(() => {
    if (allConversations.length > 0) {
      setCursor(null);
      setHasMore(true);
      setIsLoadingMore(false);
      setAllConversations([]);
      fetchData(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayFilter, sortOption]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoadingMore && !loading) {
          setIsLoadingMore(true);
          fetchData(false);
        }
      },
      {
        rootMargin: '100px', // Start loading when 100px from bottom
        threshold: 0.1
      }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasMore, isLoadingMore, loading, fetchData]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const ctx = await sdk.context;
        const farUser = ctx?.user ?? {
          fid: 203666,
          username: 'test',
          displayName: 'test',
          pfpUrl: 'https://cdn-icons-png.flaticon.com/512/1828/1828640.png',
        };

        if (!farUser || !farUser.fid) throw new Error('Farcaster user not found');
        setUser(farUser);

        await fetchData(true)

        await sdk.actions.ready()
       } catch (err) {
        setError(`Error: ${err}`)
      }
    }
    
    initializeApp()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setError(null)
    
    // Clear OpenRank cache to force fresh data
    openRankCache.current = { data: {}, timestamp: 0 };
    
    // Reset pagination state
    setCursor(null)
    setHasMore(true)
    setIsLoadingMore(false)
    setAllConversations([])
    
    // Force refresh by bypassing cache
    await fetchData(true)
    setIsRefreshing(false)
  }

  const handleReply = async (cast: UnrepliedDetail) => {
    setSelectedCast(cast)
    setReplyText('')
    setReplyError(null)
    // Focus the textarea after modal opens
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 100)
  }

  const handleComposeCast = async () => {
    if (!selectedCast || !replyText.trim()) return
    
    setIsComposing(true)
    setReplyError(null)
    
    try {
      const result = await sdk.actions.composeCast({
        text: replyText,
        parent: {
          type: 'cast',
          hash: selectedCast.castHash
        }
      })
      
      if (result?.cast) {
        // Success! Clear the form and refresh data
        setSelectedCast(null)
        setReplyText('')
        // Reset pagination and refresh all data
        setCursor(null)
        setHasMore(true)
        setIsLoadingMore(false)
        setAllConversations([])
        await fetchData(true) // Refresh to update the list
      }
    } catch (error) {
      console.error('Failed to compose cast:', error)
      setReplyError('Failed to send reply. Please try again.')
    } finally {
      setIsComposing(false)
    }
  }

  const handleCancelReply = () => {
    setSelectedCast(null)
    setReplyText('')
    setReplyError(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleComposeCast()
    } else if (e.key === 'Escape') {
      handleCancelReply()
    }
  }

  const charactersRemaining = MAX_CHARACTERS - replyText.length
  const isOverLimit = charactersRemaining < 0

  let username = '@username';
  if (data && data.unrepliedDetails.length > 0) {
    username = `@${data.unrepliedDetails[0].username}`;
  }

  // Show loading screen when loading is true
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 font-sans">
        {/* Header Section - Always visible */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-cyan-500/20"></div>
          <div className="relative px-6 pt-12 pb-8">
            <div className="max-w-3xl mx-auto text-center">
              {/* App Title */}
              <div className="mb-8">
                <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-2 tracking-tight" style={{ fontFamily: 'Instrument Sans, Nunito, Inter, sans-serif' }}>
                  ReplyCast
                </h1>
                <p className="text-xl md:text-2xl font-medium text-white/90 mb-8" style={{ fontFamily: 'Instrument Sans, Nunito, Inter, sans-serif' }}>
                  Never miss a reply again
                </p>
              </div>
              
              {/* User Greeting */}
              {user && (
                <div className="mb-6 flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  {user.pfpUrl && (
                    <Image 
                      src={`/api/image-proxy?url=${user.pfpUrl}`} 
                      alt="Profile picture" 
                      width={40} 
                      height={40} 
                      className="rounded-full border-2 border-white/30"
                    />
                  )}
                  <div className="text-center">
                    <div className="text-white font-semibold text-lg">
                      Hi, @{user.username || user.displayName || user.fid}
                    </div>
                    <div className="text-white/70 text-sm">
                      FID: {user.fid}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Stats Card - Placeholder */}
              <div className="glass rounded-3xl p-10 mb-8 animate-fade-in-up shadow-xl border border-white/30">
                <div className="text-center">
                  <div className="text-gray-900/80 text-lg font-medium mb-2">
                    Loading...
                  </div>
                  <div className="text-7xl md:text-8xl font-extrabold text-gray-900 mb-2 tracking-tighter animate-pulse" style={{ fontFamily: 'Instrument Sans, Nunito, Inter, sans-serif' }}>
                    --
                  </div>
                  <div className="text-gray-800/90 text-xl font-semibold mb-2">
                    unreplied conversations
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Conversations List - Placeholder Cards */}
        <div className="px-4 pb-12">
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {/* Placeholder Reply Cards */}
              {[1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="max-w-md w-full mx-auto bg-[#181A20]/50 rounded-2xl shadow-xl p-6 mb-6 flex items-start gap-4 animate-pulse"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-400/30 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-6 bg-gray-400/30 rounded w-24"></div>
                      <div className="h-4 bg-gray-400/30 rounded w-16"></div>
                    </div>
                    <div className="h-6 bg-gray-400/30 rounded w-full mt-2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Filtered and sorted data for rendering
  const filteredDetails = allConversations.length > 0 ? sortDetails(filterByDay(allConversations)) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 font-sans">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-cyan-500/20"></div>
        <div className="relative px-6 pt-12 pb-8">
          <div className="max-w-3xl mx-auto text-center">
            {/* App Title */}
            <div className="mb-8">
              <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-2 tracking-tight" style={{ fontFamily: 'Instrument Sans, Nunito, Inter, sans-serif' }}>
                ReplyCast
              </h1>
              <p className="text-xl md:text-2xl font-medium text-white/90 mb-8" style={{ fontFamily: 'Instrument Sans, Nunito, Inter, sans-serif' }}>
                Never miss a reply again
              </p>
            </div>
            
            {/* User Greeting */}
            {user && (
              <div className="mb-6 flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                {user.pfpUrl && (
                  <Image 
                    src={`/api/image-proxy?url=${user.pfpUrl}`} 
                    alt="Profile picture" 
                    width={40} 
                    height={40} 
                    className="rounded-full border-2 border-white/30"
                  />
                )}
                <div className="text-center">
                  <div className="text-white font-semibold text-lg">
                    Hi, @{user.username || user.displayName || user.fid}
                  </div>
                  <div className="text-white/70 text-sm">
                    FID: {user.fid}
                  </div>
                </div>
              </div>
            )}
            {/* Stats Card */}
            <div className="glass rounded-3xl p-10 mb-8 animate-fade-in-up shadow-xl border border-white/30">
              <div className="text-center">
                <div className="text-gray-900/80 text-lg font-medium mb-2">
                  {user?.username} has
                </div>
                <div className="text-7xl md:text-8xl font-extrabold text-gray-900 mb-2 tracking-tighter" style={{ fontFamily: 'Instrument Sans, Nunito, Inter, sans-serif' }}>
                  {data ? data.unrepliedCount : '--'}
                </div>
                <div className="text-gray-800/90 text-xl font-semibold mb-2">
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
                {/* Cache Status */}
                <div className="text-xs text-white/60 bg-white/5 px-2 py-1 rounded-lg border border-white/10 mt-4">
                  <span className="font-mono">
                    Cache: {getCacheStatus().cachedFids} FIDs ({getCacheStatus().age}s)
                  </span>
                </div>
                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
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
                    className={`${isRefreshing ? 'animate-spin' : ''}`}
                    aria-hidden="true"
                  >
                    <path d="M23 4v6h-6" />
                    <path d="M1 20v-6h6" />
                    <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10" />
                    <path d="M20.49 15A9 9 0 0 1 6.36 18.36L1 14" />
                  </svg>
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>
            {/* Filter Section */}
            <div className="glass rounded-2xl p-4 mt-6 border border-white/20">
              <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6">
                <div className="flex items-center gap-2 mb-2 md:mb-0">
                  <span className="text-white/80 text-sm font-medium mr-2">View:</span>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-xl transition-all duration-200 ${
                      viewMode === 'list'
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'bg-white/10 text-white/60 hover:bg-white/15 hover:text-white/80'
                    }`}
                    aria-label="List view"
                  >
                    <svg
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" />
                      <line x1="3" y1="12" x2="3.01" y2="12" />
                      <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-xl transition-all duration-200 ${
                      viewMode === 'grid'
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'bg-white/10 text-white/60 hover:bg-white/15 hover:text-white/80'
                    }`}
                    aria-label="Grid view"
                  >
                    <svg
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                  </button>
                </div>
                {/* Day Filter Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-white/80 text-sm font-medium mr-2">Day:</span>
                  <select
                    value={dayFilter}
                    onChange={e => setDayFilter(e.target.value as any)}
                    className="bg-white/10 text-white/90 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 border border-white/20 shadow-sm"
                    style={{ fontFamily: 'Instrument Sans, Nunito, Inter, sans-serif' }}
                  >
                    <option value="all">All</option>
                    <option value="today">Today</option>
                    <option value="3days">Last 3 days</option>
                    <option value="7days">Last 7 days</option>
                  </select>
                </div>
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-white/80 text-sm font-medium mr-2">Sort:</span>
                  <select
                    value={sortOption}
                    onChange={e => setSortOption(e.target.value as any)}
                    className="bg-white/10 text-white/90 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 border border-white/20 shadow-sm"
                    style={{ fontFamily: 'Instrument Sans, Nunito, Inter, sans-serif' }}
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="fid-asc">FID: Low → High</option>
                    <option value="fid-desc">FID: High → Low</option>
                    <option value="short">Cast: Short (&lt;20 chars)</option>
                    <option value="medium">Cast: Medium (20–50 chars)</option>
                    <option value="long">Cast: Long (&gt;50 chars)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Conversations List */}
      <div className="px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          {viewMode === 'list' ? (
            <div className="space-y-6">
              {filteredDetails.map((cast, index) => (
                <ReplyCard
                  key={index}
                  avatarUrl={cast.avatarUrl}
                  username={cast.username}
                  timeAgo={cast.timeAgo}
                  text={cast.text}
                  onClick={() => handleReply(cast)}
                  viewMode={viewMode}
                  authorFid={cast.authorFid}
                  openRankRank={openRankRanks[cast.authorFid] || null}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDetails.map((cast, index) => (
                <ReplyCard
                  key={index}
                  avatarUrl={cast.avatarUrl}
                  username={cast.username}
                  timeAgo={cast.timeAgo}
                  text={cast.text}
                  onClick={() => handleReply(cast)}
                  viewMode={viewMode}
                  authorFid={cast.authorFid}
                  openRankRank={openRankRanks[cast.authorFid] || null}
                />
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
                <span className="text-sm font-medium">Loading more conversations...</span>
              </div>
            </div>
          )}
          
          {/* End of Results */}
          {!hasMore && filteredDetails.length > 0 && (
            <div className="text-center py-8">
              <div className="text-white/60 text-sm">
                <span className="font-medium">🎉 All caught up!</span>
                <p className="mt-1">You&apos;ve seen all your unreplied conversations.</p>
              </div>
            </div>
          )}
          
          {/* Intersection Observer Element */}
          {hasMore && (
            <div 
              ref={observerRef} 
              className="h-4 w-full"
              aria-hidden="true"
            />
          )}
          
          {/* Empty State */}
          {filteredDetails.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="glass rounded-3xl p-12">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Instrument Sans, Nunito, Inter, sans-serif' }}>All caught up!</h3>
                <p className="text-gray-700/80 text-lg">You&apos;ve replied to all your conversations.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Reply Modal (unchanged for now) */}
      {selectedCast && (
        <div className="modal-overlay" onClick={handleCancelReply}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <Image
                src={`/api/image-proxy?url=${selectedCast.avatarUrl}`}
                alt={selectedCast.username}
                width={40}
                height={40}
                className="rounded-full border-2 border-gray-200 object-cover"
                onError={e => (e.currentTarget.src = '/default-avatar.png')}
              />
              <div>
                <div className="font-bold text-lg text-gray-900" style={{ fontFamily: 'Instrument Sans, Nunito, Inter, sans-serif' }}>@{selectedCast.username}</div>
                <div className="text-xs text-gray-500">{selectedCast.timeAgo}</div>
              </div>
            </div>
            {/* Original Cast Context */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-l-4 border-blue-400">
              <div className="text-xs text-blue-600 mb-2 font-semibold">
                Original cast by @{selectedCast.originalAuthorUsername}
              </div>
              <div className="text-sm text-gray-700 leading-relaxed">
                {selectedCast.originalCastText}
              </div>
            </div>
            {/* Reply Text */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl max-h-32 overflow-y-auto">
              <div className="text-sm text-gray-700 leading-relaxed">
                {selectedCast.text}
              </div>
            </div>
            {/* Reply Input */}
            <div className="relative mb-6">
              <textarea
                ref={textareaRef}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write your reply... (⌘+Enter to send, Esc to cancel)"
                className={`input-field resize-none h-32 ${
                  isOverLimit ? 'border-red-300 focus:ring-red-500' : ''
                }`}
                disabled={isComposing}
                maxLength={MAX_CHARACTERS}
                style={{ fontFamily: 'Instrument Sans, Nunito, Inter, sans-serif' }}
              />
              <div className={`absolute bottom-4 right-4 text-sm font-medium ${
                isOverLimit ? 'text-red-500' : 'text-gray-400'
              }`}>
                {charactersRemaining}
              </div>
            </div>
            {/* Error Message */}
            {replyError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-red-600 text-sm font-medium">
                  {replyError}
                </div>
              </div>
            )}
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelReply}
                disabled={isComposing}
                className="flex-1 px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 font-semibold transition-all"
                style={{ fontFamily: 'Instrument Sans, Nunito, Inter, sans-serif' }}
              >
                Cancel
              </button>
              <button
                onClick={handleComposeCast}
                disabled={isComposing || !replyText.trim() || isOverLimit}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Instrument Sans, Nunito, Inter, sans-serif' }}
              >
                {isComposing ? (
                  <span className="flex items-center gap-2">
                    <svg
                      width={16}
                      height={16}
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
                    Sending...
                  </span>
                ) : (
                  'Reply'
                )}
              </button>
            </div>
            {/* Keyboard Shortcut Hint */}
            <div className="mt-4 text-center text-xs text-gray-500">
              Press ⌘+Enter to send quickly
            </div>
          </div>
        </div>
      )}
    </div>
  )
}