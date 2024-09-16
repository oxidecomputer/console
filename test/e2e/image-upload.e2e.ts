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
  expectNotVisible,
  expectRowVisible,
  expectVisible,
  sleep,
} from './utils'

// playwright isn't quick enough to catch each step going from ready to running
// to complete in time, so we just assert that they all start out ready and end
// up complete
async function expectUploadProcess(page: Page) {
  // check these here instead of first because if we don't look for the ready
  // states right away we won't catch them in time
  const progressModal = page.getByRole('dialog', { name: 'Image upload progress' })
  await expect(progressModal).toBeVisible()

  const steps = page.locator('css=.upload-step')
  await expect(steps).toHaveCount(8)

  const done = progressModal.getByRole('button', { name: 'Done' })

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
  await chooseFile(page, page.getByLabel('Image file'))
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

    // now the modal pops open and the thing starts going
    await expectUploadProcess(page)

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
    await chooseFile(page, page.getByLabel('Image file'))
    await expectNotVisible(page, [fileRequired])

    await page.click('role=button[name="Clear file"]')
    await page.getByRole('button', { name: 'Upload image' }).click()

    await expectVisible(page, [fileRequired])
  })

  test('cancel', async ({ page, browserName }) => {
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(browserName === 'webkit', 'safari. stop this')

    await fillForm(page, 'new-image')

    await page.getByRole('button', { name: 'Upload image' }).click()

    const progressModal = page.getByRole('dialog', { name: 'Image upload progress' })
    await expect(progressModal).toBeVisible()

    // wait to be in the middle of upload
    const uploadStep = page.getByTestId('upload-step: Upload image file')
    await expect(uploadStep).toHaveAttribute('data-status', 'running')

    // form is disabled and semi-hidden
    // await expectNotVisible(page, ['role=textbox[name="Name"]'])

    page.on('dialog', (dialog) => dialog.accept()) // click yes on the are you sure prompt
    await progressModal.getByRole('button', { name: 'Cancel' }).click()

    // modal has closed
    await expect(progressModal).toBeHidden()

    // form's back
    await expectVisible(page, ['role=textbox[name="Name"]'])

    // get out of the form
    await page.click('text=Cancel')

    // TODO: go to disks and make sure the tmp one got cleaned up
    // await page.click('role=link[name="Disks"]')
    // await expectVisible(page, ['role=cell[name="disk-1"]'])
    // await expectNotVisible(page, ['role=cell[name=tmp]'])
  })

  // testing the onFocusOutside fix
  test('cancel canceling', async ({ page, browserName }) => {
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(browserName === 'webkit', 'safari. stop this')

    await fillForm(page, 'new-image')

    const progressModal = page.getByRole('dialog', { name: 'Image upload progress' })

    await page.getByRole('button', { name: 'Upload image' }).click()
    await expect(progressModal).toBeVisible()

    let confirmCount = 0

    page.on('dialog', (dialog) => {
      confirmCount += 1
      dialog.dismiss()
    }) // click cancel on the are you sure prompt

    await progressModal.getByRole('button', { name: 'Cancel' }).click()

    // still visible because we canceled the cancel!
    await expect(progressModal).toBeVisible()
    expect(confirmCount).toEqual(1)

    // now let's try canceling by clicking out on the background over the side modal
    await page.getByLabel('4096').click()

    await sleep(300)

    // without the onFocusOutside fix this is a higher number
    expect(confirmCount).toEqual(2)
  })

  test('Image upload cancel and retry', async ({ page, browserName }) => {
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(browserName === 'webkit', 'safari. stop this')

    await fillForm(page, 'new-image')

    await page.getByRole('button', { name: 'Upload image' }).click()

    // wait to be in the middle of upload
    const uploadStep = page.getByTestId('upload-step: Upload image file')
    await expect(uploadStep).toHaveAttribute('data-status', 'running')

    // form is disabled and semi-hidden
    // await expectNotVisible(page, ['role=textbox[name="Name"]'])

    page.on('dialog', (dialog) => dialog.accept()) // click yes on the are you sure prompt
    const progressModal = page.getByRole('dialog', { name: 'Image upload progress' })
    await progressModal.getByRole('button', { name: 'Cancel' }).click()

    // modal has closed
    await expect(progressModal).toBeHidden()

    // form's back
    await expect(page.getByRole('textbox', { name: 'Name' })).toBeVisible()
    // need to wait for submit button to come back because it's in a loading
    // state while the cleanup runs
    await expect(page.getByRole('button', { name: 'Upload image' })).toBeVisible()

    // resubmit and it should work fine
    await page.getByRole('button', { name: 'Upload image' }).click()
    await expectUploadProcess(page)
  })

  const failureCases = [
    { imageName: 'disk-create-500', stepText: 'Create temporary disk' },
    { imageName: 'import-start-500', stepText: 'Put disk in import mode' },
    { imageName: 'import-stop-500', stepText: 'Get disk out of import mode' },
    { imageName: 'disk-finalize-500', stepText: 'Finalize disk and create snapshot' },
  ]

  for (const { imageName, stepText } of failureCases) {
    test(`failure ${imageName}`, async ({ page, browserName }) => {
      // eslint-disable-next-line playwright/no-skipped-test
      test.skip(browserName === 'webkit', 'safari. stop this')

      await fillForm(page, imageName)

      await page.getByRole('button', { name: 'Upload image' }).click()

      const step = page.getByTestId(`upload-step: ${stepText}`)
      await expect(step).toHaveAttribute('data-status', 'error', { timeout: 15000 })
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
