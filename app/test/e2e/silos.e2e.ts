import { expect, test } from '@playwright/test'

import { expectNotVisible, expectRowVisible, expectVisible } from './utils'

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
