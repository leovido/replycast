# ReplyCast Architecture Documentation

This directory contains C4 model diagrams documenting the architecture of the ReplyCast Farcaster Mini App.

## Diagrams

### 1. [System Context Diagram](./c4-system-context.md)
Shows the ReplyCast system and its relationships with external users and systems (Farcaster clients, Neynar API, Farcaster Network).

**Use when**: Explaining the system to stakeholders, understanding external dependencies, onboarding new team members.

### 2. [Container Diagram](./c4-container.md)
Zooms into the ReplyCast system, showing the main applications (Next.js Web App, API Routes) and data stores (Browser Local Storage).

**Use when**: Understanding the high-level architecture, discussing deployment, identifying integration points.

### 3. [Component Diagram](./c4-component.md)
Shows the key React components and custom hooks within the Next.js Web Application.

**Use when**: Understanding the frontend structure, planning feature additions, debugging component interactions.

### 4. [useFarcasterData Component Diagram](./c4-useFarcasterData.md)
Deep dive into the `useFarcasterData` hook, showing its internal structure, state management, and data flow.

**Use when**: Understanding data fetching logic, debugging conversation loading issues, modifying pagination or refresh behavior.

### 5. [useFarcasterData Architectural Critique](./c4-useFarcasterData-critique.md)
Critical architectural analysis of the `useFarcasterData` hook covering cohesion, coupling, flexibility, maintainability, and testability.

**Use when**: Planning refactoring, evaluating code quality, making architectural decisions, onboarding senior developers.

## Sequence Diagrams

### [Sequence Diagrams Overview](./sequence-diagrams-README.md)
Interactive sequence diagrams showing key flows in the application:

- **[App Initialization Flow](./sequence-app-initialization.md)** - How the app loads and fetches initial data
- **[Conversation Fetching Flow](./sequence-conversation-fetch.md)** - How conversations are fetched from the API
- **[Pagination Flow](./sequence-pagination.md)** - How infinite scroll works
- **[Reply Flow](./sequence-reply-flow.md)** - How users reply to conversations
- **[Reputation Fetching Flow](./sequence-reputation-fetch.md)** - How reputation scores are fetched

**Use when**: Understanding complex flows, debugging multi-step processes, onboarding new developers, documenting API integrations.

## About C4 Model

The C4 model is a way to visualize software architecture at different levels of detail:

- **Context** (Level 1): Shows the system and its external actors
- **Container** (Level 2): Shows applications and data stores within the system
- **Component** (Level 3): Shows components within a container
- **Code** (Level 4): Shows classes/functions within a component (not included here)

For more information, visit [c4model.com](https://c4model.com).

## Viewing the Diagrams

These diagrams use Mermaid syntax and can be viewed:

1. **In GitHub**: Mermaid diagrams render automatically in markdown files
2. **In VS Code**: Install the "Markdown Preview Mermaid Support" extension
3. **Online**: Copy the mermaid code block to [mermaid.live](https://mermaid.live)
4. **In documentation tools**: Many tools support Mermaid rendering

## Updating the Diagrams

When making architectural changes:

1. Update the relevant diagram(s)
2. Keep descriptions accurate and up-to-date
3. Maintain consistent styling and notation
4. Add new components/containers as needed

## Related Documentation

- [README.md](../../README.md) - Project overview and setup
- [PERFORMANCE_OPTIMIZATIONS.md](../../PERFORMANCE_OPTIMIZATIONS.md) - Performance considerations
- [ANALYTICS_SETUP.md](../../ANALYTICS_SETUP.md) - Analytics implementation

