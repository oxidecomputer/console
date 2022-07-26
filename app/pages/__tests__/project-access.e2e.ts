import { test } from '@playwright/test'

import { expectNotVisible, expectRowVisible, expectVisible } from 'app/util/e2e'

test('Click through project access page', async ({ page }) => {
  await page.goto('/orgs/maze-war/projects/mock-project')
  await page.click('role=link[name*="Access & IAM"]')

  // page is there, we see user 1 but not 2
  await expectVisible(page, ['role=heading[name*="Access & IAM"]'])
  const table = page.locator('table')
  await expectRowVisible(table, { ID: 'user-1', Name: 'Hannah Arendt', Role: 'admin' })
  await expectNotVisible(page, ['role=cell[name="user-2"]'])

  // Add user 2 as collab
  await page.click('role=button[name="Add user to project"]')
  await expectVisible(page, ['role=heading[name*="Add user to project"]'])

  await page.click('role=button[name="User"]')
  // only users not already on the project should be visible
  await expectNotVisible(page, ['role=option[name="Hannah Arendt"]'])
  await expectVisible(page, ['role=option[name="Hans Jonas"]'])

  await page.click('role=option[name="Hans Jonas"]')

  await page.click('role=button[name="Role"]')
  await expectVisible(page, [
    'role=option[name="Admin"]',
    'role=option[name="Collaborator"]',
    'role=option[name="Viewer"]',
  ])

  await page.click('role=option[name="Collaborator"]')
  await page.click('role=button[name="Add user"]')

  // User 2 shows up in the table
  await expectRowVisible(table, { ID: 'user-2', Name: 'Hans Jonas', Role: 'collaborator' })

  // now change user 2 role from collab to viewer
  await page
    .locator('role=row', { hasText: 'user-2' })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Change role"]')

  await expectVisible(page, ['role=heading[name*="Change user role"]'])
  await expectVisible(page, ['button:has-text("Collaborator")'])

  await page.click('role=button[name="Role"]')
  await page.click('role=option[name="Viewer"]')
  await page.click('role=button[name="Update role"]')

  await expectRowVisible(table, { ID: 'user-2', Role: 'viewer' })

  // now delete user 2
  await page
    .locator('role=row', { hasText: 'user-2' })
    .locator('role=button[name="Row actions"]')
    .click()
  await expectVisible(page, ['role=cell[name=user-2]'])
  await page.click('role=menuitem[name="Delete"]')
  await expectNotVisible(page, ['role=cell[name=user-2]'])
})
