/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { expect, test, type Page } from '@playwright/test'

import {
  chooseFile,
  expectConsoleMessage,
  expectNotVisible,
  expectRowVisible,
  expectVisible,
} from './utils'

// playwright isn't quick enough to catch each step going from ready to running
// to complete in time, so we just assert that they all start out ready and end
// up complete
async function expectUploadProcess(page: Page) {
  const modal = page.getByRole('dialog', { name: 'Upload image' })
  await expect(modal).toBeVisible()

  const steps = page.locator('css=.upload-step')
  await expect(steps).toHaveCount(8)

  const done = modal.getByRole('button', { name: 'Done' })

  for (const step of await steps.all()) {
    await expect(step).toHaveAttribute('data-status', 'complete', { timeout: 20000 })
  }

  await expect(done).toBeEnabled({ timeout: 15000 })
  await done.click()
}

async function fillForm(page: Page, name: string) {
  await page.goto('/projects/mock-project/images-new')

  await page.fill('role=textbox[name="Name"]', name)
  await page.fill('role=textbox[name="Description"]', 'image description')
  await page.fill('role=textbox[name="OS"]', 'Ubuntu')
  await page.fill('role=textbox[name="Version"]', 'Dapper Drake')
  await chooseFile(page.getByLabel('Image file'))
}

test.describe('Image upload', () => {
  test('happy path', async ({ page, browserName }) => {
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(browserName === 'webkit', 'safari. stop this')

    await page.goto('/projects/mock-project/images')
    await expectNotVisible(page, [
      'role=cell[name="new-image"]',
      'role=dialog[name="Upload image"]',
    ])

    await page.click('role=link[name="Upload image"]')

    await expectVisible(page, ['role=dialog[name="Upload image"]'])

    await fillForm(page, 'new-image')

    await page.getByRole('button', { name: 'Upload image' }).click()

    // now the form swaps into progress phase
    await expectUploadProcess(page)

    // the image name check 404 should be logged as expected-info, with context
    await expectConsoleMessage(page, 'This error is expected', 'info')
    await expectConsoleMessage(page, 'the image name may not exist yet.', 'info')

    await expect(page).toHaveURL('/projects/mock-project/images')
    await expectRowVisible(page.locator('role=table'), {
      name: 'new-image',
      description: 'image description',
      size: '1 GiB',
    })
  })

  test('with name taken', async ({ page, browserName }) => {
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(browserName === 'webkit', 'safari. stop this')

    await fillForm(page, 'image-1')

    await expectNotVisible(page, ['text="Image name already exists"'])
    await page.getByRole('button', { name: 'Upload image' }).click()
    await expectVisible(page, ['text="Image name already exists"'])

    // changing name and resubmitting removes error
    await page.fill('role=textbox[name="Name"]', 'image-5')
    await page.getByRole('button', { name: 'Upload image' }).click()
    await expectNotVisible(page, ['text="Image name already exists"'])
    await expectUploadProcess(page)

    // TODO: changing name alone should cause error to disappear
  })

  test('form validation', async ({ page, browserName }) => {
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(browserName === 'webkit', 'safari. stop this')

    await page.goto('/projects/mock-project/images-new')

    const nameRequired = 'role=dialog[name="Upload image"] >> text="Name is required"'
    const fileRequired = 'role=dialog[name="Upload image"] >> text="Image file is required"'

    await expectNotVisible(page, [nameRequired, fileRequired])

    await page.getByRole('button', { name: 'Upload image' }).click()
    await expectVisible(page, [nameRequired, fileRequired])

    await page.fill('role=textbox[name="Name"]', 'new-image')
    await expectNotVisible(page, [nameRequired])

    // now set the file, clear it, and submit again
    await chooseFile(page.getByLabel('Image file'))
    await expectNotVisible(page, [fileRequired])

    await page.click('role=button[name="Clear file"]')
    await page.getByRole('button', { name: 'Upload image' }).click()

    await expectVisible(page, [fileRequired])
  })

  const cancelStates = [
    'Put disk in import mode',
    'Upload image file',
    'Get disk out of import mode',
    // 'Finalize disk and create snapshot',
  ]

  for (const state of cancelStates) {
    test(`cancel in state '${state}'`, async ({ page }) => {
      await fillForm(page, 'new-image')

      const modal = page.getByRole('dialog', { name: 'Upload image' })

      await page.getByRole('button', { name: 'Upload image' }).click()
      await expect(modal).toBeVisible()

      // wait to be in the middle of the specified step
      const uploadStep = page.getByTestId(`upload-step: ${state}`)
      await expect(uploadStep).toHaveAttribute('data-status', 'running')

      // open the cancel guard and confirm
      await modal.getByRole('button', { name: 'Cancel upload' }).click()
      const cancelGuard = page.getByRole('dialog', { name: 'Cancel upload?' })
      await cancelGuard.getByRole('button', { name: 'Cancel upload' }).click()

      // form's back
      await expect(modal.getByRole('textbox', { name: 'Name' })).toBeVisible()
      // wait for cleanup to finish: submit re-enables once the temp disk is gone
      await expect(modal.getByRole('button', { name: 'Upload image' })).toBeEnabled()

      // dismiss the form (react-hook-form treats post-submit state as clean,
      // so this skips the nav guard and navigates directly)
      await modal.getByRole('button', { name: 'Cancel' }).click()

      // navigate to disks to verify the temp disk was deleted
      await page.getByRole('link', { name: 'Disks' }).click()
      await expect(page.getByRole('cell', { name: 'disk-1', exact: true })).toBeVisible()
      await expect(page.getByRole('cell', { name: 'tmp' })).toBeHidden()
    })
  }

  test('cancel canceling', async ({ page, browserName }) => {
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(browserName === 'webkit', 'safari. stop this')

    await fillForm(page, 'new-image')

    const modal = page.getByRole('dialog', { name: 'Upload image' })
    await page.getByRole('button', { name: 'Upload image' }).click()
    await expect(modal).toBeVisible()

    // open the cancel guard
    await modal.getByRole('button', { name: 'Cancel upload' }).click()
    const cancelGuard = page.getByRole('dialog', { name: 'Cancel upload?' })
    await expect(cancelGuard).toBeVisible()

    // "Keep uploading" dismisses just the guard; SideModal stays open
    await cancelGuard.getByRole('button', { name: 'Keep uploading' }).click()
    await expect(cancelGuard).toBeHidden()
    await expect(modal).toBeVisible()

    // Esc also dismisses only the guard
    await modal.getByRole('button', { name: 'Cancel upload' }).click()
    await expect(cancelGuard).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(cancelGuard).toBeHidden()
    await expect(modal).toBeVisible()
  })

  test('Image upload cancel and retry', async ({ page, browserName }) => {
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(browserName === 'webkit', 'safari. stop this')

    await fillForm(page, 'new-image')

    const modal = page.getByRole('dialog', { name: 'Upload image' })
    await page.getByRole('button', { name: 'Upload image' }).click()

    // wait to be in the middle of upload
    const uploadStep = page.getByTestId('upload-step: Upload image file')
    await expect(uploadStep).toHaveAttribute('data-status', 'running')

    // open the cancel guard and confirm
    await modal.getByRole('button', { name: 'Cancel upload' }).click()
    const cancelGuard = page.getByRole('dialog', { name: 'Cancel upload?' })
    await cancelGuard.getByRole('button', { name: 'Cancel upload' }).click()

    // form's back; wait for cleanup so submit is enabled again
    await expect(modal.getByRole('textbox', { name: 'Name' })).toBeVisible()
    await expect(modal.getByRole('button', { name: 'Upload image' })).toBeEnabled()

    // resubmit and it should work fine
    await page.getByRole('button', { name: 'Upload image' }).click()
    await expectUploadProcess(page)
  })

  // generic 500s (errorCode "Internal") have no useful API message, so we fall
  // back to a generic one; specific error codes like InsufficientCapacity carry
  // a real user-facing message that we surface verbatim.
  const genericMessage = 'Something went wrong. Please try again.'
  const failureCases = [
    {
      imageName: 'disk-create-500',
      stepText: 'Create temporary disk',
      message: genericMessage,
    },
    {
      imageName: 'disk-create-quota',
      stepText: 'Create temporary disk',
      message: 'Storage Limit Exceeded',
    },
    {
      imageName: 'import-start-500',
      stepText: 'Put disk in import mode',
      message: genericMessage,
    },
    {
      imageName: 'import-stop-500',
      stepText: 'Get disk out of import mode',
      message: genericMessage,
    },
    {
      imageName: 'disk-finalize-500',
      stepText: 'Finalize disk and create snapshot',
      message: genericMessage,
    },
  ]

  for (const { imageName, stepText, message } of failureCases) {
    test(`failure ${imageName}`, async ({ page, browserName }) => {
      // eslint-disable-next-line playwright/no-skipped-test
      test.skip(browserName === 'webkit', 'safari. stop this')

      await fillForm(page, imageName)

      await page.getByRole('button', { name: 'Upload image' }).click()

      const step = page.getByTestId(`upload-step: ${stepText}`)
      await expect(step).toHaveAttribute('data-status', 'error', { timeout: 15000 })

      await expect(page.getByText(message)).toBeVisible()
      // confirm we don't show both the generic and a specific API message
      if (message !== genericMessage) {
        await expect(page.getByText(genericMessage)).toBeHidden()
      }
      await expect(page.getByRole('button', { name: 'Back to form' })).toBeVisible()
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
