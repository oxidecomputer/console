/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { PlaywrightTestConfig } from '@playwright/test'

import baseConfig from './playwright.config'

/**
 * Run test/preview against the production build served under the Nexus CSP.
 * The main e2e suite runs against the dev server, which allows inline scripts
 * by nonce, so it can't catch scripts the build leaves inline.
 */
export default {
  ...baseConfig,
  testDir: './test/preview',
  use: { ...baseConfig.use, baseURL: 'http://localhost:4010' },
  webServer: {
    command: 'npm run preview -- --port 4010 --strictPort',
    port: 4010,
    // includes a production build
    timeout: 180_000,
  },
} satisfies PlaywrightTestConfig
