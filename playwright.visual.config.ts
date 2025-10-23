/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { devices, type PlaywrightTestConfig } from '@playwright/test'

// the regression test stuff is not run in CI and only needs one browser

export default {
  testDir: './test/visual',
  testMatch: /\.e2e\.ts/,
  fullyParallel: true,
  workers: '66%',
  use: {
    baseURL: 'http://localhost:4009',
  },
  projects: [
    {
      name: 'chrome',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // use different port so it doesn't conflict with local dev server
  webServer: {
    command: 'npm run start:msw -- --port 4009',
    port: 4009,
  },
} satisfies PlaywrightTestConfig
