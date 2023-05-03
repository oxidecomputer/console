import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

import { MiB } from '@oxide/util'

import { expectNotVisible, expectRowVisible, expectVisible } from 'app/test/e2e'

async function chooseFile(page: Page, size = 10 * MiB) {
  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByText('Image file').click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles({
    name: 'my-image.iso',
    mimeType: 'application/octet-stream',
    buffer: Buffer.alloc(size),
  })
}

test('Image upload happy path', async ({ page }) => {
  await page.goto('/projects/mock-project/images')
  await expectNotVisible(page, [
    'role=cell[name="new-image"]',
    'role=heading[name="Upload image"]',
  ])

  await page.click('role=link[name="Upload image"]')

  await expectVisible(page, ['role=heading[name="Upload image"]'])

  await page.fill('role=textbox[name="Name"]', 'new-image')
  await page.fill('role=textbox[name="Description"]', 'image description')
  await page.fill('role=textbox[name="OS"]', 'Ubuntu')
  await page.fill('role=textbox[name="Version"]', 'Dapper Drake')
  await chooseFile(page)

  await page.click('role=button[name="Upload image"]')

  // now the modal pops open and the thing starts going. playwright isn't quick
  // enough to catch each step going from ready to running to complete in time,
  // so we just assert that they all start out ready and end up complete

  const steps = page.locator('div[data-status]')

  for (const step of await steps.all()) {
    await expect(step).toHaveAttribute('data-status', 'ready')
  }

  // check these here instead of first because if we don't look for the ready
  // states right away we won't catch them in time
  await expectVisible(page, ['role=heading[name="Image upload progress"]'])
  const done = page.locator('role=dialog >> role=button[name="Done"]')
  await expect(done).toBeDisabled()

  for (const step of await steps.all()) {
    await expect(step).toHaveAttribute('data-status', 'complete')
  }

  await expect(done).toBeEnabled()
  await done.click()

  await expect(page).toHaveURL('/projects/mock-project/images')
  await expectRowVisible(page.locator('role=table'), {
    name: 'new-image',
    description: 'image description',
    size: '1 GiB',
  })
})

test('Image upload with name taken', async ({ page }) => {
  await page.goto('/projects/mock-project/images-new')

  await page.fill('role=textbox[name="Name"]', 'image-1')
  await page.fill('role=textbox[name="Description"]', 'image description')
  await page.fill('role=textbox[name="OS"]', 'Ubuntu')
  await page.fill('role=textbox[name="Version"]', 'Dapper Drake')
  await chooseFile(page)

  await expectNotVisible(page, ['text="Image name already exists"'])
  await page.click('role=button[name="Upload image"]')
  await expectVisible(page, ['text="Image name already exists"'])

  // TODO: changing name in field causes error to disappear
})

test('Image upload file empty', async ({ page }) => {
  await page.goto('/projects/mock-project/images-new')
  await page.fill('role=textbox[name="Name"]', 'new-image')

  const requiredError = 'role=dialog[name="Upload image"] >> text="File is required"'

  await expectNotVisible(page, [requiredError])

  await page.click('role=button[name="Upload image"]')
  await expectVisible(page, [requiredError])

  // now set the file, clear it, and submit again
  await chooseFile(page)
  await page.click('role=button[name="Clear file"]')
  await page.click('role=button[name="Upload image"]')

  await expectVisible(page, [requiredError])
})

// test('Image upload with name taken during upload', async ({ page }) => {})

// test('Image upload form validation', async ({ page }) => {})

// test('Image upload resilient to a few errors', async ({ page }) => {})

// test('Image upload fails with many errors', async ({ page }) => {
//   // try again after failure, everything runs as expected
// })

// test('Image upload canceled, file changed, try again', async ({ page }) => {})
