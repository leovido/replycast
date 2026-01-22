# useFarcasterData Refactoring TODO List

## 🔴 High Priority

### Task 1: Extract Reputation Logic to Separate Hook

**Overview**: Move user reputation fetching logic from `useFarcasterData` to a dedicated hook to improve separation of concerns and maintainability.

**Problem**: 
- `useFarcasterData` currently handles both conversation fetching and user reputation fetching
- Violates Single Responsibility Principle
- Changes to reputation logic affect conversation logic and vice versa
- Makes the hook harder to test and understand

**Solution**:
- Create or enhance `useReputation` hook to handle all reputation-related logic
- Remove `userOpenRank`, `userQuotientScore`, and `userFollowingRank` state from `useFarcasterData`
- Remove reputation fetching `useEffect` from `useFarcasterData`
- Update `FarcasterApp` to use both hooks independently

**Technical Details**:
- Extract lines 166-221 (reputation fetching effect) to separate hook
- Move `SET_USER_RANKS` action handling if needed, or remove entirely
- Update return type to remove reputation fields
- Ensure `useReputation` hook handles OpenRank and Quotient fetching

**Acceptance Criteria**:
- [ ] `useFarcasterData` no longer contains reputation-related state or logic
- [ ] `useReputation` hook handles all reputation fetching
- [ ] `FarcasterApp` uses both hooks independently
- [ ] All tests pass
- [ ] No functionality is lost

**Estimated Effort**: 4-6 hours

---

### Task 2: Abstract API Client Interface

**Overview**: Create an abstract API client interface to decouple the hook from direct API calls, improving testability and flexibility.

**Problem**:
- Hard-coded API endpoints (`/api/farcaster-notification-replies`, `/api/openRank`, `/api/quotient`)
- Direct dependency on global `fetch` function
- Cannot easily swap data sources or mock for testing
- API changes require hook modifications

**Solution**:
- Create `FarcasterApiClient` interface with methods for all API operations
- Implement concrete `NeynarApiClient` class
- Inject API client via props (with default implementation)
- Replace all direct `fetch` calls with client methods

**Technical Details**:
```typescript
interface FarcasterApiClient {
  fetchConversations(params: ConversationParams): Promise<FarcasterRepliesResponse>;
  fetchUserReputation(fid: number): Promise<ReputationData>;
}

interface UseFarcasterDataProps {
  apiClient?: FarcasterApiClient; // Optional, defaults to NeynarApiClient
}
```

**Acceptance Criteria**:
- [ ] `FarcasterApiClient` interface defined
- [ ] `NeynarApiClient` implementation created
- [ ] All `fetch` calls replaced with client methods
- [ ] Hook accepts optional `apiClient` prop
- [ ] Tests can inject mock client
- [ ] All existing functionality works

**Estimated Effort**: 6-8 hours

---

### Task 3: Eliminate Code Duplication in Fetch Logic

**Overview**: Extract shared fetch logic to eliminate duplication across `dataFetcher`, `loadMoreConversations`, and `handleRefresh`.

**Problem**:
- Same fetch pattern appears in 3 different places (lines 230-277, 288-340, 343-373)
- Changes to fetch logic must be made in multiple locations
- Risk of inconsistencies between implementations
- Harder to maintain and test

**Solution**:
- Create `createFetchConversations` helper function
- Extract URL building, mock detection, and fetch logic
- Refactor all three locations to use shared function
- Ensure abort controller handling is consistent

**Technical Details**:
```typescript
async function fetchConversations(
  params: {
    fid: number;
    dayFilter: string;
    limit: number;
    cursor?: string;
    signal?: AbortSignal;
  },
  useMocks: boolean
): Promise<FarcasterRepliesResponse>
```

**Acceptance Criteria**:
- [ ] Single source of truth for conversation fetching
- [ ] All three fetch locations use shared function
- [ ] No duplicate code remains
- [ ] All edge cases handled (mocks, abort signals, errors)
- [ ] Tests verify all fetch scenarios

**Estimated Effort**: 3-4 hours

---

## 🟡 Medium Priority

### Task 4: Add Configuration Options

**Overview**: Make the hook more flexible by adding configurable options for page size, filters, and retry behavior.

**Problem**:
- Hard-coded values (page size: 25, default day filter: "today")
- Inflexible filtering (only supports day-based filtering)
- No retry strategy for transient failures
- Cannot adjust behavior without modifying hook

**Solution**:
- Add configuration interface to hook props
- Make page size configurable (default: 25)
- Support extensible filter object instead of just `dayFilter`
- Add optional retry configuration

**Technical Details**:
```typescript
interface UseFarcasterDataConfig {
  pageSize?: number; // Default: 25
  filters?: ConversationFilters; // Extensible filter object
  retryConfig?: {
    maxRetries?: number;
    retryDelay?: number;
  };
}

interface ConversationFilters {
  dayFilter?: string;
  reputationMin?: number;
  channel?: string;
  // Extensible for future filters
}
```

**Acceptance Criteria**:
- [ ] Page size is configurable
- [ ] Filter object supports multiple filter types
- [ ] Retry configuration available
- [ ] Backward compatible (defaults maintain current behavior)
- [ ] Documentation updated

**Estimated Effort**: 4-5 hours

---

### Task 5: Improve Error Handling and Recovery

**Overview**: Enhance error handling to provide better user experience and automatic recovery from transient failures.

**Problem**:
- Silent failures for OpenRank fetching (only `console.error`)
- Generic error messages not actionable
- No automatic retry on transient failures
- Once error state is set, user must manually refresh

**Solution**:
- Add error callback prop for side effects
- Implement error codes/types for better error categorization
- Add automatic retry with exponential backoff
- Surface errors to consumers with context

**Technical Details**:
```typescript
type ErrorCode = 'NETWORK_ERROR' | 'AUTH_ERROR' | 'RATE_LIMIT' | 'UNKNOWN';

interface UseFarcasterDataProps {
  onError?: (error: { code: ErrorCode; message: string; context: string }) => void;
}

// Retry logic with exponential backoff
const fetchWithRetry = async (
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> => {
  // Implementation
};
```

**Acceptance Criteria**:
- [ ] Error callback prop available
- [ ] Error codes defined and used
- [ ] Automatic retry implemented for transient failures
- [ ] Errors surfaced to consumers with context
- [ ] User experience improved

**Estimated Effort**: 5-6 hours

---

### Task 6: Enhance Testability

**Overview**: Improve testability by injecting dependencies and removing environment-dependent logic.

**Problem**:
- Environment detection logic scattered throughout (`process.env.NEXT_PUBLIC_USE_MOCKS`, `window.__FORCE_MOCKS__`)
- Must mock global `fetch` in tests
- Side effects make testing unpredictable
- Hard to test different scenarios

**Solution**:
- Inject mock flag via props (overrides environment)
- Inject `fetch` function (defaults to global fetch)
- Return side effects explicitly instead of executing them
- Remove environment checks from hook logic

**Technical Details**:
```typescript
interface UseFarcasterDataProps {
  useMocks?: boolean; // Override for testing
  fetchFn?: typeof fetch; // Default: global fetch
  // ...
}

// Return side effects
return {
  // ... state
  sideEffects: {
    fetchOpenRankForAuthors: (fids: number[]) => Promise<void>;
  }
};
```

**Acceptance Criteria**:
- [ ] Mock flag can be injected via props
- [ ] Fetch function can be injected
- [ ] Side effects returned as callbacks
- [ ] Tests can run without environment setup
- [ ] Test coverage improved

**Estimated Effort**: 4-5 hours

---

## 🟢 Low Priority

### Task 7: Add Request Deduplication

**Overview**: Prevent duplicate requests when dependencies change rapidly.

**Problem**:
- If `user.fid` or `dayFilter` changes rapidly, multiple requests fire simultaneously
- Wastes resources and can cause race conditions
- May show stale data if requests complete out of order

**Solution**:
- Track active requests by key
- Cancel previous request when new one starts
- Use request key based on parameters

**Technical Details**:
```typescript
const activeRequests = useRef(new Map<string, AbortController>());

const requestKey = `${user.fid}-${dayFilter}`;
// Cancel previous request if exists
// Track new request
```

**Acceptance Criteria**:
- [ ] Duplicate requests prevented
- [ ] Previous requests cancelled when new one starts
- [ ] No race conditions
- [ ] Performance improved

**Estimated Effort**: 2-3 hours

---

### Task 8: Add Response Caching

**Overview**: Implement response caching to avoid unnecessary refetches.

**Problem**:
- Every refresh fetches fresh data, even if nothing changed
- No cache validation (ETag/Last-Modified)
- Wastes bandwidth and increases load times

**Solution**:
- Add ETag/Last-Modified support
- Cache responses with validation
- Use cache headers from API responses

**Technical Details**:
```typescript
interface CachedResponse<T> {
  data: T;
  etag?: string;
  lastModified?: string;
  timestamp: number;
}

// Check cache before fetching
// Use If-None-Match header for validation
```

**Acceptance Criteria**:
- [ ] ETag support implemented
- [ ] Cache validation working
- [ ] Reduced unnecessary requests
- [ ] Faster load times

**Estimated Effort**: 4-5 hours

---

### Task 9: Optimize Dependency Arrays

**Overview**: Optimize `useCallback` dependency arrays to prevent unnecessary recreations.

**Problem**:
- `loadMoreConversations` has large dependency array
- Recreates on every state change
- May cause unnecessary re-renders

**Solution**:
- Use refs for stable values
- Minimize dependencies
- Use functional updates where possible

**Technical Details**:
```typescript
const cursorRef = useRef(state.cursor);
useEffect(() => { cursorRef.current = state.cursor; }, [state.cursor]);

// Use ref in callback instead of state
const loadMore = useCallback(() => {
  // Use cursorRef.current instead of state.cursor
}, [/* minimal deps */]);
```

**Acceptance Criteria**:
- [ ] Dependency arrays optimized
- [ ] Fewer unnecessary recreations
- [ ] Performance improved
- [ ] No functionality lost

**Estimated Effort**: 2-3 hours

---

### Task 10: Add Comprehensive Documentation

**Overview**: Add JSDoc comments, usage examples, and architectural documentation.

**Problem**:
- Limited inline documentation
- No usage examples
- Error codes not documented
- Hard for new developers to understand

**Solution**:
- Add JSDoc comments to all public interfaces
- Create usage examples
- Document error codes and error handling
- Add architectural decision records

**Acceptance Criteria**:
- [ ] All public APIs documented with JSDoc
- [ ] Usage examples provided
- [ ] Error codes documented
- [ ] ADR created for architectural decisions

**Estimated Effort**: 3-4 hours

---

## Implementation Order

### Phase 1: Foundation (Week 1)
1. Task 3: Eliminate Code Duplication (enables easier refactoring)
2. Task 1: Extract Reputation Logic (reduces complexity)
3. Task 2: Abstract API Client (enables testing)

### Phase 2: Enhancement (Week 2)
4. Task 4: Add Configuration Options
5. Task 5: Improve Error Handling
6. Task 6: Enhance Testability

### Phase 3: Optimization (Week 3)
7. Task 7: Request Deduplication
8. Task 8: Response Caching
9. Task 9: Optimize Dependencies
10. Task 10: Documentation

---

## Dependencies

- **Task 1** → No dependencies
- **Task 2** → No dependencies (but easier after Task 3)
- **Task 3** → No dependencies (should be done first)
- **Task 4** → Benefits from Task 2
- **Task 5** → Benefits from Task 2
- **Task 6** → Benefits from Task 2
- **Task 7-10** → Can be done independently

---

## Notes

- All tasks should maintain backward compatibility where possible
- Each task should include tests
- Consider creating feature branch for each task
- Review architectural critique document for detailed analysis
- Update C4 diagrams after significant changes


