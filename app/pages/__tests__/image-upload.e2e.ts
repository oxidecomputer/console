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

async function expectStepToRun(page: Page, step: string) {
  const stepElt = page.locator('div[data-status]').filter({ hasText: step }).first()
  await expect(stepElt).toHaveAttribute('data-status', 'running')
  await expect(stepElt).toHaveAttribute('data-status', 'complete')
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

  // now the modal pops open and the thing starts going
  await expectVisible(page, ['role=heading[name="Image upload progress"]'])
  const done = page.locator('role=dialog >> role=button[name="Done"]')
  await expect(done).toBeDisabled()

  await expectStepToRun(page, 'Create temporary disk')
  await expectStepToRun(page, 'Set disk to import mode')
  await expectStepToRun(page, 'Upload file')
  await expectStepToRun(page, 'Get disk out of import mode')
  await expectStepToRun(page, 'Finalize disk')
  await expectStepToRun(page, 'Create image')
  await expectStepToRun(page, 'Delete disk and snapshot')

  // TODO: assert something about the steps

  await expect(done).toBeEnabled()
  await done.click()

  await expect(page).toHaveURL('/projects/mock-project/images')
  await expectRowVisible(page.locator('role=table'), {
    name: 'new-image',
    description: 'image description',
    size: '1 GiB',
  })
})

// TODO: things to test
//
// - image name already taken
// - image name gets taken during the upload
// - a couple of errors during bulk upload don't crash it
// - a lot of errors during bulk upload do crash it, with nice handling
// - cancel upload, change file, upload again
