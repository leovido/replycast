// Component-specific types for FarcasterApp
import type { UnrepliedDetail } from "@/types/types";

export type ViewMode = "list" | "grid";

export type DayFilter = "all" | "today" | "3days" | "7days";

export type SortOption =
  | "newest"
  | "oldest"
  | "fid-asc"
  | "fid-desc"
  | "short"
  | "medium"
  | "long"
  | "openrank-asc"
  | "openrank-desc";

export interface FilterState {
  viewMode: ViewMode;
  dayFilter: DayFilter;
  sortOption: SortOption;
}

export interface ReplyComposerState {
  selectedCast: UnrepliedDetail | null;
  replyText: string;
  isComposing: boolean;
  replyError: string | null;
}

// Re-export main types for convenience
export type {
  Cursor,
  FarcasterRepliesResponse,
  UnrepliedDetail,
  User,
} from "@/types/types";
