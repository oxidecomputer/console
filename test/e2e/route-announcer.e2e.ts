/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test, type Page } from '@playwright/test'

// react-aria appends each announcement as a child of a hidden polite live
// region shared with toasts. CSS locator because there's a second region for
// assertive announcements and we only want the messages from this one.
const announcements = (page: Page) =>
  page.locator('[data-live-announcer] [aria-live="polite"] > div')

test('route announcer', async ({ page }) => {
  await page.goto('/projects')
  await page.getByRole('heading', { name: 'Projects' }).waitFor()

  // nothing on first load — the browser already announced the page
  await expect(announcements(page)).toHaveCount(0)

  // nav by a link inside the content, which unmounts along with the page
  await page.getByRole('link', { name: 'mock-project' }).click()
  await expect(announcements(page)).toHaveText(['Instances, mock-project, Projects'])
  // focus would have been dropped on the body, so it goes to the top of the
  // new page instead
  await expect(page.locator('#content')).toBeFocused()

  // nav by a sidebar link, which is still there afterward, so it keeps focus
  const disksLink = page
    .getByRole('navigation', { name: 'Sidebar navigation' })
    .getByRole('link', { name: 'Disks' })
  await disksLink.click()
  await expect(announcements(page)).toHaveText([
    'Instances, mock-project, Projects',
    'Disks, mock-project, Projects',
  ])
  await expect(disksLink).toBeFocused()

  // a side modal form is its own route, but it opens on top of the page rather
  // than replacing it, so it doesn't announce or take focus from the dialog
  await page.getByRole('link', { name: 'New Disk' }).click()
  await expect(page.getByRole('dialog', { name: 'Create disk' })).toBeVisible()
  await expect(announcements(page)).toHaveCount(2)

  // ...and neither does dismissing it
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(page.getByRole('dialog', { name: 'Create disk' })).toBeHidden()
  await expect(announcements(page)).toHaveCount(2)
})

// tabs that live in the query param rather than the path aren't navigations as
// far as the router is concerned, so there's nothing to announce
test('route announcer ignores query param tabs', async ({ page }) => {
  await page.goto('/system/utilization')
  await page.getByRole('tab', { name: 'Metrics' }).click()
  await expect(page).toHaveURL(/tab=metrics/)
  await expect(announcements(page)).toHaveCount(0)
})

// VPC tabs, on the other hand, are real routes. Routes like these share a crumb
// path with their siblings, which is why the announcer keys off the pathname.
test('route announcer on tab routes', async ({ page }) => {
  await page.goto('/projects/mock-project/vpcs/default/firewall-rules')
  const tab = page.getByRole('tab', { name: 'Routers' })
  await tab.click()
  await expect(announcements(page)).toHaveText([
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
  await expect(announcements(page)).toHaveCount(0)
})
