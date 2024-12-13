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
    'Firewall Rules / mock-vpc / VPCs / mock-project / Projects / Oxide Console'
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
  const breadcrumbs = page.getByRole('navigation', { name: 'Breadcrumbs' })
  await breadcrumbs.getByRole('link', { name: 'VPCs' }).click()
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

test('create router route', async ({ page }) => {
  await page.goto('/projects/mock-project/vpcs/mock-vpc/routers/mock-custom-router')

  // Selectors
  const form = page.getByRole('dialog', { name: 'Create route' })
  const nameInput = page.getByRole('textbox', { name: 'Name' })
  const destinationValueInput = page.getByRole('textbox', { name: 'Destination value' })
  const targetValueInput = page.getByRole('textbox', { name: 'Target value' })
  const submitButton = page.getByRole('button', { name: 'Create route' })

  const invalidIpError = form.getByText('Not a valid IP address')
  const invalidIpNetError = form.getByText(
    'Must contain an IP address and a width, separated by a /'
  )

  // create a new route
  await page.getByRole('link', { name: 'New route' }).click()
  await nameInput.fill('new-route')

  // Test IP validation for destination
  await selectOption(page, 'Destination type', 'IP')
  await destinationValueInput.fill('invalid-ip')
  await expect(invalidIpError).toBeHidden()
  await submitButton.click()
  // other field was left empty, so is also invalid
  await expect(invalidIpError).toHaveCount(2)

  // change target to valid, error disappear
  await targetValueInput.fill('192.168.0.2')
  await expect(invalidIpError).toHaveCount(1)

  // Test IP net validation for destination
  await selectOption(page, 'Destination type', 'IP network')
  // error on dest value clears on type change
  await expect(invalidIpError).toBeHidden()
  await destinationValueInput.fill('invalid-ip-net')
  await expect(invalidIpError).toBeHidden()
  await submitButton.click()
  await expect(invalidIpNetError).toBeVisible()

  // revalidates on change
  await destinationValueInput.fill('192.168.0.0/24')
  await expect(invalidIpNetError).toBeHidden()

  // Set target
  await selectOption(page, 'Target type', 'IP')
  await targetValueInput.fill('10.0.0.1')

  await submitButton.click()
  await expect(form).toBeHidden()
  await expectRowVisible(page.getByRole('table'), {
    Name: 'new-route',
    Destination: 'IP network192.168.0.0/24',
    Target: 'IP10.0.0.1',
  })
})

test('edit and delete router route', async ({ page }) => {
  await page.goto('/projects/mock-project/vpcs/mock-vpc/routers/mock-custom-router')

  const table = page.getByRole('table')
  await expect(table.locator('tbody >> tr')).toHaveCount(2)

  const form = page.getByRole('dialog', { name: 'Edit route' })
  await expect(form).toBeHidden()

  await clickRowAction(page, 'drop-local', 'Edit')
  await expect(form).toBeVisible()

  const targetValueInput = page.getByRole('textbox', { name: 'Target value' })
  const submitButton = page.getByRole('button', { name: 'Update route' })

  await form.getByRole('textbox', { name: 'Name' }).fill('new-name')

  // Test IP validation for target
  await selectOption(page, 'Target type', 'IP')
  await targetValueInput.fill('invalid-ip')
  await submitButton.click()
  await expect(form.getByText('Not a valid IP address')).toBeVisible()

  await targetValueInput.fill('10.0.0.2')
  await expect(form.getByText('Not a valid IP address')).toBeHidden()

  // Change destination to subnet
  await selectOption(page, 'Destination type', 'Subnet')
  await selectOption(page, 'Destination value', 'mock-subnet')

  await submitButton.click()
  await expect(form).toBeHidden()

  await expectRowVisible(table, {
    Name: 'new-name',
    Destination: 'VPC subnetmock-subnet',
    Target: 'IP10.0.0.2',
  })

  // delete the route
  await clickRowAction(page, 'new-name', 'Delete')
  await page.getByRole('button', { name: 'Confirm' }).click()
  // expect 1 row in table
  await expect(table.locator('tbody >> tr')).toHaveCount(1)
})

test('can view internet gateways', async ({ page }) => {
  await page.goto('/projects/mock-project/vpcs/mock-vpc')
  await page.getByRole('tab', { name: 'Internet Gateways' }).click()

  const table = page.getByRole('table')
  const rows = table.locator('tbody >> tr')
  await expect(rows).toHaveCount(2)

  await expectRowVisible(table, {
    name: 'internet-gateway-1',
    description: 'internet gateway 1',
    'Attached IP Address': '123.4.56.3',
    'Attached IP Pool': 'ip-pool-1',
  })
  await expectRowVisible(table, {
    name: 'internet-gateway-2',
    description: 'internet gateway 2',
    'Attached IP Address': '—',
    'Attached IP Pool': 'ip-pool-2',
  })

  await page.getByRole('link', { name: 'internet-gateway-1' }).click()
  await expect(page).toHaveURL(
    '/projects/mock-project/vpcs/mock-vpc/internet-gateways/internet-gateway-1'
  )
  const sidemodal = page.getByLabel('Internet Gateway')

  await expect(sidemodal.getByText('123.4.56.3')).toBeVisible()

  // close the sidemodal
  await sidemodal.getByRole('button', { name: 'Close' }).click()
  await expect(sidemodal).toBeHidden()

  await page.getByRole('link', { name: 'internet-gateway-2' }).click()
  await expect(sidemodal.getByText('This internet gateway does not have any')).toBeVisible()
})

test('internet gateway shows proper list of routes targeting it', async ({ page }) => {
  // open up the internet gateway detail page for internet-gateway-1
  await page.goto(
    '/projects/mock-project/vpcs/mock-vpc/internet-gateways/internet-gateway-1'
  )
  // verify that it has a table with the row showing "mock-custom-router" and "dc2"
  const sidemodal = page.getByRole('dialog', { name: 'Internet Gateway' })
  const table = sidemodal.getByRole('table')
  await expectRowVisible(table, { Router: 'mock-custom-router', Route: 'dc2' })
  await expect(table.locator('tbody >> tr')).toHaveCount(1)

  // close the sidemodal
  await sidemodal.getByRole('button', { name: 'Close' }).click()
  await expect(sidemodal).toBeHidden()
  // check for the route count; which should be 1
  await expect(page.getByRole('link', { name: '1', exact: true })).toBeVisible()
  // go to the Routers tab
  await page.getByRole('tab', { name: 'Routers' }).click()
  // click on the mock-custom-router to go to the router detail page
  await page.getByRole('link', { name: 'mock-custom-router' }).click()
  // expect to be on the view page
  await expect(page).toHaveURL(
    '/projects/mock-project/vpcs/mock-vpc/routers/mock-custom-router'
  )

  await page.getByRole('link', { name: 'mock-custom-router' }).click()
  // create a new route
  await page.getByRole('link', { name: 'New route' }).click()
  await page.getByRole('textbox', { name: 'Name' }).fill('new-route')
  await page.getByRole('textbox', { name: 'Destination value' }).fill('1.2.3.4')
  await selectOption(page, 'Target type', 'Internet gateway')
  await selectOption(page, 'Target value', 'internet-gateway-1')
  await page.getByRole('button', { name: 'Create route' }).click()

  // go back to the mock-vpc page by clicking on the link in the header
  await page.getByRole('link', { name: 'mock-vpc' }).click()
  // click on the internet gateways tab and then the internet-gateway-1 link to go to the detail page
  await page.getByRole('tab', { name: 'Internet Gateways' }).click()
  // verify that the route count is now 2: click on the link to go to the edit gateway sidemodal
  await page.getByRole('link', { name: '2', exact: true }).click()

  // the new route should be visible in the table
  await expectRowVisible(table, { Router: 'mock-custom-router', Route: 'dc2' })
  await expectRowVisible(table, { Router: 'mock-custom-router', Route: 'new-route' })
  await expect(table.locator('tbody >> tr')).toHaveCount(2)

  // click on the new-route link to go to the detail page
  await sidemodal.getByRole('link', { name: 'new-route' }).click()
  // expect to be on the view page
  await expect(page).toHaveURL(
    '/projects/mock-project/vpcs/mock-vpc/routers/mock-custom-router/routes/new-route/edit'
  )
})
