/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { type Page, expect, test } from '@playwright/test'

import { MiB } from '@oxide/util'

import { expectNotVisible, expectRowVisible, expectVisible } from './utils'

async function chooseFile(fieldName: string, page: Page) {
  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByLabel(fieldName, { exact: true }).click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles({
    name: 'my-image.iso',
    mimeType: 'application/octet-stream',
    // fill with nonzero content, otherwise we'll skip the whole thing, which
    // makes the test too fast for playwright to catch anything
    buffer: Buffer.alloc(0.1 * MiB, 'a'),
  })
}

test('Silos page', async ({ page }) => {
  await page.goto('/system/silos')

  await expectVisible(page, ['role=heading[name*="Silos"]'])
  const table = page.locator('role=table')
  await expectRowVisible(table, {
    name: 'default-silo',
    'Identity mode': 'saml jit',
    // not easy to assert this until we can calculate accessible name instead of text content
    // discoverable: 'true',
  })

  await page.click('role=link[name="New silo"]')

  // fill out form and submit
  await page.fill('role=textbox[name="Name"]', 'other-silo')
  await page.fill('role=textbox[name="Description"]', 'definitely a silo')
  await expect(page.locator('role=checkbox[name="Discoverable"]')).toBeChecked()
  await page.click('role=checkbox[name="Discoverable"]')
  await page.click('role=radio[name="Local only"]')
  await page.fill('role=textbox[name="Admin group name"]', 'admins')
  await page.click('role=checkbox[name="Grant fleet admin role to silo admins"]')

  // Add a TLS cert
  await page.click('role=button[name="Add TLS certificate"]')

  const certRequired = 'role=dialog[name="Add TLS certificate"] >> text="Cert is required"'
  const keyRequired = 'role=dialog[name="Add TLS certificate"] >> text="Key is required"'
  await expectNotVisible(page, [certRequired, keyRequired])
  await page.click('role=button[name="Add Certificate"]')
  // Check that the modal cannot be submitted without cert and
  // key and that an error is displayed
  await expectVisible(page, [certRequired, keyRequired])

  await chooseFile('Cert', page)
  await chooseFile('Key', page)
  await page.fill(
    'role=dialog[name="Add TLS certificate"] >> role=textbox[name="Name"]',
    'test-cert'
  )

  await page.click('role=button[name="Add Certificate"]')

  // Check cert appears in the mini-table
  await expectVisible(page, ['role=cell[name="test-cert"]'])

  await page.click('role=button[name="remove test-cert"]')
  // Cert should not appear after it has been deleted
  await expectNotVisible(page, ['role=cell[name="test-cert"]'])

  await page.click('role=button[name="Add TLS certificate"]')

  // Adding another after the first cert is deleted
  await page.fill(
    'role=dialog[name="Add TLS certificate"] >> role=textbox[name="Name"]',
    'test-cert-2'
  )
  await page.fill(
    'role=dialog[name="Add TLS certificate"] >> role=textbox[name="Description"]',
    'definitely a cert'
  )
  await chooseFile('Cert', page)
  await chooseFile('Key', page)
  await page.click('role=button[name="Add Certificate"]')
  await expectVisible(page, ['role=cell[name="test-cert-2"]'])

  await page.click('role=button[name="Create silo"]')

  // it's there in the table
  await expectRowVisible(table, {
    name: 'other-silo',
    description: 'definitely a silo',
    'Identity mode': 'local only',
    // discoverable: 'false',
  })
  const otherSiloCell = page.getByRole('cell', { name: 'other-silo' })
  await expect(otherSiloCell).toBeVisible()

  // click into detail view and check the fleet role map
  await otherSiloCell.getByRole('link').click()
  await expectVisible(page, [
    page.getByRole('heading', { name: 'other-silo' }),
    page.getByText('Silo adminFleet admin'),
  ])
  await expect(page.getByText('Silo viewerFleet viewer')).toBeHidden()

  await page.goBack()

  // now delete it
  await page.locator('role=button[name="Row actions"]').nth(1).click()
  await page.click('role=menuitem[name="Delete"]')
  await page.getByRole('button', { name: 'Confirm' }).click()

  await expect(otherSiloCell).toBeHidden()
})

test('Default silo', async ({ page }) => {
  await page.goto('/system/silos')
  await page.getByRole('link', { name: 'default-silo' }).click()

  await expect(page.getByRole('heading', { name: 'default-silo' })).toBeVisible()
  await expectNotVisible(page, [
    page.getByText('Silo adminFleet admin'),
    page.getByText('Silo viewerFleet viewer'),
  ])
})

test('Identity providers', async ({ page }) => {
  await page.goto('/system/silos/default-silo')

  await expectVisible(page, ['role=heading[name*=default-silo]'])

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
