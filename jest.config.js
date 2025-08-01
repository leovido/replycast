module.exports = {
  testEnvironment: "jsdom",
  testMatch: ["**/*.test.js", "**/*.test.ts", "**/*.test.tsx"],
  collectCoverageFrom: [
    "test-api-local.js",
    "test-api-simple.js",
    "pages/api/**/*.ts",
    "components/**/*.tsx",
    "!**/node_modules/**",
  ],
  coverageReporters: ["text", "lcov", "html"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testTimeout: 10000,
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  transformIgnorePatterns: ["node_modules/(?!(@farcaster|@testing-library)/)"],
  // Add these options to help with test isolation
  maxWorkers: 1, // Run tests sequentially
  maxConcurrency: 1, // Limit concurrent test execution
  // Clear mocks between tests
  clearMocks: true,
  // Reset modules between tests
  resetModules: true,
};
