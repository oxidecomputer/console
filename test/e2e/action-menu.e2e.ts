/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test, type Page } from '@playwright/test'

import { expectNotVisible } from './utils'

const openActionMenu = async (page: Page) => {
  // open the action menu (use the sidenav button, as keyboard events aren't reliable in Playwright)
  await page.getByRole('button', { name: 'JUMP TO' }).click()
  // make sure the action menu modal is visible
  await expect(page.getByText('Enterto submit')).toBeVisible()
}

const getSelectedItem = (page: Page) => page.getByRole('option', { selected: true })

test('Enter key does not prematurely submit a linked form', async ({ page }) => {
  await page.goto('/system/silos')
  await openActionMenu(page)
  // wait for page-level quick actions to register before pressing Enter
  await expect(page.getByRole('option', { name: 'New silo' })).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog', { name: 'Create silo' })).toBeVisible()
  // make sure error text is not visible
  await expectNotVisible(page, [page.getByText('Name is required')])
})

test('Ctrl+N/P navigate up and down', async ({ page }) => {
  await page.goto('/projects/mock-project/instances')
  await openActionMenu(page)

  // wait for instance list to load so the items don't shift mid-test
  await expect(page.getByRole('option', { name: 'db1' })).toBeVisible()

  const selected = getSelectedItem(page)
  // first item is selected by default
  await expect(selected).toHaveText('New instance')

  // Ctrl+N moves down
  await page.keyboard.press('Control+n')
  await expect(selected).toHaveText('db1')

  // Ctrl+P moves back up
  await page.keyboard.press('Control+p')
  await expect(selected).toHaveText('New instance')

  // Ctrl+N again gets the same second item
  await page.keyboard.press('Control+n')
  await expect(selected).toHaveText('db1')
})

test('Arrow keys navigate up and down', async ({ page }) => {
  await page.goto('/projects/mock-project/instances')
  await openActionMenu(page)

  await expect(page.getByRole('option', { name: 'db1' })).toBeVisible()

  const selected = getSelectedItem(page)
  await expect(selected).toHaveText('New instance')

  await page.keyboard.press('ArrowDown')
  await expect(selected).toHaveText('db1')

  await page.keyboard.press('ArrowUp')
  await expect(selected).toHaveText('New instance')
})

test('search filters items', async ({ page }) => {
  await page.goto('/projects/mock-project/instances')
  await openActionMenu(page)

  // wait for instance list items to load before searching
  await expect(page.getByRole('option', { name: 'db1' })).toBeVisible()

  // type a search query that matches a specific instance
  await page.keyboard.type('db1')
  // the matching item should be visible
  await expect(page.getByRole('option', { name: 'db1' })).toBeVisible()
  // an unrelated item should be filtered out
  await expect(page.getByRole('option', { name: 'New instance' })).toBeHidden()
})

test('"Go up" actions derived from breadcrumbs', async ({ page }) => {
  await page.goto('/projects/mock-project/disks')
  await openActionMenu(page)

  // breadcrumb ancestors should appear in a "Go up" group
  await expect(page.getByText('Go up')).toBeVisible()
  await expect(page.getByRole('option', { name: 'Projects' })).toBeVisible()
  await expect(page.getByRole('option', { name: 'mock-project' })).toBeVisible()

  // selecting "Projects" navigates to the projects page
  await page.keyboard.type('Projects')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL('/projects')
})

test('Enter navigates to selected item', async ({ page }) => {
  await page.goto('/projects/mock-project/instances')
  await openActionMenu(page)

  // search for a specific instance and hit Enter
  await page.keyboard.type('db1')
  await expect(getSelectedItem(page)).toHaveText('db1')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL('/projects/mock-project/instances/db1/storage')
})

test('items from page and layout sources coexist', async ({ page }) => {
  await page.goto('/projects/mock-project/instances')
  await openActionMenu(page)

  // page-level actions (from InstancesPage)
  await expect(page.getByRole('option', { name: 'New instance' })).toBeVisible()
  // page-level "Go to" group (from InstancesPage)
  await expect(page.getByText('Go to instance')).toBeVisible()
  await expect(page.getByRole('option', { name: 'db1' })).toBeVisible()
  // layout-level group (from ProjectLayoutBase)
  await expect(page.getByText("Project 'mock-project'")).toBeVisible()
  await expect(page.getByRole('option', { name: 'Disks' })).toBeVisible()
})

test('dismiss with Escape', async ({ page }) => {
  await page.goto('/projects/mock-project/instances')
  await openActionMenu(page)

  await page.keyboard.press('Escape')
  await expect(page.getByText('Enterto submit')).toBeHidden()
})
