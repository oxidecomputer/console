/** E2E tests designed to run against an external API */
import type { PlaywrightTestConfig } from '@playwright/test'

import { common } from './playwright.common.config'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  ...common,
  testMatch: /test\/.*\.e2e\.ts/,
  globalSetup: 'app/test/e2e/global-setup.ts', // run the API server separately
  // use different port so it doesn't conflict with local dev server
  webServer: {
    command: `npm run build && npm start preview -- --port 4009`,
    port: 4009,
  },
}

export default config
