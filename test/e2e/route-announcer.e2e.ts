/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test, type Page } from '@playwright/test'

declare global {
  interface Window {
    announcements: string[]
  }
}

// react-aria appends each announcement as a child of a hidden polite live
// region shared with toasts, and removes it 7 seconds later. A slow CI runner
// can take longer than that to get to an assertion, so record announcements as
// they're added. Match on the polite region because there's a second one for
// assertive announcements and we only want the messages from this one.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.announcements = []
    new MutationObserver((records) => {
      for (const { target, addedNodes } of records) {
        if (
          target instanceof Element &&
          target.matches('[data-live-announcer] [aria-live="polite"]')
        ) {
          for (const node of addedNodes) window.announcements.push(node.textContent ?? '')
        }
      }
    }).observe(document, { childList: true, subtree: true })
  })
})

const expectAnnouncements = (page: Page) =>
  expect.poll(() => page.evaluate(() => window.announcements))

test('route announcer', async ({ page }) => {
  await page.goto('/projects')
  await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible()

  // nothing on first load — the browser already announced the page
  await expectAnnouncements(page).toEqual([])

  // nav by a link inside the content, which unmounts along with the page
  await page.getByRole('link', { name: 'mock-project' }).click()
  await expectAnnouncements(page).toEqual(['Instances, mock-project, Projects'])
  // focus goes to the new page's heading, like (better than) a real page load
  await expect(page.getByRole('heading', { name: 'Instances' })).toBeFocused()

  // nav by a sidebar link: the link survives the nav, but focus still moves to
  // the top of the new page
  const disksLink = page
    .getByRole('navigation', { name: 'Sidebar navigation' })
    .getByRole('link', { name: 'Disks' })
  await disksLink.click()
  await expectAnnouncements(page).toEqual([
    'Instances, mock-project, Projects',
    'Disks, mock-project, Projects',
  ])
  await expect(page.getByRole('heading', { name: 'Disks' })).toBeFocused()

  // a side modal form is its own route, but it opens on top of the page rather
  // than replacing it, so it doesn't announce or take focus from the dialog
  await page.getByRole('link', { name: 'New Disk' }).click()
  await expect(page.getByRole('dialog', { name: 'Create disk' })).toBeVisible()
  await expectAnnouncements(page).toHaveLength(2)

  // ...and neither does dismissing it
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(page.getByRole('dialog', { name: 'Create disk' })).toBeHidden()
  await expectAnnouncements(page).toHaveLength(2)
})

// tabs that live in the query param rather than the path aren't navigations as
// far as the router is concerned, so there's nothing to announce
test('route announcer ignores query param tabs', async ({ page }) => {
  await page.goto('/system/utilization')
  await page.getByRole('tab', { name: 'Metrics' }).click()
  await expect(page).toHaveURL(/tab=metrics/)
  await expectAnnouncements(page).toEqual([])
})

// VPC tabs, on the other hand, are real routes. Routes like these share a crumb
// path with their siblings, which is why the announcer keys off the pathname.
test('route announcer on tab routes', async ({ page }) => {
  await page.goto('/projects/mock-project/vpcs/default/firewall-rules')
  const tab = page.getByRole('tab', { name: 'Routers' })
  await tab.click()
  await expectAnnouncements(page).toEqual([
    'Routers, default, VPCs, mock-project, Projects',
  ])
  // the tab is still there, so it keeps focus
  await expect(tab).toBeFocused()
})

// the image detail side modal isn't a form, but it's still a dialog on top of
// the list rather than a new page
test('route announcer ignores detail side modals', async ({ page }) => {
  await page.goto('/images')
  await page.getByRole('link', { name: 'ubuntu-22-04' }).click()
  await expect(page.getByRole('dialog', { name: 'Image details' })).toBeVisible()
  await expectAnnouncements(page).toEqual([])
})
