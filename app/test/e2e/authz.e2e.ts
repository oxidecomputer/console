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

test('dev user gets 404 on system pages', async ({ browser }) => {
  const page = await getDevUserPage(browser)
  await page.goto('/system/silos')
  await expect(page.getByText('Page not found')).toBeVisible()

  await page.goto('/system/utilization')
  await expect(page.getByText('Page not found')).toBeVisible()

  await page.goto('/system/inventory/sleds')
  await expect(page.getByText('Page not found')).toBeVisible()
})
