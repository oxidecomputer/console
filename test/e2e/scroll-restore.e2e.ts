/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, expectVisible, test, type Page } from './utils'

async function expectScrollTop(page: Page, expected: number) {
  await page.waitForFunction((expected) => window.scrollY === expected, expected)
}

async function scrollTo(page: Page, to: number) {
  await page.evaluate((y) => {
    window.scrollTo(0, y)
  }, to)
}

test('scroll restore', async ({ page }) => {
  // open short window to make scrolling easier
  // needs to be wide enough to not require the nav to be opened
  await page.setViewportSize({ width: 1024, height: 500 })

  // nav to disks and scroll it
  await page.goto('/projects/mock-project/disks')
  // this helps us wait till the page is ready to scroll
  await expectVisible(page, ['role=heading[name*="Disks"]'])
  await expectScrollTop(page, 0)
  await scrollTo(page, 143)

  // nav to snapshots
  await page.getByRole('link', { name: 'Snapshots' }).click()
  await expectVisible(page, ['role=heading[name*="Snapshots"]'])
  await expect(page).toHaveURL('/projects/mock-project/snapshots')
  await expectScrollTop(page, 0)

  // go back to disks, scroll is restored, scroll it some more
  await page.goBack()
  await expect(page).toHaveURL('/projects/mock-project/disks')
  await expectScrollTop(page, 143)
  await scrollTo(page, 190)

  // go forward to snapshots, now scroll it
  await page.goForward()
  await expect(page).toHaveURL('/projects/mock-project/snapshots')
  await expectScrollTop(page, 0)
  await scrollTo(page, 30)

  // new nav to disks
  await page.getByRole('link', { name: 'Disks' }).click()
  await expectScrollTop(page, 0)

  // this is too flaky so forget it for now

  // random reload in there because we use sessionStorage. note we are
  // deliberately on the disks page here because there's a quirk in playwright
  // that seems to reset to the disks page on reload
  // await page.reload()

  // back to snapshots, scroll is restored
  await page.goBack()
  await expect(page).toHaveURL('/projects/mock-project/snapshots')
  await expectScrollTop(page, 30)

  // back again to disks, newer scroll value is restored
  await page.goBack()
  await expect(page).toHaveURL('/projects/mock-project/disks')
  await expectScrollTop(page, 190)

  // forward again to newest disks history entry, scroll remains 0
  await page.goForward()
  await page.goForward()
  await expect(page).toHaveURL('/projects/mock-project/disks')
  await expectScrollTop(page, 0)
})
