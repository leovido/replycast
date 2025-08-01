module.exports = {
  testEnvironment: "jsdom",
  testMatch: ["**/*.test.js", "**/*.test.tsx"],
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
};
