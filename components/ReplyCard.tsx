import React, { memo, useMemo } from 'react';
import Image from 'next/image';

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

export interface ReplyCardProps {
  detail: UnrepliedDetail;
  openRank?: number | null;
  onClick?: () => void;
  viewMode?: 'list' | 'grid';
}

// Memoized rank badge calculator
const getRankBadge = (rank: number | null) => {
  if (!rank) return null;
  
  if (rank <= 100) return { text: 'Top 100', color: 'bg-yellow-500 text-yellow-900' };
  if (rank <= 500) return { text: 'Top 500', color: 'bg-blue-500 text-white' };
  if (rank <= 1000) return { text: 'Top 1K', color: 'bg-green-500 text-white' };
  if (rank <= 5000) return { text: 'Top 5K', color: 'bg-purple-500 text-white' };
  return null;
};

export const ReplyCard = memo<ReplyCardProps>(({
  detail,
  openRank,
  onClick,
  viewMode = 'list'
}) => {
  const isGrid = viewMode === 'grid';
  
  // Memoize rank badge calculation
  const rankBadge = useMemo(() => getRankBadge(openRank || null), [openRank]);
  
  // Memoize truncated text for grid view
  const displayText = useMemo(() => {
    if (isGrid && detail.text.length > 100) {
      return `${detail.text.substring(0, 100)}...`;
    }
    return detail.text;
  }, [detail.text, isGrid]);
  
  // Memoize image dimensions
  const imageSize = useMemo(() => (isGrid ? 40 : 48), [isGrid]);
  
  const handleKeyDown = useMemo(() => (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  }, [onClick]);
  
  return (
    <div
      className={`bg-[#181A20] rounded-2xl shadow-xl p-6 transition-colors duration-200 hover:bg-[#23242a] focus-within:bg-[#23242a] outline-none ${
        isGrid 
          ? 'w-full' 
          : 'max-w-md w-full mx-auto mb-6'
      } flex items-start gap-4 cursor-pointer`}
      tabIndex={0}
      role="button"
      aria-label={`Open reply from @${detail.username}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      style={{ fontFamily: 'Instrument Sans, Nunito, Inter, sans-serif' }}
    >
      <Image
        src={`/api/image-proxy?url=${detail.avatarUrl}`}
        alt={`${detail.username}'s avatar`}
        width={imageSize}
        height={imageSize}
        className="rounded-full object-cover flex-shrink-0 border-2 border-[#23242a]"
        style={{ background: 'linear-gradient(135deg, #7f5af0 0%, #23242a 100%)' }}
        onError={(e) => {
          e.currentTarget.src = '/default-avatar.png';
        }}
        loading="lazy"
        quality={75}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyVPzM/Tv4nLzmM5l7z3FbYK/QenaMhBnQ/"
      />
      <div className="flex-1 min-w-0">
        <div className="flex flex-col gap-0 mb-1">
          <span className={`font-bold text-white font-sans ${
            isGrid ? 'text-lg' : 'text-xl'
          }`}>
            @{detail.username}
          </span>
          <span className="text-sm text-white/70 font-sans font-light">
            FID: {detail.authorFid}
          </span>
          {openRank && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400 font-sans">
                Rank: #{openRank.toLocaleString()}
              </span>
              {rankBadge && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rankBadge.color}`}>
                  {rankBadge.text}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-gray-400 font-sans">{detail.timeAgo}</span>
        </div>
        <div className={`text-white font-sans leading-snug break-words ${
          isGrid ? 'text-sm' : 'text-lg'
        } mt-2`}>
          {displayText}
        </div>
      </div>
    </div>
  );
});

ReplyCard.displayName = 'ReplyCard';