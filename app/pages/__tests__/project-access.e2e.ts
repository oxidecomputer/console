import { test } from '@playwright/test'

import { expectNotVisible, expectRowVisible, expectVisible } from 'app/util/e2e'

test('Click through project access page', async ({ page }) => {
  await page.goto('/orgs/maze-war/projects/mock-project')

  // page is there, we see AL but not FDR
  await page.click('role=link[name*="Access & IAM"]')
  await expectVisible(page, ['role=heading[name*="Access & IAM"]'])
  await expectRowVisible(page, 'user-1', ['user-1', 'Abraham Lincoln', 'admin'])
  await expectNotVisible(page, ['role=cell[name="Franklin Delano Roosevelt"]'])

  // Add FDR as collab
  await page.click('role=button[name="Add user to project"]')
  await expectVisible(page, ['role=heading[name*="Add user to project"]'])

  await page.click('role=button[name="User"]')
  // only users not already on the project should be visible
  await expectNotVisible(page, ['role=option[name="Abraham Lincoln"]'])
  await expectVisible(page, ['role=option[name="Franklin Delano Roosevelt"]'])

  await page.click('role=option[name="Franklin Delano Roosevelt"]')

  await page.click('role=button[name="Role"]')
  await expectVisible(page, [
    'role=option[name="Admin"]',
    'role=option[name="Collaborator"]',
    'role=option[name="Viewer"]',
  ])

  await page.click('role=option[name="Collaborator"]')
  await page.click('role=button[name="Add user"]')

  // FDR shows up in the table
  await expectRowVisible(page, 'user-2', [
    'user-2',
    'Franklin Delano Roosevelt',
    'collaborator',
  ])

  // now change FDR's role from collab to viewer
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

  await expectRowVisible(page, 'user-2', ['user-2', 'Franklin Delano Roosevelt', 'viewer'])

  // now delete FDR
  await page
    .locator('role=row', { hasText: 'user-2' })
    .locator('role=button[name="Row actions"]')
    .click()
  await expectVisible(page, ['role=cell[name=user-2]'])
  await page.click('role=menuitem[name="Delete"]')
  await expectNotVisible(page, ['role=cell[name=user-2]'])
})
