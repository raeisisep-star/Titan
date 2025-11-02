module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  // Exclude integration/E2E tests from unit test runs
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    'tests/contracts/',
    'tests/e2e/',
    '\\.e2e\\.',
    'playwright',
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  // Load test environment variables before running tests
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverageFrom: [
    'server-real-v3.js',
    'src/**/*.{js,ts}',
    'middleware/**/*.{js,ts}',
    'services/**/*.{js,ts}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
    '!**/*.test.{js,ts}',
    '!**/*.spec.{js,ts}',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 75,
      statements: 75,
    },
  },
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 10000,
};
