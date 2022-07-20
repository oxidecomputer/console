import { test } from '@playwright/test'

import { expectNotVisible, expectRowVisible, expectVisible } from 'app/util/e2e'

import { stopInstance } from './util'

test('Instance networking tab', async ({ page }) => {
  await page.goto('/orgs/maze-war/projects/mock-project/instances/db1')

  // Instance networking tab
  await page.click('role=tab[name="Networking"]')
  await expectRowVisible(page, 'my-nic', [
    '',
    'my-nic',
    'a network interface',
    '172.30.0.10',
    'mock-vpc',
    'mock-subnet',
    'primary',
  ])

  // Have to stop instance to edit NICs
  await stopInstance(page)

  await page.click('role=button[name="Add network interface"]')

  // Add network interface
  // TODO: modal title is not getting hooked up, IDs are wrong
  await expectVisible(page, [
    'role=heading[name="Add network interface"]',
    'role=textbox[name="Name"]',
    'role=textbox[name="Description"]',
    'role=button[name="VPC"]', // listbox
    'role=button[name="Subnet"]', // listbox
    'role=textbox[name="IP Address"]',
  ])

  await page.fill('role=textbox[name="Name"]', 'nic-2')
  await page.click('role=button[name="VPC"]')
  await page.click('role=option[name="mock-vpc"]')
  await page.click('role=button[name="Subnet"]')
  await page.click('role=option[name="mock-subnet"]')
  await page.click('role=button[name="Add network interface"]')
  await expectVisible(page, ['role=cell[name="nic-2"]'])

  // Make this interface primary
  await page
    .locator('role=row', { hasText: 'nic-2' })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Make primary"]')
  await expectRowVisible(page, 'my-nic', [
    '',
    'my-nic',
    'a network interface',
    '172.30.0.10',
    'mock-vpc',
    'mock-subnet',
    '',
  ])
  await expectRowVisible(page, 'nic-2', ['', 'nic-2', null, null, null, null, 'primary'])

  // Make an edit to the network interface
  await page
    .locator('role=row', { hasText: 'nic-2' })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Edit"]')
  await page.fill('role=textbox[name="Name"]', 'nic-3')
  await page.click('role=button[name="Save changes"]')
  await expectNotVisible(page, ['role=cell[name="nic-2"]'])
  await expectVisible(page, ['role=cell[name="nic-3"]'])

  // Delete just-added network interface
  await page
    .locator('role=row', { hasText: 'nic-3' })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Delete"]')
  // Close toast, it holds up the test for some reason
  await page.click('role=button[name="Dismiss notification"]')
  await expectNotVisible(page, ['role=cell[name="nic-3"]'])
})
