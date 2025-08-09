export const sdk = {
  isInMiniApp: jest.fn(async () => false),
  get context() {
    return Promise.resolve({ user: null });
  },
  actions: {},
};