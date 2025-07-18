import { useEffect, useState, useRef } from 'react'
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
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const MAX_CHARACTERS = 320 // Farcaster cast limit

  useEffect(() => {
    const initializeApp = async () => {
      try {

        const ctx = await sdk.context;
        const farUser = ctx?.user ?? {
          fid: 123,
          username: 'test',
          displayName: 'test',
          pfpUrl: 'https://cdn-icons-png.flaticon.com/512/1828/1828640.png',
        };

        if (!farUser || !farUser.fid) throw new Error('Farcaster user not found');
        setUser(farUser);

        await fetchData()

        await sdk.actions.ready()
       } catch (err) {
        setError(`Error: ${err}`)
      } finally {
        setLoading(false)
      }
    }
    
    initializeApp()
  }, [])

  const fetchData = async () => {
    try {
      // Use the actual user FID instead of hardcoded value
      const userFid = user?.fid || 203666;
      const res = await fetch(`/api/farcaster-replies?fid=${userFid}`, {
        // Add cache control to prevent unnecessary refetches
        cache: 'default'
      });
      const responseData = await res.json()
      if (responseData) {
        setData(responseData)
      } else {
        setError(responseData.error || 'Failed to fetch data')
      }
    } catch (err) {
      setError('Failed to load conversations')
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setError(null)
    // Force refresh by bypassing cache
    const userFid = user?.fid || 203666;
    try {
      const res = await fetch(`/api/farcaster-replies?fid=${userFid}`, {
        cache: 'no-store' // Force fresh data
      });
      const responseData = await res.json()
      if (responseData) {
        setData(responseData)
      } else {
        setError(responseData.error || 'Failed to fetch data')
      }
    } catch (err) {
      setError('Failed to load conversations')
    }
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
        await fetchData() // Refresh to update the list
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
                  {username} has
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
          </div>
        </div>
      </div>
      {/* Conversations List */}
      <div className="px-4 pb-12">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            {data?.unrepliedDetails.map((cast, index) => (
              <ReplyCard
                key={index}
                avatarUrl={cast.avatarUrl}
                username={cast.username}
                timeAgo={cast.timeAgo}
                text={cast.text}
                onClick={() => handleReply(cast)}
              />
            ))}
          </div>
          {/* Empty State */}
          {data?.unrepliedDetails.length === 0 && (
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