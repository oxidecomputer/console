import { test } from '@playwright/test'

import { expectNotVisible, expectRowVisible, expectVisible } from 'app/util/e2e'

test('Click through project access page', async ({ page }) => {
  await page.goto('/orgs/maze-war/projects/mock-project')

  await page.click('role=link[name*="Access & IAM"]')
  await expectVisible(page, ['role=heading[name*="Access & IAM"]'])
  await expectRowVisible(page, 'user-1', [
    'user-1',
    'Abraham Lincoln',
    'Prohibited',
    'Prohibited',
    'Permitted',
  ])

  await expectNotVisible(page, ['role=cell[name="Franklin Delano Roosevelt"]'])

  await page.click('role=button[name="Add user to project"]')
  await expectVisible(page, ['role=heading[name*="Add user to project"]'])

  await page.click('role=button[name="User"]')
  await expectVisible(page, [
    'role=option[name="Abraham Lincoln"]',
    'role=option[name="Franklin Delano Roosevelt"]',
  ])

  await page.click('role=option[name="Franklin Delano Roosevelt"]')

  await page.click('role=button[name="Role"]')
  await expectVisible(page, [
    'role=option[name="Admin"]',
    'role=option[name="Collaborator"]',
    'role=option[name="Viewer"]',
  ])

  await page.click('role=option[name="Collaborator"]')

  await page.click('role=button[name="Add user"]')

  await expectRowVisible(page, 'user-2', [
    'user-2',
    'Franklin Delano Roosevelt',
    'Prohibited',
    'Permitted',
    'Prohibited',
  ])
})
