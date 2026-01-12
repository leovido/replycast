# C4 Model - System Context Diagram

## System Context

This diagram shows the ReplyCast system and how it interacts with external users and systems.

```mermaid
C4Context
    title System Context Diagram for ReplyCast

    Person(user, "Farcaster User", "A user who wants to track and reply to unreplied conversations")
    
    System(replycast, "ReplyCast", "Farcaster Mini App that helps users track and reply to unreplied conversations")
    
    System_Ext(farcasterClient, "Farcaster Client", "Warpcast or other Farcaster client that hosts the Mini App")
    System_Ext(neynar, "Neynar API", "Farcaster data API service")
    System_Ext(farcasterNetwork, "Farcaster Network", "Decentralized social network protocol")
    
    Rel(user, farcasterClient, "Uses", "Opens Mini App")
    Rel(farcasterClient, replycast, "Hosts", "Renders Mini App in iframe/WebView")
    Rel(replycast, neynar, "Fetches conversation data", "HTTPS/REST API")
    Rel(neynar, farcasterNetwork, "Queries", "Reads casts, replies, and user data")
    Rel(replycast, farcasterClient, "Sends casts via SDK", "Uses @farcaster/miniapp-sdk")
    Rel(farcasterClient, farcasterNetwork, "Publishes casts", "Writes to Farcaster protocol")
    
    UpdateElementStyle(user, $bgColor="#E8F4F8", $fontColor="#000000")
    UpdateElementStyle(replycast, $bgColor="#6C2BD7", $fontColor="#FFFFFF")
    UpdateElementStyle(farcasterClient, $bgColor="#1CB5E0", $fontColor="#FFFFFF")
    UpdateElementStyle(neynar, $bgColor="#FFA500", $fontColor="#000000")
    UpdateElementStyle(farcasterNetwork, $bgColor="#2C3E50", $fontColor="#FFFFFF")
```

## Description

The **ReplyCast** system is a Farcaster Mini App that helps users track and reply to unreplied conversations. 

### Key Relationships

- **Farcaster Users** interact with the app through their Farcaster client (e.g., Warpcast)
- **Farcaster Client** hosts the Mini App and provides the SDK for authentication and casting
- **Neynar API** provides access to Farcaster conversation data
- **Farcaster Network** is the underlying decentralized protocol that stores all social data


