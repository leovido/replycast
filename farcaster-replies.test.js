global.fetch = jest.fn(() => 
  Promise.resolve({
    json: () => Promise.resolve({})
  })
);

const { randomInt } = require('crypto');
// Import the functions we want to test
const { timeAgo, flattenReplies, handleFarcasterReplies } = require('./test-api-local.js');

// Mock environment variables
process.env.NEYNAR_API_KEY = 'test-api-key';

describe('Farcaster Replies API', () => {
  const fid = randomInt(100000, 999999).toString();
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset fetch mock to default behavior
    global.fetch.mockImplementation(() => 
      Promise.resolve({
        json: () => Promise.resolve({})
      })
    );
  });

  afterEach(async () => {
    // Ensure all pending promises are resolved
    await new Promise(resolve => setImmediate(resolve));
  });

  describe('timeAgo function', () => {
    test('should return seconds for recent timestamps', () => {
      const now = new Date();
      const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);
      expect(timeAgo(thirtySecondsAgo.toISOString())).toBe('30s ago');
    });

    test('should return minutes for timestamps within an hour', () => {
      const now = new Date();
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
      expect(timeAgo(thirtyMinutesAgo.toISOString())).toBe('30min ago');
    });

    test('should return hours for timestamps within a day', () => {
      const now = new Date();
      const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
      expect(timeAgo(threeHoursAgo.toISOString())).toBe('3h ago');
    });

    test('should return days for older timestamps', () => {
      const now = new Date();
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      expect(timeAgo(twoDaysAgo.toISOString())).toBe('2d ago');
    });
  });

  describe('flattenReplies function', () => {
    test('should flatten nested replies correctly', () => {
      const mockReplies = [
        {
          id: '1',
          author: { username: 'user1' },
          direct_replies: [
            {
              id: '2',
              author: { username: 'user2' },
              direct_replies: [
                { id: '3', author: { username: 'user3' } }
              ]
            }
          ]
        },
        {
          id: '4',
          author: { username: 'user4' }
        }
      ];

      const result = flattenReplies(mockReplies);
      expect(result).toHaveLength(4);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
      expect(result[2].id).toBe('3');
      expect(result[3].id).toBe('4');
    });

    test('should handle empty replies array', () => {
      const result = flattenReplies([]);
      expect(result).toEqual([]);
    });

    test('should handle replies without nested replies', () => {
      const mockReplies = [
        { id: '1', author: { username: 'user1' } },
        { id: '2', author: { username: 'user2' } }
      ];

      const result = flattenReplies(mockReplies);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });
  });

  describe('handleFarcasterReplies function', () => {
    test('should return error when FID is missing', async () => {
      const result = await handleFarcasterReplies();
      expect(result.status).toBe(400);
      expect(result.data.error).toBe('FID parameter is required');
    }, 10000);

    test('should return error when FID is not a string', async () => {
      const result = await handleFarcasterReplies(123);
      expect(result.status).toBe(400);
      expect(result.data.error).toBe('FID parameter is required');
    }, 10000);

    test('should return error when API key is not configured', async () => {
      fetch.mockRejectedValueOnce(new Error('Internal server error'));

      // Temporarily remove API key
      const originalKey = process.env.NEYNAR_API_KEY;
      delete process.env.NEYNAR_API_KEY;

      const result = await handleFarcasterReplies(fid);
      expect(result.status).toBe(500);
      expect(result.data.error).toBe('Internal server error');

      // Restore API key
      process.env.NEYNAR_API_KEY = originalKey;
    }, 10000);

    test('should handle no casts found', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ casts: [] })
      });

      const result = await handleFarcasterReplies(fid);
      expect(result.status).toBe(200);
      expect(result.data.unrepliedCount).toBe(0);
      expect(result.data.unrepliedDetails).toEqual([]);
      expect(result.data.message).toBe('You have 0 unreplied comments today.');
    }, 10000);

    test('should handle API error response', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await handleFarcasterReplies(fid);
      expect(result.status).toBe(500);
      expect(result.data.error).toBe('Internal server error');
    });

    test('should identify unreplied conversations correctly', async () => {
      // Mock user casts response
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          casts: [
            {
              hash: 'cast1',
              timestamp: '2024-01-01T10:00:00Z'
            }
          ]
        })
      });

      // Mock conversation response with unreplied conversation
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          conversation: {
            cast: {
              hash: 'cast1',
              author: { fid: fid },
              direct_replies: [
                {
                  hash: 'reply1',
                  author: { username: 'alice', fid: '123' },
                  timestamp: '2024-01-01T11:00:00Z',
                  direct_replies: []
                }
              ]
            }
          }
        })
      });

      const result = await handleFarcasterReplies(fid);
      expect(result.status).toBe(200);
      expect(result.data.unrepliedCount).toBe(1);
      expect(result.data.unrepliedDetails).toHaveLength(1);
      expect(result.data.unrepliedDetails[0].username).toBe('alice');
      expect(result.data.message).toBe('You have 1 unreplied comments today.');
    });

    test('should not count conversations where author has replied', async () => {
      // Mock user casts response
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          casts: [
            {
              hash: 'cast1',
              timestamp: '2024-01-01T10:00:00Z'
            }
          ]
        })
      });

      // Mock conversation response where author has replied
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          conversation: {
            cast: {
              hash: 'cast1',
              author: { fid: fid },
              direct_replies: [
                {
                  hash: 'reply1',
                  author: { username: 'alice', fid: '123' },
                  timestamp: '2024-01-01T11:00:00Z',
                  direct_replies: []
                },
                {
                  hash: 'reply2',
                  author: { username: 'bob', fid: fid }, // Author replied
                  parent_hash: 'reply1', // Reply to someone else
                  timestamp: '2024-01-01T12:00:00Z',
                  direct_replies: []
                }
              ]
            }
          }
        })
      });

      const result = await handleFarcasterReplies(fid);
      expect(result.status).toBe(200);
      expect(result.data.unrepliedCount).toBe(0);
      expect(result.data.unrepliedDetails).toEqual([]);
    });

    test('should handle multiple casts with mixed results', async () => {
      // Mock user casts response with multiple casts
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          casts: [
            { hash: 'cast1', timestamp: '2024-01-01T10:00:00Z' },
            { hash: 'cast2', timestamp: '2024-01-01T11:00:00Z' }
          ]
        })
      });

      // Mock conversation for first cast (unreplied)
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          conversation: {
            cast: {
              hash: 'cast1',
              author: { fid: fid },
              direct_replies: [
                {
                  hash: 'reply1',
                  author: { username: 'alice', fid: '123' },
                  timestamp: '2024-01-01T11:00:00Z',
                  direct_replies: []
                }
              ]
            }
          }
        })
      });

      // Mock conversation for second cast (replied)
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          conversation: {
            cast: {
              hash: 'cast2',
              author: { fid: fid },
              direct_replies: [
                {
                  hash: 'reply2',
                  author: { username: 'bob', fid: '456' },
                  timestamp: '2024-01-01T12:00:00Z',
                  direct_replies: []
                },
                {
                  hash: 'reply3',
                  author: { username: 'charlie', fid: fid }, // Author replied
                  parent_hash: 'reply2',
                  timestamp: '2024-01-01T13:00:00Z',
                  direct_replies: []
                }
              ]
            }
          }
        })
      });

      const result = await handleFarcasterReplies(fid);
      expect(result.status).toBe(200);
      expect(result.data.unrepliedCount).toBe(1);
      expect(result.data.unrepliedDetails).toHaveLength(1);
      expect(result.data.unrepliedDetails[0].username).toBe('alice');
    });

    test('should handle missing conversation data', async () => {
      // Mock user casts response
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          casts: [
            { hash: 'cast1', timestamp: '2024-01-01T10:00:00Z' }
          ]
        })
      });

      // Mock conversation response with missing conversation
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({})
      });

      const result = await handleFarcasterReplies(fid);
      expect(result.status).toBe(200);
      expect(result.data.unrepliedCount).toBe(0);
      expect(result.data.unrepliedDetails).toEqual([]);
    });
  });

  describe('Integration tests', () => {
    test('should handle real-world scenario with nested replies', async () => {
      // Mock user casts response
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          casts: [
            { hash: 'cast1', timestamp: '2024-01-01T10:00:00Z' }
          ]
        })
      });

      // Mock conversation with complex nested replies
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          conversation: {
            cast: {
              hash: 'cast1',
              author: { fid: fid },
              direct_replies: [
                {
                  hash: 'reply1',
                  author: { username: 'alice', fid: '123' },
                  timestamp: '2024-01-01T11:00:00Z',
                  direct_replies: [
                    {
                      hash: 'reply1a',
                      author: { username: 'bob', fid: '456' },
                      timestamp: '2024-01-01T12:00:00Z',
                      direct_replies: []
                    }
                  ]
                },
                {
                  hash: 'reply2',
                  author: { username: 'charlie', fid: '789' },
                  timestamp: '2024-01-01T13:00:00Z',
                  direct_replies: []
                }
              ]
            }
          }
        })
      });

      const result = await handleFarcasterReplies(fid);
      expect(result.status).toBe(200);
      expect(result.data.unrepliedCount).toBe(1);
      expect(result.data.unrepliedDetails).toHaveLength(1);
      expect(result.data.unrepliedDetails[0].username).toBe('alice');
    });
  });
}); 