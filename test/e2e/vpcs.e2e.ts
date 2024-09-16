/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from '@playwright/test'

import { clickRowAction, expectRowVisible, selectOption } from './utils'

test('can nav to VpcPage from /', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('table').getByRole('link', { name: 'mock-project' }).click()
  await page.getByRole('link', { name: 'VPCs' }).click()

  await expectRowVisible(page.getByRole('table'), {
    name: 'mock-vpc',
    'DNS name': 'mock-vpc',
    description: 'a fake vpc',
    'Firewall Rules': '3',
  })

  // click the vpc name cell to go there
  await page.getByRole('link', { name: 'mock-vpc' }).click()

  await expect(page.getByRole('heading', { name: 'mock-vpc' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Firewall rules' })).toBeVisible()
  await expect(page.getByRole('cell', { name: 'allow-icmp' })).toBeVisible()
  await expect(page).toHaveURL('/projects/mock-project/vpcs/mock-vpc/firewall-rules')
  await expect(page).toHaveTitle(
    'Firewall Rules / mock-vpc / VPCs / mock-project / Oxide Console'
  )

  // we can also click the firewall rules cell to get to the VPC detail
  await page.goBack()
  await expect(page.getByRole('heading', { name: 'mock-vpc' })).toBeHidden()
  await expect(page.getByRole('cell', { name: 'allow-icmp' })).toBeHidden()
  await page.getByRole('link', { name: '3' }).click()
  await expect(page.getByRole('heading', { name: 'mock-vpc' })).toBeVisible()
  await expect(page.getByRole('cell', { name: 'allow-icmp' })).toBeVisible()
})

test('can edit VPC', async ({ page }) => {
  // update the VPC name, starting from the VPCs list page
  await page.goto('/projects/mock-project/vpcs')
  await expectRowVisible(page.getByRole('table'), { name: 'mock-vpc' })
  await clickRowAction(page, 'mock-vpc', 'Edit')
  await expect(page).toHaveURL('/projects/mock-project/vpcs/mock-vpc/edit')
  await page.getByRole('textbox', { name: 'Name' }).first().fill('mock-vpc-2')
  await page.getByRole('button', { name: 'Update VPC' }).click()
  await expect(page).toHaveURL('/projects/mock-project/vpcs/mock-vpc-2/firewall-rules')
  await expect(page.getByRole('heading', { name: 'mock-vpc-2' })).toBeVisible()

  // now update the VPC description, starting from the VPC view page
  await page.getByRole('button', { name: 'VPC actions' }).click()
  await page.getByRole('menuitem', { name: 'Edit' }).click()
  await expect(page).toHaveURL('/projects/mock-project/vpcs/mock-vpc-2/edit')
  await page.getByRole('textbox', { name: 'Description' }).fill('updated description')
  await page.getByRole('button', { name: 'Update VPC' }).click()
  await expect(page).toHaveURL('/projects/mock-project/vpcs/mock-vpc-2/firewall-rules')
  await expect(page.getByText('descriptionupdated description')).toBeVisible()

  // go to the VPCs list page and verify the name and description change
  await page.getByRole('link', { name: 'VPCs' }).click()
  await expect(page.getByRole('table').locator('tbody >> tr')).toHaveCount(1)
  await expectRowVisible(page.getByRole('table'), {
    name: 'mock-vpc-2',
    'DNS name': 'mock-vpc',
    description: 'updated description',
  })
})

test('can create and delete subnet', async ({ page }) => {
  await page.goto('/projects/mock-project/vpcs/mock-vpc')
  await page.getByRole('tab', { name: 'Subnets' }).click()
  // only one row in table, the default mock-subnet
  const table = page.getByRole('table')
  const rows = page.getByRole('table').getByRole('row')
  await expect(rows).toHaveCount(2)

  await expectRowVisible(table, {
    name: 'mock-subnet',
    'Custom Router': '—',
    'IP Block': expect.stringContaining('10.1.1.1/24'),
  })

  // open modal, fill out form, submit
  await page.getByRole('link', { name: 'New subnet' }).click()

  const dialog = page.getByRole('dialog', { name: 'Create subnet' })
  await expect(dialog).toBeVisible()

  await dialog.getByRole('textbox', { name: 'Name' }).fill('mock-subnet-2')
  await dialog.getByRole('textbox', { name: 'IPv4 block' }).fill('10.1.1.2/24')

  // little hack to catch a bug where we weren't handling empty input here properly
  await dialog.getByRole('textbox', { name: 'IPv6 block' }).fill('abc')
  await dialog.getByRole('textbox', { name: 'IPv6 block' }).clear()

  await dialog.getByRole('button', { name: 'Create subnet' }).click()

  await expect(dialog).toBeHidden()
  await expect(rows).toHaveCount(3)

  await expectRowVisible(table, {
    name: 'mock-subnet',
    'Custom Router': '—',
    'IP Block': expect.stringContaining('10.1.1.1/24'),
  })
  await expectRowVisible(table, {
    name: 'mock-subnet-2',
    'Custom Router': '—',
    'IP Block': expect.stringContaining('10.1.1.2/24'),
  })

  // click more button on row to get menu, then click Delete
  await clickRowAction(page, 'mock-subnet-2', 'Delete')
  await page.getByRole('button', { name: 'Confirm' }).click()

  await expect(rows).toHaveCount(2)
})

test('can create and update subnets with a custom router', async ({ page }) => {
  await page.goto('/projects/mock-project/vpcs/mock-vpc/subnets')
  await page.getByRole('link', { name: 'New subnet' }).click()

  const table = page.getByRole('table')
  const rows = table.getByRole('row')
  await expect(rows).toHaveCount(2)
  await expectRowVisible(table, {
    name: 'mock-subnet',
    'Custom Router': '—',
    'IP Block': expect.stringContaining('10.1.1.1/24'),
  })

  const dialog = page.getByRole('dialog', { name: 'Create subnet' })
  await expect(dialog).toBeVisible()

  await page.getByRole('textbox', { name: 'Name' }).fill('mock-subnet-2')
  await page.getByRole('textbox', { name: 'IPv4 block' }).fill('10.1.1.2/24')

  await page.getByRole('button', { name: 'Custom router' }).click()
  await page.getByRole('option', { name: 'mock-custom-router' }).click()

  await page.getByRole('button', { name: 'Create subnet' }).click()
  await expect(dialog).toBeHidden()

  await expect(rows).toHaveCount(3)
  await expectRowVisible(table, {
    name: 'mock-subnet-2',
    'Custom Router': 'mock-custom-router',
    'IP Block': expect.stringContaining('10.1.1.2/24'),
  })

  // now remove the router
  await page.getByRole('link', { name: 'mock-subnet-2' }).click()
  await page.getByRole('button', { name: 'Custom router' }).click()
  await page.getByRole('option', { name: 'None' }).click()
  await page.getByRole('button', { name: 'Update subnet' }).click()
  await expect(dialog).toBeHidden()

  await expectRowVisible(table, {
    name: 'mock-subnet-2',
    'Custom Router': '—',
  })
})

test('can create, update, and delete Router', async ({ page }) => {
  // load the VPC page for mock-vpc, to the firewall-rules tab
  await page.goto('/projects/mock-project/vpcs/mock-vpc')
  await page.getByRole('tab', { name: 'Routers' }).click()

  // expect to see the list of routers, including mock-system-router and mock-custom-router
  const table = page.getByRole('table')
  const tbody = table.locator('tbody')
  const rows = tbody.locator('tr')
  await expect(rows).toHaveCount(2)
  await expectRowVisible(table, { name: 'mock-system-router' })
  await expectRowVisible(table, { name: 'mock-custom-router' })

  // delete mock-custom-router
  await clickRowAction(page, 'mock-custom-router', 'Delete')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(rows).toHaveCount(1)
  await expect(rows.getByText('mock-custom-router')).toBeHidden()

  // create a new router
  await page.click('text=New router')
  await page.fill('input[name=name]', 'mock-custom-router-2')
  await page.click('button:has-text("Create router")')
  await expect(rows).toHaveCount(2)
  await expectRowVisible(table, { name: 'mock-custom-router-2' })

  // click on mock-system-router to go to the router detail page
  await page.getByText('mock-system-router').click()
  await expect(page).toHaveURL(
    '/projects/mock-project/vpcs/mock-vpc/routers/mock-system-router'
  )
})

test('can’t create or delete Routes on system routers', async ({ page }) => {
  // load the router
  await page.goto('/projects/mock-project/vpcs/mock-vpc/routers/mock-system-router')

  // verify that the "new route" link isn't present, since users can't add routes to system routers
  await expect(page.getByRole('link', { name: 'New route' })).toBeHidden()

  // expect to see table of routes
  const table = page.getByRole('table')
  const routeRows = table.locator('tbody >> tr')
  await expect(routeRows).toHaveCount(3)
  await expectRowVisible(table, { Name: 'default' })
  await expectRowVisible(table, { Name: 'default-v4' })
  await expectRowVisible(table, { Name: 'default-v6' })
  await routeRows.first().getByRole('button', { name: 'Row actions' }).click()
  // can't delete default routes
  await expect(page.getByRole('menuitem', { name: 'Delete' })).toBeDisabled()
})

test('can create, update, and delete Route', async ({ page }) => {
  // go to the custom-router-2 page
  await page.goto('/projects/mock-project/vpcs/mock-vpc/routers/mock-custom-router')
  const table = page.getByRole('table')
  const routeRows = table.locator('tbody >> tr')
  await expectRowVisible(table, { Name: 'drop-local' })

  // create a new route
  await page.click('text=New route')
  await page.getByRole('textbox', { name: 'name' }).fill('new-route')
  await page.getByRole('textbox', { name: 'Destination value' }).fill('0.0.0.0')

  // we'll set the target in a second, but first verify that selecting internet gateway disables the value
  await page.getByRole('button', { name: 'Target type' }).click()
  await page.getByRole('option', { name: 'Internet gateway' }).click()
  await expect(page.getByRole('textbox', { name: 'Target value' })).toBeDisabled()
  await expect(page.getByRole('textbox', { name: 'Target value' })).toHaveValue('outbound')
  await page.getByRole('button', { name: 'Target type' }).click()
  await page.getByRole('option', { name: 'IP' }).click()
  await page.getByRole('textbox', { name: 'Target value' }).fill('1.1.1.1')
  await page.getByRole('button', { name: 'Create route' }).click()
  await expect(routeRows).toHaveCount(2)
  await expectRowVisible(table, {
    Name: 'new-route',
    Destination: 'IP0.0.0.0',
    Target: 'IP1.1.1.1',
  })

  // update the route by clicking the edit button
  await clickRowAction(page, 'new-route', 'Edit')
  // change the destination type to VPC subnet: `mock-subnet`
  await selectOption(page, 'Destination type', 'Subnet')
  await selectOption(page, 'Destination value', 'mock-subnet')
  await page.getByRole('textbox', { name: 'Target value' }).fill('0.0.0.1')
  await page.getByRole('button', { name: 'Update route' }).click()
  await expect(routeRows).toHaveCount(2)
  await expectRowVisible(table, {
    Name: 'new-route',
    Destination: 'VPC subnetmock-subnet',
    Target: 'IP0.0.0.1',
  })

  // delete the route
  await clickRowAction(page, 'new-route', 'Delete')
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(routeRows).toHaveCount(1)
  await expect(page.getByRole('row', { name: 'new-route' })).toBeHidden()
})
