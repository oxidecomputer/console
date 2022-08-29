import type { PlaywrightTestConfig } from '@playwright/test'
import { devices } from '@playwright/test'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  testDir: './app',
  testMatch: /.*\.e2e\.(js|ts|mjs)/,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  globalSetup: 'app/test/e2e/global-setup.ts',
  use: {
    trace: 'on-first-retry',
  },

  projects: ([process.env.browser as string] ?? ['Chrome', 'Firefox', 'Safari']).flatMap(
    (browser) => [
      /**
       * Configuration for smoke tests, these tests don't rely on underlying mock data to work.
       * Should be compatible with a live rack
       */
      {
        name: `smoke-${browser.toLowerCase()}`,
        testMatch: [/test\/.*\.e2e\.ts/],
        use: {
          ...devices[`Desktop ${browser}`],
          baseURL: 'http://localhost:4010',
        },
      },
      {
        name: `validate-${browser.toLowerCase()}`,
        testMatch: [/pages\/.*\.e2e\.ts/],
        use: {
          ...devices[`Desktop ${browser}`],
          baseURL: 'http://localhost:4010',
        },
      },
    ]
  ),

  // use different port so it doesn't conflict with local dev server
  webServer: [
    {
      command: `yarn start:msw --port 4009`,
      port: 4009,
    },
    {
      command: `yarn start --port 4010`,
      port: 4010,
    },
  ],
}

export default config
