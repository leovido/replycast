import React, { memo } from "react";
import Image from "next/image";

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
  viewMode?: "list" | "grid";
}

export const ReplyCard = memo<ReplyCardProps>(({ detail, onClick }) => {
  return (
    <article
      tabIndex={0}
      role="button"
      aria-label={`Open reply from @${detail.username}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className="
        relative isolate flex flex-col gap-6
        w-full max-w-lg mx-auto
        rounded-2xl p-8 shadow-xl ring-1 ring-white/10
        bg-zinc-900/75 backdrop-blur-lg overflow-hidden
        transition hover:bg-zinc-900/80
        focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
        group
      "
      style={{ fontFamily: "Instrument Sans, Nunito, Inter, sans-serif" }}
    >
      <span
        className="
          pointer-events-none absolute inset-0 rounded-[inherit]
          bg-gradient-to-br from-white/20 via-white/5 to-transparent
          opacity-25 saturate-150 blur-sm
        "
      />

      <header className="flex items-center gap-4 z-10">
        <Image
          src={`/api/image-proxy?url=${detail.avatarUrl}`}
          alt={`${detail.username}'s avatar`}
          width={48}
          height={48}
          className="h-12 w-12 rounded-full object-cover"
          loading="lazy"
          quality={80}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/default-avatar.png";
          }}
        />
        <div className="flex flex-col">
          <span className="text-white font-semibold leading-tight text-lg">
            @{detail.username}
          </span>
          <span className="text-sm text-white/60">{detail.timeAgo}</span>
        </div>
      </header>

      {/* 3️⃣  reply text */}
      <p className="z-10 text-white text-base leading-relaxed break-words">
        {detail.text}
      </p>

      {/* 4️⃣  CTA */}
      <button
        type="button"
        onClick={onClick}
        className="
          mt-auto self-start inline-flex items-center gap-2
          rounded-xl px-6 py-3
          bg-white/10 border border-white/20 text-white
          text-base font-medium
          transition hover:bg-white/20
          focus:outline-none focus-visible:ring-2
          focus-visible:ring-indigo-400
          z-10"
        aria-label="Reply"
      >
        {/* <ArrowRight className="h-4 w-4" /> */}
        Reply
      </button>
    </article>
  );
});

ReplyCard.displayName = "ReplyCard";
