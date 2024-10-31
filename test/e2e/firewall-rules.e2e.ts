/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import {
  clickRowAction,
  expect,
  expectRowVisible,
  selectOption,
  test,
  type Locator,
} from './utils'

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

  // add targets with overlapping names and types to test delete
  const targets = page.getByRole('table', { name: 'Targets' })

  await selectOption(page, 'Target type', 'IP')
  await page.getByRole('textbox', { name: 'IP address' }).fill('192.168.0.1')
  await page.getByRole('button', { name: 'Add target' }).click()
  await expectRowVisible(targets, { Type: 'ip', Value: '192.168.0.1' })

  // add host filter instance "host-filter-instance"
  await selectOption(page, 'Host type', 'Instance')
  await page.getByRole('combobox', { name: 'Instance name' }).fill('host-filter-instance')
  await page.getByText('host-filter-instance').click()
  await page.getByRole('button', { name: 'Add host filter' }).click()

  // host is added to hosts table
  const hosts = page.getByRole('table', { name: 'Host filters' })
  await expectRowVisible(hosts, { Type: 'instance', Value: 'host-filter-instance' })

  const portRangeField = page.getByRole('textbox', { name: 'Port filters' })
  const invalidPort = page.getByRole('dialog').getByText('Not a valid port range')
  const addPortButton = page.getByRole('button', { name: 'Add port filter' })
  await portRangeField.fill('abc')
  await expect(invalidPort).toBeHidden()
  await addPortButton.click()
  await expect(invalidPort).toBeVisible()

  // test clear button
  await page.getByRole('button', { name: 'Clear' }).nth(1).click()
  await expect(portRangeField).toHaveValue('')

  await portRangeField.fill('123-456')
  await addPortButton.click()
  await expect(invalidPort).toBeHidden()

  // port range is added to port ranges table
  const ports = page.getByRole('table', { name: 'Port filters' })
  await expectRowVisible(ports, { 'Port ranges': '123-456' })

  const dupePort = page.getByRole('dialog').getByText('Port range already added')
  await expect(dupePort).toBeHidden()
  await portRangeField.fill('123-456')
  // don't need to click because we're already validating onChange
  await expect(dupePort).toBeVisible()

  // check the UDP box
  await page.locator('text=UDP').click()

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
    page.getByRole('cell', { name: 'instance hello-friend +5', exact: true })
  ).toBeVisible()

  // scroll table sideways past the filters cell
  await page.getByText('Enabled').first().scrollIntoViewIfNeeded()

  await page.getByText('+5').hover()
  const tooltip = page.getByRole('tooltip', {
    name: 'Other filters subnet my-subnet ip 148.38.89.5 TCP Port 3389 Port 45-89',
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

  const targets = page.getByRole('table', { name: 'Targets' })
  const targetVpcNameField = page.getByRole('combobox', { name: 'VPC name' }).first()

  const addButton = page.getByRole('button', { name: 'Add target' })

  // add targets with overlapping names and types to test delete

  await targetVpcNameField.fill('abc')
  await targetVpcNameField.press('Enter')
  await addButton.click()
  await expectRowVisible(targets, { Type: 'vpc', Value: 'abc' })

  // enter a VPC called 'mock-subnet', even if that doesn't make sense here, to test dropdown later
  await targetVpcNameField.fill('mock-subnet')
  await targetVpcNameField.press('Enter')
  await addButton.click()
  await expectRowVisible(targets, { Type: 'vpc', Value: 'mock-subnet' })

  // add VPC subnet targets
  const subnetNameField = page.getByRole('combobox', { name: 'Subnet name' })

  // add a subnet by selecting from a dropdown; make sure 'mock-subnet' is present in the dropdown,
  // even though VPC:'mock-subnet' has already been added
  await selectOption(page, 'Target type', 'VPC subnet')
  await selectOption(page, subnetNameField, 'mock-subnet')
  await addButton.click()
  await expectRowVisible(targets, { Type: 'subnet', Value: 'mock-subnet' })

  // now add a subnet by entering text
  await selectOption(page, 'Target type', 'VPC subnet')
  await subnetNameField.fill('abc')
  await page.getByText('abc').click()
  await addButton.click()
  await expectRowVisible(targets, { Type: 'subnet', Value: 'abc' })

  // add IP target
  await selectOption(page, 'Target type', 'IP')
  await page.getByRole('textbox', { name: 'IP address' }).fill('192.168.0.1')
  await addButton.click()
  await expectRowVisible(targets, { Type: 'ip', Value: '192.168.0.1' })

  // test table row delete; only keep the IP one
  // we start with 6 rows, because the header row counts as one
  await expect(targets.getByRole('row')).toHaveCount(6)
  await deleteRowAndVerifyRowCount(targets, 5)
  await deleteRowAndVerifyRowCount(targets, 4)
  await deleteRowAndVerifyRowCount(targets, 3)
  await deleteRowAndVerifyRowCount(targets, 2)

  // we still have the IP target
  await expectRowVisible(targets, { Type: 'ip', Value: '192.168.0.1' })
})

test('firewall rule form target validation', async ({ page }) => {
  await page.goto('/projects/mock-project/vpcs/mock-vpc/firewall-rules-new')

  const addButton = page.getByRole('button', { name: 'Add target' })
  const targets = page.getByRole('table', { name: 'Targets' })

  const formModal = page.getByRole('dialog', { name: 'Add firewall rule' })
  const nameError = formModal.getByText('Must end with a letter or number')

  // Enter invalid VPC name
  const vpcNameField = page.getByRole('combobox', { name: 'VPC name' }).first()
  await vpcNameField.fill('ab-')
  await vpcNameField.press('Enter')
  await addButton.click()
  await expect(nameError).toBeVisible()

  // Change to IP, error should disappear and value field should be empty
  await selectOption(page, 'Target type', 'IP')
  await expect(nameError).toBeHidden()
  const ipField = page.getByRole('textbox', { name: 'IP address' })
  await expect(ipField).toHaveValue('')

  // Type '1', error should not appear immediately (back to validating onSubmit)
  await ipField.fill('1')
  const ipError = formModal.getByText('Not a valid IP address')
  await expect(ipError).toBeHidden()
  await addButton.click()
  await expect(ipError).toBeVisible()

  // test clear button
  await page.getByRole('button', { name: 'Clear' }).first().click()
  await expect(ipField).toHaveValue('')

  // Change back to VPC, enter valid value
  await selectOption(page, 'Target type', 'VPC')
  await expect(ipError).toBeHidden()
  await expect(nameError).toBeHidden()
  await vpcNameField.fill('abc')
  await page.getByText('abc').click()
  await addButton.click()
  await expectRowVisible(targets, { Type: 'vpc', Value: 'abc' })

  // Switch to IP again
  await selectOption(page, 'Target type', 'IP')
  await ipField.fill('1')

  // No error means we're back to validating on submit
  await expect(ipError).toBeHidden()

  // Hit submit to get error
  await addButton.click()
  await expect(ipError).toBeVisible()

  // Fill out valid IP and submit
  await ipField.fill('1.1.1.1')
  await addButton.click()
  await expect(ipError).toBeHidden()
  await expectRowVisible(targets, { Type: 'ip', Value: '1.1.1.1' })
})

// This test may appear redundant because host and target share their logic, but
// testing them separately is still valuable because we want to make sure we're
// hooking up the shared code correctly and we don't break them if we refactor
// that code.

test('firewall rule form host validation', async ({ page }) => {
  await page.goto('/projects/mock-project/vpcs/mock-vpc/firewall-rules-new')

  const addButton = page.getByRole('button', { name: 'Add host filter' })
  const hosts = page.getByRole('table', { name: 'Host filters' })

  const formModal = page.getByRole('dialog', { name: 'Add firewall rule' })
  const nameError = formModal.getByText('Must end with a letter or number')

  // Enter invalid VPC name
  const vpcNameField = page.getByRole('combobox', { name: 'VPC name' }).nth(1)
  await vpcNameField.fill('ab-')
  await vpcNameField.press('Enter')
  await addButton.click()
  await expect(nameError).toBeVisible()

  // Change to IP, error should disappear and value field should be empty
  await selectOption(page, 'Host type', 'IP')
  await expect(nameError).toBeHidden()
  const ipField = page.getByRole('textbox', { name: 'IP address' })
  await expect(ipField).toHaveValue('')

  // Type '1', error should not appear immediately (back to validating onSubmit)
  await ipField.fill('1')
  const ipError = formModal.getByText('Not a valid IP address')
  await expect(ipError).toBeHidden()
  await addButton.click()
  await expect(ipError).toBeVisible()

  // test clear button
  await page.getByRole('button', { name: 'Clear' }).nth(2).click()
  await expect(ipField).toHaveValue('')

  // Change back to VPC, enter valid value
  await selectOption(page, 'Host type', 'VPC')
  await expect(ipError).toBeHidden()
  await expect(nameError).toBeHidden()
  await vpcNameField.fill('abc')
  await page.getByText('abc').click()
  await addButton.click()
  await expectRowVisible(hosts, { Type: 'vpc', Value: 'abc' })

  // use subnet to be slightly different from the target validation test

  // Switch to IP subnet
  await selectOption(page, 'Host type', 'IP subnet')
  const ipSubnetField = page.getByRole('textbox', { name: 'IP network' })
  await ipSubnetField.fill('1')

  // No error means we're back to validating on submit
  const ipNetError = formModal.getByText(
    'Must contain an IP address and a width, separated by a /'
  )
  await expect(ipNetError).toBeHidden()

  // Hit submit to get error
  await addButton.click()
  await expect(ipNetError).toBeVisible()

  // Fill out valid IP and submit
  await ipSubnetField.fill('1.1.1.1/1')
  await addButton.click()
  await expect(ipNetError).toBeHidden()
  await expectRowVisible(hosts, { Type: 'ip_net', Value: '1.1.1.1/1' })
})

test('firewall rule form hosts table', async ({ page }) => {
  await page.goto('/projects/mock-project/vpcs/mock-vpc')
  await page.getByRole('tab', { name: 'Firewall Rules' }).click()

  // open modal
  await page.getByRole('link', { name: 'New rule' }).click()

  const hosts = page.getByRole('table', { name: 'Host filters' })
  const hostFiltersVpcNameField = page.getByRole('combobox', { name: 'VPC name' }).nth(1)
  const addButton = page.getByRole('button', { name: 'Add host filter' })

  // add hosts with overlapping names and types to test delete

  await hostFiltersVpcNameField.fill('abc')
  await hostFiltersVpcNameField.press('Enter')
  await addButton.click()
  await expectRowVisible(hosts, { Type: 'vpc', Value: 'abc' })

  await hostFiltersVpcNameField.fill('def')
  await hostFiltersVpcNameField.press('Enter')
  await addButton.click()
  await expectRowVisible(hosts, { Type: 'vpc', Value: 'def' })

  await selectOption(page, 'Host type', 'VPC subnet')
  await selectOption(page, 'Subnet name', 'mock-subnet')
  await addButton.click()
  await expectRowVisible(hosts, { Type: 'subnet', Value: 'mock-subnet' })

  await selectOption(page, 'Host type', 'VPC subnet')
  await page.getByRole('combobox', { name: 'Subnet name' }).fill('abc')
  await page.getByRole('combobox', { name: 'Subnet name' }).press('Enter')
  await addButton.click()
  await expectRowVisible(hosts, { Type: 'subnet', Value: 'abc' })

  await selectOption(page, 'Host type', 'IP')
  await page.getByRole('textbox', { name: 'IP address' }).fill('192.168.0.1')
  await addButton.click()
  await expectRowVisible(hosts, { Type: 'ip', Value: '192.168.0.1' })

  // test table row delete; only keep the IP one
  await expect(hosts.getByRole('row')).toHaveCount(6)
  await deleteRowAndVerifyRowCount(hosts, 5)
  await deleteRowAndVerifyRowCount(hosts, 4)
  await deleteRowAndVerifyRowCount(hosts, 3)
  await deleteRowAndVerifyRowCount(hosts, 2)

  // we still have the IP target
  await expectRowVisible(hosts, { Type: 'ip', Value: '192.168.0.1' })
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

  // protocol is populated
  await expect(page.locator('label >> text=ICMP')).toBeChecked()
  await expect(page.locator('label >> text=TCP')).not.toBeChecked()
  await expect(page.locator('label >> text=UDP')).not.toBeChecked()

  // targets default vpc
  // screen.getByRole('cell', { name: 'vpc' })
  // screen.getByRole('cell', { name: 'default' })

  // update name
  await page.getByRole('textbox', { name: 'Name' }).fill('new-rule-name')

  // add host filter
  await selectOption(page, 'Host type', 'VPC subnet')
  await page.getByRole('combobox', { name: 'Subnet name' }).fill('edit-filter-subnet')
  await page.getByText('edit-filter-subnet').click()
  await page.getByRole('button', { name: 'Add host filter' }).click()

  // new host is added to hosts table
  const hosts = page.getByRole('table', { name: 'Host filters' })
  await expectRowVisible(hosts, { Type: 'subnet', Value: 'edit-filter-subnet' })

  // submit the form
  await page.getByRole('button', { name: 'Update rule' }).click()

  // modal closes again
  await expect(modal).toBeHidden()

  // table refetches and now includes the updated rule name, not the old name
  await expect(newNameCell).toBeVisible()
  await expect(oldNameCell).toBeHidden()

  await expect(rows).toHaveCount(3)

  // new target shows up in target cell
  await expect(page.locator('text=subnetedit-filter-subnetICMP')).toBeVisible()

  // other 3 rules are still there
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

  await expect(modal.getByRole('checkbox', { name: 'TCP' })).not.toBeChecked()
  await expect(modal.getByRole('checkbox', { name: 'UDP' })).not.toBeChecked()
  await expect(modal.getByRole('checkbox', { name: 'ICMP' })).toBeChecked()

  // no port filters
  const portFilters = modal.getByRole('table', { name: 'Port filters' })
  await expect(portFilters).toBeHidden()

  const targets = modal.getByRole('table', { name: 'Targets' })
  await expect(targets.getByRole('row', { name: 'Name: default, Type: vpc' })).toBeVisible()

  // close the modal
  await page.keyboard.press('Escape')
  await expect(modal).toBeHidden()

  // do it again with a different rule
  await clickRowAction(page, 'allow-ssh', 'Clone')

  await expect(modal).toBeVisible()
  await expect(modal.getByRole('textbox', { name: 'Name', exact: true })).toHaveValue(
    'allow-ssh-copy'
  )

  await expect(portFilters.getByRole('cell', { name: '22', exact: true })).toBeVisible()

  await expect(modal.getByRole('checkbox', { name: 'TCP' })).toBeChecked()
  await expect(modal.getByRole('checkbox', { name: 'UDP' })).not.toBeChecked()
  await expect(modal.getByRole('checkbox', { name: 'ICMP' })).not.toBeChecked()

  await expect(targets.getByRole('row', { name: 'Name: default, Type: vpc' })).toBeVisible()
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
  await page.goto('/projects/mock-project/vpcs/mock-vpc/firewall-rules/allow-icmp/edit')

  // changing the name to one taken by another rule is an error
  const nameField = page.getByRole('textbox', { name: 'Name', exact: true })
  await nameField.fill('allow-ssh')

  const error = page.getByText('Name taken').first()
  await expect(error).toBeHidden()

  await page.getByRole('button', { name: 'Update rule' }).click()
  await expect(error).toBeVisible()

  // change name back
  await nameField.fill('allow-icmp')

  // changing a value _without_ changing the name is allowed
  await page.getByRole('textbox', { name: 'Priority' }).fill('37')
  await page.getByRole('button', { name: 'Update rule' }).click()
  await expect(error).toBeHidden()
  await expectRowVisible(page.getByRole('table'), { Name: 'allow-icmp', Priority: '37' })

  // changing the name to a non-conflicting name is allowed
  await page.getByRole('link', { name: 'allow-icmp' }).click()
  await nameField.fill('allow-icmp2')
  await page.getByRole('button', { name: 'Update rule' }).click()
  await expectRowVisible(page.getByRole('table'), { Name: 'allow-icmp2', Priority: '37' })
})
