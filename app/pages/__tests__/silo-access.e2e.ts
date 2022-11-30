import { test } from '@playwright/test'

import { user1, user3, user4, userGroup3 } from '@oxide/api-mocks'

import {
  expectNotVisible,
  expectRowVisible,
  expectSimultaneous,
  expectVisible,
} from 'app/test/e2e'

test('Click through silo access page', async ({ page }) => {
  await page.goto('/orgs')

  const table = page.locator('role=table')

  // page is there, we see user 1 and 2 but not 3
  await page.click('role=link[name*="Access & IAM"]')

  // has to be before anything else is checked. ensures we've prefetched
  // users list and groups list properly
  await expectSimultaneous(page, [
    `role=cell[name="${userGroup3.id}"]`,
    'role=cell[name="real-estate-devs Group"]',
    `role=cell[name="${user1.id}"]`,
    'role=cell[name="Hannah Arendt"]',
  ])

  await expectVisible(page, ['role=heading[name*="Access & IAM"]'])
  await expectRowVisible(table, {
    ID: userGroup3.id,
    // no space because expectRowVisible uses textContent, not accessible name
    Name: 'real-estate-devsGroup',
    'Silo role': 'admin',
  })
  await expectRowVisible(table, {
    ID: user1.id,
    Name: 'Hannah Arendt',
    'Silo role': 'admin',
  })
  await expectNotVisible(page, [`role=cell[name="${user4.id}"]`])

  // Add user 2 as collab
  await page.click('role=button[name="Add user or group"]')
  await expectVisible(page, ['role=heading[name*="Add user or group"]'])

  await page.click('role=button[name="User or group"]')
  // only users not already on the org should be visible
  await expectNotVisible(page, ['role=option[name="Hannah Arendt"]'])
  await expectVisible(page, [
    'role=option[name="Hans Jonas"]',
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
  await page.click('role=button[name="Assign role"]')

  // User 3 shows up in the table
  await expectRowVisible(table, {
    ID: user3.id,
    Name: 'Jacob Klein',
    'Silo role': 'collaborator',
  })

  // now change user 3's role from collab to viewer
  await page
    .locator('role=row', { hasText: user3.id })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Change role"]')

  await expectVisible(page, ['role=heading[name*="Change user role"]'])
  await expectVisible(page, ['button:has-text("Collaborator")'])

  await page.click('role=button[name="Role"]')
  await page.click('role=option[name="Viewer"]')
  await page.click('role=button[name="Update role"]')

  await expectRowVisible(table, { ID: user3.id, 'Silo role': 'viewer' })

  // now delete user 3
  await page
    .locator('role=row', { hasText: user3.id })
    .locator('role=button[name="Row actions"]')
    .click()
  await expectVisible(page, [`role=cell[name="${user3.id}"]`])
  await page.click('role=menuitem[name="Delete"]')
  await expectNotVisible(page, [`role=cell[name="${user3.id}"]`])
})
