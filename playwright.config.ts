import type { PlaywrightTestConfig } from '@playwright/test'
import { devices } from '@playwright/test'

import { capitalize } from '@oxide/util'

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
  timeout: 60000,
  use: {
    trace: 'retain-on-failure',
    baseURL: 'http://localhost:4009',
  },

  projects: (process.env.BROWSER
    ? [process.env.BROWSER]
    : ['chrome', 'firefox', 'safari']
  ).flatMap((browser) => {
    const device = devices[`Desktop ${capitalize(browser)}`]
    return [
      /**
       * Configuration for smoke tests, these tests don't rely on underlying mock data to work.
       * Should be compatible with a live rack
       */
      {
        name: `smoke-${browser}`,
        testMatch: [/test\/.*\.e2e\.ts/],
        use: device,
      },
      {
        name: `validate-${browser}`,
        testMatch: [/pages\/.*\.e2e\.ts/],
        // special user agent lets us run one server that can handle both
        // MSW and non-MSW requests
        use: { ...device, userAgent: device.userAgent + ' MSW' },
      },
    ]
  }),

  // use different port so it doesn't conflict with local dev server
  webServer: {
    command: `npm run build -- --mode development && npm run start preview -- --port 4009`,
    port: 4009,
  },
}

export default config
