/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testMatch: [
    "**/__tests__/**/*.(js|jsx|ts|tsx)",
    "**/*.(test|spec).(js|jsx|ts|tsx)",
  ],
  testPathIgnorePatterns: ["/node_modules/", "/.next/", "/out/"],
  moduleNameMapper: {
    "^@/(.*)": "<rootDir>/$1",
    "^@farcaster/miniapp-sdk$": "<rootDir>/__mocks__/@farcaster/miniapp-sdk.js",
    "^@farcaster/auth-kit$": "<rootDir>/__mocks__/@farcaster/auth-kit.js",
    "^@vercel/analytics(/next)?$": "<rootDir>/__mocks__/@vercel/analytics.js",
  },
  transform: {
    "^.+\\.(t|j)sx?$": "babel-jest",
  },
  transformIgnorePatterns: ["node_modules/(?!@ngrx|(?!deck.gl)|ng-dynamic)"],
  collectCoverageFrom: [
    "components/**/*.{js,jsx,ts,tsx}",
    "hooks/**/*.{js,jsx,ts,tsx}",
    "pages/**/*.{js,jsx,ts,tsx}",
    "utils/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
    "!**/coverage/**",
    "!**/__tests__/**",
    "!**/*.test.{js,jsx,ts,tsx}",
    "!**/*.spec.{js,jsx,ts,tsx}",
  ],
  coverageReporters: ["html", "text", "lcov", "json", "text-summary"],
  coverageDirectory: "coverage",
};

module.exports = config;
