import { expect, test } from '../utils'

test('can delete a failed instance', async ({ page }) => {
  await page.goto('/projects/mock-project/instances')

  const row = page.getByRole('row', { name: 'you-fail', exact: false })
  await expect(row).toBeVisible()
  await expect(row.getByRole('cell', { name: /failed/ })).toBeVisible()

  await row.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()

  await expect(row).toBeHidden() // bye
})

test('can stop and delete a running instance', async ({ page }) => {
  await page.goto('/projects/mock-project/instances')

  const row = page.getByRole('row', { name: 'db1', exact: false })
  await expect(row).toBeVisible()
  await expect(row.getByRole('cell', { name: /running/ })).toBeVisible()

  // can't delete, can stop
  await row.getByRole('button', { name: 'Row actions' }).click()
  await expect(page.getByRole('menuitem', { name: 'Delete' })).toBeDisabled()
  await page.getByRole('menuitem', { name: 'Stop' }).click()

  // now it's stopped
  await expect(row.getByRole('cell', { name: /stopped/ })).toBeVisible()

  // now delete
  await row.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Delete' }).click()
  await page.getByRole('button', { name: 'Confirm' }).click()

  await expect(row).toBeHidden() // bye
})

test('can stop a starting instance', async ({ page }) => {
  await page.goto('/projects/mock-project/instances')

  const row = page.getByRole('row', { name: 'not-there-yet', exact: false })
  await expect(row).toBeVisible()
  await expect(row.getByRole('cell', { name: /starting/ })).toBeVisible()

  await row.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Stop' }).click()

  await expect(row.getByRole('cell', { name: /stopped/ })).toBeVisible()
})
