/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'
import type { BrowserCommand } from 'vitest/node'

const pressComboboxKey: BrowserCommand<[label: string, key: string]> = async (
  context,
  label,
  key
) => {
  if (context.provider.name !== 'playwright') {
    throw new Error(
      `pressComboboxKey requires Playwright, received ${context.provider.name}`
    )
  }
  await context.iframe.getByRole('combobox', { name: label }).press(key)
}

export default defineConfig({
  optimizeDeps: {
    entries: ['app/**/*.browser.spec.{ts,tsx}'],
    include: ['react-router'],
  },
  plugins: [tailwindcss(), react()],
  resolve: { tsconfigPaths: true },
  test: {
    attachmentsDir: 'test-results/vitest/attachments',
    include: ['app/**/*.browser.spec.{ts,tsx}'],
    name: 'browser',
    setupFiles: ['test/browser/setup.ts'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      commands: { pressComboboxKey },
      screenshotDirectory: 'test-results/vitest/screenshots',
      instances: [{ browser: 'chromium' }, { browser: 'firefox' }, { browser: 'webkit' }],
    },
  },
})
