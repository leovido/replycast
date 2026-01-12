# Sequence Diagrams

This directory contains sequence diagrams visualizing key flows in the ReplyCast application.

## Available Diagrams

### 1. [App Initialization Flow](./sequence-app-initialization.md)
Shows how the app initializes when a user opens it, including:
- Authentication flow
- Parallel data fetching (conversations + reputation)
- Background reputation fetching for authors
- SDK ready signal

**Use when**: Understanding app startup, debugging initialization issues, onboarding new developers.

### 2. [Conversation Fetching Flow](./sequence-conversation-fetch.md)
Details how conversations are fetched from the API:
- Notification fetching from Neynar
- Reply checking with caching
- Reaction data fetching
- Deduplication logic

**Use when**: Understanding data fetching logic, debugging API issues, optimizing performance.

### 3. [Pagination Flow](./sequence-pagination.md)
Shows how infinite scroll pagination works:
- Scroll detection
- Guard checks to prevent duplicate requests
- Cursor-based pagination
- Data merging and deduplication

**Use when**: Understanding pagination, debugging infinite scroll issues, optimizing load performance.

### 4. [Reply Flow](./sequence-reply-flow.md)
Visualizes the user reply process:
- Opening reply modal
- Composing reply via Farcaster SDK
- Publishing cast
- Refreshing conversation list

**Use when**: Understanding user interactions, debugging reply functionality, testing SDK integration.

### 5. [Reputation Fetching Flow](./sequence-reputation-fetch.md)
Shows how reputation scores are fetched:
- Parallel fetching of OpenRank and Quotient
- Caching strategy
- Batch requests
- Data aggregation

**Use when**: Understanding reputation system, debugging score display, optimizing API calls.

## Viewing the Diagrams

These diagrams use Mermaid syntax and can be viewed:

1. **In GitHub**: Mermaid diagrams render automatically in markdown files
2. **In VS Code**: Install the "Markdown Preview Mermaid Support" extension
3. **Online**: Copy the mermaid code block to [mermaid.live](https://mermaid.live)
4. **In documentation tools**: Many tools support Mermaid rendering

## When to Create New Sequence Diagrams

Create a new sequence diagram when:

- A flow involves multiple components/services
- The interaction order is important to understand
- Debugging a complex multi-step process
- Onboarding new team members
- Documenting API integration patterns
- Explaining async operations or parallel processing

## Related Documentation

- [C4 Architecture Diagrams](./README.md) - System architecture at different levels
- [Architectural Critique](./c4-useFarcasterData-critique.md) - Detailed code analysis
- [AGENTS.md](../../AGENTS.md) - Development guidelines
