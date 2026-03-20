/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import {
  clickRowAction,
  closeToast,
  expect,
  expectRowVisible,
  expectToast,
  selectOption,
  test,
} from './utils'

const externalSubnetsPage = '/projects/mock-project/external-subnets'

test('can navigate to external subnets via sidebar', async ({ page }) => {
  await page.goto('/projects/mock-project/instances')
  await page.getByRole('link', { name: 'External Subnets' }).click()
  await expect(page).toHaveURL(externalSubnetsPage)
  await expect(page.getByRole('heading', { name: 'External Subnets' })).toBeVisible()
})

test('displays seeded external subnets in table', async ({ page }) => {
  await page.goto(externalSubnetsPage)

  const table = page.getByRole('table')
  await expectRowVisible(table, {
    name: 'web-subnet',
    description: 'Subnet for web services',
    Subnet: '10.128.1.0/24',
  })
  await expectRowVisible(table, {
    name: 'db-subnet',
    description: 'Subnet for database tier',
    Subnet: '10.128.2.0/24',
    Instance: 'db1',
  })
  await expectRowVisible(table, {
    name: 'staging-subnet',
    description: 'Staging environment subnet',
    Subnet: '10.128.3.0/28',
  })
})

test('can create an external subnet with auto allocation', async ({ page }) => {
  await page.goto(externalSubnetsPage)
  await page.getByRole('link', { name: 'New External Subnet' }).click()

  await expect(page.getByRole('heading', { name: /Create external subnet/ })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Name' })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Description' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Create external subnet' })).toBeVisible()

  // Auto should be selected by default
  await expect(page.getByRole('radio', { name: 'Auto' })).toBeChecked()

  await page.getByRole('textbox', { name: 'Name' }).fill('my-new-subnet')
  await page.getByRole('textbox', { name: 'Description' }).fill('A test subnet')

  await page.getByRole('button', { name: 'Create external subnet' }).click()

  await expect(page).toHaveURL(externalSubnetsPage)
  await expectToast(page, 'External subnet my-new-subnet created')

  await expectRowVisible(page.getByRole('table'), {
    name: 'my-new-subnet',
    description: 'A test subnet',
  })
})

test('can create an external subnet with non-default pool', async ({ page }) => {
  await page.goto(externalSubnetsPage)
  await page.getByRole('link', { name: 'New External Subnet' }).click()

  await page.getByRole('textbox', { name: 'Name' }).fill('alt-pool-subnet')

  // Default pool should be preselected
  await expect(page.getByRole('button', { name: 'Subnet pool' })).toContainText(
    'default-v4-subnet-pool'
  )

  // Switch to the secondary pool
  await selectOption(
    page,
    'Subnet pool',
    page.getByRole('option', { name: 'secondary-v4-subnet-pool' })
  )

  await page.getByRole('button', { name: 'Create external subnet' }).click()

  await expect(page).toHaveURL(externalSubnetsPage)
  await expectToast(page, 'External subnet alt-pool-subnet created')

  await expectRowVisible(page.getByRole('table'), {
    name: 'alt-pool-subnet',
  })
})

test('can create an external subnet with explicit CIDR', async ({ page }) => {
  await page.goto(externalSubnetsPage)
  await page.getByRole('link', { name: 'New External Subnet' }).click()

  await page.getByRole('textbox', { name: 'Name' }).fill('explicit-subnet')
  await page.getByRole('textbox', { name: 'Description' }).fill('Explicit CIDR subnet')

  // Switch to explicit mode
  await page.getByRole('radio', { name: 'Explicit' }).click()

  // Prefix length and pool fields should be hidden, subnet CIDR should appear
  await expect(page.getByRole('textbox', { name: 'Prefix length' })).toBeHidden()
  await expect(page.getByRole('textbox', { name: 'Subnet CIDR' })).toBeVisible()

  await page.getByRole('textbox', { name: 'Subnet CIDR' }).fill('10.128.5.0/24')

  await page.getByRole('button', { name: 'Create external subnet' }).click()

  await expect(page).toHaveURL(externalSubnetsPage)
  await expectToast(page, 'External subnet explicit-subnet created')

  await expectRowVisible(page.getByRole('table'), {
    name: 'explicit-subnet',
    Subnet: '10.128.5.0/24',
  })
})

test('can update an external subnet', async ({ page }) => {
  await page.goto(externalSubnetsPage)
  await clickRowAction(page, 'web-subnet', 'Edit')

  await expect(page.getByRole('heading', { name: /Edit external subnet/ })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Name' })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Description' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Update external subnet' })).toBeVisible()

  // Read-only properties should be visible in the side modal
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByText('10.128.1.0/24')).toBeVisible()
  await expect(dialog.getByText('default-v4-subnet-pool')).toBeVisible()

  await page.getByRole('textbox', { name: 'Name' }).fill('renamed-subnet')
  await page.getByRole('textbox', { name: 'Description' }).fill('Updated description')
  await page.getByRole('button', { name: 'Update external subnet' }).click()

  await expect(page).toHaveURL(externalSubnetsPage)
  await expectToast(page, 'External subnet renamed-subnet updated')

  await expectRowVisible(page.getByRole('table'), {
    name: 'renamed-subnet',
    description: 'Updated description',
  })
})

test('can update just the description', async ({ page }) => {
  await page.goto(`${externalSubnetsPage}/web-subnet/edit`)

  await page.getByRole('textbox', { name: 'Description' }).fill('New description only')
  await page.getByRole('button', { name: 'Update external subnet' }).click()

  await expect(page).toHaveURL(externalSubnetsPage)
  await expectToast(page, 'External subnet web-subnet updated')

  await expectRowVisible(page.getByRole('table'), {
    name: 'web-subnet',
    description: 'New description only',
  })
})

test('can delete an unattached external subnet', async ({ page }) => {
  await page.goto(externalSubnetsPage)

  await clickRowAction(page, 'web-subnet', 'Delete')
  await expect(page.getByText('Are you sure you want to delete web-subnet?')).toBeVisible()
  await page.getByRole('button', { name: 'Confirm' }).click()

  await expectToast(page, 'External subnet web-subnet deleted')

  await expect(page.getByRole('cell', { name: 'web-subnet' })).toBeHidden()
})

test('cannot delete an attached external subnet', async ({ page }) => {
  await page.goto(externalSubnetsPage)

  // db-subnet is attached to db1, so delete should be disabled
  const actionsButton = page
    .getByRole('row', { name: 'db-subnet' })
    .getByRole('button', { name: 'Row actions' })
  await actionsButton.click()

  const deleteButton = page.getByRole('menuitem', { name: 'Delete' })
  await expect(deleteButton).toBeDisabled()
  await deleteButton.hover()
  await expect(page.getByText('must be detached')).toBeVisible()
})

test('can detach and reattach an external subnet from the list page', async ({ page }) => {
  await page.goto(externalSubnetsPage)

  // db-subnet is attached to db1
  await expectRowVisible(page.getByRole('table'), {
    name: 'db-subnet',
    Instance: 'db1',
  })

  // Detach it
  await clickRowAction(page, 'db-subnet', 'Detach')
  await expect(page.getByText('Are you sure you want to detach')).toBeVisible()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectToast(page, 'External subnet db-subnet detached')

  // After detaching, the instance cell should no longer show db1
  await expect(page.getByRole('dialog')).toBeHidden()

  // Now reattach it via the Attach action
  await clickRowAction(page, 'db-subnet', 'Attach')
  await expect(page.getByRole('heading', { name: 'Attach external subnet' })).toBeVisible()
  await page.getByLabel('Instance').click()
  await page.getByRole('option', { name: 'db1' }).click()
  await page.getByRole('button', { name: 'Attach' }).click()

  await expect(page.getByRole('dialog')).toBeHidden()
  await expectToast(page, 'External subnet db-subnet attached')

  await expectRowVisible(page.getByRole('table'), {
    name: 'db-subnet',
    Instance: 'db1',
  })
})

test('Instance networking tab — shows attached external subnets', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1/networking')

  const subnetTable = page.getByRole('table', { name: 'External Subnets' })
  await expectRowVisible(subnetTable, {
    name: 'db-subnet',
    Subnet: '10.128.2.0/24',
  })

  // Unattached subnets should not appear
  await expect(subnetTable.getByRole('cell', { name: 'web-subnet' })).toBeHidden()
  await expect(subnetTable.getByRole('cell', { name: 'staging-subnet' })).toBeHidden()
})

test('Instance networking tab — detach external subnet', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1/networking')

  const subnetTable = page.getByRole('table', { name: 'External Subnets' })
  await expectRowVisible(subnetTable, { name: 'db-subnet' })

  await clickRowAction(page, 'db-subnet', 'Detach')
  await expect(page.getByText('Are you sure you want to detach')).toBeVisible()
  await page.getByRole('button', { name: 'Confirm' }).click()

  await expectToast(page, 'External subnet db-subnet detached')

  await expect(subnetTable.getByRole('cell', { name: 'db-subnet' })).toBeHidden()
})

test('Instance networking tab — attach external subnet', async ({ page }) => {
  await page.goto('/projects/mock-project/instances/db1/networking')

  const attachButton = page.getByRole('button', { name: 'Attach external subnet' })
  await expect(attachButton).toBeEnabled()

  await attachButton.click()
  await expect(page.getByRole('heading', { name: 'Attach external subnet' })).toBeVisible()

  // Select web-subnet (unattached)
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: 'External subnet', exact: true }).click()
  await page.getByRole('option', { name: /web-subnet/ }).click()
  await dialog.getByRole('button', { name: 'Attach' }).click()

  await expect(page.getByRole('dialog')).toBeHidden()
  await expectToast(page, 'External subnet web-subnet attached')

  const subnetTable = page.getByRole('table', { name: 'External Subnets' })
  await expectRowVisible(subnetTable, {
    name: 'web-subnet',
    Subnet: '10.128.1.0/24',
  })
})

test('Instance networking tab — attach button disabled when no available subnets', async ({
  page,
}) => {
  await page.goto('/projects/mock-project/instances/db1/networking')

  // Attach both unattached subnets to exhaust the pool
  const attachButton = page.getByRole('button', { name: 'Attach external subnet' })

  // Attach web-subnet
  await attachButton.click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: 'External subnet', exact: true }).click()
  await page.getByRole('option', { name: /web-subnet/ }).click()
  await dialog.getByRole('button', { name: 'Attach' }).click()
  await expect(dialog).toBeHidden()
  await closeToast(page)

  // Attach staging-subnet
  await attachButton.click()
  await dialog.getByRole('button', { name: 'External subnet', exact: true }).click()
  await page.getByRole('option', { name: /staging-subnet/ }).click()
  await dialog.getByRole('button', { name: 'Attach' }).click()
  await expect(dialog).toBeHidden()
  await closeToast(page)

  // Now all subnets are attached, so the button should be disabled
  await expect(attachButton).toBeDisabled()
})

test('edit form shows resolved subnet pool and instance names', async ({ page }) => {
  // db-subnet is attached to db1
  await page.goto(`${externalSubnetsPage}/db-subnet/edit`)

  await expect(page.getByRole('heading', { name: /Edit external subnet/i })).toBeVisible()

  const dialog = page.getByRole('dialog')
  await expect(dialog.getByText('10.128.2.0/24')).toBeVisible()
  await expect(dialog.getByText('default-v4-subnet-pool')).toBeVisible()
  await expect(dialog.getByRole('link', { name: 'db1' })).toBeVisible()

  await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue('db-subnet')
})

test('edit form works via direct URL for unattached subnet', async ({ page }) => {
  await page.goto(`${externalSubnetsPage}/web-subnet/edit`)

  const dialog = page.getByRole('dialog')
  await expect(dialog.getByText('10.128.1.0/24')).toBeVisible()
  await expect(dialog.getByText('default-v4-subnet-pool')).toBeVisible()

  await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue('web-subnet')
})

test('create form validates explicit subnet CIDR', async ({ page }) => {
  await page.goto(`${externalSubnetsPage}-new`)

  await page.getByRole('textbox', { name: 'Name' }).fill('bad-cidr-subnet')
  await page.getByRole('radio', { name: 'Explicit' }).click()

  const dialog = page.getByRole('dialog')
  const subnetField = page.getByRole('textbox', { name: 'Subnet CIDR' })
  const submitButton = page.getByRole('button', { name: 'Create external subnet' })
  const cidrError = dialog.getByText(
    'Must contain an IP address and a width, separated by a /'
  )

  // Invalid CIDR shows error on submit
  await subnetField.fill('not-a-cidr')
  await submitButton.click()
  await expect(cidrError).toBeVisible()

  // Valid CIDR clears the error and submits successfully
  await subnetField.fill('10.128.6.0/24')
  await submitButton.click()
  await expect(cidrError).toBeHidden()
  await expectToast(page, 'External subnet bad-cidr-subnet created')
})

test('create form prefix length max changes with pool IP version', async ({ page }) => {
  await page.goto(`${externalSubnetsPage}-new`)

  await expect(page.getByText('Max is 32 for IPv4 pools, 128 for IPv6.')).toBeVisible()

  const prefixLen = page.getByRole('textbox', { name: 'Prefix length' })
  const v6Pool = page.getByRole('option', { name: 'ipv6-subnet-pool' })
  const v4Pool = page.getByRole('option', { name: 'default-v4-subnet-pool' })

  // With v4 pool selected, typing 64 should be clamped to 32
  await prefixLen.fill('64')
  await prefixLen.blur()
  await expect(prefixLen).toHaveValue('32')

  // Switch to v6 pool — 64 should now be accepted
  await selectOption(page, 'Subnet pool', v6Pool)
  await prefixLen.fill('64')
  await prefixLen.blur()
  await expect(prefixLen).toHaveValue('64')

  // Switch back to v4 — value should clamp back to 32
  await selectOption(page, 'Subnet pool', v4Pool)
  await expect(prefixLen).toHaveValue('32')
})

test('create form toggles between auto and explicit fields', async ({ page }) => {
  await page.goto(`${externalSubnetsPage}-new`)

  // Auto mode: prefix length visible, subnet CIDR hidden
  await expect(page.getByRole('radio', { name: 'Auto' })).toBeChecked()
  await expect(page.getByRole('textbox', { name: 'Prefix length' })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Subnet CIDR' })).toBeHidden()

  // Switch to explicit
  await page.getByRole('radio', { name: 'Explicit' }).click()
  await expect(page.getByRole('textbox', { name: 'Prefix length' })).toBeHidden()
  await expect(page.getByRole('textbox', { name: 'Subnet CIDR' })).toBeVisible()

  // Switch back to auto
  await page.getByRole('radio', { name: 'Auto' }).click()
  await expect(page.getByRole('textbox', { name: 'Prefix length' })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Subnet CIDR' })).toBeHidden()
})
