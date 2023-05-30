import { test } from '@playwright/test'

import { expectNotVisible, expectRowVisible, expectVisible } from './utils'

test('SSH keys', async ({ page }) => {
  await page.goto('/settings/ssh-keys')

  // see table with the ssh key
  await expectVisible(page, [
    'role=heading[name*="SSH Keys"]',
    'role=cell[name="m1-macbook-pro"]',
  ])

  // delete the only ssh key
  await page.click('role=button[name="Row actions"]')
  await page.click('role=menuitem[name="Delete"]')

  // should show empty state
  await expectVisible(page, ['text="No SSH keys"'])

  // there are two of these, but it doesn't matter which one we click
  await page.click('role=button[name="Add SSH key"]')

  // fill out form and submit
  await page.fill('role=textbox[name="Name"]', 'my-key')
  await page.fill('role=textbox[name="Description"]', 'definitely a key')
  await page.fill('role=textbox[name="Public key"]', 'key contents')
  await page.click('role=button[name="Add SSH key"]')

  // it's there in the table
  await expectNotVisible(page, ['text="No SSH keys"'])
  const table = page.locator('role=table')
  await expectRowVisible(table, { Name: 'my-key', Description: 'definitely a key' })

  // now delete it
  await page.click('role=button[name="Row actions"]')
  await page.click('role=menuitem[name="Delete"]')

  await expectNotVisible(page, ['role=cell[name="my-key"]'])
  await expectVisible(page, ['text="No SSH keys"'])
})
