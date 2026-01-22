# Sequence Diagram - Pagination Flow

This diagram shows how infinite scroll pagination works when loading more conversations.

```mermaid
sequenceDiagram
    participant User
    participant ConversationList
    participant useInfiniteScroll
    participant useFarcasterData
    participant API as /api/farcaster-notification-replies
    participant NeynarAPI

    User->>ConversationList: Scrolls to bottom
    ConversationList->>useInfiniteScroll: Scroll detected
    useInfiniteScroll->>useInfiniteScroll: Check if should load (hasMore && !isLoadingMore)
    
    alt Should load more
        useInfiniteScroll->>useFarcasterData: loadMoreConversations()
        useFarcasterData->>useFarcasterData: Check guards (hasMore, isLoadingMore, loading)
        
        alt Guards pass
            useFarcasterData->>useFarcasterData: dispatch(LOAD_MORE_START)
            useFarcasterData->>API: GET /api/farcaster-notification-replies?fid=X&cursor=ABC123
            API->>NeynarAPI: Fetch next page
            NeynarAPI-->>API: Next page data
            API-->>useFarcasterData: FarcasterRepliesResponse (nextCursor: DEF456)
            
            useFarcasterData->>useFarcasterData: deduplicateAndMerge(existing, newItems)
            useFarcasterData->>useFarcasterData: dispatch(LOAD_MORE_SUCCESS)
            useFarcasterData-->>ConversationList: Updated conversations, hasMore: true/false
            ConversationList->>User: Render new conversations
        else Guards fail
            useFarcasterData-->>useInfiniteScroll: No action (already loading or no more)
        end
    else Should not load
        useInfiniteScroll-->>ConversationList: No action
    end
```

## Key Interactions

1. **Scroll Detection**: `useInfiniteScroll` detects when user reaches bottom
2. **Guard Checks**: Prevents duplicate requests and unnecessary calls
3. **Cursor-based Pagination**: Uses cursor from previous response
4. **Deduplication**: Merges new items with existing, removing duplicates
