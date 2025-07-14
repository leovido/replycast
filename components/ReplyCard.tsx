import React from 'react';

export interface ReplyCardProps {
  avatarUrl: string;
  username: string;
  text: string;
  timeAgo: string;
  onClick?: () => void;
}

export function ReplyCard({
  avatarUrl,
  username,
  text,
  onClick,
}: ReplyCardProps) {
  return (
    <div
      className="max-w-md w-full mx-auto bg-[#181A20] rounded-2xl shadow-xl p-6 mb-6 flex items-start gap-4 transition hover:bg-[#23242a] focus-within:bg-[#23242a] outline-none"
      tabIndex={0}
      role="button"
      aria-label={`Open reply from @${username}`}
      onClick={onClick}
      onKeyDown={e => (onClick && (e.key === 'Enter' || e.key === ' ') && onClick())}
      style={{ fontFamily: 'Instrument Sans, Nunito, Inter, sans-serif' }}
    >
      <img
        src={avatarUrl || '/default-avatar.png'}
        alt={username}
        className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-[#23242a]"
        style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #7f5af0 0%, #23242a 100%)' }}
        onError={e => (e.currentTarget.src = '/default-avatar.png')}
      />
      <div className="flex-1 min-w-0">
        <div className="font-bold text-xl text-white font-sans">@{username}</div>
        <div className="text-white text-lg mt-2 font-sans leading-snug break-words">{text}</div>
      </div>
    </div>
  );
}