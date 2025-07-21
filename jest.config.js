module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.js'],
  collectCoverageFrom: [
    'test-api-local.js',
    'test-api-simple.js',
    'pages/api/**/*.ts',
    '!**/node_modules/**'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: [],
  testTimeout: 10000,
  // Simple transform configuration
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  // Handle mixed module types
  transformIgnorePatterns: [
    'node_modules/(?!(@farcaster|ethers)/)'
  ]
};