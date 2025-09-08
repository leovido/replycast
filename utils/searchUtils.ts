import type { UnrepliedDetail } from "@/types/types";

export interface SearchResult {
  conversations: UnrepliedDetail[];
  totalMatches: number;
  searchQuery: string;
}

/**
 * Search through conversations based on query
 * Searches through username, display name, and cast text
 */
export function searchConversations(
  conversations: UnrepliedDetail[],
  query: string
): SearchResult {
  if (!query || query.length < 3) {
    return {
      conversations,
      totalMatches: conversations.length,
      searchQuery: query,
    };
  }

  const normalizedQuery = query.toLowerCase().trim();

  const filteredConversations = conversations.filter((conversation) => {
    // Search in username
    const usernameMatch = conversation.username
      ?.toLowerCase()
      .includes(normalizedQuery);

    // Search in cast text
    const textMatch = conversation.text
      ?.toLowerCase()
      .includes(normalizedQuery);

    // Search in original cast text
    const originalTextMatch = conversation.originalCastText
      ?.toLowerCase()
      .includes(normalizedQuery);

    // Search in original author username
    const originalAuthorMatch = conversation.originalAuthorUsername
      ?.toLowerCase()
      .includes(normalizedQuery);

    // Search in FID (exact match)
    const fidMatch = conversation.authorFid
      ?.toString()
      .includes(normalizedQuery);

    return (
      usernameMatch ||
      textMatch ||
      originalTextMatch ||
      originalAuthorMatch ||
      fidMatch
    );
  });

  return {
    conversations: filteredConversations,
    totalMatches: filteredConversations.length,
    searchQuery: query,
  };
}

/**
 * Highlight search terms in text
 */
export function highlightSearchTerms(text: string, query: string): string {
  if (!query || query.length < 3) return text;

  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  return text.replace(
    regex,
    '<mark class="bg-yellow-200 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-200">$1</mark>'
  );
}

/**
 * Get search suggestions based on existing data
 */
export function getSearchSuggestions(
  conversations: UnrepliedDetail[]
): string[] {
  const suggestions = new Set<string>();

  conversations.forEach((conversation) => {
    // Add usernames
    if (conversation.username) {
      suggestions.add(conversation.username);
    }

    // Add original author usernames
    if (conversation.originalAuthorUsername) {
      suggestions.add(conversation.originalAuthorUsername);
    }

    // Add FIDs
    suggestions.add(conversation.authorFid.toString());
  });

  return Array.from(suggestions).slice(0, 10); // Limit to 10 suggestions
}

/**
 * Check if search is active (query length >= 3)
 */
export function isSearchActive(query: string): boolean {
  return query.length >= 3;
}

/**
 * Get search stats for display
 */
export function getSearchStats(
  totalConversations: number,
  searchResult: SearchResult
): {
  isSearching: boolean;
  totalFound: number;
  totalOriginal: number;
  searchQuery: string;
} {
  return {
    isSearching: isSearchActive(searchResult.searchQuery),
    totalFound: searchResult.totalMatches,
    totalOriginal: totalConversations,
    searchQuery: searchResult.searchQuery,
  };
}
