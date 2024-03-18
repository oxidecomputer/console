/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { expect, expectRowVisible, test } from './utils'

const defaultRules = ['allow-internal-inbound', 'allow-ssh', 'allow-icmp', 'allow-rdp']

test('can create firewall rule', async ({ page }) => {
  await page.goto('/projects/mock-project/vpcs/mock-vpc')
  await page.getByRole('tab', { name: 'Firewall Rules' }).click()

  // default rules are all there
  for (const name of defaultRules) {
    await expect(page.locator(`text="${name}"`)).toBeVisible()
  }
  const rows = page.locator('tbody >> tr')
  await expect(rows).toHaveCount(4)

  const modal = page.getByRole('dialog', { name: 'Add firewall rule' })
  await expect(modal).toBeHidden()

  // open modal
  await page.getByRole('button', { name: 'New rule' }).click()

  // modal is now open
  await expect(modal).toBeVisible()

  await page.fill('input[name=name]', 'my-new-rule')
  await page.locator('text=Outbound').click()

  await page.fill('role=textbox[name="Priority"]', '5')

  // add targets with overlapping names and types to test delete
  const targets = page.getByRole('table', { name: 'Targets' })

  await page.getByRole('button', { name: 'Target type' }).click()
  await page.getByRole('option', { name: 'IP', exact: true }).click()
  await page.getByRole('textbox', { name: 'IP address' }).fill('192.168.0.1')
  await page.getByRole('button', { name: 'Add target' }).click()
  await expectRowVisible(targets, { Type: 'ip', Value: '192.168.0.1' })

  // add host filter instance "host-filter-instance"
  await page.locator('role=button[name*="Host type"]').click()
  await page.locator('role=option[name="Instance"]').click()
  await page.fill('role=textbox[name="Instance name"]', 'host-filter-instance')
  await page.locator('text="Add host filter"').click()

  // host is added to hosts table
  const hosts = page.getByRole('table', { name: 'Host filters' })
  await expectRowVisible(hosts, { Type: 'instance', Value: 'host-filter-instance' })

  // TODO: test invalid port range once I put an error message in there
  await page.fill('role=textbox[name="Port filter"]', '123-456')
  await page.getByRole('button', { name: 'Add port filter' }).click()

  // port range is added to port ranges table
  const ports = page.getByRole('table', { name: 'Ports' })
  await expectRowVisible(ports, { Range: '123-456' })

  // check the UDP box
  await page.locator('text=UDP').click()

  // submit the form
  await page.locator('text="Add rule"').click()

  // modal closes again
  await expect(modal).toBeHidden()

  // table refetches and now includes the new rule as well as the originals
  await expectRowVisible(page.getByRole('table'), {
    Name: 'my-new-rule',
    Priority: '5',
    Targets: 'ip192.168.0.1',
    Filters: 'instancehost-filter-instanceUDP123-456',
  })

  await expect(rows).toHaveCount(5)
  for (const name of defaultRules) {
    await expect(page.locator(`text="${name}"`)).toBeVisible()
  }
})

test('firewall rule form targets table', async ({ page }) => {
  await page.goto('/projects/mock-project/vpcs/mock-vpc')
  await page.getByRole('tab', { name: 'Firewall Rules' }).click()

  // open modal
  await page.getByRole('button', { name: 'New rule' }).click()

  const targets = page.getByRole('table', { name: 'Targets' })
  const addButton = page.getByRole('button', { name: 'Add target' })

  // add targets with overlapping names and types to test delete

  // there are two of these because the hosts table also defaults to VPC
  await page.getByRole('textbox', { name: 'VPC name' }).nth(0).fill('abc')
  await addButton.click()
  await expectRowVisible(targets, { Type: 'vpc', Value: 'abc' })

  await page.getByRole('textbox', { name: 'VPC name' }).nth(0).fill('def')
  await addButton.click()
  await expectRowVisible(targets, { Type: 'vpc', Value: 'def' })

  await page.getByRole('button', { name: 'Target type' }).click()
  await page.getByRole('option', { name: 'VPC Subnet' }).click()
  await page.getByRole('textbox', { name: 'Subnet name' }).fill('abc')
  await addButton.click()
  await expectRowVisible(targets, { Type: 'subnet', Value: 'abc' })

  await page.getByRole('button', { name: 'Target type' }).click()
  await page.getByRole('option', { name: 'IP', exact: true }).click()
  await page.getByRole('textbox', { name: 'IP address' }).fill('192.168.0.1')
  await addButton.click()
  await expectRowVisible(targets, { Type: 'ip', Value: '192.168.0.1' })

  // test table row delete, only keep the IP one
  const firstDeleteButton = targets
    .getByRole('row')
    .nth(1)
    .getByRole('button', { name: 'remove' })
  await expect(targets.getByRole('row')).toHaveCount(5)
  await firstDeleteButton.click()
  await expect(targets.getByRole('row')).toHaveCount(4)
  await firstDeleteButton.click()
  await expect(targets.getByRole('row')).toHaveCount(3)
  await firstDeleteButton.click()
  await expect(targets.getByRole('row')).toHaveCount(2)

  // we still have the IP target
  await expectRowVisible(targets, { Type: 'ip', Value: '192.168.0.1' })
})

test('firewall rule form hosts table', async ({ page }) => {
  await page.goto('/projects/mock-project/vpcs/mock-vpc')
  await page.getByRole('tab', { name: 'Firewall Rules' }).click()

  // open modal
  await page.getByRole('button', { name: 'New rule' }).click()

  const hosts = page.getByRole('table', { name: 'Host filters' })
  const addButton = page.getByRole('button', { name: 'Add host filter' })

  // add hosts with overlapping names and types to test delete

  // there are two of these because the targets table also defaults to VPC
  await page.getByRole('textbox', { name: 'VPC name' }).nth(1).fill('abc')
  await addButton.click()
  await expectRowVisible(hosts, { Type: 'vpc', Value: 'abc' })

  await page.getByRole('textbox', { name: 'VPC name' }).nth(1).fill('def')
  await addButton.click()
  await expectRowVisible(hosts, { Type: 'vpc', Value: 'def' })

  await page.getByRole('button', { name: 'Host type' }).click()
  await page.getByRole('option', { name: 'VPC Subnet' }).click()
  await page.getByRole('textbox', { name: 'Subnet name' }).fill('abc')
  await addButton.click()
  await expectRowVisible(hosts, { Type: 'subnet', Value: 'abc' })

  await page.getByRole('button', { name: 'Host type' }).click()
  await page.getByRole('option', { name: 'IP', exact: true }).click()
  await page.getByRole('textbox', { name: 'IP address' }).fill('192.168.0.1')
  await addButton.click()
  await expectRowVisible(hosts, { Type: 'ip', Value: '192.168.0.1' })

  // test table row delete, only keep the IP one
  const firstDeleteButton = hosts
    .getByRole('row')
    .nth(1)
    .getByRole('button', { name: 'remove' })
  await expect(hosts.getByRole('row')).toHaveCount(5)
  await firstDeleteButton.click()
  await expect(hosts.getByRole('row')).toHaveCount(4)
  await firstDeleteButton.click()
  await expect(hosts.getByRole('row')).toHaveCount(3)
  await firstDeleteButton.click()
  await expect(hosts.getByRole('row')).toHaveCount(2)

  // we still have the IP target
  await expectRowVisible(hosts, { Type: 'ip', Value: '192.168.0.1' })
})

test('can update firewall rule', async ({ page }) => {
  await page.goto('/projects/mock-project/vpcs/mock-vpc')
  await page.getByRole('tab', { name: 'Firewall Rules' }).click()

  const rows = page.locator('tbody >> tr')
  await expect(rows).toHaveCount(4)

  // allow-icmp is the one we're doing to change
  const oldNameCell = page.locator('td >> text="allow-icmp"')
  await expect(oldNameCell).toBeVisible()

  const newNameCell = page.locator('td >> text="new-rule-name"')
  await expect(newNameCell).toBeHidden()

  const modal = page.getByRole('dialog', { name: 'Edit rule' })
  await expect(modal).toBeHidden()

  // can click name cell to edit
  await page.getByRole('button', { name: 'allow-icmp' }).click()

  // modal is now open
  await expect(modal).toBeVisible()

  // TODO: get these by their label when that becomes easier to do

  // name is populated
  await expect(page.locator('input[name=name]')).toHaveValue('allow-icmp')

  // priority is populated
  await expect(page.locator('role=textbox[name=Priority]')).toHaveValue('65534')

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
  await expect(page.locator('role=cell >> text="edit-filter-subnet"')).toBeVisible()

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
