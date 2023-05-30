import { expect, test } from './utils'

test.describe('login', () => {
  test('with valid credentials redirects', async ({ page }) => {
    await page.goto('/login/default-silo/local')
    await page.fill('input[name=username]', 'abc')
    await page.fill('input[name=password]', 'def')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL('/projects')
  })

  test('with state param redirects to last page', async ({ page }) => {
    await page.goto(
      '/login/default-silo/local?state=%2Fprojects%2Fmock-project%2Finstances'
    )
    await page.fill('input[name=username]', 'abc')
    await page.fill('input[name=password]', 'def')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL('/projects/mock-project/instances')
  })

  test('with valid credentials shows error', async ({ page }) => {
    await page.goto('/login/default-silo/local')
    await page.fill('input[name=username]', 'abc')
    await page.fill('input[name=password]', 'bad') // the Bad Password
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByText('Could not sign in')).toBeVisible()
  })
})
