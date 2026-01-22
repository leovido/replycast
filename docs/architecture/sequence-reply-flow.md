# Sequence Diagram - Reply Flow

This diagram shows how a user replies to a conversation using the Farcaster SDK.

```mermaid
sequenceDiagram
    participant User
    participant ReplyCard
    participant FarcasterApp
    participant FarcasterSDK
    participant FarcasterNetwork
    participant useFarcasterData
    participant Analytics

    User->>ReplyCard: Clicks "Reply" button
    ReplyCard->>FarcasterApp: Opens reply modal
    FarcasterApp->>User: Shows reply interface
    
    User->>FarcasterApp: Types reply text
    FarcasterApp->>FarcasterApp: Update character count
    
    alt User presses Cmd+Enter or clicks Send
        FarcasterApp->>FarcasterSDK: sdk.actions.composeCast({ text, parent: { hash } })
        FarcasterSDK->>User: Shows cast composer UI
        User->>FarcasterSDK: Confirms/reviews cast
        FarcasterSDK->>FarcasterNetwork: Publish cast
        FarcasterNetwork-->>FarcasterSDK: Cast published
        FarcasterSDK-->>FarcasterApp: Cast result
        
        alt Cast successful
            FarcasterApp->>Analytics: trackMarkAsRead(castHash)
            FarcasterApp->>useFarcasterData: handleRefresh()
            useFarcasterData->>useFarcasterData: dispatch(REFRESH_START)
            useFarcasterData->>useFarcasterData: clearOpenRankCache()
            Note over useFarcasterData: Fetch fresh data to update<br/>conversation list
            useFarcasterData->>useFarcasterData: Fetch conversations (no cache)
            useFarcasterData->>useFarcasterData: dispatch(REFRESH_SUCCESS)
            useFarcasterData-->>FarcasterApp: Updated conversations
            FarcasterApp->>User: Close modal, show updated list
        else User cancels
            FarcasterSDK-->>FarcasterApp: null (user cancelled)
            FarcasterApp->>User: Keep modal open
        end
    else User presses Esc
        FarcasterApp->>User: Close modal (no action)
    end
```

## Key Interactions

1. **Reply Initiation**: User opens reply modal from conversation card
2. **SDK Integration**: Uses Farcaster SDK to compose and publish cast
3. **Data Refresh**: After successful reply, refreshes conversation list
4. **Analytics**: Tracks the reply action
