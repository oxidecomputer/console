/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import {
  clearTextbox,
  clickButton,
  clickLink,
  clickListboxItem,
  clickRowAction,
  expect,
  expectNotVisible,
  expectRowVisible,
  expectVisible,
  fillTextbox,
  test,
} from './utils'

const floatingIpsPage = '/projects/mock-project/floating-ips'

test('can create a Floating IP', async ({ page }) => {
  await page.goto(floatingIpsPage)
  await clickLink(page, 'New Floating IP')

  await expectVisible(page, [
    'role=heading[name*="Create Floating IP"]',
    'role=textbox[name="Name"]',
    'role=textbox[name="Description"]',
    'role=button[name="Advanced"]',
    'role=button[name="Create Floating IP"]',
  ])

  const floatingIpName = 'my-floating-ip'
  await page.fill('input[name=name]', floatingIpName)
  await fillTextbox(page, 'Description', 'A description for this Floating IP')

  // accordion content should be hidden
  await expectNotVisible(page, ['role=textbox[name="Address"]'])

  // open accordion
  await clickButton(page, 'Advanced')

  // accordion content should be visible
  await expectVisible(page, [
    page.getByRole('button', { name: 'IP pool' }),
    page.getByRole('textbox', { name: 'Address' }),
  ])

  // test that the IP validation works
  await clickListboxItem(page, 'IP pool', 'ip-pool-1')
  await fillTextbox(page, 'Address', '256.256.256.256')
  await clickButton(page, 'Create Floating IP')
  await expect(page.getByText('Not a valid IP address').first()).toBeVisible()

  // correct IP and submit
  await clearTextbox(page, 'Address')
  await fillTextbox(page, 'Address', '12.34.56.78')

  await clickButton(page, 'Create Floating IP')

  await expect(page).toHaveURL(floatingIpsPage)

  await expectRowVisible(page.getByRole('table'), {
    name: floatingIpName,
    description: 'A description for this Floating IP',
  })
})

test('can detach and attach a Floating IP', async ({ page }) => {
  await page.goto(floatingIpsPage)

  await expectRowVisible(page.getByRole('table'), {
    'Attached to instance': 'db1',
  })
  await clickRowAction(page, 'cola-float', 'Detach')
  await clickButton(page, 'Confirm')

  await expectNotVisible(page, ['role=heading[name*="Detach Floating IP"]'])
  // Since we detached it, we don't expect to see db1 any longer
  await expectNotVisible(page, ['text=db1'])

  // Reattach it to db1
  await clickRowAction(page, 'cola-float', 'Attach')
  await clickListboxItem(page, 'Select instance', 'db1')
  await clickButton(page, 'Attach')

  // The dialog should be gone
  await expectNotVisible(page, ['role=heading[name*="Attach Floating IP"]'])
  await expectRowVisible(page.getByRole('table'), {
    'Attached to instance': 'db1',
  })
})
