import { expect, expectNotVisible, expectRowVisible, expectVisible, test } from './utils'

test('Click through snapshots', async ({ page }) => {
  await page.goto('/projects/mock-project')
  await page.click('role=link[name*="Snapshots"]')
  await expectVisible(page, [
    'role=heading[name*="Snapshots"]',
    'role=cell[name="snapshot-1"]',
    'role=cell[name="snapshot-2"]',
    'role=cell[name="snapshot-3"]',
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

  const row2 = page.getByRole('row', { name: 'snapshot-2' })

  async function clickDelete() {
    await row2.getByRole('button', { name: 'Row actions' }).click()
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
  await expectNotVisible(page, [modal, row2])
})
