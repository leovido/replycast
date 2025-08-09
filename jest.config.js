/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)": "<rootDir>/$1",
    "^@farcaster/miniapp-sdk$": "<rootDir>/__mocks__/@farcaster/miniapp-sdk.js",
    "^@farcaster/auth-kit$": "<rootDir>/__mocks__/@farcaster/auth-kit.js",
    "^@vercel/analytics(\/next)?$": "<rootDir>/__mocks__/@vercel/analytics.js",
  },
  transform: {
    "^.+\\.(t|j)sx?$": "babel-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!@ngrx|(?!deck.gl)|ng-dynamic)",
  ],
};

module.exports = config;
