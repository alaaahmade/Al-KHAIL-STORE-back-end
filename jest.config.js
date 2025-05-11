module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['./tests/setup.js'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  maxWorkers: 1, // Run tests serially
  testTimeout: 60000, // 60 second timeout for tests
  // Add global teardown script to guarantee connection closed
  globalTeardown: './tests/globalTeardown.js'
};