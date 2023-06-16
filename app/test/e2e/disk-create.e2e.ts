import { expectVisible, test } from './utils'

test.describe('Disk create', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects/mock-project/disks-new')
    await page.getByRole('textbox', { name: 'Name' }).fill('a-new-disk')
  })

  test.afterEach(async ({ page }) => {
    await page.getByRole('button', { name: 'Create disk' }).click()

    await expectVisible(page, ['text="Your disk has been created"'])

    await page.getByRole('button', { name: 'Next' }).click()
    await expectVisible(page, ['role=cell[name="a-new-disk"]'])
  })

  test('from blank', async ({ page }) => {
    await page.getByRole('radio', { name: '512' }).click()
  })

  test('from snapshot', async ({ page }) => {
    await page.getByRole('radio', { name: 'Snapshot' }).click()
    await page.getByRole('button', { name: 'Source snapshot' }).click()
    await page.getByRole('option', { name: 'delete-500' }).click()
  })

  test('from image', async ({ page }) => {
    await page.getByRole('radio', { name: 'Image' }).click()
    await page.getByRole('button', { name: 'Source image' }).click()
    await page.getByRole('option', { name: 'image-3' }).click()
  })

  test('switching to snapshot and back to blank', async ({ page }) => {
    await page.getByRole('radio', { name: 'Snapshot' }).click()
    await page.getByRole('radio', { name: 'Blank' }).click()
  })
})
