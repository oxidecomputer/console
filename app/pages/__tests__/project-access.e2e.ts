import { test } from '@playwright/test'

import { user3, user4 } from '@oxide/api-mocks'

import {
  expectNotVisible,
  expectRowVisible,
  expectSimultaneous,
  expectVisible,
} from 'app/test/e2e'

test('Click through project access page', async ({ page }) => {
  await page.goto('/orgs/maze-war/projects/mock-project')
  await page.click('role=link[name*="Access & IAM"]')

  // has to be before anything else is checked. ensures we've prefetched
  // users list and groups list properly
  await expectSimultaneous(page, [
    'role=button[name="Add user or group"]', // important to include a static element
    'role=cell[name="web-devs Group"]',
    'role=cell[name="Hannah Arendt"]',
  ])

  // page is there, we see user 1-3 but not 4
  await expectVisible(page, ['role=heading[name*="Access & IAM"]'])
  const table = page.locator('table')
  await expectRowVisible(table, {
    Name: 'Hannah Arendt',
    'Silo role': 'admin',
    'Org role': '',
    'Project role': '',
  })
  await expectRowVisible(table, {
    Name: 'Hans Jonas',
    'Silo role': '',
    'Org role': 'viewer',
    'Project role': '',
  })
  await expectRowVisible(table, {
    Name: 'Jacob Klein',
    'Silo role': '',
    'Org role': '',
    'Project role': 'collaborator',
  })
  await expectRowVisible(table, {
    // no space because expectRowVisible uses textContent, not accessible name
    Name: 'web-devsGroup',
    'Silo role': '',
    'Org role': 'collaborator',
  })
  await expectRowVisible(table, {
    // no space because expectRowVisible uses textContent, not accessible name
    Name: 'kernel-devsGroup',
    'Silo role': '',
    'Org role': '',
    'Project role': 'viewer',
  })

  await expectNotVisible(page, [`role=cell[name="${user4.display_name}"]`])

  // Add user 4 as collab
  await page.click('role=button[name="Add user or group"]')
  await expectVisible(page, ['role=heading[name*="Add user or group"]'])

  await page.click('role=button[name="User or group"]')
  // only users not already on the project should be visible
  await expectNotVisible(page, ['role=option[name="Jacob Klein"]'])
  await expectVisible(page, [
    'role=option[name="Hannah Arendt"]',
    'role=option[name="Hans Jonas"]',
    'role=option[name="Simone de Beauvoir"]',
  ])

  await page.click('role=option[name="Simone de Beauvoir"]')

  await page.click('role=button[name="Role"]')
  await expectVisible(page, [
    'role=option[name="Admin"]',
    'role=option[name="Collaborator"]',
    'role=option[name="Viewer"]',
  ])

  await page.click('role=option[name="Collaborator"]')
  await page.click('role=button[name="Assign role"]')

  // User 4 shows up in the table
  await expectRowVisible(table, {
    Name: 'Simone de Beauvoir',
    'Project role': 'collaborator',
  })

  // now change user 4 role from collab to viewer
  await page
    .locator('role=row', { hasText: user4.display_name })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Change role"]')

  await expectVisible(page, ['role=heading[name*="Change user role"]'])
  await expectVisible(page, ['button:has-text("Collaborator")'])

  await page.click('role=button[name="Role"]')
  await page.click('role=option[name="Viewer"]')
  await page.click('role=button[name="Update role"]')

  await expectRowVisible(table, { Name: user4.display_name, 'Project role': 'viewer' })

  // now delete user 3. has to be 3 or 4 because they're the only ones that come
  // from the project policy
  await expectVisible(page, [`role=cell[name="${user3.display_name}"]`])
  await page
    .locator('role=row', { hasText: user3.display_name })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Delete"]')
  await expectNotVisible(page, [`role=cell[name="${user3.display_name}"]`])

  // now add a project role to user 1, who currently only has silo role
  await page.click('role=button[name="Add user or group"]')
  await page.click('role=button[name="User or group"]')
  await page.click('role=option[name="Hannah Arendt"]')
  await page.click('role=button[name="Role"]')
  await page.click('role=option[name="Viewer"]')
  await page.click('role=button[name="Assign role"]')
  await expectRowVisible(table, {
    Name: 'Hannah Arendt',
    'Silo role': 'admin',
    'Org role': '',
    'Project role': 'viewer',
  })
})
