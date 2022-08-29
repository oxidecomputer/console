import { test } from '@playwright/test'

import { expectNotVisible, expectRowVisible, expectVisible } from 'app/util/e2e'

test('Click through org access page', async ({ page }) => {
  await page.goto('/orgs/maze-war')

  const table = page.locator('role=table')

  // page is there, we see user 1 and 2 but not 3
  await page.click('role=link[name*="Access & IAM"]')
  await expectVisible(page, ['role=heading[name*="Access & IAM"]'])
  await expectRowVisible(table, {
    ID: 'user-1',
    Name: 'Hannah Arendt',
    'Silo role': 'admin',
    'Org role': '',
  })
  await expectRowVisible(table, {
    ID: 'user-2',
    Name: 'Hans Jonas',
    'Silo role': '',
    'Org role': 'viewer',
  })
  await expectNotVisible(page, ['role=cell[name="user-3"]'])

  // Add user 2 as collab
  await page.click('role=button[name="Add user to organization"]')
  await expectVisible(page, ['role=heading[name*="Add user to organization"]'])

  await page.click('role=button[name="User"]')
  // only users not already on the org should be visible
  await expectNotVisible(page, ['role=option[name="Hans Jonas"]'])
  await expectVisible(page, [
    'role=option[name="Hannah Arendt"]',
    'role=option[name="Jacob Klein"]',
    'role=option[name="Simone de Beauvoir"]',
  ])

  await page.click('role=option[name="Jacob Klein"]')

  await page.click('role=button[name="Role"]')
  await expectVisible(page, [
    'role=option[name="Admin"]',
    'role=option[name="Collaborator"]',
    'role=option[name="Viewer"]',
  ])

  await page.click('role=option[name="Collaborator"]')
  await page.click('role=button[name="Add user"]')

  // User 3 shows up in the table
  await expectRowVisible(table, {
    ID: 'user-3',
    Name: 'Jacob Klein',
    'Silo role': '',
    'Org role': 'collaborator',
  })

  // now change user 3's role from collab to viewer
  await page
    .locator('role=row', { hasText: 'user-3' })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Change role"]')

  await expectVisible(page, ['role=heading[name*="Change user role"]'])
  await expectVisible(page, ['button:has-text("Collaborator")'])

  await page.click('role=button[name="Role"]')
  await page.click('role=option[name="Viewer"]')
  await page.click('role=button[name="Update role"]')

  await expectRowVisible(table, { ID: 'user-3', 'Org role': 'viewer' })

  // now delete user 2
  await page
    .locator('role=row', { hasText: 'user-2' })
    .locator('role=button[name="Row actions"]')
    .click()
  await expectVisible(page, ['role=cell[name=user-2]'])
  await page.click('role=menuitem[name="Delete"]')
  await expectNotVisible(page, ['role=cell[name=user-2]'])

  // now add an org role to user 1, who currently only has silo role
  await page.click('role=button[name="Add user to organization"]')
  await page.click('role=button[name="User"]')
  await page.click('role=option[name="Hannah Arendt"]')
  await page.click('role=button[name="Role"]')
  await page.click('role=option[name="Viewer"]')
  await page.click('role=button[name="Add user"]')
  await expectRowVisible(table, {
    ID: 'user-1',
    Name: 'Hannah Arendt',
    'Silo role': 'admin',
    'Org role': 'viewer',
  })
})
