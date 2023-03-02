import { expect, test } from '@playwright/test'

import { user2, user3, userGroup1 } from '@oxide/api-mocks'

import {
  expectNotVisible,
  expectRowVisible,
  expectSimultaneous,
  expectVisible,
} from 'app/test/e2e'

test('Click through org access page', async ({ page }) => {
  await page.goto('/orgs/maze-war')

  const table = page.locator('role=table')

  // page is there, we see user 1 and 2 but not 3
  await page.click('role=link[name*="Access & IAM"]')

  // has to be before anything else is checked. ensures we've prefetched users
  // list and groups list properly
  await expectSimultaneous(page, [
    'role=button[name="Add user or group"]', // important to include a static element
    'role=cell[name="web-devs Group"]',
    'role=cell[name="Hannah Arendt"]',
  ])

  await expectVisible(page, ['role=heading[name*="Access & IAM"]'])
  await expectRowVisible(table, {
    // no space because expectRowVisible uses textContent, not accessible name
    Name: 'web-devsGroup',
    'Silo role': '',
    'Org role': 'collaborator',
  })
  await expectRowVisible(table, {
    Name: 'Hannah Arendt',
    'Silo role': 'admin',
    'Org role': '',
  })
  await expectRowVisible(table, {
    Name: 'Hans Jonas',
    'Silo role': '',
    'Org role': 'viewer',
  })
  await expectNotVisible(page, [`role=cell[name="${user3.display_name}"]`])

  // Add user 2 as collab
  await page.click('role=button[name="Add user or group"]')
  await expectVisible(page, ['role=heading[name*="Add user or group"]'])

  await page.click('role=button[name="User or group"]')
  // only users not already on the org should be visible
  await expectNotVisible(page, ['role=option[name="Hans Jonas"]'])
  await page.pause()
  await expectVisible(page, [
    'role=option[name="Hannah Arendt"]',
    'role=option[name="Jacob Klein"]',
    'role=option[name="Simone de Beauvoir"]',
    'role=option[name="kernel-devs Group"]',
    'role=option[name="real-estate-devs Group"]',
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
    Name: 'Jacob Klein',
    'Silo role': '',
    'Org role': 'collaborator',
  })

  // now change user 3's role from collab to viewer
  await page
    .locator('role=row', { hasText: user3.display_name })
    .locator('role=button[name="Row actions"]')
    .click()
  await page.click('role=menuitem[name="Change role"]')

  await expectVisible(page, ['role=heading[name*="Change user role"]'])
  await expectVisible(page, ['button:has-text("Collaborator")'])

  await page.click('role=button[name="Role"]')
  await page.click('role=option[name="Viewer"]')
  await page.click('role=button[name="Update role"]')

  await expectRowVisible(table, { Name: user3.display_name, 'Org role': 'viewer' })

  // now delete user 2
  await page
    .locator('role=row', { hasText: user2.display_name })
    .locator('role=button[name="Row actions"]')
    .click()
  await expectVisible(page, [`role=cell[name="${user2.display_name}"]`])
  await page.click('role=menuitem[name="Delete"]')
  await expectNotVisible(page, [`role=cell[name="${user2.display_name}"]`])

  // now add an org role to user 1, who currently only has silo role
  await page.click('role=button[name="Add user or group"]')
  await page.click('role=button[name="User or group"]')
  await page.click('role=option[name="Hannah Arendt"]')
  await page.click('role=button[name="Role"]')
  await page.click('role=option[name="Viewer"]')
  await page.click('role=button[name="Assign role"]')
  await expectRowVisible(table, {
    Name: 'Hannah Arendt',
    'Silo role': 'admin',
    'Org role': 'viewer',
  })

  // add an org role to a group, which currently has no role
  await page.click('role=button[name="Add user or group"]')
  await page.click('role=button[name="User or group"]')
  await page.click('role=option[name="kernel-devs Group"]')
  await page.click('role=button[name="Role"]')
  await page.click('role=option[name="Collaborator"]')
  await page.click('role=button[name="Assign role"]')
  await expectRowVisible(table, {
    Name: 'kernel-devsGroup',
    'Silo role': '',
    'Org role': 'collaborator',
  })
})

test('Click through to group detail from access page', async ({ page }) => {
  await page.goto('/orgs/maze-war')

  await page.click('role=link[name*="Access & IAM"]')
  await page.click('role=link[name="web-devs"]')

  // groups are linked by ID
  await expect(page).toHaveURL(`/groups/${userGroup1.id}`)

  await expectVisible(page, [
    'role=heading[name*="web-devs"]',
    'role=cell[name="Hannah Arendt"]',
  ])
})
