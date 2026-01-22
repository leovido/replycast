# C4 Model - Component Diagram

## Component Diagram

This diagram shows the key components within the Next.js Web Application container.

```mermaid
C4Component
    title Component Diagram for ReplyCast Web Application

    Container(webApp, "Next.js Web Application", "React, TypeScript", "Main user interface")
    
    Component(farcasterApp, "FarcasterApp", "React Component", "Main application container that orchestrates all features")
    Component(conversationList, "ConversationList", "React Component", "Displays list of unreplied conversations")
    Component(focusTab, "FocusTab", "React Component", "Focus mode for prioritizing conversations")
    Component(speedModeTab, "SpeedModeTab", "React Component", "Speed mode for quick conversation review")
    Component(analyticsTab, "AnalyticsTab", "React Component", "Shows user analytics and reputation scores")
    Component(replyCard, "ReplyCard", "React Component", "Individual conversation card with reply interface")
    Component(searchBar, "SearchBar", "React Component", "Search functionality for conversations")
    Component(tabBar, "TabBar", "React Component", "Navigation between different views")
    
    ComponentDb(useFarcasterAuth, "useFarcasterAuth", "React Hook", "Manages Farcaster authentication state")
    ComponentDb(useFarcasterData, "useFarcasterData", "React Hook", "Fetches and manages conversation data")
    ComponentDb(useReputation, "useReputation", "React Hook", "Manages reputation and scoring data")
    ComponentDb(useAnalytics, "useAnalytics", "React Hook", "Tracks user interactions and events")
    ComponentDb(useInfiniteScroll, "useInfiniteScroll", "React Hook", "Handles pagination and infinite scrolling")
    
    Rel(farcasterApp, conversationList, "Renders")
    Rel(farcasterApp, focusTab, "Renders")
    Rel(farcasterApp, speedModeTab, "Renders")
    Rel(farcasterApp, analyticsTab, "Renders")
    Rel(farcasterApp, tabBar, "Renders")
    Rel(farcasterApp, searchBar, "Renders")
    Rel(conversationList, replyCard, "Renders multiple")
    Rel(farcasterApp, useFarcasterAuth, "Uses")
    Rel(farcasterApp, useFarcasterData, "Uses")
    Rel(farcasterApp, useReputation, "Uses")
    Rel(farcasterApp, useAnalytics, "Uses")
    Rel(conversationList, useInfiniteScroll, "Uses")
    
    UpdateElementStyle(farcasterApp, $bgColor="#6C2BD7", $fontColor="#FFFFFF")
    UpdateElementStyle(conversationList, $bgColor="#9B59B6", $fontColor="#FFFFFF")
    UpdateElementStyle(focusTab, $bgColor="#8E44AD", $fontColor="#FFFFFF")
    UpdateElementStyle(speedModeTab, $bgColor="#7D3C98", $fontColor="#FFFFFF")
    UpdateElementStyle(analyticsTab, $bgColor="#6C3483", $fontColor="#FFFFFF")
    UpdateElementStyle(replyCard, $bgColor="#A569BD", $fontColor="#FFFFFF")
    UpdateElementStyle(useFarcasterAuth, $bgColor="#1CB5E0", $fontColor="#FFFFFF")
    UpdateElementStyle(useFarcasterData, $bgColor="#3498DB", $fontColor="#FFFFFF")
    UpdateElementStyle(useReputation, $bgColor="#5DADE2", $fontColor="#FFFFFF")
    UpdateElementStyle(useAnalytics, $bgColor="#85C1E2", $fontColor="#000000")
```

## Component Descriptions

### UI Components

**FarcasterApp**
- Main orchestrator component
- Manages global state (theme, active tab, settings)
- Coordinates between different tabs and features
- Handles authentication flow

**ConversationList**
- Displays paginated list of unreplied conversations
- Supports filtering, sorting, and search
- Handles infinite scroll for loading more conversations

**FocusTab**
- Provides focused view for prioritizing conversations
- Shows conversations that need immediate attention
- Includes tutorial for first-time users

**SpeedModeTab**
- Quick review mode for conversations
- Swipe gestures for fast navigation
- Optimized for mobile interactions

**AnalyticsTab**
- Displays user statistics and reputation scores
- Shows OpenRank, Quotient, and Following Rank
- Visual charts and metrics

**ReplyCard**
- Individual conversation display
- Reply interface with character counter
- Shows cast context and metadata

**SearchBar & TabBar**
- Navigation and search UI components

### Custom Hooks

**useFarcasterAuth**
- Manages Farcaster SDK authentication
- Handles sign-in flow and user context

**useFarcasterData**
- Fetches conversation data from API
- Manages loading states, pagination, and caching
- Handles error states and retries

**useReputation**
- Fetches and manages reputation scores
- Caches OpenRank and Quotient data
- Provides reputation-based filtering

**useAnalytics**
- Tracks user interactions via Vercel Analytics
- Logs events for app usage analysis

**useInfiniteScroll**
- Handles pagination logic
- Manages cursor-based loading
- Detects scroll position for auto-loading


