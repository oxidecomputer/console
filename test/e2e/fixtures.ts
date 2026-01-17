/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { mkdirSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { test as base, type Page } from '@playwright/test'

const coverageEnabled = !!process.env.COVERAGE
const coverageDir = resolve('.nyc_output')

// Counter for unique filenames within this worker process
let coverageCounter = 0

async function collectCoverage(page: Page): Promise<void> {
  if (!coverageEnabled) return

  const coverage = await page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any).__coverage__
  })

  if (!coverage) return

  mkdirSync(coverageDir, { recursive: true })

  // Write to unique file per test - nyc will merge all files in the directory
  const filename = `coverage-${process.pid}-${coverageCounter++}.json`
  writeFileSync(resolve(coverageDir, filename), JSON.stringify(coverage))
}

export const test = base.extend<{ coverageFixture: void }>({
  coverageFixture: [
    // eslint-disable-next-line react-hooks/rules-of-hooks -- `use` is Playwright fixture callback, not a React hook
    async ({ page }, use) => {
      await use()
      await collectCoverage(page)
    },
    { auto: true },
  ],
})

export { expect } from '@playwright/test'
