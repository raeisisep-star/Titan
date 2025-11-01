import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Configuration
 * 
 * Features:
 * - Automatic retries (2 attempts on failure)
 * - Timeouts configured for staging environment
 * - Parallel test execution
 * - HTML reporter for CI
 */

export default defineConfig({
  testDir: './tests/e2e',
  
  // Maximum time one test can run
  timeout: 30 * 1000, // 30 seconds
  
  // Run tests in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],
  
  // Shared settings for all the projects below
  use: {
    // Base URL for all tests
    baseURL: process.env.E2E_BASE_URL || 'https://staging.zala.ir',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // Maximum time each action (click, fill, etc.) can take
    actionTimeout: 10 * 1000, // 10 seconds
    
    // Maximum time for navigation (page.goto)
    navigationTimeout: 15 * 1000, // 15 seconds
  },
  
  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    // Uncomment for cross-browser testing:
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
  
  // Run your local dev server before starting the tests
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
