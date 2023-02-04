/** E2E tests that use MSW in-browser */
import type { PlaywrightTestConfig } from '@playwright/test'

import { common } from './playwright.common.config'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  ...common,
  fullyParallel: true,
  testMatch: /pages\/.*\.e2e\.ts/,
  // use different port so it doesn't conflict with local dev server
  webServer: {
    command: 'npm run start:msw -- --port 4009',
    port: 4009,
  },
}

export default config
