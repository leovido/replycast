# Architectural Critique: useFarcasterData Hook

## Executive Summary

**Overall Assessment**: ⚠️ **Moderate Risk - Good Foundation, Needs Refinement**

The hook demonstrates solid React patterns and performance awareness, but suffers from **mixed responsibilities**, **tight coupling**, and **limited extensibility**. It's production-ready but would benefit from architectural refactoring for long-term maintainability.

---

## 1. Cohesion Analysis

### ✅ **Strengths**
- **Functional Cohesion**: All code relates to Farcaster data management
- **Clear State Management**: `useReducer` provides predictable state transitions
- **Helper Functions**: Deduplication logic is properly extracted

### ❌ **Weaknesses**

#### **Mixed Responsibilities (Low Cohesion)**
The hook violates Single Responsibility Principle by handling:
1. **Conversation fetching** (primary responsibility)
2. **User reputation fetching** (secondary concern - should be separate)
3. **OpenRank coordination** (side effect management)
4. **Cache management** (delegated but tightly coupled)

**Impact**: Changes to reputation logic affect conversation logic and vice versa.

**Recommendation**: Extract reputation fetching to `useReputation` hook (already exists but not used here).

---

## 2. Coupling Analysis

### ❌ **Tight Coupling Issues**

#### **1. Direct API Dependency**
```typescript
// Hard-coded API endpoints
fetch(`/api/farcaster-notification-replies`, ...)
fetch(`/api/openRank?fids=${user.fid}`, ...)
fetch(`/api/quotient`, ...)
```

**Problem**: 
- Cannot easily swap data sources
- Hard to test without mocking `fetch`
- API changes require hook modifications

**Recommendation**: Inject API client via props or context:
```typescript
interface UseFarcasterDataProps {
  apiClient?: FarcasterApiClient; // Abstract interface
  // ...
}
```

#### **2. Mock Service Coupling**
```typescript
const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
  (typeof window !== "undefined" && (window as any).__FORCE_MOCKS__);
```

**Problem**:
- Environment detection logic scattered throughout
- Hard to test different scenarios
- Violates Dependency Inversion Principle

**Recommendation**: Use dependency injection:
```typescript
interface DataService {
  fetchReplies(fid: number, dayFilter: string, limit: number, cursor?: string): Promise<FarcasterRepliesResponse>;
  fetchUserReputation(fid: number): Promise<ReputationData>;
}
```

#### **3. Function Prop Coupling**
```typescript
fetchOpenRankData: (fids: number[]) => Promise<void>;
clearOpenRankCache: () => void;
```

**Problem**:
- Parent component must provide these functions
- Creates circular dependency (parent depends on hook, hook depends on parent functions)
- Hard to test in isolation

**Recommendation**: Use event emitter pattern or context:
```typescript
// Option 1: Event-based
sdk.events.on('conversationsLoaded', (fids) => {
  fetchOpenRankData(fids);
});

// Option 2: Context-based
const { fetchOpenRank } = useReputationContext();
```

---

## 3. Flexibility & Extensibility

### ❌ **Limited Extensibility**

#### **1. Hard-coded Configuration**
```typescript
url.searchParams.set("limit", "25"); // Hard-coded
```

**Problem**: Cannot adjust page size without modifying hook

**Recommendation**: Make configurable:
```typescript
interface UseFarcasterDataProps {
  pageSize?: number; // Default: 25
  // ...
}
```

#### **2. Inflexible Filtering**
```typescript
if (dayFilter !== "all") {
  url.searchParams.set("dayFilter", dayFilter);
}
```

**Problem**: Only supports day-based filtering. Adding new filters requires hook modification.

**Recommendation**: Use filter object:
```typescript
interface ConversationFilters {
  dayFilter?: string;
  reputationMin?: number;
  channel?: string;
  // Extensible
}
```

#### **3. No Retry Strategy**
```typescript
catch (error: unknown) {
  dispatch({ type: 'FETCH_ERROR', error: ... });
}
```

**Problem**: No automatic retry on transient failures

**Recommendation**: Add retry logic with exponential backoff:
```typescript
const fetchWithRetry = async (fn: () => Promise<T>, retries = 3): Promise<T> => {
  // Retry logic
};
```

---

## 4. Maintainability Concerns

### ⚠️ **Code Duplication**

#### **Duplicate Fetch Logic**
The same fetch pattern appears in:
- `dataFetcher` (lines 230-277)
- `loadMoreConversations` (lines 288-340)
- `handleRefresh` (lines 343-373)

**Problem**: Changes to fetch logic must be made in 3 places

**Recommendation**: Extract to shared function:
```typescript
const createFetchConversations = (
  fid: number,
  dayFilter: string,
  cursor?: string
) => {
  // Centralized fetch logic
};
```

### ⚠️ **Magic Numbers & Strings**
```typescript
limit: "25" // Why 25?
dayFilter = "today" // Default value not documented
```

**Recommendation**: Extract to constants:
```typescript
const DEFAULT_PAGE_SIZE = 25;
const DEFAULT_DAY_FILTER = "today";
```

---

## 5. Testability Issues

### ❌ **Hard to Test**

#### **1. Environment-Dependent Logic**
```typescript
const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
  (typeof window !== "undefined" && (window as any).__FORCE_MOCKS__);
```

**Problem**: Requires environment setup for testing

**Recommendation**: Inject mock flag:
```typescript
interface UseFarcasterDataProps {
  useMocks?: boolean; // Override for testing
}
```

#### **2. Global Fetch Dependency**
```typescript
const res = await fetch(url.toString(), ...);
```

**Problem**: Must mock global `fetch` in tests

**Recommendation**: Inject fetch function:
```typescript
interface UseFarcasterDataProps {
  fetchFn?: typeof fetch; // Default: global fetch
}
```

#### **3. Side Effects in Effects**
```typescript
fetchOpenRankDataRef.current(fids).catch(console.error);
```

**Problem**: Side effects make testing unpredictable

**Recommendation**: Return side effects as callbacks:
```typescript
return {
  // ...
  sideEffects: {
    fetchOpenRankForAuthors: (fids: number[]) => void;
  }
};
```

---

## 6. Performance Analysis

### ✅ **Strengths**
1. **Abort Controllers**: Proper cleanup prevents memory leaks
2. **Parallel Fetching**: Reputation scores fetched in parallel
3. **Fire-and-Forget**: OpenRank fetching doesn't block UI
4. **Deduplication**: Prevents duplicate conversations
5. **Refs for Callbacks**: Avoids dependency issues

### ⚠️ **Concerns**

#### **1. No Request Deduplication**
If `user.fid` changes rapidly, multiple requests fire simultaneously.

**Recommendation**: Add request deduplication:
```typescript
const activeRequests = useRef(new Map<string, AbortController>());
```

#### **2. No Response Caching**
Every refresh fetches fresh data, even if nothing changed.

**Recommendation**: Add ETag/Last-Modified support:
```typescript
res.headers.get('ETag'); // Cache validation
```

#### **3. Large Dependency Array**
```typescript
}, [state.hasMore, state.isLoadingMore, state.loading, state.cursor, user?.fid, dayFilter]);
```

**Problem**: `loadMoreConversations` recreates on every state change

**Recommendation**: Use refs for stable values:
```typescript
const cursorRef = useRef(state.cursor);
useEffect(() => { cursorRef.current = state.cursor; }, [state.cursor]);
```

---

## 7. Error Handling Robustness

### ⚠️ **Inconsistent Error Handling**

#### **1. Silent Failures**
```typescript
fetchOpenRankDataRef.current(fids).catch(console.error);
```

**Problem**: Errors are logged but not surfaced to user

**Recommendation**: Add error state or callback:
```typescript
interface UseFarcasterDataProps {
  onError?: (error: Error, context: string) => void;
}
```

#### **2. Generic Error Messages**
```typescript
error: "Failed to load conversations"
```

**Problem**: Not actionable for users or developers

**Recommendation**: Provide error codes:
```typescript
type ErrorCode = 'NETWORK_ERROR' | 'AUTH_ERROR' | 'RATE_LIMIT' | 'UNKNOWN';
```

#### **3. No Error Recovery**
Once error state is set, user must manually refresh.

**Recommendation**: Add automatic retry with exponential backoff.

---

## 8. Type Safety

### ✅ **Strengths**
- Strong TypeScript typing
- Discriminated union for actions
- Proper null handling

### ⚠️ **Weaknesses**

#### **1. Type Assertions**
```typescript
(window as any).__FORCE_MOCKS__
```

**Recommendation**: Use proper type guards:
```typescript
function isForceMocksEnabled(window: Window): boolean {
  return '__FORCE_MOCKS__' in window && window.__FORCE_MOCKS__ === true;
}
```

---

## 9. Architectural Patterns

### ✅ **Good Patterns Used**
1. **Reducer Pattern**: Predictable state management
2. **Custom Hooks**: Reusable logic encapsulation
3. **Abort Controllers**: Proper async cleanup

### ❌ **Missing Patterns**

#### **1. Repository Pattern**
Direct API calls should be abstracted:
```typescript
class ConversationRepository {
  async fetchConversations(filters: ConversationFilters): Promise<FarcasterRepliesResponse>;
  async fetchMore(cursor: string): Promise<FarcasterRepliesResponse>;
}
```

#### **2. Strategy Pattern**
Mock vs real service should be swappable:
```typescript
interface DataServiceStrategy {
  fetchReplies(...): Promise<FarcasterRepliesResponse>;
}
```

---

## 10. Critical Recommendations

### 🔴 **High Priority**

1. **Extract Reputation Logic**
   - Move to separate `useReputation` hook
   - Remove reputation state from this hook
   - Use composition instead of mixing concerns

2. **Abstract API Client**
   - Create `FarcasterApiClient` interface
   - Inject via props/context
   - Enables testing and service swapping

3. **Eliminate Code Duplication**
   - Extract shared fetch logic
   - Single source of truth for API calls

### 🟡 **Medium Priority**

4. **Add Configuration Options**
   - Make page size configurable
   - Support extensible filters
   - Add retry strategies

5. **Improve Error Handling**
   - Surface errors to consumers
   - Add error recovery
   - Provide error codes

6. **Enhance Testability**
   - Inject dependencies
   - Remove environment checks
   - Return side effects explicitly

### 🟢 **Low Priority**

7. **Performance Optimizations**
   - Request deduplication
   - Response caching
   - Optimize dependency arrays

8. **Documentation**
   - Add JSDoc comments
   - Document error codes
   - Provide usage examples

---

## 11. Refactoring Strategy

### Phase 1: Extract & Abstract (Low Risk)
1. Extract shared fetch logic
2. Create API client interface
3. Move reputation to separate hook

### Phase 2: Inject & Configure (Medium Risk)
1. Add dependency injection
2. Make configuration flexible
3. Improve error handling

### Phase 3: Optimize & Enhance (Low Risk)
1. Add caching layer
2. Implement retry logic
3. Performance optimizations

---

## 12. Risk Assessment

| Concern | Risk Level | Impact | Mitigation |
|---------|-----------|--------|------------|
| Mixed Responsibilities | 🔴 High | Maintainability | Extract reputation logic |
| Tight API Coupling | 🔴 High | Flexibility | Abstract API client |
| Code Duplication | 🟡 Medium | Maintainability | Extract shared functions |
| Limited Extensibility | 🟡 Medium | Future Changes | Add configuration options |
| Error Handling | 🟡 Medium | User Experience | Improve error recovery |
| Testability | 🟡 Medium | Code Quality | Inject dependencies |

---

## Conclusion

The `useFarcasterData` hook is **functionally sound** but **architecturally fragile**. It works well for current requirements but will become harder to maintain as the codebase grows.

**Key Takeaway**: The hook tries to do too much. Following the Single Responsibility Principle and Dependency Inversion Principle would significantly improve its architecture.

**Recommended Next Steps**:
1. Create architectural refactoring ticket
2. Prioritize extraction of reputation logic
3. Design API client abstraction
4. Plan incremental refactoring (don't rewrite everything at once)


