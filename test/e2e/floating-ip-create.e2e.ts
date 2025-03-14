/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { clickRowAction, expect, expectRowVisible, expectVisible, test } from './utils'

const floatingIpsPage = '/projects/mock-project/floating-ips'

test('can create a floating IP', async ({ page }) => {
  await page.goto(floatingIpsPage)
  await page.locator('text="New Floating IP"').click()

  await expectVisible(page, [
    'role=heading[name*="Create floating IP"]',
    'role=textbox[name="Name"]',
    'role=textbox[name="Description"]',
    'role=button[name="Advanced"]',
    'role=button[name="Create floating IP"]',
  ])

  const floatingIpName = 'my-floating-ip'
  await page.fill('input[name=name]', floatingIpName)
  await page
    .getByRole('textbox', { name: 'Description' })
    .fill('A description for this Floating IP')

  const label = page.getByLabel('IP pool')

  // accordion content should be hidden
  await expect(label).toBeHidden()

  // open accordion
  await page.getByRole('button', { name: 'Advanced' }).click()

  // accordion content should be visible
  await expect(label).toBeVisible()

  // choose pool and submit
  await label.click()
  await page.getByRole('option', { name: 'ip-pool-1' }).click()
  await page.getByRole('button', { name: 'Create floating IP' }).click()

  await expect(page).toHaveURL(floatingIpsPage)

  await expectRowVisible(page.getByRole('table'), {
    name: floatingIpName,
    description: 'A description for this Floating IP',
    'IP pool': 'ip-pool-1',
  })
})

test('can detach and attach a floating IP', async ({ page }) => {
  // check floating IP is visible on instance detail
  await page.goto('/projects/mock-project/instances/db1')
  await expect(page.getByText('123.4.56.5')).toBeVisible()

  // now go detach it
  await page.goto(floatingIpsPage)

  await expectRowVisible(page.getByRole('table'), {
    name: 'cola-float',
    'IP address': '123.4.56.5',
    'Attached to instance': 'db1',
  })
  await clickRowAction(page, 'cola-float', 'Detach')
  await page.getByRole('button', { name: 'Confirm' }).click()

  await expect(page.getByRole('dialog')).toBeHidden()
  // Since we detached it, we don't expect to see db1 any longer
  await expect(page.getByRole('cell', { name: 'db1' })).toBeHidden()

  // click back over to instance page (can't use goto because it refreshes) and
  // confirm the IP is no longer there either
  await page.getByRole('link', { name: 'Instances' }).click()
  await page.getByRole('link', { name: 'db1' }).click()
  await expect(page.getByRole('heading', { name: 'db1' })).toBeVisible()
  await expect(page.getByText('123.4.56.5')).toBeHidden()

  // Now click back to floating IPs and reattach it to db1
  await page.getByRole('link', { name: 'Floating IPs' }).click()
  await clickRowAction(page, 'cola-float', 'Attach')
  await page.getByLabel('Instance').click()
  await page.getByRole('option', { name: 'db1' }).click()

  await page.getByRole('button', { name: 'Attach' }).click()

  // The dialog should be gone
  await expect(page.getByRole('dialog')).toBeHidden()
  await expectRowVisible(page.getByRole('table'), {
    name: 'cola-float',
    'IP address': '123.4.56.5',
    'Attached to instance': 'db1',
  })
})
