import { test } from '@playwright/test'

import { expectNotVisible, expectVisible } from 'app/util/e2e'

test('Click through project access page', async ({ page }) => {
  await page.goto('/orgs/maze-war/projects/mock-project')

  await page.click('role=link[name*="Access & IAM"]')
  await expectVisible(page, [
    'role=heading[name*="Access & IAM"]',
    'role=cell[name="Abraham Lincoln"]',
  ])
  await expectNotVisible(page, [
    'role=cell[name="Franklin Delano Roosevelt"]',
    'role=cell[name="collaborator"]',
  ])

  await page.click('role=button[name="Add user to project"]')
  await expectVisible(page, ['role=heading[name*="Add user to project"]'])

  await page.click('role=combobox[name="User"]')
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

  await expectVisible(page, [
    'role=cell[name="Franklin Delano Roosevelt"]',
    'role=cell[name="collaborator"]',
  ])
})
