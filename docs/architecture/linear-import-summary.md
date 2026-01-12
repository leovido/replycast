# Linear Import Summary - useFarcasterData Refactoring

## Quick Import Format

Each task below can be copied directly into Linear. Use the format:

**Title**: [Task Number] Task Name

**Description**: 
[Copy the Overview, Problem, Solution sections]

**Labels**: `refactoring`, `high-priority` (or `medium-priority`, `low-priority`)

**Estimate**: [X hours]

---

## 🔴 High Priority Tasks

### [H1] Extract Reputation Logic to Separate Hook
**Estimate**: 4-6 hours
**Labels**: `refactoring`, `high-priority`, `architecture`

**Description**:
Move user reputation fetching logic from `useFarcasterData` to a dedicated hook to improve separation of concerns.

**Problem**: 
`useFarcasterData` currently handles both conversation fetching and user reputation fetching, violating Single Responsibility Principle. Changes to reputation logic affect conversation logic and vice versa.

**Solution**:
- Create or enhance `useReputation` hook to handle all reputation-related logic
- Remove reputation state from `useFarcasterData`
- Update `FarcasterApp` to use both hooks independently

**Acceptance Criteria**:
- `useFarcasterData` no longer contains reputation-related state or logic
- `useReputation` hook handles all reputation fetching
- All tests pass

---

### [H2] Abstract API Client Interface
**Estimate**: 6-8 hours
**Labels**: `refactoring`, `high-priority`, `architecture`, `testing`

**Description**:
Create an abstract API client interface to decouple the hook from direct API calls, improving testability and flexibility.

**Problem**:
Hard-coded API endpoints and direct dependency on global `fetch` function. Cannot easily swap data sources or mock for testing.

**Solution**:
- Create `FarcasterApiClient` interface
- Implement concrete `NeynarApiClient` class
- Inject API client via props (with default implementation)
- Replace all direct `fetch` calls with client methods

**Acceptance Criteria**:
- `FarcasterApiClient` interface defined
- All `fetch` calls replaced with client methods
- Tests can inject mock client

---

### [H3] Eliminate Code Duplication in Fetch Logic
**Estimate**: 3-4 hours
**Labels**: `refactoring`, `high-priority`, `code-quality`

**Description**:
Extract shared fetch logic to eliminate duplication across three different locations in the hook.

**Problem**:
Same fetch pattern appears in 3 different places. Changes to fetch logic must be made in multiple locations, risking inconsistencies.

**Solution**:
- Create `createFetchConversations` helper function
- Extract URL building, mock detection, and fetch logic
- Refactor all three locations to use shared function

**Acceptance Criteria**:
- Single source of truth for conversation fetching
- No duplicate code remains
- All tests verify fetch scenarios

---

## 🟡 Medium Priority Tasks

### [M1] Add Configuration Options
**Estimate**: 4-5 hours
**Labels**: `refactoring`, `medium-priority`, `enhancement`

**Description**:
Make the hook more flexible by adding configurable options for page size, filters, and retry behavior.

**Problem**:
Hard-coded values (page size: 25, default day filter: "today"). Inflexible filtering and no retry strategy.

**Solution**:
- Add configuration interface to hook props
- Make page size configurable
- Support extensible filter object
- Add optional retry configuration

**Acceptance Criteria**:
- Page size is configurable
- Filter object supports multiple filter types
- Backward compatible

---

### [M2] Improve Error Handling and Recovery
**Estimate**: 5-6 hours
**Labels**: `refactoring`, `medium-priority`, `error-handling`, `ux`

**Description**:
Enhance error handling to provide better user experience and automatic recovery from transient failures.

**Problem**:
Silent failures, generic error messages, no automatic retry, user must manually refresh on errors.

**Solution**:
- Add error callback prop
- Implement error codes/types
- Add automatic retry with exponential backoff
- Surface errors to consumers with context

**Acceptance Criteria**:
- Error callback prop available
- Error codes defined
- Automatic retry implemented
- User experience improved

---

### [M3] Enhance Testability
**Estimate**: 4-5 hours
**Labels**: `refactoring`, `medium-priority`, `testing`

**Description**:
Improve testability by injecting dependencies and removing environment-dependent logic.

**Problem**:
Environment detection logic scattered throughout. Must mock global `fetch` in tests. Side effects make testing unpredictable.

**Solution**:
- Inject mock flag via props
- Inject `fetch` function
- Return side effects explicitly
- Remove environment checks

**Acceptance Criteria**:
- Mock flag can be injected
- Fetch function can be injected
- Tests can run without environment setup

---

## 🟢 Low Priority Tasks

### [L1] Add Request Deduplication
**Estimate**: 2-3 hours
**Labels**: `refactoring`, `low-priority`, `performance`

**Description**:
Prevent duplicate requests when dependencies change rapidly.

**Problem**:
If `user.fid` or `dayFilter` changes rapidly, multiple requests fire simultaneously, wasting resources.

**Solution**:
- Track active requests by key
- Cancel previous request when new one starts

**Acceptance Criteria**:
- Duplicate requests prevented
- No race conditions

---

### [L2] Add Response Caching
**Estimate**: 4-5 hours
**Labels**: `refactoring`, `low-priority`, `performance`, `caching`

**Description**:
Implement response caching to avoid unnecessary refetches.

**Problem**:
Every refresh fetches fresh data, even if nothing changed. No cache validation.

**Solution**:
- Add ETag/Last-Modified support
- Cache responses with validation
- Use cache headers from API responses

**Acceptance Criteria**:
- ETag support implemented
- Reduced unnecessary requests

---

### [L3] Optimize Dependency Arrays
**Estimate**: 2-3 hours
**Labels**: `refactoring`, `low-priority`, `performance`

**Description**:
Optimize `useCallback` dependency arrays to prevent unnecessary recreations.

**Problem**:
`loadMoreConversations` has large dependency array, recreates on every state change.

**Solution**:
- Use refs for stable values
- Minimize dependencies
- Use functional updates where possible

**Acceptance Criteria**:
- Dependency arrays optimized
- Fewer unnecessary recreations

---

### [L4] Add Comprehensive Documentation
**Estimate**: 3-4 hours
**Labels**: `refactoring`, `low-priority`, `documentation`

**Description**:
Add JSDoc comments, usage examples, and architectural documentation.

**Problem**:
Limited inline documentation, no usage examples, error codes not documented.

**Solution**:
- Add JSDoc comments to all public interfaces
- Create usage examples
- Document error codes
- Add architectural decision records

**Acceptance Criteria**:
- All public APIs documented
- Usage examples provided
- Error codes documented

---

## Implementation Phases

**Phase 1 (Week 1)**: H3 → H1 → H2
**Phase 2 (Week 2)**: M1 → M2 → M3
**Phase 3 (Week 3)**: L1 → L2 → L3 → L4

---

## Related Documents

- [Architectural Critique](./c4-useFarcasterData-critique.md) - Detailed analysis
- [Component Diagram](./c4-useFarcasterData.md) - Current architecture
- [Full TODO List](./refactoring-todos.md) - Complete details

