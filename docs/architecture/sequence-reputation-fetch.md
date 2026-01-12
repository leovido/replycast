# Sequence Diagram - Reputation Data Fetching Flow

This diagram shows how reputation scores (OpenRank and Quotient) are fetched for users.

```mermaid
sequenceDiagram
    participant useFarcasterData
    participant useReputation
    participant useOpenRank
    participant useQuotient
    participant OpenRankAPI as /api/openRank
    participant QuotientAPI as /api/quotient
    participant NeynarAPI
    participant Cache as OpenRank Cache

    Note over useFarcasterData: After conversations load
    useFarcasterData->>useReputation: fetchReputationData(authorFids)
    
    par Fetch OpenRank
        useReputation->>useOpenRank: fetchOpenRankData(fids)
        useOpenRank->>useOpenRank: Check cache for fids
        
        alt All fids cached
            useOpenRank-->>useReputation: Return cached data
        else Some fids missing
            useOpenRank->>OpenRankAPI: GET /api/openRank?fids=1,2,3
            OpenRankAPI->>NeynarAPI: Fetch OpenRank scores
            NeynarAPI-->>OpenRankAPI: OpenRank data
            OpenRankAPI-->>useOpenRank: Ranks data
            useOpenRank->>Cache: Store in cache
            useOpenRank-->>useReputation: Updated openRankData
        end
    and Fetch Quotient
        useReputation->>useQuotient: fetchQuotientScores(fids)
        useQuotient->>QuotientAPI: POST /api/quotient {fids: [1,2,3]}
        QuotientAPI->>NeynarAPI: Fetch Quotient scores
        NeynarAPI-->>QuotientAPI: Quotient data
        QuotientAPI-->>useQuotient: Scores data
        useQuotient-->>useReputation: Updated quotientScores
    end
    
    useReputation-->>useFarcasterData: Reputation data available
    Note over useFarcasterData: Reputation data used in<br/>conversation cards via getReputationValue()
```

## Key Interactions

1. **Parallel Fetching**: OpenRank and Quotient are fetched simultaneously
2. **Caching**: OpenRank uses cache to avoid redundant API calls
3. **Batch Requests**: Multiple FIDs are requested in single API call
4. **Data Aggregation**: `useReputation` combines both data sources
