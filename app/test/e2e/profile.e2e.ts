import { user1 } from '@oxide/api-mocks'

import { expect, test } from './utils'

test('Profile page works', async ({ page }) => {
  await page.goto('/settings/profile')
  await expect(page.getByRole('textbox', { name: 'User ID' })).toHaveValue(user1.id)
  await expect(page.getByRole('cell', { name: 'web-devs' })).toBeVisible()
})
