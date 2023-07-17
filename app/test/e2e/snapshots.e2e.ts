import { expect, expectNotVisible, expectRowVisible, expectVisible, test } from './utils'

test('Click through snapshots', async ({ page }) => {
  await page.goto('/projects/mock-project')
  await page.click('role=link[name*="Snapshots"]')
  await expectVisible(page, [
    'role=heading[name*="Snapshots"]',
    'role=cell[name="snapshot-1"]',
    'role=cell[name="snapshot-2"]',
    'role=cell[name="delete-500"]',
    'role=cell[name="snapshot-4"]',
    'role=cell[name="snapshot-disk-deleted"]',
  ])

  // test async disk name fetch
  const table = page.getByRole('table')
  await expectRowVisible(table, { name: 'snapshot-1', disk: 'disk-1' })
  await expectRowVisible(table, { name: 'snapshot-disk-deleted', disk: 'Deleted' })
})

test('Confirm delete snapshot', async ({ page }) => {
  await page.goto('/projects/mock-project/snapshots')

  const row = page.getByRole('row', { name: 'snapshot-2' })

  async function clickDelete() {
    await row.getByRole('button', { name: 'Row actions' }).click()
    await page.getByRole('menuitem', { name: 'Delete' }).click()
  }

  await clickDelete()

  const modal = page.getByRole('dialog', { name: 'Confirm delete' })
  await expect(modal).toBeVisible()

  // cancel works
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(modal).toBeHidden()

  // get back in there
  await clickDelete()
  await page.getByRole('button', { name: 'Confirm' }).click()

  // modal closes, row is gone
  await expectNotVisible(page, [modal, row])
})

test('Error on delete snapshot', async ({ page }) => {
  await page.goto('/projects/mock-project/snapshots')

  const row = page.getByRole('row', { name: 'delete-500' })

  await row.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Delete' }).click()

  const modal = page.getByRole('dialog', { name: 'Confirm delete' })
  await expect(modal).toBeVisible()

  await page.getByRole('button', { name: 'Confirm' }).click()

  // modal closes, but row is not gone and error toast is visible
  await expect(modal).toBeHidden()
  await expectVisible(page, [
    row,
    page.getByText('Could not delete resource', { exact: true }),
  ])
})

test('Create image from snapshot', async ({ page }) => {
  await page.goto('/projects/mock-project/snapshots')

  const row = page.getByRole('row', { name: 'snapshot-1' })
  await row.getByRole('button', { name: 'Row actions' }).click()
  await page.getByRole('menuitem', { name: 'Create image' }).click()

  await expectVisible(page, ['role=dialog[name="Create image from snapshot"]'])

  await page.fill('role=textbox[name="Name"]', 'image-from-snapshot-1')
  await page.fill('role=textbox[name="Description"]', 'image description')
  await page.fill('role=textbox[name="OS"]', 'Ubuntu')
  await page.fill('role=textbox[name="Version"]', '20.02')

  await page.click('role=button[name="Create image"]')

  await expect(page).toHaveURL('/projects/mock-project/snapshots')

  await page.click('role=link[name*="Images"]')
  await expectRowVisible(page.getByRole('table'), {
    name: 'image-from-snapshot-1',
    description: 'image description',
  })
})
