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
  // use all available cores (2) on github actions. use fewer locally
  workers: process.env.PLAYWRIGHT_WORKER_COUNT
    ? parseInt(process.env.PLAYWRIGHT_WORKER_COUNT, 10)
    : process.env.CI
      ? '100%'
      : '66%',
  timeout: (process.env.CI ? 60 : 30) * 1000, // shorter timeout locally
  fullyParallel: true,
  // default is 5 seconds. somehow playwright really hates async route modules,
  // takes a long time to load them. https://playwright.dev/docs/test-timeouts
  expect: { timeout: 10_000 },
  // Local runs also emit a compact plain-text failure report to .e2e-logs/
  // (timestamped per run, last 10 kept) via test/e2e/compact-reporter.ts, so
  // an LLM agent can read the failures.
  reporter: process.env.CI ? 'list' : [['list'], ['./test/e2e/compact-reporter.ts']],
  use: {
    // Recording a trace for every test makes local runs much slower, so it's
    // off by default. Pass `--trace retain-on-failure` to keep traces of
    // failed tests, e.g. when chasing a flake.
    trace: process.env.CI ? 'on-first-retry' : 'off',
    baseURL: 'http://localhost:4009',
  },
  projects: [
    {
      name: 'chrome',
      use: {
        contextOptions: {
          reducedMotion: 'reduce',
          permissions: ['clipboard-read', 'clipboard-write'],
        },
        ...devices['Desktop Chrome'],
        channel: 'chromium',
      },
    },
    {
      name: 'firefox',
      use: {
        contextOptions: {
          reducedMotion: 'reduce',
        },
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'safari',
      use: {
        contextOptions: {
          reducedMotion: 'reduce',
        },
        ...devices['Desktop Safari'],
      },
    },
  ],
  // use different port so it doesn't conflict with local dev server
  webServer: {
    command: 'npm run start:msw -- --port 4009',
    port: 4009,
  },
} satisfies PlaywrightTestConfig
