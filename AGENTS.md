# AGENTS.md

A guide for AI coding agents working on ReplyCast. This file complements [README.md](./README.md) with detailed technical instructions.

## Setup commands

- Install dependencies: `pnpm install`
- Start dev server: `pnpm dev`
- Run tests: `pnpm test`
- Run tests with coverage: `pnpm test:coverage`
- Build for production: `pnpm build`
- Start production server: `pnpm start`
- Lint code: `pnpm lint`

## Environment setup

Create `.env.local` in the project root:

```env
NEYNAR_API_KEY=your_neynar_api_key_here
```

For testing with mocks, set:
```env
NEXT_PUBLIC_USE_MOCKS=true
```

## Code style

- **TypeScript**: Strict mode enabled (`strict: true` in tsconfig.json)
- **Quotes**: Single quotes for strings
- **Semicolons**: Use semicolons consistently
- **Naming**:
  - Interfaces/Types: PascalCase (`FarcasterRepliesResponse`)
  - Functions/Hooks: camelCase (`useFarcasterData`)
  - Components: PascalCase (`ConversationList`)
  - Constants: UPPER_SNAKE_CASE (`DEFAULT_PAGE_SIZE`)

## Architecture principles

### Always use abstractions

Never make direct API calls. Always use abstracted interfaces:

```typescript
// ✅ DO: Use abstraction
interface FarcasterApiClient {
  fetchConversations(params: ConversationParams): Promise<FarcasterRepliesResponse>;
}

// ❌ DON'T: Direct fetch calls
const res = await fetch('/api/farcaster-replies?fid=123');
```

### Single responsibility for hooks

Each hook should have one clear purpose:

```typescript
// ✅ DO: Separate hooks
const conversations = useFarcasterData({ user, dayFilter });
const reputation = useReputation({ user });

// ❌ DON'T: One hook doing everything
const { conversations, reputation } = useFarcasterEverything();
```

### Avoid code duplication

Extract shared logic to utilities:

```typescript
// ✅ DO: Shared function
async function fetchConversations(params: FetchParams): Promise<Response> {
  // Single source of truth
}

// ❌ DON'T: Duplicate fetch logic in multiple places
```

### Never silent error handling

Always log errors with context:

```typescript
// ✅ DO: Log with context
catch (error) {
  console.error('[useFarcasterData] Failed to fetch:', {
    error: error instanceof Error ? error.message : String(error),
    context: { fid, dayFilter },
  });
  trackError?.(error, { context: 'fetchConversations' });
}

// ❌ DON'T: Silent failures
fetchData().catch(() => {});
```

### Avoid large dependency arrays

Use refs for stable values to minimize dependencies:

```typescript
// ✅ DO: Use refs
const cursorRef = useRef(state.cursor);
const loadMore = useCallback(() => {
  fetchMore(cursorRef.current);
}, [fetchMore]); // Minimal deps

// ❌ DON'T: Large dependency array
const loadMore = useCallback(() => {
  fetchMore(state.cursor);
}, [state.hasMore, state.isLoadingMore, state.loading, state.cursor, user?.fid]);
```

### Avoid prop drilling

Use Context or composition instead of passing functions through multiple layers:

```typescript
// ✅ DO: Use Context
const FarcasterContext = createContext<FarcasterContextValue>();

// ❌ DON'T: Prop drilling
<App>
  <Container fetchData={fetchData}>
    <Wrapper fetchData={fetchData}>
      <Component fetchData={fetchData} />
    </Wrapper>
  </Container>
</App>
```

## Testing instructions

- Run all tests: `pnpm test`
- Run tests in watch mode: `pnpm test:watch`
- Run tests with coverage: `pnpm test:coverage`
- Run specific test file: `pnpm test path/to/file.test.ts`

### Test requirements

- **Every hook must have tests**: Test loading, error, and success states
- **Mock external dependencies**: Use `jest.fn()` for API clients, fetch, etc.
- **Test error cases**: Ensure error handling is tested
- **Coverage goals**: Critical paths 100%, error handling 100%, edge cases 80%+

### Mocking strategy

Always mock external dependencies:

```typescript
// Mock API client
const mockApiClient: FarcasterApiClient = {
  fetchConversations: jest.fn(),
};

// Mock fetch
global.fetch = jest.fn();
```

## File structure

```
components/     → UI components (presentation only)
hooks/          → Business logic (state management)
utils/          → Pure functions (data transformation)
pages/api/      → API routes (data fetching)
types/          → TypeScript type definitions
```

**Separation of concerns**: Keep UI, business logic, and data fetching separate.

## React patterns

### Custom hooks

- Start with `use` prefix
- Return objects, not arrays
- Use TypeScript interfaces for return types
- Handle loading/error states

```typescript
interface UseFarcasterDataReturn {
  data: FarcasterRepliesResponse | null;
  loading: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
}

export function useFarcasterData(props: Props): UseFarcasterDataReturn {
  // Implementation
}
```

### useEffect guidelines

- Always include cleanup (abort controllers, subscriptions)
- Use primitive dependencies when possible
- Separate concerns into different effects

```typescript
// Separate effects for separate concerns
useEffect(() => {
  // Fetch conversations
}, [user?.fid, dayFilter]);

useEffect(() => {
  // Fetch reputation (different concern)
}, [user?.fid]);
```

### State management

- **useReducer**: For complex state with multiple related fields
- **useState**: For simple, independent state values

## TypeScript conventions

- **Strict mode**: Always enabled
- **Avoid `any`**: Use `unknown` if type is truly unknown
- **Discriminated unions**: For action types in reducers
- **Type guards**: Instead of type assertions

```typescript
// ✅ DO: Discriminated union
type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: FarcasterRepliesResponse }
  | { type: 'FETCH_ERROR'; error: string };

// ✅ DO: Type guard
catch (error: unknown) {
  if (error instanceof Error) {
    // Handle Error
  }
}
```

## Farcaster Mini App specifics

### SDK usage

Always call `sdk.actions.ready()` after app initialization:

```typescript
useEffect(() => {
  sdk.actions.ready();
}, []);
```

Access context safely:

```typescript
const { user } = sdk.context;
if (sdk.context.location?.type === 'cast_embed') {
  // Handle cast embed
}
```

### Neynar API

Always use the centralized client from `@/client`:

```typescript
// ✅ DO: Use centralized client
import { client } from '@/client';
const result = await client.lookupCastConversation({ ... });

// ❌ DON'T: Direct SDK calls
import { NeynarAPIClient } from '@neynar/nodejs-sdk';
```

## Next.js conventions

- Use Server Components by default
- Mark Client Components with `'use client'`
- API routes: Always handle errors and return proper status codes

```typescript
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Handler logic
    return res.status(200).json(data);
  } catch (error) {
    console.error('[API] Handler error:', {
      route: req.url,
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
```

## PR instructions

- **Title format**: `[Area] Description` (e.g., `[Hooks] Extract reputation logic`)
- **Before committing**: Run `pnpm lint` and `pnpm test`
- **Tests must pass**: All tests should be green before submitting
- **Add tests**: Include tests for new functionality
- **Update types**: Ensure TypeScript types are updated if needed

## Common pitfalls to avoid

1. **Mixing concerns in hooks** - Keep hooks focused on one responsibility
2. **Direct API calls** - Always use abstractions
3. **Silent error handling** - Always log with context
4. **Large dependency arrays** - Use refs for stable values
5. **Prop drilling** - Use Context or composition
6. **Code duplication** - Extract shared logic
7. **Missing cleanup** - Always clean up effects (abort controllers, subscriptions)
8. **Type assertions** - Use type guards instead

## Additional resources

- [C4 Architecture Diagrams](./docs/architecture/README.md) - System architecture
- [Architectural Critique](./docs/architecture/c4-useFarcasterData-critique.md) - Detailed analysis
- [Farcaster Mini Apps Docs](https://miniapps.farcaster.xyz) - Official documentation
- [Next.js Docs](https://nextjs.org/docs) - Next.js best practices
