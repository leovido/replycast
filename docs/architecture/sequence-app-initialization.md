# Sequence Diagram - App Initialization Flow

This diagram shows how the app initializes when a user opens it, including authentication, data fetching, and reputation loading.

```mermaid
sequenceDiagram
    participant User
    participant FarcasterApp
    participant useFarcasterAuth
    participant FarcasterSDK
    participant useFarcasterData
    participant API as /api/farcaster-notification-replies
    participant NeynarAPI
    participant useReputation
    participant OpenRankAPI as /api/openRank
    participant QuotientAPI as /api/quotient
    participant Analytics

    User->>FarcasterApp: Opens Mini App
    FarcasterApp->>useFarcasterAuth: Initialize
    useFarcasterAuth->>FarcasterSDK: sdk.isInMiniApp()
    FarcasterSDK-->>useFarcasterAuth: true/false
    
    alt In Mini App
        useFarcasterAuth->>FarcasterSDK: sdk.context (with retries)
        FarcasterSDK-->>useFarcasterAuth: User context
        useFarcasterAuth-->>FarcasterApp: user, loading: false
    else Not in Mini App
        useFarcasterAuth-->>FarcasterApp: user: null, loading: false
    end
    
    FarcasterApp->>Analytics: trackAppOpened()
    Analytics-->>FarcasterApp: Event tracked
    
    FarcasterApp->>useFarcasterData: Initialize (user, dayFilter)
    useFarcasterData->>useFarcasterData: dispatch(FETCH_START)
    
    par Fetch Conversations
        useFarcasterData->>API: GET /api/farcaster-notification-replies?fid=X&limit=25
        API->>NeynarAPI: Fetch notifications
        NeynarAPI-->>API: Notifications data
        API->>NeynarAPI: Check if user replied (for each conversation)
        NeynarAPI-->>API: Reply status
        API-->>useFarcasterData: FarcasterRepliesResponse
        useFarcasterData->>useFarcasterData: dispatch(FETCH_SUCCESS)
    and Fetch User Reputation
        useFarcasterData->>OpenRankAPI: GET /api/openRank?fids=userFid
        OpenRankAPI->>NeynarAPI: Fetch OpenRank
        NeynarAPI-->>OpenRankAPI: OpenRank data
        OpenRankAPI-->>useFarcasterData: userOpenRank, userFollowingRank
        
        useFarcasterData->>QuotientAPI: POST /api/quotient {fids: [userFid]}
        QuotientAPI->>NeynarAPI: Fetch Quotient
        NeynarAPI-->>QuotientAPI: Quotient data
        QuotientAPI-->>useFarcasterData: userQuotientScore
    end
    
    useFarcasterData->>useFarcasterData: dispatch(SET_USER_RANKS)
    
    Note over useFarcasterData: Fire and forget: Fetch reputation<br/>for conversation authors
    useFarcasterData->>useReputation: fetchReputationData(authorFids)
    useReputation->>OpenRankAPI: GET /api/openRank?fids=authorFids
    useReputation->>QuotientAPI: POST /api/quotient {fids: authorFids}
    
    useFarcasterData-->>FarcasterApp: conversations, loading: false
    FarcasterApp->>FarcasterApp: Render UI with data
    FarcasterApp->>FarcasterSDK: sdk.actions.ready()
    FarcasterSDK-->>User: Hide splash screen, show app
```

## Key Interactions

1. **Authentication**: App checks if it's in a Mini App environment and retrieves user context
2. **Parallel Data Fetching**: Conversations and user reputation are fetched in parallel
3. **Background Reputation Fetching**: After conversations load, reputation for authors is fetched asynchronously
4. **SDK Ready**: App signals it's ready to hide the splash screen
