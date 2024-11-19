/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, getPageAsUser, test } from './utils'

test.describe('Silo/system picker', () => {
  test('appears for fleet viewer', async ({ page }) => {
    await page.goto('/projects')
    const homeLink = page.getByRole('link', { name: 'SILO maze-war' })
    await expect(homeLink).toHaveAttribute('href', '/projects')
    const picker = page.getByRole('button', { name: 'Switch between system and silo' })
    await expect(picker).toHaveText('Silo')

    await picker.click()
    const siloItem = page.getByRole('menuitem', { name: 'Silo' })
    await expect(siloItem).toBeVisible()
    const systemItem = page.getByRole('menuitem', { name: 'System' })
    await expect(systemItem).toBeVisible()
    await systemItem.click()

    // on system pages, the picker says system and the home button goes to system root
    await expect(page).toHaveURL('/system/silos')
    const homeLink2 = page.getByRole('link', { name: 'OXIDE System' })
    await expect(homeLink2).toHaveAttribute('href', '/system/silos')
    await expect(picker).toHaveText('System')

    // go back to projects
    await picker.click()
    await siloItem.click()
    await expect(page).toHaveURL('/projects')
  })

  test('does not appear to for dev user', async ({ browser }) => {
    const page = await getPageAsUser(browser, 'Hans Jonas')
    await page.goto('/projects')
    await expect(page.getByRole('link', { name: 'SILO maze-war' })).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Switch between system and silo' })
    ).toBeHidden()
  })
})

test('dev user gets 404 on system pages', async ({ browser }) => {
  const page = await getPageAsUser(browser, 'Hans Jonas')
  await page.goto('/system/silos')
  await expect(page.getByText('Page not found')).toBeVisible()

  await page.goto('/system/utilization')
  await expect(page.getByText('Page not found')).toBeVisible()

  await page.goto('/system/inventory/sleds')
  await expect(page.getByText('Page not found')).toBeVisible()
})
