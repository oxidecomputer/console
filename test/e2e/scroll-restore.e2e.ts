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
  await expect(page.getByRole('heading', { name: 'Disks' })).toBeVisible()
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

  // new nav to snapshots via click, scroll it
  await page.getByRole('link', { name: 'Snapshots' }).click()
  await expect(page).toHaveURL('/projects/mock-project/snapshots')
  await expectScrollTop(page, 0)

  // back to disks, newer scroll value is restored
  await page.goBack()
  await expect(page).toHaveURL('/projects/mock-project/disks')
  await sleep(1000)
  await expectScrollTop(page, 190)

  // forward to snapshots, scroll is 0 (fresh nav)
  await page.goForward()
  await expect(page).toHaveURL('/projects/mock-project/snapshots')
  await expectScrollTop(page, 0)
})

// https://github.com/oxidecomputer/console/issues/3321
test('opening and closing side modal preserves scroll', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 500 })

  await page.goto('/projects/mock-project/disks')
  await expect(page.getByRole('heading', { name: 'Disks' })).toBeVisible()

  // visit snapshots and come back so its data is cached: the later nav to it
  // can then complete without rendering a loading state, which would otherwise
  // save the scroll position and mask a failure to record it at modal close
  await page.getByRole('link', { name: 'Snapshots' }).click()
  await expect(page.getByRole('heading', { name: 'Snapshots' })).toBeVisible()
  await page.getByRole('link', { name: 'Disks' }).click()
  await expect(page.getByRole('heading', { name: 'Disks' })).toBeVisible()

  // click the last disk in the table. clicking auto-scrolls it into view, so
  // read the resulting scroll position as the baseline rather than setting one
  const lastDisk = page
    .locator('table')
    .getByRole('link', { name: /^disk-/ })
    .last()
  await lastDisk.scrollIntoViewIfNeeded()
  const baseline = await page.evaluate(() => window.scrollY)
  expect(baseline).toBeGreaterThan(0)

  // opening the detail side modal doesn't scroll the page underneath
  await lastDisk.click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expectScrollTop(page, baseline)

  // closing it doesn't either
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
  await expectScrollTop(page, baseline)

  // nav away and back: the scroll recorded at modal close is restored
  await page.getByRole('link', { name: 'Snapshots' }).click()
  await expectScrollTop(page, 0)
  await page.goBack()
  await expect(page).toHaveURL('/projects/mock-project/disks')
  await expectScrollTop(page, baseline)
})

// this modal route is trickier than the others: it hangs off a pathless crumb
// wrapper route rather than being a direct child of the page route
test('opening firewall rule modal preserves scroll', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 300 })

  await page.goto('/projects/mock-project/vpcs/default/firewall-rules')
  await expect(page.getByRole('tab', { name: 'Firewall Rules' })).toBeVisible()
  await scrollTo(page, 100)
  await expectScrollTop(page, 100)

  // clicking auto-scrolls the link into view, so read the resulting scroll
  // position as the baseline rather than assuming it stays at 100
  const newRuleLink = page.getByRole('link', { name: 'New rule' })
  await newRuleLink.scrollIntoViewIfNeeded()
  const baseline = await page.evaluate(() => window.scrollY)
  expect(baseline).toBeGreaterThan(0)

  await newRuleLink.click()
  await expect(page.getByRole('dialog', { name: 'Add firewall rule' })).toBeVisible()
  await expectScrollTop(page, baseline)

  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
  await expectScrollTop(page, baseline)
})

test('navigating from a side modal to a new page resets scroll', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 300 })

  await page.goto('/projects/mock-project/vpcs')
  await expect(page.getByRole('heading', { name: 'VPCs' })).toBeVisible()
  await scrollTo(page, 100)
  await expectScrollTop(page, 100)

  await page.getByRole('link', { name: 'New VPC' }).click()
  await expect(page.getByRole('dialog', { name: 'Create VPC' })).toBeVisible()
  await expectScrollTop(page, 100)

  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('scroll-test-vpc')
  await page.getByRole('textbox', { name: 'DNS name' }).fill('scroll-test-vpc')
  await page.getByRole('button', { name: 'Create VPC' }).click()

  await expect(page.getByRole('heading', { name: 'scroll-test-vpc' })).toBeVisible()
  await expectScrollTop(page, 0)

  // going back reopens the modal with the underlying page's scroll restored
  await page.goBack()
  await expect(page.getByRole('dialog', { name: 'Create VPC' })).toBeVisible()
  await expectScrollTop(page, 100)
})
