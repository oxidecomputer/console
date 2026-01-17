/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { test as base, type Page } from '@playwright/test'

const coverageEnabled = !!process.env.COVERAGE
const coverageDir = resolve('.nyc_output')

// Read existing coverage or start fresh
function readExistingCoverage(): Record<string, unknown> {
  const coverageFile = resolve(coverageDir, 'coverage.json')
  if (existsSync(coverageFile)) {
    try {
      return JSON.parse(require('fs').readFileSync(coverageFile, 'utf-8'))
    } catch {
      return {}
    }
  }
  return {}
}

async function collectCoverage(page: Page): Promise<void> {
  if (!coverageEnabled) return

  const coverage = await page.evaluate(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any).__coverage__
  })

  if (!coverage) return

  mkdirSync(coverageDir, { recursive: true })

  // Merge with existing coverage from previous tests
  const existing = readExistingCoverage()
  const merged = { ...existing, ...coverage }

  writeFileSync(resolve(coverageDir, 'coverage.json'), JSON.stringify(merged))
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
