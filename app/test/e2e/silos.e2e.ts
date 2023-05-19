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
  await page.click('role=button[name="Create silo"]')

  // it's there in the table
  await expectRowVisible(table, {
    name: 'other-silo',
    description: 'definitely a silo',
    'Identity mode': 'local only',
    // discoverable: 'false',
  })

  // now delete it
  await page.locator('role=button[name="Row actions"]').nth(1).click()
  await page.click('role=menuitem[name="Delete"]')

  await expectNotVisible(page, ['text="other-silo"'])
})

test('Identity providers', async ({ page }) => {
  await page.goto('/system/silos/default-silo')

  await expectVisible(page, ['role=heading[name="Identity providers"]'])

  await page.getByRole('link', { name: 'mock-idp' }).click()

  await expectVisible(page, [
    'role=dialog[name="Identity provider"]',
    // random stuff that's not in the table
    'text="Entity ID"',
    'text="SLO URL"',
  ])

  await page.getByRole('button', { name: 'Done' }).click()
  await expectNotVisible(page, ['role=dialog[name="Identity provider"]'])
})
