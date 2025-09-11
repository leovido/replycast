# Mocking System for Local Development

This document explains how to use the comprehensive mocking system to avoid making real API calls during development.

## Overview

The mocking system allows you to develop and test the application without hitting external APIs like:

- Quotient API
- OpenRank API (Base blockchain)
- Neynar API
- Farcaster Hub APIs

## Quick Start

1. **Enable mocks** by setting the environment variable:

   ```bash
   # .env.local
   NEXT_PUBLIC_USE_MOCKS=true
   ```

2. **Start your development server**:

   ```bash
   npm run dev
   ```

3. **Mocks are now active** - all API calls will return realistic mock data instead of hitting external services.

## Environment Variables

| Variable                 | Default | Description                              |
| ------------------------ | ------- | ---------------------------------------- |
| `NEXT_PUBLIC_USE_MOCKS`  | `false` | Enable/disable the entire mocking system |
| `NEXT_PUBLIC_MOCK_DELAY` | `500`   | Simulated network delay in milliseconds  |

## What Gets Mocked

### 1. Quotient API (`/api/quotient`)

- **Real API**: `https://api.quotient.social/v1/user-reputation`
- **Mock Data**: Sample Quotient scores with various tiers (Exceptional, Elite, Influential, Active, Casual, Inactive)
- **Benefits**: No need for Quotient API key during development

### 2. OpenRank API (`/api/openRank`)

- **Real API**: Base blockchain contract calls
- **Mock Data**: Sample OpenRank scores and rankings
- **Benefits**: No blockchain RPC calls, faster development

### 3. Farcaster APIs

- **Real APIs**: Neynar SDK calls to Farcaster Hub
- **Mock Data**: Sample conversation data with various authors and engagement levels
- **Benefits**: No Neynar API usage, consistent test data

### 4. Image Proxy (`/api/image-proxy`)

- **Real API**: External image fetching
- **Mock Data**: Placeholder images and sample avatar URLs
- **Benefits**: No external image dependencies

## Mock Data Structure

### Quotient Scores

```typescript
{
  "123": {
    "fid": 123,
    "username": "alice",
    "quotientScore": 0.95,        // Exceptional tier
    "quotientRank": 50,
    "quotientProfileUrl": "https://quotient.social/user/123"
  },
  "456": {
    "fid": 456,
    "username": "bob",
    "quotientScore": 0.82,        // Elite tier
    "quotientRank": 500,
    "quotientProfileUrl": "https://quotient.social/user/456"
  }
}
```

### OpenRank Scores

```typescript
{
  "123": 1500,    // High rank
  "456": 5000,    // Medium rank
  "789": 15000    // Lower rank
}
```

### Conversations

```typescript
[
  {
    username: "alice",
    timeAgo: "2 hours ago",
    text: "This is a really interesting conversation about Farcaster!",
    authorFid: 123,
    replyCount: 5,
    likesCount: 12,
    recastsCount: 3,
  },
];
```

## Mock Service Classes

The system uses service classes for different API types:

- `MockQuotientService` - Handles Quotient score requests
- `MockOpenRankService` - Handles OpenRank requests
- `MockFarcasterService` - Handles Farcaster data requests
- `MockAuthService` - Handles user authentication

## Customizing Mock Data

### Adding New Mock Users

Edit `utils/mockData.ts`:

```typescript
export const mockQuotientScores: Record<number, QuotientScore> = {
  // ... existing users
  999: {
    fid: 999,
    username: "newuser",
    quotientScore: 0.75, // Influential tier
    quotientScoreRaw: 0.75,
    quotientRank: 1200,
    quotientProfileUrl: "https://quotient.social/user/999",
  },
};
```

### Modifying Mock Conversations

```typescript
export const mockConversations: UnrepliedDetail[] = [
  // ... existing conversations
  {
    username: "newuser",
    timeAgo: "1 hour ago",
    text: "Your custom conversation text here",
    // ... other fields
  },
];
```

## Testing with Mocks

### Unit Tests

The mocking system includes comprehensive unit tests:

```bash
# Run all tests
npm test

# Run specific test files
npm test -- useQuotient.test.ts
npm test -- useReputation.test.ts
npm test -- ReputationFilter.test.ts
```

### Integration Tests

Test the entire flow with mock data:

```typescript
// Enable mocks in tests
process.env.NEXT_PUBLIC_USE_MOCKS = "true";

// Test reputation switching
const { result } = renderHook(() => useReputation());
act(() => result.current.setReputationType("openrank"));
expect(result.current.reputationType).toBe("openrank");
```

## Switching Between Mock and Real APIs

### During Development

```bash
# Use mocks (default for development)
NEXT_PUBLIC_USE_MOCKS=true

# Use real APIs
NEXT_PUBLIC_USE_MOCKS=false
```

### In Production

Mocks are automatically disabled in production builds.

## Troubleshooting

### Mocks Not Working

1. Check that `NEXT_PUBLIC_USE_MOCKS=true` is set
2. Restart your development server
3. Check browser console for "Mock:" prefixed logs

### Mock Data Not Updating

1. Clear browser cache
2. Check that mock data files are saved
3. Verify environment variables are loaded

### Tests Failing

1. Ensure mocks are properly imported
2. Check that test environment variables are set
3. Verify mock service classes are working

## Performance Benefits

- **Faster Development**: No network delays
- **Consistent Data**: Predictable test scenarios
- **Offline Development**: Work without internet
- **Cost Savings**: No API usage during development
- **Better Testing**: Controlled data for edge cases

## Advanced Usage

### Custom Mock Delays

```typescript
// Simulate slow network
await MockService.simulateSlowNetwork(0.5); // 50% chance of 2-5 second delay

// Simulate network errors
await MockService.simulateNetworkError(0.1); // 10% chance of error
```

### Mock Service Extension

```typescript
// Add new mock service
export class MockCustomService {
  static async fetchData() {
    if (!shouldUseMocks()) {
      throw new Error("Mock service called when mocks are disabled");
    }

    await mockDelay();
    return {
      /* your mock data */
    };
  }
}
```

## Best Practices

1. **Keep Mock Data Realistic**: Use realistic usernames, scores, and timestamps
2. **Test Edge Cases**: Include various data scenarios in mocks
3. **Document Changes**: Update this document when adding new mock data
4. **Use Consistent Patterns**: Follow the established mock service patterns
5. **Test Both Modes**: Ensure your app works with both mock and real APIs

## Support

If you encounter issues with the mocking system:

1. Check the console logs for "Mock:" prefixed messages
2. Verify environment variables are correctly set
3. Ensure mock data files are properly imported
4. Check that the mock service classes are working correctly
