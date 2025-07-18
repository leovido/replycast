import React from 'react';
import Image from 'next/image';

export interface ReplyCardProps {
  avatarUrl: string;
  username: string;
  text: string;
  timeAgo: string;
  onClick?: () => void;
  viewMode?: 'list' | 'grid';
}

export function ReplyCard({
  avatarUrl,
  username,
  text,
  timeAgo,
  onClick,
  viewMode = 'list',
}: ReplyCardProps) {
  const isGrid = viewMode === 'grid';
  
  return (
    <div
      className={`bg-[#181A20] rounded-2xl shadow-xl p-6 transition hover:bg-[#23242a] focus-within:bg-[#23242a] outline-none ${
        isGrid 
          ? 'w-full' 
          : 'max-w-md w-full mx-auto mb-6'
      } flex items-start gap-4`}
      tabIndex={0}
      role="button"
      aria-label={`Open reply from @${username}`}
      onClick={onClick}
      onKeyDown={e => (onClick && (e.key === 'Enter' || e.key === ' ') && onClick())}
      style={{ fontFamily: 'Instrument Sans, Nunito, Inter, sans-serif' }}
    >
      <Image
        src={`/api/image-proxy?url=${avatarUrl}`}
        alt={username}
        width={isGrid ? 40 : 48}
        height={isGrid ? 40 : 48}
        className="rounded-full object-cover flex-shrink-0 border-2 border-[#23242a]"
        style={{ background: 'linear-gradient(135deg, #7f5af0 0%, #23242a 100%)' }}
        onError={e => (e.currentTarget.src = '/default-avatar.png')}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`font-bold text-white font-sans ${
            isGrid ? 'text-lg' : 'text-xl'
          }`}>@{username}</span>
          <span className="text-xs text-gray-400 font-sans">{timeAgo}</span>
        </div>
        <div className={`text-white font-sans leading-snug break-words ${
          isGrid ? 'text-sm' : 'text-lg'
        } mt-2`}>
          {isGrid && text.length > 100 
            ? `${text.substring(0, 100)}...` 
            : text
          }
        </div>
      </div>
    </div>
  );
}