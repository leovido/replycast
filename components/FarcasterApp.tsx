import { useEffect, useState, useRef } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'
import { ReplyCard } from './ReplyCard';

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
            <img 
              src="https://cdn-icons-png.flaticon.com/512/1828/1828640.png" 
              alt="ReplyCast"
              className="w-8 h-8 !w-8 !h-8"
              style={{ width: '32px', height: '32px', textAlign: 'center' }}
            />
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
        // Initialize the Mini App
        await sdk.actions.ready()
        
        // Fetch data
        await fetchData()
      } catch (err) {
        setError('Network error')
      } finally {
        setLoading(false)
      }
    }
    
    initializeApp()
  }, [])

  const fetchData = async () => {
    try {
      const responseData = mockReplies;
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
    await fetchData()
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
    return <LoadingScreen />
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
                  <img 
                    src="https://cdn-icons-png.flaticon.com/512/3524/3524636.png" 
                    alt="Refresh"
                    className={`w-4 h-4 !w-4 !h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                    style={{ width: '16px', height: '16px' }}
                  />
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
                originalAuthorUsername={cast.originalAuthorUsername}
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
                <p className="text-gray-700/80 text-lg">You've replied to all your conversations.</p>
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
              <img
                src={selectedCast.avatarUrl || '/default-avatar.png'}
                alt={selectedCast.username}
                className="w-10 h-10 rounded-full border-2 border-gray-200 object-cover !w-10 !h-10"
                style={{ width: '40px', height: '40px' }}
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
                    <img 
                      src="https://cdn-icons-png.flaticon.com/512/3524/3524636.png" 
                      alt="Loading"
                      className="animate-spin h-4 w-4 !h-4 !w-4"
                      style={{ width: '16px', height: '16px' }}
                    />
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