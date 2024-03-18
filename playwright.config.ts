/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { devices, type PlaywrightTestConfig } from '@playwright/test'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default {
  testDir: './test/e2e',
  testMatch: /\.e2e\.ts/,
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  // use all available cores (2) on github actions. default is 50%, use that locally
  workers: process.env.CI ? '100%' : undefined,
  timeout: 2 * 60 * 1000, // 2 minutes, surely overkill
  fullyParallel: true,
  use: {
    trace: 'retain-on-failure',
    baseURL: 'http://localhost:4009',
  },
  projects: [
    {
      name: 'chrome',
      use: {
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write'],
        },
        ...devices['Desktop Chrome'],
      },
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
  // use different port so it doesn't conflict with local dev server
  webServer: {
    command: 'npm run start:msw -- --port 4009',
    port: 4009,
  },
} satisfies PlaywrightTestConfig
