# C4 Model - Container Diagram

## Container Diagram

This diagram zooms into the ReplyCast system, showing the applications and data stores.

```mermaid
C4Container
    title Container Diagram for ReplyCast

    Person(user, "Farcaster User", "A user who wants to track and reply to unreplied conversations")
    
    System_Ext(farcasterClient, "Farcaster Client", "Warpcast or other Farcaster client")
    System_Ext(neynar, "Neynar API", "Farcaster data API service")
    
    System_Boundary(replycastSystem, "ReplyCast System") {
        Container(webApp, "Next.js Web Application", "React, TypeScript", "Provides the main user interface for viewing and replying to conversations")
        Container(apiRoutes, "Next.js API Routes", "Node.js, TypeScript", "Handles server-side logic for fetching data and generating images")
        ContainerDb(localStorage, "Browser Local Storage", "Key-Value Store", "Stores user preferences, theme settings, and UI state")
    }
    
    Rel(user, farcasterClient, "Uses")
    Rel(farcasterClient, webApp, "Renders in iframe/WebView", "HTTPS")
    Rel(webApp, apiRoutes, "Makes API calls", "HTTP")
    Rel(webApp, localStorage, "Reads and writes", "Browser API")
    Rel(apiRoutes, neynar, "Fetches conversation data", "HTTPS/REST")
    Rel(webApp, farcasterClient, "Uses SDK for casting", "@farcaster/miniapp-sdk")
    
    UpdateElementStyle(user, $bgColor="#E8F4F8", $fontColor="#000000")
    UpdateElementStyle(webApp, $bgColor="#6C2BD7", $fontColor="#FFFFFF")
    UpdateElementStyle(apiRoutes, $bgColor="#1CB5E0", $fontColor="#FFFFFF")
    UpdateElementStyle(localStorage, $bgColor="#95A5A6", $fontColor="#000000")
    UpdateElementStyle(farcasterClient, $bgColor="#3498DB", $fontColor="#FFFFFF")
    UpdateElementStyle(neynar, $bgColor="#FFA500", $fontColor="#000000")
```

## Container Descriptions

### Next.js Web Application
- **Technology**: React, TypeScript, Tailwind CSS
- **Responsibilities**:
  - Renders the main UI (tabs, conversation list, reply interface)
  - Manages client-side state and user interactions
  - Handles authentication via Farcaster SDK
  - Provides search, filtering, and sorting capabilities
  - Manages themes and user preferences

### Next.js API Routes
- **Technology**: Node.js, TypeScript
- **Responsibilities**:
  - `/api/farcaster-replies` - Fetches unreplied conversations from Neynar
  - `/api/og-image` - Generates dynamic OpenGraph images using Satori
  - `/api/openRank` - Fetches OpenRank data for reputation scoring
  - `/api/quotient` - Fetches Quotient scores
  - `/api/image-proxy` - Proxies images for CORS and caching
  - Implements caching strategies for performance

### Browser Local Storage
- **Technology**: Browser Web Storage API
- **Responsibilities**:
  - Stores user preferences (theme mode, view mode, sort options)
  - Persists active tab selection
  - Caches UI state across sessions


