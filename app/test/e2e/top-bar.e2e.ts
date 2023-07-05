import { expect, getDevUserPage, test } from './utils'

test.describe('Silo/system picker', () => {
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
