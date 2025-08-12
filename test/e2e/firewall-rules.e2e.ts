/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { expect, test, type Locator, type Page } from '@playwright/test'

import { clickRowAction, expectRowVisible } from './utils'

const defaultRules = ['allow-internal-inbound', 'allow-ssh', 'allow-icmp']

test('can create firewall rule', async ({ page }) => {
  await page.goto('/projects/mock-project/vpcs/mock-vpc')
  await page.getByRole('tab', { name: 'Firewall Rules' }).click()

  // default rules are all there
  for (const name of defaultRules) {
    await expect(page.locator(`text="${name}"`)).toBeVisible()
  }
  const rows = page.locator('tbody >> tr')
  await expect(rows).toHaveCount(3)

  const modal = page.getByRole('dialog', { name: 'Add firewall rule' })
  await expect(modal).toBeHidden()

  // open modal
  await page.getByRole('link', { name: 'New rule' }).click()

  // modal is now open
  await expect(modal).toBeVisible()

  await page.fill('input[name=name]', 'my-new-rule')
  await page.getByRole('radio', { name: 'Outbound' }).click()

  await page.fill('role=textbox[name="Priority"]', '5')

  // add new target
  const targetsFieldset = page.getByRole('group', { name: 'targets' })
  await targetsFieldset.getByRole('button', { name: 'Add item' }).click()

  // change target type to IP and enter value
  const targetsTable = targetsFieldset.getByRole('table')
  await targetsTable.getByRole('button').first().click() // Open listbox

  // changing type should reset the value
  await page.getByRole('option', { name: 'Instance' }).click()
  await targetsTable.getByRole('combobox').first().fill('host-filter-instance')
  await page.getByText('host-filter-instance').click()
  await expect(targetsTable.getByRole('combobox')).toHaveValue('host-filter-instance')
  await targetsTable.getByRole('button').first().click()
  await page.getByRole('option', { name: 'VPC subnet', exact: true }).click()
  await expect(page.getByText('host-filter-instance')).toBeHidden()

  await targetsTable.getByRole('button').first().click() // Open listbox
  await page.getByRole('option', { name: 'IP', exact: true }).click()

  await targetsTable.getByRole('textbox').first().fill('192.168.0.1')

  // add host filter
  const hostsFieldset = page.getByRole('group', { name: 'hosts' })
  await hostsFieldset.getByRole('button', { name: 'Add item' }).click()

  // change host type to Instance and enter value
  const hostsTable = hostsFieldset.getByRole('table')
  await hostsTable.getByRole('button').first().click() // Open listbox
  await page.getByRole('option', { name: 'Instance' }).click()
  await hostsTable.getByRole('combobox').first().fill('host-filter-instance')
  await page.getByText('host-filter-instance').click()

  // add port filters
  const portsFieldset = page.getByRole('group', { name: 'ports' })
  const portsTable = portsFieldset.getByRole('table')

  // add invalid port first
  await portsFieldset.getByRole('button', { name: 'Add item' }).click()
  await portsTable.getByRole('textbox').first().fill('abc')

  // add valid port
  await portsFieldset.getByRole('button', { name: 'Add item' }).click()
  await portsTable.getByRole('textbox').nth(1).fill('123-456')

  // add duplicate port
  await portsFieldset.getByRole('button', { name: 'Add item' }).click()
  await portsTable.getByRole('textbox').nth(2).fill('123-456')

  // add protocol filter
  const protocolsFieldset = page.getByRole('group', { name: 'protocols' })
  await protocolsFieldset.getByRole('button', { name: 'Add item' }).click()

  // change protocol type to UDP
  const protocolsTable = protocolsFieldset.getByRole('table')
  await protocolsTable.getByRole('button').first().click() // Open listbox
  await page.getByRole('option', { name: 'UDP' }).click()

  // try to submit with invalid data - should show validation errors
  await page.getByRole('button', { name: 'Add rule' }).click()

  const invalidPortButton = page.getByRole('button', {
    name: 'Error: Not a valid port range',
  })
  await expect(invalidPortButton).toBeVisible()
  await invalidPortButton.hover()
  const invalidPortTooltip = page
    .getByRole('tooltip')
    .filter({ hasText: 'Not a valid port range' })
  await expect(invalidPortTooltip).toBeVisible()

  const dupePortButton = page
    .getByRole('button', {
      name: 'Error: Port range already added',
    })
    .first()
  await expect(dupePortButton).toBeVisible()
  await dupePortButton.hover()
  const dupePortTooltip = page
    .getByRole('tooltip')
    .filter({ hasText: 'Port range already added' })
  await expect(dupePortTooltip).toBeVisible()

  // remove invalid entries
  await portsTable.getByRole('button', { name: 'Remove item 1' }).click() // Remove 'abc'
  await portsTable.getByRole('button', { name: 'Remove item 2' }).click() // Remove duplicate '123-456'

  // submit the form
  await page.getByRole('button', { name: 'Add rule' }).click()

  // modal closes again
  await expect(modal).toBeHidden()

  // table refetches and now includes the new rule as well as the originals
  await expectRowVisible(page.getByRole('table'), {
    Name: 'my-new-rule',
    Priority: '5',
    Targets: 'ip192.168.0.1',
    Filters: 'instancehost-filter-instance+2', // UDP and port filters in plus popup
  })

  // scroll table sideways past the filters cell
  await page.getByText('Enabled').first().scrollIntoViewIfNeeded()

  await page.getByText('+2').hover()
  const tooltip = page.getByRole('tooltip', { name: 'Other filters UDP Port 123-' })
  await expect(tooltip).toBeVisible()

  await expect(rows).toHaveCount(4)
  for (const name of defaultRules) {
    await expect(page.locator(`text="${name}"`)).toBeVisible()
  }
})

test('firewall rule targets and filters overflow', async ({ page }) => {
  await page.goto('/projects/other-project/vpcs/mock-vpc-2')

  await expect(
    page.getByRole('cell', { name: 'instance my-inst +2', exact: true })
  ).toBeVisible()

  await page.getByText('+2').hover()
  await expect(
    page.getByRole('tooltip', {
      name: 'Other targets ip 125.34.25.2 subnet subsubsub',
      exact: true,
    })
  ).toBeVisible()

  await expect(
    page.getByRole('cell', { name: 'instance hello-friend +6', exact: true })
  ).toBeVisible()

  // scroll table sideways past the filters cell
  await page.getByText('Enabled').first().scrollIntoViewIfNeeded()

  await page.getByText('+6').hover()
  const tooltip = page.getByRole('tooltip', {
    name: 'Other filters subnet my-subnet ip 148.38.89.5 TCP ICMP type 5 code 1-3 Port 3389 Port 45-89',
    exact: true,
  })
  await expect(tooltip).toBeVisible()
})

const deleteRowAndVerifyRowCount = async (table: Locator, expectedCount: number) => {
  const rows = table.getByRole('row')
  // skip the header row
  await rows.nth(1).getByRole('button', { name: 'remove' }).click()
  await expect(rows).toHaveCount(expectedCount)
}

test('firewall rule form targets table', async ({ page }) => {
  await page.goto('/projects/mock-project/vpcs/mock-vpc')
  await page.getByRole('tab', { name: 'Firewall Rules' }).click()

  // open modal
  await page.getByRole('link', { name: 'New rule' }).click()

  const targetsFieldset = page.getByRole('group', { name: 'targets' })
  const targets = targetsFieldset.getByRole('table')

  // add VPC target
  await targetsFieldset.getByRole('button', { name: 'Add item' }).click()
  await targets.getByRole('button').first().click() // Open VPC listbox
  await page.getByRole('option', { name: 'VPC', exact: true }).click()
  await targets.getByRole('combobox').first().fill('abc')
  await page.getByText('abc').click()

  // add another VPC target
  await targetsFieldset.getByRole('button', { name: 'Add item' }).click()
  await targets.getByRole('button').nth(2).click() // Open second VPC listbox
  await page.getByRole('option', { name: 'VPC', exact: true }).click()
  const targetsField2 = targets.getByRole('combobox').nth(1)
  await targetsField2.fill('mock-vpc')
  await targetsField2.press('Enter')

  // add VPC subnet target
  await targetsFieldset.getByRole('button', { name: 'Add item' }).click()
  await targets.getByRole('button').nth(4).click() // Open third listbox
  await page.getByRole('option', { name: 'VPC subnet' }).click()
  await targets.getByRole('combobox').nth(2).fill('mock-subnet')
  await page.getByText('mock-subnet').click()

  // add another subnet by typing
  await targetsFieldset.getByRole('button', { name: 'Add item' }).click()
  await targets.getByRole('button').nth(6).click() // Open fourth listbox
  await page.getByRole('option', { name: 'VPC subnet' }).click()
  await targets.getByRole('combobox').nth(3).fill('abc-123')
  await page.getByText('abc-123').click()

  // add IP target
  await targetsFieldset.getByRole('button', { name: 'Add item' }).click()
  await targets.getByRole('button').nth(8).click() // Open fifth listbox
  await page.getByRole('option', { name: 'IP', exact: true }).click()
  await targets.getByRole('textbox').first().fill('192.168.0.1')

  // test table row delete; only keep the IP one
  // we start with 6 rows, because the header row counts as one
  await expect(targets.getByRole('row')).toHaveCount(6)
  await deleteRowAndVerifyRowCount(targets, 5)
  await deleteRowAndVerifyRowCount(targets, 4)
  await deleteRowAndVerifyRowCount(targets, 3)
  await deleteRowAndVerifyRowCount(targets, 2)

  // verify the IP target remains
  await expect(targets.getByRole('textbox')).toHaveValue('192.168.0.1')
})

test('firewall rule form target validation', async ({ page }) => {
  await page.goto('/projects/mock-project/vpcs/mock-vpc/firewall-rules-new')

  await page.fill('input[name=name]', 'my-new-rule')

  const targetsFieldset = page.getByRole('group', { name: 'targets' })
  const targets = targetsFieldset.getByRole('table')

  // add invalid VPC target
  await targetsFieldset.getByRole('button', { name: 'Add item' }).click()
  await targets.getByRole('button').first().click() // Open listbox
  await page.getByRole('option', { name: 'VPC', exact: true }).click()
  const vpcField = targets.getByRole('combobox').first()
  await vpcField.fill('ab-')
  await vpcField.press('Enter')

  // add invalid IP target
  await targetsFieldset.getByRole('button', { name: 'Add item' }).click()
  await targets.getByRole('button').nth(2).click() // Open second listbox
  await page.getByRole('option', { name: 'IP', exact: true }).click()
  const ipField = targets.getByRole('textbox').first()
  await ipField.fill('1')

  // submit form to trigger validation
  await page.getByRole('button', { name: 'Add rule' }).click()

  // check for validation error buttons
  const vpcError = targetsFieldset.getByRole('button', {
    name: 'Error: Must end with a letter or number',
  })
  const ipError = targetsFieldset.getByRole('button', {
    name: 'Error: Not a valid IP address',
  })
  await expect(vpcError).toBeVisible()
  await expect(ipError).toBeVisible()

  // fix the errors by changing values
  await vpcField.fill('abc')
  await vpcField.press('Enter')
  await ipField.fill('1.1.1.1')

  // submit again - should succeed
  await page.getByRole('button', { name: 'Add rule' }).click()
  await expect(page.getByRole('dialog', { name: 'Add firewall rule' })).toBeHidden()
})

// This test may appear redundant because host and target share their logic, but
// testing them separately is still valuable because we want to make sure we're
// hooking up the shared code correctly and we don't break them if we refactor
// that code.

test('firewall rule form host validation', async ({ page }) => {
  await page.goto('/projects/mock-project/vpcs/mock-vpc/firewall-rules-new')

  await page.fill('input[name=name]', 'my-new-rule')

  const hostsFieldset = page.getByRole('group', { name: 'hosts' })
  const hosts = hostsFieldset.getByRole('table')
  const formModal = page.getByRole('dialog', { name: 'Add firewall rule' })

  // add invalid VPC host
  await hostsFieldset.getByRole('button', { name: 'Add item' }).click()
  await hosts.getByRole('button').first().click() // Open listbox
  await page.getByRole('option', { name: 'VPC', exact: true }).click()
  const vpcField = hosts.getByRole('combobox').first()
  await vpcField.fill('ab-')
  await vpcField.press('Enter')

  // add invalid IP host
  await hostsFieldset.getByRole('button', { name: 'Add item' }).click()
  await hosts.getByRole('button').nth(2).click() // Open second listbox
  await page.getByRole('option', { name: 'IP', exact: true }).click()
  const ipField = hosts.getByRole('textbox').first()
  await ipField.fill('1')

  // add invalid IP subnet host
  await hostsFieldset.getByRole('button', { name: 'Add item' }).click()
  await hosts.getByRole('button').nth(4).click() // Open third listbox
  await page.getByRole('option', { name: 'IP subnet' }).click()
  const ipSubnetField = hosts.getByRole('textbox').nth(1)
  await ipSubnetField.fill('1')
  await vpcField.press('Enter')

  // submit form to trigger validation
  await page.getByRole('button', { name: 'Add rule' }).click()

  // check for validation error buttons
  const vpcError = hostsFieldset.getByRole('button', {
    name: 'Error: Must end with a letter or number',
  })
  const ipError = hostsFieldset.getByRole('button', {
    name: 'Error: Not a valid IP address',
  })
  const ipNetError = hostsFieldset.getByRole('button', {
    name: 'Error: Must contain an IP address and a width, separated by a /',
  })
  await expect(vpcError).toBeVisible()
  await expect(ipError).toBeVisible()
  await expect(ipNetError).toBeVisible()

  // fix the errors
  await vpcField.fill('abc')
  await vpcField.press('Enter')
  await ipField.fill('1.1.1.1')
  await ipSubnetField.fill('1.1.1.1/1')

  // submit again - should succeed
  await page.getByRole('button', { name: 'Add rule' }).click()
  await expect(formModal).toBeHidden()
})

test('firewall rule form hosts table', async ({ page }) => {
  await page.goto('/projects/mock-project/vpcs/mock-vpc')
  await page.getByRole('tab', { name: 'Firewall Rules' }).click()

  // open modal
  await page.getByRole('link', { name: 'New rule' }).click()

  await page.fill('input[name=name]', 'my-new-rule')

  const hostsFieldset = page.getByRole('group', { name: 'hosts' })
  const hosts = hostsFieldset.getByRole('table')

  // add VPC hosts
  await hostsFieldset.getByRole('button', { name: 'Add item' }).click()
  await hosts.getByRole('button').first().click() // Open first listbox
  await page.getByRole('option', { name: 'VPC', exact: true }).click()
  const hostsField1 = hosts.getByRole('combobox').first()
  await hostsField1.fill('abc')
  await hostsField1.press('Enter')

  await hostsFieldset.getByRole('button', { name: 'Add item' }).click()
  await hosts.getByRole('button').nth(2).click() // Open second listbox
  await page.getByRole('option', { name: 'VPC', exact: true }).click()
  const hostsField2 = hosts.getByRole('combobox').nth(1)
  await hostsField2.fill('def')
  await hostsField2.press('Enter')

  // add subnet hosts
  await hostsFieldset.getByRole('button', { name: 'Add item' }).click()
  await hosts.getByRole('button').nth(4).click() // Open third listbox
  await page.getByRole('option', { name: 'VPC subnet' }).click()
  const hostsField3 = hosts.getByRole('combobox').nth(2)
  await hostsField3.fill('mock-subnet')
  await hostsField3.press('Enter')

  await hostsFieldset.getByRole('button', { name: 'Add item' }).click()
  await hosts.getByRole('button').nth(6).click() // Open fourth listbox
  await page.getByRole('option', { name: 'VPC subnet' }).click()
  const hostsField4 = hosts.getByRole('combobox').nth(3)
  await hostsField4.fill('abc')
  await hostsField4.press('Enter')

  // add IP host
  await hostsFieldset.getByRole('button', { name: 'Add item' }).click()
  await hosts.getByRole('button').nth(8).click() // Open fifth listbox
  await page.getByRole('option', { name: 'IP', exact: true }).click()
  await hosts.getByRole('textbox').first().fill('192.168.0.1')

  // test table row delete; only keep the IP one
  await expect(hosts.getByRole('row')).toHaveCount(6)
  await deleteRowAndVerifyRowCount(hosts, 5)
  await deleteRowAndVerifyRowCount(hosts, 4)
  await deleteRowAndVerifyRowCount(hosts, 3)
  await deleteRowAndVerifyRowCount(hosts, 2)

  // verify the IP host remains
  await expect(hosts.getByRole('textbox')).toHaveValue('192.168.0.1')
})

test('can update firewall rule', async ({ page }) => {
  await page.goto('/projects/mock-project/vpcs/mock-vpc')
  await page.getByRole('tab', { name: 'Firewall Rules' }).click()

  const rows = page.locator('tbody >> tr')
  await expect(rows).toHaveCount(3)

  // allow-icmp is the one we're going to change
  const oldNameCell = page.locator('td >> text="allow-icmp"')
  await expect(oldNameCell).toBeVisible()

  const newNameCell = page.locator('td >> text="new-rule-name"')
  await expect(newNameCell).toBeHidden()

  const modal = page.getByRole('dialog', { name: 'Edit rule' })
  await expect(modal).toBeHidden()

  // can click name cell to edit
  await page.getByRole('link', { name: 'allow-icmp' }).click()

  // modal is now open
  await expect(modal).toBeVisible()

  // name is populated
  await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue('allow-icmp')

  // priority is populated
  await expect(page.getByRole('textbox', { name: 'Priority' })).toHaveValue('65534')

  // protocol is populated in the table
  const protocolsFieldset = page.getByRole('group', { name: 'protocols' })
  const protocolTable = protocolsFieldset.getByRole('table')
  await expect(protocolTable.getByRole('button', { name: 'ICMP' })).toBeVisible()

  // remove the existing ICMP protocol filter
  await protocolTable.getByRole('button', { name: 'Remove item 1' }).click()

  // add a new TCP protocol filter
  await protocolsFieldset.getByRole('button', { name: 'Add item' }).click()
  await protocolTable.getByRole('button').first().click() // Open listbox
  await page.getByRole('option', { name: 'TCP' }).click()

  // update name
  await page.getByRole('textbox', { name: 'Name' }).fill('new-rule-name')

  // add host filter
  const hostsFieldset = page.getByRole('group', { name: 'Hosts' })
  await hostsFieldset.getByRole('button', { name: 'Add item' }).click()
  const hosts = hostsFieldset.getByRole('table')
  await hosts.getByRole('button').first().click() // Open listbox
  await page.getByRole('option', { name: 'VPC subnet' }).click()
  await hosts.getByRole('combobox').first().fill('edit-filter-subnet')
  await page.getByText('edit-filter-subnet').click()

  // submit the form
  await page.getByRole('button', { name: 'Update rule' }).click()

  // modal closes again
  await expect(modal).toBeHidden()

  // table refetches and now includes the updated rule name, not the old name
  await expect(newNameCell).toBeVisible()
  await expect(oldNameCell).toBeHidden()

  await expect(rows).toHaveCount(3)

  // new host filter shows up in filters cell, along with the new TCP protocol
  await expect(page.locator('text=subnetedit-filter-subnetTCP')).toBeVisible()

  // other rules are still there
  const rest = defaultRules.filter((r) => r !== 'allow-icmp')
  for (const name of rest) {
    await expect(page.locator(`text="${name}"`)).toBeVisible()
  }
})

test('create from existing rule', async ({ page }) => {
  const url = '/projects/mock-project/vpcs/mock-vpc/firewall-rules'
  await page.goto(url)

  const modal = page.getByRole('dialog', { name: 'Add firewall rule' })
  await expect(modal).toBeHidden()

  await clickRowAction(page, 'allow-icmp', 'Clone')

  await expect(page).toHaveURL(url + '-new/allow-icmp')
  await expect(modal).toBeVisible()
  await expect(modal.getByRole('textbox', { name: 'Name', exact: true })).toHaveValue(
    'allow-icmp-copy'
  )

  // protocol is populated in the modal
  const protocolsFieldset = modal.getByRole('group', { name: 'protocols' })
  const protocolTable = protocolsFieldset.getByRole('table')
  await expect(protocolTable.getByRole('button', { name: 'ICMP' })).toBeVisible()

  // no port filters
  const portFieldset = modal.getByRole('group', { name: 'ports' })
  const portTable = portFieldset.getByRole('table')
  await expect(portTable.getByText('No ports')).toBeVisible()

  // targets contain default VPC
  const targetsFieldset = modal.getByRole('group', { name: 'targets' })
  const targets = targetsFieldset.getByRole('table')
  await expect(targets.getByRole('combobox').first()).toHaveValue('default')

  // close the modal
  await page.keyboard.press('Escape')
  await expect(modal).toBeHidden()

  // do it again with a different rule
  await clickRowAction(page, 'allow-ssh', 'Clone')

  await expect(modal).toBeVisible()
  await expect(modal.getByRole('textbox', { name: 'Name', exact: true })).toHaveValue(
    'allow-ssh-copy'
  )

  await expect(portTable.getByRole('textbox').first()).toHaveValue('22')

  // protocol is populated in the modal
  await expect(protocolTable.getByRole('button', { name: 'TCP' })).toBeVisible()

  await expect(targets.getByRole('combobox').first()).toHaveValue('default')

  // submit the form
  await page.getByRole('button', { name: 'Add rule' }).click()

  await expect(page.locator('tbody >> tr')).toHaveCount(4)
})

const rulePath = '/projects/mock-project/vpcs/mock-vpc/firewall-rules/allow-icmp/edit'

test('can edit rule directly by URL', async ({ page }) => {
  await page.goto(rulePath)
  await expect(page.getByRole('dialog', { name: 'Edit rule' })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Name', exact: true })).toHaveValue(
    'allow-icmp'
  )
})

test('404s on edit non-existent rule', async ({ page }) => {
  await page.goto(rulePath.replace('icmp', 'boop'))
  await expect(page.getByText('Page not found')).toBeVisible()
})

// when creating a rule, giving it the same name as an existing rule is an
// error. if you want to overwrite a rule, you need to edit it
test('name conflict error on create', async ({ page }) => {
  await page.goto('/projects/mock-project/vpcs/mock-vpc/firewall-rules-new')

  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('allow-ssh')

  const error = page.getByText('Name taken').first()
  await expect(error).toBeHidden()

  await page.getByRole('button', { name: 'Add rule' }).click()
  await expect(error).toBeVisible()
})

// when editing a rule, on the other hand, we only check for conflicts against rules
// other than the one being edited, because of course its name can stay the same
test('name conflict error on edit', async ({ page }) => {
  await page.goto('/projects/mock-project/vpcs/mock-vpc/firewall-rules/allow-ssh/edit')

  // changing the name to one taken by another rule is an error
  const nameField = page.getByRole('textbox', { name: 'Name', exact: true })
  await nameField.fill('allow-icmp')
  await page.getByRole('button', { name: 'Update rule' }).click()

  // change name back
  await nameField.fill('allow-ssh')
  const error = page.getByRole('dialog').getByText('Name taken')
  await expect(error).toBeHidden()

  // wait for modal to close after successful update
  await page.getByRole('button', { name: 'Update rule' }).click()
  const modal = page.getByRole('dialog', { name: 'Edit rule' })
  await expect(modal).toBeHidden()

  await expectRowVisible(page.getByRole('table'), { Name: 'allow-ssh' })

  // changing the name to a non-conflicting name is allowed
  await page.getByRole('link', { name: 'allow-ssh' }).click()
  await nameField.fill('allow-ssh2')
  await page.getByRole('button', { name: 'Update rule' }).click()
  await expectRowVisible(page.getByRole('table'), { Name: 'allow-ssh2' })
})

async function expectOptions(page: Page, options: string[]) {
  const selector = page.getByRole('option')
  await expect(selector).toHaveCount(options.length)
  for (const option of options) {
    await expect(page.getByRole('option', { name: option })).toBeVisible()
  }
}

test('arbitrary values combobox', async ({ page }) => {
  await page.goto('/projects/mock-project/vpcs/mock-vpc/firewall-rules-new')

  // Add a target row first to access the VPC input
  const targetsFieldset = page.getByRole('group', { name: 'targets' })
  await targetsFieldset.getByRole('button', { name: 'Add item' }).click()
  const targets = targetsFieldset.getByRole('table')

  // test for bug where we'd persist the d after add and only show 'Custom: d'
  const vpcInput = targets.getByRole('combobox').first()
  await vpcInput.focus()
  await expectOptions(page, ['mock-vpc'])

  await vpcInput.fill('d')
  await expectOptions(page, ['Custom: d'])

  await vpcInput.blur()
  await expect(vpcInput).toHaveValue('d')

  await vpcInput.focus()
  await expectOptions(page, ['Custom: d'])

  // clear and test again
  await vpcInput.clear()
  await expectOptions(page, ['mock-vpc']) // bug cause failure here

  // test keeping query around on blur - change type to Instance
  await targets.getByRole('button').first().click() // Open type listbox for first row
  await page.getByRole('option', { name: 'Instance' }).click()

  const input = targets.getByRole('combobox').first()

  await input.focus()
  await expectOptions(page, ['db1', 'you-fail', 'not-there-yet', 'db2'])

  await input.fill('d')
  await expectOptions(page, ['db1', 'db2', 'Custom: d'])

  await input.blur()
  await expect(page.getByRole('option')).toBeHidden()

  await expect(input).toHaveValue('d')
  await input.focus()

  // same options show up after blur (there was a bug around this)
  await expectOptions(page, ['db1', 'db2', 'Custom: d'])

  // test typing in ICMP filter input triggers validation error for bad input
  const protocolsFieldset = page.getByRole('group', { name: 'protocols' })
  await protocolsFieldset.getByRole('button', { name: 'Add item' }).click()
  const protocolTable = protocolsFieldset.getByRole('table')
  await protocolTable.getByRole('button').first().click()
  await page.getByRole('option', { name: 'ICMP' }).click()
  await protocolTable.getByRole('combobox').first().fill('abc')

  // Submit form to trigger validation
  await page.getByRole('button', { name: 'Add rule' }).click()

  // Check that the form submission was prevented
  await expect(page.getByRole('dialog', { name: 'Add firewall rule' })).toBeVisible()
})

test("esc in combobox doesn't close form", async ({ page }) => {
  await page.goto('/projects/mock-project/vpcs/mock-vpc/firewall-rules-new')

  // make form dirty so we can get the confirm modal on close attempts
  await page.getByRole('textbox', { name: 'Name' }).fill('a')

  // make sure the confirm modal does pop up on esc when we're not in a combobox
  const confirmModal = page.getByRole('dialog', { name: 'Confirm navigation' })
  await expect(confirmModal).toBeHidden()
  await page.keyboard.press('Escape')
  await expect(confirmModal).toBeVisible()
  await confirmModal.getByRole('button', { name: 'Keep editing' }).click()
  await expect(confirmModal).toBeHidden()

  const formModal = page.getByRole('dialog', { name: 'Add firewall rule' })
  await expect(formModal).toBeVisible()

  // add a target to access the VPC combobox
  const targetsFieldset = page.getByRole('group', { name: 'targets' })
  await targetsFieldset.getByRole('button', { name: 'Add item' }).click()
  const targets = targetsFieldset.getByRole('table')

  // VPC is the default type, so we can directly access the combobox
  const input = targets.getByRole('combobox').first()
  await input.focus()

  await page.keyboard.press('Escape')
  // form modal should still be visible, not closed by escape in input
  await expect(confirmModal).toBeHidden()
  await expect(formModal).toBeVisible()

  // now press esc again to leave the form
  await page.keyboard.press('Escape')
  await expect(confirmModal).toBeVisible()
})
