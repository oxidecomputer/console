import { expect, test } from '@playwright/test'

import { expectVisible } from 'app/test/e2e'

test.describe('Project create', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/orgs/maze-war/projects-new')
  })

  test('contains expected elements', async ({ page }) => {
    await expectVisible(page, [
      'role=heading[name*="Create project"]', // TODO: standardize capitalization
      'role=textbox[name="Name"]',
      'role=textbox[name="Description"]',
      'role=button[name="Create project"]',
    ])
  })

  test('navigates back to project instances page on success', async ({ page }) => {
    await page.fill('role=textbox[name="Name"]', 'mock-project-2')
    await page.click('role=button[name="Create project"]')
    await expect(page).toHaveURL('/orgs/maze-war/projects/mock-project-2/instances')
  })

  test('shows field-level validation error and does not POST', async ({ page }) => {
    await page.fill('role=textbox[name="Name"]', 'Invalid name')

    await page.click('role=textbox[name="Description"]') // just to blur name input
    // role=dialog to distinguish from reach alert
    await expectVisible(page, ['role=dialog >> text="Must start with a lower-case letter"'])
  })

  test('shows form-level error for known server error', async ({ page }) => {
    await page.fill('role=textbox[name="Name"]', 'mock-project') // already exists
    await page.click('role=button[name="Create project"]')
    await expectVisible(page, ['text="Project name already exists"'])
  })

  // TODO: figure these out

  // it('shows message for known error code in global code map', async () => {
  //   overrideOnce('post', projectsUrl, 403, { error_code: 'Forbidden' })
  //   renderAppAt(formUrl)
  //   await enterName('mock-project-2')
  //   clickByRole('button', 'Create project')
  //   await screen.findByText('Action not authorized')
  //   expect(window.location.pathname).toEqual(formUrl) // don't nav away
  // })

  // it('shows generic message for unknown server error', async () => {
  //   overrideOnce('post', projectsUrl, 400, { error_code: 'UnknownCode' })
  //   renderAppAt(formUrl)
  //   await enterName('mock-project-2')
  //   clickByRole('button', 'Create project')
  //   await screen.findByText('Unknown error from server')
  //   expect(window.location.pathname).toEqual(formUrl) // don't nav away
  // })
})
