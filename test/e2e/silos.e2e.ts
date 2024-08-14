/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test } from '@playwright/test'

import { MiB } from '~/util/units'

import {
  chooseFile,
  clickRowAction,
  expectNotVisible,
  expectRowVisible,
  expectVisible,
} from './utils'

test('Create silo', async ({ page }) => {
  await page.goto('/system/silos')

  await expectVisible(page, ['role=heading[name*="Silos"]'])
  const table = page.locator('role=table')
  await expectRowVisible(table, {
    name: 'maze-war',
    'Identity mode': 'saml jit',
    // not easy to assert this until we can calculate accessible name instead of text content
    // discoverable: 'true',
  })
  await expect(page.getByText('Feb 28, 202312:00 AM')).toBeVisible()

  await page.click('role=link[name="New silo"]')

  // fill out form
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('other-silo')
  await page.getByRole('textbox', { name: 'Description' }).fill('definitely a silo')
  const discoverable = page.getByRole('checkbox', { name: 'Discoverable' })
  await expect(discoverable).toBeChecked()
  await discoverable.click()
  await expect(page.getByRole('textbox', { name: 'Admin group name' })).toBeVisible()
  await page.getByRole('textbox', { name: 'Admin group name' }).fill('admins')
  await page.getByRole('checkbox', { name: 'Grant fleet admin' }).click()
  await expect(page.getByRole('textbox', { name: 'Admin group name' })).toHaveValue(
    'admins'
  )
  await expect(page.getByRole('checkbox', { name: 'Grant fleet admin' })).toBeChecked()
  await page.getByRole('radio', { name: 'Local only' }).click()
  await expect(page.getByRole('textbox', { name: 'Admin group name' })).toBeHidden()
  await page.getByRole('radio', { name: 'SAML' }).click()
  await expect(page.getByRole('textbox', { name: 'Admin group name' })).toHaveValue('')
  await expect(page.getByRole('checkbox', { name: 'Grant fleet admin' })).toBeChecked()
  await page.getByRole('textbox', { name: 'Admin group name' }).fill('admins')
  await page.getByRole('textbox', { name: 'CPU quota' }).fill('30')
  await page.getByRole('textbox', { name: 'Memory quota' }).fill('58')
  await page.getByRole('textbox', { name: 'Storage quota' }).fill('735')

  // Add a TLS cert
  const openCertModalButton = page.getByRole('button', { name: 'Add TLS certificate' })
  await openCertModalButton.click()

  const certDialog = page.getByRole('dialog', { name: 'Add TLS certificate' })

  const certRequired = certDialog.getByText('Cert is required')
  const keyRequired = certDialog.getByText('Key is required')
  const nameRequired = certDialog.getByText('Name is required')
  await expectNotVisible(page, [certRequired, keyRequired, nameRequired])

  const certSubmit = page.getByRole('button', { name: 'Add Certificate' })
  await certSubmit.click()

  // Validation error for missing name + key and cert files
  await expectVisible(page, [certRequired, keyRequired, nameRequired])

  await chooseFile(page, page.getByLabel('Cert', { exact: true }), 0.1 * MiB)
  await chooseFile(page, page.getByLabel('Key'), 0.1 * MiB)
  const certName = certDialog.getByRole('textbox', { name: 'Name' })
  await certName.fill('test-cert')

  await certSubmit.click()

  // Check cert appears in the mini-table
  const certCell = page.getByRole('cell', { name: 'test-cert', exact: true })
  await expect(certCell).toBeVisible()

  // check unique name validation
  await openCertModalButton.click()
  await certName.fill('test-cert')
  await certSubmit.click()
  await expect(
    certDialog.getByText('A certificate with this name already exists')
  ).toBeVisible()

  // Change the name so it's unique
  await certName.fill('test-cert-2')
  await chooseFile(page, page.getByLabel('Cert', { exact: true }), 0.1 * MiB)
  await chooseFile(page, page.getByLabel('Key'), 0.1 * MiB)
  await certSubmit.click()
  await expect(page.getByRole('cell', { name: 'test-cert-2', exact: true })).toBeVisible()

  // now delete the first
  await page.getByRole('button', { name: 'remove cert test-cert', exact: true }).click()
  // Cert should not appear after it has been deleted
  await expect(certCell).toBeHidden()

  await page.click('role=button[name="Create silo"]')

  // it's there in the table
  await expectRowVisible(table, {
    name: 'other-silo',
    description: 'definitely a silo',
    'Identity mode': 'saml jit',
    // discoverable: 'false',
  })
  const otherSiloCell = page.getByRole('cell', { name: 'other-silo' })
  await expect(otherSiloCell).toBeVisible()

  // click into detail view and check the fleet role map
  await otherSiloCell.getByRole('link').click()
  await page.getByRole('tab', { name: 'Fleet roles' }).click()
  await expectVisible(page, [
    page.getByRole('heading', { name: 'other-silo' }),
    page.getByText('Silo adminFleet admin'),
  ])
  await expect(page.getByText('Silo viewerFleet viewer')).toBeHidden()

  await page.goBack()

  // now go check the quotas in its entry in the utilization table
  await page.getByRole('link', { name: 'Utilization' }).click()
  await expectRowVisible(page.getByRole('table'), {
    Silo: 'other-silo',
    CPU: '30',
    Memory: '58 GiB',
    Storage: '0.72 TiB',
  })

  await page.goBack()

  // now delete it
  await page.locator('role=button[name="Row actions"]').nth(2).click()
  await page.click('role=menuitem[name="Delete"]')
  await page.getByRole('button', { name: 'Confirm' }).click()

  await expect(otherSiloCell).toBeHidden()
})

test('Default silo', async ({ page }) => {
  await page.goto('/system/silos')
  await page.getByRole('link', { name: 'myriad' }).click()

  await expect(page.getByRole('heading', { name: 'myriad' })).toBeVisible()
  await page.getByRole('tab', { name: 'Fleet roles' }).click()

  await expect(
    page.getByText('Silo roles can automatically grant a fleet role.')
  ).toBeVisible()

  await expectNotVisible(page, [
    page.getByText('Silo adminFleet admin'),
    page.getByText('Silo viewerFleet viewer'),
  ])
})

test('Identity providers', async ({ page }) => {
  await page.goto('/system/silos/maze-war')

  await expectVisible(page, ['role=heading[name*=maze-war]'])

  await page.getByRole('link', { name: 'mock-idp' }).click()

  await expectVisible(page, [
    'role=dialog[name="Identity provider"]',
    'role=heading[name="mock-idp"]',
    // random stuff that's not in the table
    'text="Entity ID"',
    'text="Single Logout (SLO) URL"',
  ])

  await page.getByRole('button', { name: 'Cancel' }).click()
  await expectNotVisible(page, ['role=dialog[name="Identity provider"]'])
})

test('Silo IP pools', async ({ page }) => {
  await page.goto('/system/silos/maze-war?tab=ip-pools')

  const table = page.getByRole('table')
  await expectRowVisible(table, { name: 'ip-pool-1', Default: 'default' })
  await expectRowVisible(table, { name: 'ip-pool-2', Default: '' })
  await expect(table.getByRole('row')).toHaveCount(3) // header + 2

  // clicking on pool goes to pool detail
  await page.getByRole('link', { name: 'ip-pool-1' }).click()
  await expect(page).toHaveURL('/system/networking/ip-pools/ip-pool-1')
  await page.goBack()

  // make default
  await clickRowAction(page, 'ip-pool-2', 'Make default')
  await expect(
    page
      .getByRole('dialog', { name: 'Confirm change default' })
      .getByText(
        'Are you sure you want to change the default pool from ip-pool-1 to ip-pool-2?'
      )
  ).toBeVisible()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectRowVisible(table, { name: 'ip-pool-1', Default: '' })
  await expectRowVisible(table, { name: 'ip-pool-2', Default: 'default' })

  // unlink
  await clickRowAction(page, 'ip-pool-1', 'Unlink')
  await expect(
    page
      .getByRole('dialog', { name: 'Confirm unlink pool' })
      .getByText('Are you sure you want to unlink ip-pool-1?')
  ).toBeVisible()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(page.getByRole('cell', { name: 'ip-pool-1' })).toBeHidden()
  await expectRowVisible(table, { name: 'ip-pool-2', Default: 'default' })

  // clear default
  await clickRowAction(page, 'ip-pool-2', 'Clear default')
  await expect(
    page
      .getByRole('dialog', { name: 'Confirm clear default' })
      .getByText('Are you sure you want ip-pool-2 to stop being the default')
  ).toBeVisible()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expectRowVisible(table, { name: 'ip-pool-2', Default: '' })
})

test('Silo IP pools link pool', async ({ page }) => {
  await page.goto('/system/silos/maze-war?tab=ip-pools')

  const table = page.getByRole('table')
  await expectRowVisible(table, { name: 'ip-pool-1', Default: 'default' })
  await expectRowVisible(table, { name: 'ip-pool-2', Default: '' })
  await expect(table.getByRole('row')).toHaveCount(3) // header + 2

  const modal = page.getByRole('dialog', { name: 'Link pool' })
  await expect(modal).toBeHidden()

  // open link modal
  await page.getByRole('button', { name: 'Link pool' }).click()
  await expect(modal).toBeVisible()

  // close modal works
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(modal).toBeHidden()

  // reopen
  await page.getByRole('button', { name: 'Link pool' }).click()
  await expect(modal).toBeVisible()

  // select silo in combobox and click link
  await page.getByPlaceholder('Select a pool').fill('ip-pool')
  await page.getByRole('option', { name: 'ip-pool-3' }).click()
  await modal.getByRole('button', { name: 'Link' }).click()

  // modal closes and we see the thing in the table
  await expect(modal).toBeHidden()
  await expectRowVisible(table, { name: 'ip-pool-3', Default: '' })
})

// just a convenient form to test this with because it's tall
test('form scrolls to name field on already exists error', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 400 })
  await page.goto('/system/silos-new')

  const nameField = page.getByRole('textbox', { name: 'Name', exact: true })
  await expect(nameField).toBeInViewport()

  await nameField.fill('maze-war')

  // scroll all the way down so the name field is not visible
  await page
    .getByTestId('sidemodal-scroll-container')
    .evaluate((el: HTMLElement, to) => el.scrollTo(0, to), 800)
  await expect(nameField).not.toBeInViewport()

  await page.getByRole('button', { name: 'Create silo' }).click()

  await expect(nameField).toBeInViewport()
  await expect(page.getByText('name already exists').nth(0)).toBeVisible()
})
