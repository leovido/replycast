# Sequence Diagram - Conversation Fetching Flow

This diagram shows how conversations are fetched, including the API route logic and Neynar integration.

```mermaid
sequenceDiagram
    participant Component
    participant useFarcasterData
    participant API as /api/farcaster-notification-replies
    participant NeynarClient as Neynar Client
    participant NeynarAPI
    participant Cache as Reply Check Cache

    Component->>useFarcasterData: user.fid changes
    useFarcasterData->>useFarcasterData: dispatch(FETCH_START)
    useFarcasterData->>API: GET /api/farcaster-notification-replies?fid=X&limit=25&dayFilter=today
    
    API->>NeynarClient: fetchAllNotifications(userFid, types)
    NeynarClient->>NeynarAPI: API Request
    NeynarAPI-->>NeynarClient: Notifications array
    
    loop For each notification
        API->>Cache: Check cache (userFid-castHash)
        alt Cache hit
            Cache-->>API: hasReplied (cached)
        else Cache miss
            API->>NeynarClient: lookupCastConversation(castHash)
            NeynarClient->>NeynarAPI: API Request
            NeynarAPI-->>NeynarClient: Conversation with replies
            API->>API: Check if user replied
            API->>Cache: Store result (userFid-castHash)
            Cache-->>API: hasReplied
        end
        
        alt User has NOT replied
            API->>NeynarClient: fetchCastReactions(castHash)
            NeynarClient->>NeynarAPI: API Request
            NeynarAPI-->>NeynarClient: Reactions data
            API->>API: Build UnrepliedDetail object
        end
    end
    
    API->>API: Filter unreplied conversations
    API->>API: Sort and format response
    API-->>useFarcasterData: FarcasterRepliesResponse
    
    useFarcasterData->>useFarcasterData: deduplicateConversations()
    useFarcasterData->>useFarcasterData: dispatch(FETCH_SUCCESS)
    useFarcasterData-->>Component: conversations, loading: false
```

## Key Interactions

1. **Notification Fetching**: Gets all notifications from Neynar
2. **Reply Checking**: For each notification, checks if user has replied (with caching)
3. **Reaction Fetching**: Gets likes/recasts for unreplied conversations
4. **Deduplication**: Removes duplicate conversations before returning
