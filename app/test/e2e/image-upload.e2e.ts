import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

import { MiB } from '@oxide/util'

import { expectNotVisible, expectRowVisible, expectVisible } from './utils'

async function chooseFile(page: Page, size = 10 * MiB) {
  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByText('Image file', { exact: true }).click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles({
    name: 'my-image.iso',
    mimeType: 'application/octet-stream',
    // fill with nonzero content, otherwise we'll skip the whole thing, which
    // makes the test too fast for playwright to catch anything
    buffer: Buffer.alloc(size, 'a'),
  })
}

// playwright isn't quick enough to catch each step going from ready to running
// to complete in time, so we just assert that they all start out ready and end
// up complete
async function expectUploadProcess(page: Page) {
  const steps = page.locator('div[data-status]')

  for (const step of await steps.all()) {
    await expect(step).toHaveAttribute('data-status', 'ready', { timeout: 10000 })
  }

  // check these here instead of first because if we don't look for the ready
  // states right away we won't catch them in time
  const progressModal = page.getByRole('dialog', { name: 'Image upload progress' })
  await expect(progressModal).toBeVisible()
  const done = progressModal.getByRole('button', { name: 'Done' })

  for (const step of await steps.all()) {
    await expect(step).toHaveAttribute('data-status', 'complete', { timeout: 20000 })
  }

  await expect(done).toBeEnabled({ timeout: 15000 })
  await done.click()
}

test.describe('Image upload', () => {
  test('happy path', async ({ page }) => {
    await page.goto('/projects/mock-project/images')
    await expectNotVisible(page, [
      'role=cell[name="new-image"]',
      'role=dialog[name="Upload image"]',
    ])

    await page.click('role=link[name="Upload image"]')

    await expectVisible(page, ['role=dialog[name="Upload image"]'])

    await page.fill('role=textbox[name="Name"]', 'new-image')
    await page.fill('role=textbox[name="Description"]', 'image description')
    await page.fill('role=textbox[name="OS"]', 'Ubuntu')
    await page.fill('role=textbox[name="Version"]', 'Dapper Drake')
    await chooseFile(page)

    await page.click('role=button[name="Upload image"]')

    // now the modal pops open and the thing starts going
    await expectUploadProcess(page)

    await expect(page).toHaveURL('/projects/mock-project/images')
    await expectRowVisible(page.locator('role=table'), {
      name: 'new-image',
      description: 'image description',
      size: '1 GiB',
    })
  })

  test('with name taken', async ({ page }) => {
    await page.goto('/projects/mock-project/images-new')

    await page.fill('role=textbox[name="Name"]', 'image-1')
    await page.fill('role=textbox[name="Description"]', 'image description')
    await page.fill('role=textbox[name="OS"]', 'Ubuntu')
    await page.fill('role=textbox[name="Version"]', 'Dapper Drake')
    await chooseFile(page)

    await expectNotVisible(page, ['text="Image name already exists"'])
    await page.click('role=button[name="Upload image"]')
    await expectVisible(page, ['text="Image name already exists"'])

    // changing name and resubmitting removes error
    await page.fill('role=textbox[name="Name"]', 'image-5')
    await page.click('role=button[name="Upload image"]')
    await expectNotVisible(page, ['text="Image name already exists"'])
    await expectUploadProcess(page)

    // TODO: changing name alone should cause error to disappear
  })

  test('form validation', async ({ page }) => {
    await page.goto('/projects/mock-project/images-new')

    const nameRequired = 'role=dialog[name="Upload image"] >> text="Name is required"'
    const fileRequired = 'role=dialog[name="Upload image"] >> text="Image file is required"'

    await expectNotVisible(page, [nameRequired, fileRequired])

    await page.click('role=button[name="Upload image"]')
    await expectVisible(page, [nameRequired, fileRequired])

    await page.fill('role=textbox[name="Name"]', 'new-image')
    await expectNotVisible(page, [nameRequired])

    // now set the file, clear it, and submit again
    await chooseFile(page)
    await expectNotVisible(page, [fileRequired])

    await page.click('role=button[name="Clear file"]')
    await page.click('role=button[name="Upload image"]')

    await expectVisible(page, [fileRequired])
  })

  test('cancel', async ({ page }) => {
    await page.goto('/projects/mock-project/images-new')

    await page.fill('role=textbox[name="Name"]', 'new-image')
    await page.fill('role=textbox[name="Description"]', 'image description')
    await page.fill('role=textbox[name="OS"]', 'Ubuntu')
    await page.fill('role=textbox[name="Version"]', 'Dapper Drake')
    await chooseFile(page)

    await page.click('role=button[name="Upload image"]')

    // wait to be in the middle of upload
    const uploadStep = page
      .locator('div[data-status]')
      .filter({ hasText: 'Upload image file' })
      .first()
    await expect(uploadStep).toHaveAttribute('data-status', 'running')

    // form is disabled and semi-hidden
    // await expectNotVisible(page, ['role=textbox[name="Name"]'])

    page.on('dialog', (dialog) => dialog.accept()) // click yes on the are you sure prompt
    await page
      .getByRole('dialog', { name: 'Image upload progress' })
      .getByRole('button', { name: 'Cancel' })
      .click()

    // modal has closed
    await expectNotVisible(page, ['role=dialog[name="Image upload progress"]'])

    // form's back
    await expectVisible(page, ['role=textbox[name="Name"]'])

    // get out of the form
    await page.click('text=Cancel')

    // TODO: go to disks and make sure the tmp one got cleaned up
    // await page.click('role=link[name="Disks"]')
    // await expectVisible(page, ['role=cell[name="disk-1"]'])
    // await expectNotVisible(page, ['role=cell[name=tmp]'])
  })

  test('Image upload cancel and retry', async ({ page }) => {
    await page.goto('/projects/mock-project/images-new')

    await page.fill('role=textbox[name="Name"]', 'new-image')
    await page.fill('role=textbox[name="Description"]', 'image description')
    await page.fill('role=textbox[name="OS"]', 'Ubuntu')
    await page.fill('role=textbox[name="Version"]', 'Dapper Drake')
    await chooseFile(page)

    await page.click('role=button[name="Upload image"]')

    // wait to be in the middle of upload
    const uploadStep = page
      .locator('div[data-status]')
      .filter({ hasText: 'Upload image file' })
      .first()
    await expect(uploadStep).toHaveAttribute('data-status', 'running')

    // form is disabled and semi-hidden
    // await expectNotVisible(page, ['role=textbox[name="Name"]'])

    page.on('dialog', (dialog) => dialog.accept()) // click yes on the are you sure prompt
    const progressModal = page.getByRole('dialog', { name: 'Image upload progress' })
    await progressModal.getByRole('button', { name: 'Cancel' }).click()

    // modal has closed
    await expect(progressModal).toBeHidden()

    // form's back
    await expectVisible(page, [
      'role=textbox[name="Name"]',
      // need to wait for submit button to come back because it's in a loading
      // state while the cleanup runs
      'role=button[name="Upload image"]',
    ])

    // resubmit and it should work fine
    await page.getByRole('button', { name: 'Upload image' }).click()
    await expectUploadProcess(page)
  })

  const failureCases = [
    { imageName: 'disk-create-500', stepText: 'Create temporary disk' },
    { imageName: 'import-start-500', stepText: 'Put disk in import mode' },
    { imageName: 'import-stop-500', stepText: 'Get disk out of import mode' },
    { imageName: 'disk-finalize-500', stepText: 'Finalize disk' },
  ]

  for (const { imageName, stepText } of failureCases) {
    test(`failure ${imageName}`, async ({ page }) => {
      await page.goto('/projects/mock-project/images-new')

      // note special image name
      await page.fill('role=textbox[name="Name"]', imageName)

      await page.fill('role=textbox[name="Description"]', 'image description')
      await page.fill('role=textbox[name="OS"]', 'Ubuntu')
      await page.fill('role=textbox[name="Version"]', 'Dapper Drake')
      await chooseFile(page)

      await page.click('role=button[name="Upload image"]')

      const steps = page.locator('div[data-status]')

      for (const step of await steps.all()) {
        await expect(step).toHaveAttribute('data-status', 'ready')
      }

      const step = page.locator('[data-status]').filter({ hasText: stepText }).first()
      await expect(step).toHaveAttribute('data-status', 'error', { timeout: 10000 })
      await expectVisible(page, [
        'text="Something went wrong. Please try again."',
        'role=button[name="Back"]',
      ])
    })
  }
})

// TODO: these tests

// test('Image upload with name taken during upload', async ({ page }) => {})
// test('Image upload resilient to a few errors', async ({ page }) => {})
// test('Image upload fails with many errors', async ({ page }) => {
//   // try again after failure, everything runs as expected
// })
// test('Image upload canceled, file changed, try again', async ({ page }) => {})
