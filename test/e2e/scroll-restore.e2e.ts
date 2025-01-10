/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from '@playwright/test'

import { expectScrollTop, scrollTo, sleep } from './utils'

test('scroll restore', async ({ page }) => {
  // open small window to make scrolling easier
  await page.setViewportSize({ width: 800, height: 500 })

  // nav to disks and scroll it
  await page.goto('/projects/mock-project/disks')
  await expectScrollTop(page, 0)
  await scrollTo(page, 143)

  // nav to snapshots
  await page.getByRole('link', { name: 'Snapshots' }).click()
  await expectScrollTop(page, 0)

  // go back to disks, scroll is restored, scroll it some more
  await page.goBack()
  await expect(page).toHaveURL('/projects/mock-project/disks')
  await expectScrollTop(page, 143)

  // sleep required to get the scroll position to stick
  await sleep(1000)
  await scrollTo(page, 190)
  await sleep(1000)

  // go forward to snapshots, now scroll it
  await page.goForward()
  await expect(page).toHaveURL('/projects/mock-project/snapshots')
  await expectScrollTop(page, 0)
  await scrollTo(page, 30)

  // Oddly, this is required here in order for the page to have time to
  // catch the 30 scroll position. This became necessary with RR v7's use of
  // startTransition. Extra oddly, with a value of 500 it passes rarely, but
  // with 1000 it passes every time.
  await sleep(1000)

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
  await sleep(1000)
  await expectScrollTop(page, 190)

  // forward again to newest disks history entry, scroll remains 0
  await page.goForward()
  await page.goForward()
  await expect(page).toHaveURL('/projects/mock-project/disks')
  await expectScrollTop(page, 0)
})
