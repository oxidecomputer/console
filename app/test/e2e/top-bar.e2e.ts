import { expect, expectSimultaneous, getDevUserPage, test } from './utils'

test.describe('Silo/system picker', () => {
  test('does not pop in', async ({ page }) => {
    await page.goto('/projects')

    // make sure the system policy call is prefetched properly so that the
    // silo/system picker doesn't pop in. if this turns out to be flaky, just
    // throw it out. it's extra as hell
    await expectSimultaneous(page, [
      'role=button[name="Switch between system and silo"]',
      'role=button[name="Switch project"]',
    ])
  })

  test('appears for fleet viewer', async ({ page }) => {
    await page.goto('/projects')
    await expect(page.getByRole('link', { name: 'SILO default-silo' })).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Switch between system and silo' })
    ).toBeVisible()
  })

  test('does not appear to for dev user', async ({ browser }) => {
    const page = await getDevUserPage(browser)
    await page.goto('/projects')
    await expect(page.getByRole('link', { name: 'SILO default-silo' })).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Switch between system and silo' })
    ).toBeHidden()
  })
})
