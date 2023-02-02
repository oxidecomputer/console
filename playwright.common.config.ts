/** E2E tests that use MSW in-browser */
import type { PlaywrightTestConfig } from '@playwright/test'
import { devices } from '@playwright/test'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export const common: PlaywrightTestConfig = {
  testDir: './app',
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  timeout: 60000,
  use: {
    trace: 'retain-on-failure',
    baseURL: 'http://localhost:4009',
  },
  projects: [
    {
      name: 'chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'safari',
      use: { ...devices['Desktop Safari'] },
    },
  ],
}
