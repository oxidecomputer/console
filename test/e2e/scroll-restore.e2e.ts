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
  // use desktop-width viewport with short height to make scrolling easier
  await page.setViewportSize({ width: 1280, height: 400 })

  // nav to disks and scroll it
  await page.goto('/projects/mock-project/disks')
  // wait for content to render so the page is tall enough to scroll
  await page.getByRole('heading', { name: 'Disks' }).waitFor()
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
  await sleep(500)
  await scrollTo(page, 190)
  await sleep(500)

  // new nav to snapshots via click, scroll it
  await page.getByRole('link', { name: 'Snapshots' }).click()
  await expect(page).toHaveURL('/projects/mock-project/snapshots')
  await expectScrollTop(page, 0)

  // back to disks, newer scroll value is restored
  await page.goBack()
  await expect(page).toHaveURL('/projects/mock-project/disks')
  await sleep(500)
  await expectScrollTop(page, 190)

  // forward to snapshots, scroll is 0 (fresh nav)
  await page.goForward()
  await expect(page).toHaveURL('/projects/mock-project/snapshots')
  await expectScrollTop(page, 0)
})
