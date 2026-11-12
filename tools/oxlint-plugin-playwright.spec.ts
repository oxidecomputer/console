/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { RuleTester } from 'oxlint/plugins-dev'
import { describe, it } from 'vitest'

import plugin from './oxlint-plugin-playwright'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester()

tester.run('expect-expect', plugin.rules['expect-expect'], {
  valid: [
    `test('direct expect', async ({ page }) => { await expect(page).toHaveURL('/') })`,
    `test('poll', async () => { await expect.poll(() => 1).toBe(1) })`,
    `test('helper', async ({ page }) => { await expectRowVisible(page) })`,
    `test('inside step', async ({ page }) => {
      await test.step('s', async () => { await expect(page).toHaveURL('/') })
    })`,
    // condition modifiers take callbacks without declaring tests
    `test.slow(({ browserName }) => browserName === 'webkit')`,
    `test.skip(({ browserName }) => browserName === 'webkit')`,
    `test('inline modifier', async ({ page }) => {
      test.skip(({ browserName }) => browserName === 'webkit')
      await expect(page).toHaveURL('/')
    })`,
    // afterEach covers tests in its scope and nested describes, even when declared last
    `test.describe('suite', () => {
      test('a', async ({ page }) => { await page.click('button') })
      test.describe('nested', () => {
        test('b', async ({ page }) => { await page.click('button') })
      })
      test.afterEach(async ({ page }) => { await expectToast(page, 'ok') })
    })`,
  ],
  invalid: [
    {
      code: `test('empty', async ({ page }) => { await page.goto('/') })`,
      errors: [{ messageId: 'noAssertions' }],
    },
    {
      code: `test.skip('skipped test body', { tag: '@slow' }, async ({ page }) => { await page.goto('/') })`,
      errors: [{ messageId: 'noAssertions' }],
    },
    {
      // beforeEach waits for setup; it doesn't assert what the test did
      code: `
        test.beforeEach(async ({ page }) => { await expect(page).toHaveURL('/') })
        test('forgot assertion', async ({ page }) => { await page.click('button') })
      `,
      errors: [{ messageId: 'noAssertions' }],
    },
    {
      // sibling describe's afterEach doesn't leak out
      code: `
        test.describe('covered', () => {
          test.afterEach(async ({ page }) => { await expect(page).toHaveURL('/') })
          test('ok', async ({ page }) => { await page.click('button') })
        })
        test('uncovered', async ({ page }) => { await page.click('button') })
      `,
      errors: [{ messageId: 'noAssertions' }],
    },
  ],
})

tester.run('no-focused-test', plugin.rules['no-focused-test'], {
  valid: [
    `test('ok', async () => {})`,
    `test.describe('ok', () => {})`,
    `other.only('not playwright', () => {})`,
  ],
  invalid: [
    { code: `test.only('x', async () => {})`, errors: [{ messageId: 'focused' }] },
    { code: `test.fail.only('x', async () => {})`, errors: [{ messageId: 'focused' }] },
    { code: `test.describe.only('x', () => {})`, errors: [{ messageId: 'focused' }] },
    {
      code: `test.describe.serial.only('x', () => {})`,
      errors: [{ messageId: 'focused' }],
    },
  ],
})

tester.run('no-page-route', plugin.rules['no-page-route'], {
  valid: [`await page.goto('/routes')`, `await page.unroute('**/*')`],
  invalid: [
    {
      code: `await page.route('**/v1/**', (r) => r.abort())`,
      errors: [{ messageId: 'pageRoute' }],
    },
    {
      code: `await page.context().route('**/v1/**', (r) => r.abort())`,
      errors: [{ messageId: 'pageRoute' }],
    },
  ],
})
