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
  expectVisible,
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
    'Attached to instance': 'db1',
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

  await expectVisible(page, [
    'role=heading[name*="Create external subnet"]',
    'role=textbox[name="Name"]',
    'role=textbox[name="Description"]',
    'role=button[name="Create external subnet"]',
  ])

  // Auto should be selected by default
  await expect(page.getByRole('radio', { name: 'Auto' })).toBeChecked()

  await page.fill('input[name=name]', 'my-new-subnet')
  await page.getByRole('textbox', { name: 'Description' }).fill('A test subnet')

  await page.getByRole('button', { name: 'Create external subnet' }).click()

  await expect(page).toHaveURL(externalSubnetsPage)
  await expectToast(page, 'External subnet my-new-subnet created')

  await expectRowVisible(page.getByRole('table'), {
    name: 'my-new-subnet',
    description: 'A test subnet',
  })
})

test('can create an external subnet with explicit CIDR', async ({ page }) => {
  await page.goto(externalSubnetsPage)
  await page.getByRole('link', { name: 'New External Subnet' }).click()

  await page.fill('input[name=name]', 'explicit-subnet')
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

  await expectVisible(page, [
    'role=heading[name*="Edit external subnet"]',
    'role=textbox[name="Name"]',
    'role=textbox[name="Description"]',
    'role=button[name="Update external subnet"]',
  ])

  // Read-only properties should be visible in the side modal
  const modal = page.getByTestId('sidemodal-scroll-container')
  await expect(modal.getByText('10.128.1.0/24')).toBeVisible()

  await page.fill('input[name=name]', 'renamed-subnet')
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
    'Attached to instance': 'db1',
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
    'Attached to instance': 'db1',
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

test('external subnet edit form accessible via direct URL', async ({ page }) => {
  await page.goto(`${externalSubnetsPage}/web-subnet/edit`)

  await expect(page.getByRole('heading', { name: /Edit external subnet/i })).toBeVisible()

  // Read-only properties should be present in the side modal
  const modal = page.getByTestId('sidemodal-scroll-container')
  await expect(modal.getByText('10.128.1.0/24')).toBeVisible()

  await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue('web-subnet')
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
