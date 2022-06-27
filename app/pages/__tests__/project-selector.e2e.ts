import { expect, test } from '@playwright/test'

import { expectVisible } from 'app/util/e2e'

test('Project selector', async ({ page }) => {
  // create a second project
  await page.goto('/orgs/maze-war/projects/new')
  await page.fill('role=textbox[name="Name"]', 'other-project')
  await page.click('role=button[name="Create project"]')

  // go to projects page and make sure they're both there
  await page.click('role=link[name="Projects"]')
  await expect(page).toHaveURL('/orgs/maze-war/projects')
  await expectVisible(page, [
    'role=cell[name="mock-project"]',
    'role=cell[name="other-project"]',
  ])

  // switcher button is present, has text indicating no project selected
  await expect(page.locator('role=button[name="Switch project"]')).toHaveText(
    'maze-warselect a project'
  )
  await page.click('role=button[name="Switch project"]')
  await expectVisible(page, [
    'role=menuitem[name="mock-project"]',
    'role=menuitem[name="other-project"]',
  ])

  // picking mock-project in the menu takes you there
  await page.click('role=menuitem[name="mock-project"]')
  await expect(page).toHaveURL('/orgs/maze-war/projects/mock-project/instances')
  await expect(page.locator('role=button[name="Switch project"]')).toHaveText(
    'maze-warmock-project'
  )

  // picking other-project in the menu takes you there
  await page.click('role=button[name="Switch project"]')
  await page.click('role=menuitem[name="other-project"]')
  await expect(page).toHaveURL('/orgs/maze-war/projects/other-project/instances')
  await expect(page.locator('role=button[name="Switch project"]')).toHaveText(
    'maze-warother-project'
  )
})
