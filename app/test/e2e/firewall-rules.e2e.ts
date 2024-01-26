/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { test } from '@playwright/test'

import { expect, expectNotVisible, expectVisible } from './utils'

const defaultRules = ['allow-internal-inbound', 'allow-ssh', 'allow-icmp', 'allow-rdp']

test('can create firewall rule', async ({ page }) => {
  await page.goto('/projects/mock-project/vpcs/default')
  await page.locator('text="Firewall Rules"').click()

  // default rules are all there
  for (const name of defaultRules) {
    await expect(page.locator(`text="${name}"`)).toBeVisible()
  }
  const rows = page.locator('tbody >> tr')
  await expect(rows).toHaveCount(4)

  const modal = 'role=dialog[name="Add firewall rule"]'
  await expectNotVisible(page, [modal])

  // open modal
  await page.locator('text="New rule"').click()

  // modal is now open
  await expectVisible(page, [modal])

  await page.fill('input[name=name]', 'my-new-rule')
  await page.locator('text=Outgoing').click()

  await page.fill('role=spinbutton[name="Priority"]', '5')

  // add target VPC "my-target-vpc"
  await page.locator('role=button[name*="Target type"]').click()
  await page.locator('role=option[name="IP"]').click()
  await page.fill('role=textbox[name="IP address"]', '192.168.0.1')
  await page.locator('text="Add target"').click()

  // target is added to targets table
  await expect(page.locator('td:has-text("192.168.0.1")')).toBeVisible()

  // add host filter instance "host-filter-instance"
  await page.locator('role=button[name*="Host type"]').click()
  await page.locator('role=option[name="Instance"]').click()
  await page.fill('role=textbox[name="Instance name"]', 'host-filter-instance')
  await page.locator('text="Add host filter"').click()

  // host is added to hosts table
  await expect(page.locator('td:has-text("host-filter-instance")')).toBeVisible()

  // TODO: test invalid port range once I put an error message in there
  await page.fill('role=textbox[name="Port filter"]', '123-456')
  await page.locator('text="Add port filter"').click()

  // port range is added to port ranges table
  await expect(page.locator('td:has-text("123-456")')).toBeVisible()

  // check the UDP box
  await page.locator('text=UDP').click()

  // submit the form
  await page.locator('text="Add rule"').click()

  // modal closes again
  await expectNotVisible(page, [modal])

  // table refetches and now includes the new rule as well as the originals
  await expect(page.locator('td >> text="my-new-rule"')).toBeVisible()
  // target shows up in target cell
  await expect(page.locator('text=ip192.168.0.1')).toBeVisible()
  // other stuff filled out shows up in the filters column
  await expect(page.locator('text=instancehost-filter-instanceUDP123-456')).toBeVisible()

  await expect(rows).toHaveCount(5)
  for (const name of defaultRules) {
    await expect(page.locator(`text="${name}"`)).toBeVisible()
  }
})

test('can update firewall rule', async ({ page }) => {
  await page.goto('/projects/mock-project/vpcs/default')
  await page.locator('text="Firewall Rules"').click()

  const rows = page.locator('tbody >> tr')
  await expect(rows).toHaveCount(4)

  // allow-icmp is the one we're doing to change
  const oldNameCell = page.locator('td >> text="allow-icmp"')
  await expect(oldNameCell).toBeVisible()

  const newNameCell = page.locator('td >> text="new-rule-name"')
  await expect(newNameCell).toBeHidden()

  const modal = page.locator('text="Edit rule"')
  await expect(modal).toBeHidden()

  // click more button on allow-icmp row to get menu, then click Edit
  await page
    .locator('role=row', { hasText: 'allow-icmp' })
    .locator('role=button[name="Row actions"]')
    .click()

  // filter visible to distinguish from all the hidden menus' Edit button
  await page.locator('text="Edit" >> visible=true').click()

  // modal is now open
  await expect(modal).toBeVisible()

  // TODO: get these by their label when that becomes easier to do

  // name is populated
  await expect(page.locator('input[name=name]')).toHaveValue('allow-icmp')

  // priority is populated
  await expect(page.locator('input[name=priority]')).toHaveValue('65534')

  // protocol is populated
  await expect(page.locator('label >> text=ICMP')).toBeChecked()
  await expect(page.locator('label >> text=TCP')).not.toBeChecked()
  await expect(page.locator('label >> text=UDP')).not.toBeChecked()

  // targets default vpc
  // screen.getByRole('cell', { name: 'vpc' })
  // screen.getByRole('cell', { name: 'default' })

  // update name
  await page.fill('input[name=name]', 'new-rule-name')

  // add host filter
  await page.locator('role=button[name*="Host type"]').click()
  await page.locator('role=option[name="VPC Subnet"]').click()
  await page.fill('role=textbox[name="Subnet name"]', 'edit-filter-subnet')
  await page.locator('text="Add host filter"').click()

  // new host is added to hosts table
  await expect(page.locator('td:has-text("edit-filter-subnet")')).toBeVisible()

  // submit the form
  await page.locator('text="Update rule"').click()

  // modal closes again
  await expect(modal).toBeHidden()

  // table refetches and now includes the updated rule name, not the old name
  await expect(newNameCell).toBeVisible()
  await expect(oldNameCell).toBeHidden()

  await expect(rows).toHaveCount(4)

  // new target shows up in target cell
  await expect(page.locator('text=subnetedit-filter-subnetICMP')).toBeVisible()

  // other 3 rules are still there
  const rest = defaultRules.filter((r) => r !== 'allow-icmp')
  for (const name of rest) {
    await expect(page.locator(`text="${name}"`)).toBeVisible()
  }
})
