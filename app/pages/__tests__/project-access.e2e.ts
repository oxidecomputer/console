import { test } from '@playwright/test'

import { expectVisible } from 'app/util/e2e'

test('Click through project access page', async ({ page }) => {
  await page.goto('/orgs/maze-war/projects/mock-project')

  await page.click('role=link[name*="Access & IAM"]')
  await page.pause()
  await expectVisible(page, [
    'role=heading[name*="Access & IAM"]',
    'role=cell[name="Abraham Lincoln"]',
  ])

  await page.click('role=button[name="Add user to project"]')
  await expectVisible(page, ['role=heading[name*="Add user to project"]'])
})
