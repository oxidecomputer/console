import { test } from '@playwright/test'

import { expectVisible } from 'app/test/e2e'

test('Orgs list and detail click work', async ({ page }) => {
  await page.goto('/')
  await expectVisible(page, [
    // note substring matcher bc headers have icons that mess with accessible name
    // TODO: maybe that's bad and we should fix it in the code
    'role=heading[name*="Organizations"]',
    'role=cell[name="maze-war"]',
  ])

  // create org form
  await page.click('role=link[name="New Organization"]')
  await expectVisible(page, [
    'role=heading[name*="Create organization"]',
    'role=textbox[name="Name"]',
    'role=textbox[name="Description"]',
    'role=button[name="Create organization"]',
  ])
  await page.goBack()

  // org page (redirects to /org/org-name/projects)
  await page.click('role=link[name="maze-war"]')
  await expectVisible(page, [
    'role=heading[name*="Projects"]',
    'role=cell[name="mock-project"]',
  ])

  // new project button works
  await page.click('role=link[name="New Project"]')
  await expectVisible(page, ['role=heading[name*="Create project"]'])
})
