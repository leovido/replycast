// Mock for @vercel/analytics
export const track = jest.fn(() => {
  // Mock implementation that does nothing in tests
});

export default {
  track,
};
