import { test } from '@playwright/test'

import { user1, user2, user3, user4 } from '@oxide/api-mocks'

import { expectNotVisible, expectRowVisible, expectVisible } from 'app/test/e2e'

test('Click through project access page', async ({ page }) => {
  await page.goto('/orgs/maze-war/projects/mock-project')
  await page.click('role=link[name*="Access & IAM"]')

  // page is there, we see user 1-3 but not 4
  await expectVisible(page, ['role=heading[name*="Access & IAM"]'])
  const table = page.locator('table')
  await expectRowVisible(table, {
    ID: user1.id,
    Name: 'Hannah Arendt',
    'Silo role': 'admin',
    'Org role': '',
    'Project role': '',
  })
  await expectRowVisible(table, {
    ID: user2.id,
    Name: 'Hans Jonas',
    'Silo role': '',
    'Org role': 'viewer',
    'Project role': '',
  })
  await expectRowVisible(table, {
    ID: user3.id,
    Name: 'Jacob Klein',
    'Silo role': '',
    'Org role': '',
    'Project role': 'collaborator',
  })
  await expectNotVisible(page, [`role=cell[name="${user4.id}"]`])

  // Add user 4 as collab
  await page.click('role=button[name="Add user to project"]')
  await expectVisible(page, ['role=heading[name*="Add user to project"]'])

  await page.click('role=button[name="User"]')
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
  await page.click('role=button[name="Add user"]')

  // User 4 shows up in the table
  await expectRowVisible(table, {
    ID: user4.id,
    Name: 'Simone de Beauvoir',
    'Project role': 'collaborator',
  })

  // now change user 4 role from collab to viewer
  await page
    .locator('role=row', { hasText: user4.id })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Change role"]')

  await expectVisible(page, ['role=heading[name*="Change user role"]'])
  await expectVisible(page, ['button:has-text("Collaborator")'])

  await page.click('role=button[name="Role"]')
  await page.click('role=option[name="Viewer"]')
  await page.click('role=button[name="Update role"]')

  await expectRowVisible(table, { ID: user4.id, 'Project role': 'viewer' })

  // now delete user 3. has to be 3 or 4 because they're the only ones that come
  // from the project policy
  await page
    .locator('role=row', { hasText: user3.id })
    .locator('role=button[name="Row actions"]')
    .click()
  await expectVisible(page, [`role=cell[name=${user3.id}]`])
  await page.click('role=menuitem[name="Delete"]')
  await expectNotVisible(page, [`role=cell[name=${user3.id}]`])

  // now add a project role to user 1, who currently only has silo role
  await page.click('role=button[name="Add user to project"]')
  await page.click('role=button[name="User"]')
  await page.click('role=option[name="Hannah Arendt"]')
  await page.click('role=button[name="Role"]')
  await page.click('role=option[name="Viewer"]')
  await page.click('role=button[name="Add user"]')
  await expectRowVisible(table, {
    ID: user1.id,
    Name: 'Hannah Arendt',
    'Silo role': 'admin',
    'Org role': '',
    'Project role': 'viewer',
  })
})
